#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
预置班表数据生成脚本（开发期手动运行，不进运行时）

从九巴官网 FunctionRequest.ashx 抓取核心线路的班表 / 站点 / 行车时间，
生成 data/schedule.json，供 PWA 离线推算使用。

用法：
    python3 scripts/build-schedule.py

输出：
    data/schedule.json

日志：
    scripts/build-schedule.log
"""
import json, os, sys, time, datetime, urllib3
import requests

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'schedule.json')
LOG = os.path.join(os.path.abspath(__file__) + '.log')

API = 'https://search.kmb.hk/KMBWebSite/Function/FunctionRequest.ashx?'
HEAD = {'Content-Type': 'application/json; charset=utf-8'}
ROUTES = ['272X', '272A', 'A47X', 'A41', 'A42', 'A46', 'A41P']
BOUNDS = [1, 2]
STYPE = '1'
RETRY = 3

_log_lines = []
def log(msg):
    line = str(datetime.datetime.now().strftime('%H:%M:%S')) + ' ' + msg
    print(line, flush=True)
    _log_lines.append(line)

def post(action, params):
    url = API + 'action=' + action + '&' + params
    for i in range(RETRY):
        try:
            r = requests.post(url, headers=HEAD, data='{}', timeout=20, verify=False)
            j = r.json()
            if j.get('result'):
                return j.get('data')
        except Exception as e:
            log('  重试 %d/%d %s %s' % (i + 1, RETRY, action, e))
        time.sleep(0.6 * (i + 1))
    return None

def main():
    lines = {}
    for route in ROUTES:
        for bound in BOUNDS:
            key = '%s|%d|%s' % (route, bound, STYPE)
            q = 'route=%s&bound=%d&serviceType=%s' % (route, bound, STYPE)
            log('抓取 ' + key)
            stops = post('getstops', q)
            sched = post('getschedule', q)
            if not stops or not isinstance(stops, dict) or not isinstance(stops.get('routeStops'), list):
                log('  跳过（无站点数据）')
                continue
            rs = [x for x in stops['routeStops']
                  if str(x.get('Direction', '')).strip().upper().startswith('F')
                  and str(x.get('Seq', '')).strip().isdigit()]
            if not rs:
                log('  跳过（无去程站点）')
                continue
            rs.sort(key=lambda x: int(x['Seq']))
            mlist = []
            for x in rs:
                import re
                m = re.search(r'\(([A-Z]{2}\d{2,5})\)', str(x.get('CName', '')))
                mlist.append({
                    'seq': int(x['Seq']),
                    'code': m.group(1) if m else '',
                    'name': {'tc': x.get('CName', ''), 'sc': x.get('SCName') or x.get('CName', ''), 'en': x.get('EName', '')},
                    'fare': float(x.get('AirFare') or 0),
                })
            fare = max([x['fare'] for x in mlist] or [0])
            # 行车时间：0 -> 每个站点 seq
            jt = {}
            for x in mlist:
                seq = x['seq']
                if seq == 0:
                    jt[str(seq)] = 0
                    continue
                jq = 'route=%s&bound=%d&serviceType=%s&seq1=0&seq2=%d' % (route, bound, STYPE, seq)
                d = post('getjtbyfromtostop', jq)
                v = None
                if isinstance(d, dict):
                    try:
                        v = float(d.get('Journey_time'))
                    except (TypeError, ValueError):
                        v = None
                if v and v > 0:
                    jt[str(seq)] = int(v)
                time.sleep(0.05)
            lines[key] = {
                'route': route, 'bound': bound, 'stype': int(STYPE),
                'sched': sched or {},
                'list': mlist,
                'fare': fare,
                'basic': stops.get('basicInfo') or {},
                'jt': jt,
                'capturedAt': int(time.time() * 1000),
            }
            log('  完成：站点 %d，行车时间 %d 条' % (len(mlist), len(jt)))

    out = {
        'generatedAt': datetime.date.today().isoformat(),
        'note': 'KMB official timetable snapshot for offline estimation. For reference only.',
        'routes': ROUTES,
        'lines': lines,
    }
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    size = os.path.getsize(OUT)
    log('写入 %s（%d 条线路/方向，%.1f KB）' % (OUT, len(lines), size / 1024.0))
    with open(LOG, 'w', encoding='utf-8') as f:
        f.write('\n'.join(_log_lines))

if __name__ == '__main__':
    main()
