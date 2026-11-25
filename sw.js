/* 巴士到站 PWA Service Worker —— 离线优先 */
const SHELL = 'bus-shell-v17';
const DATA = 'bus-data-v3';
const SHELL_FILES = [
  './', './index.html', './style.css?v=144', './app.js?v=144', './manifest.webmanifest', './data/stopcodes.json',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-180.png'
];
const DATA_FILES = [
  './data/quickstops.json', './data/trips.json', './data/links.json',
  './data/stops.json', './data/routes.json', './data/routestop.json', './data/schedule.json'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(SHELL);
    for (const f of SHELL_FILES) { try { await c.add(f); } catch (err) {} }
    const d = await caches.open(DATA);
    for (const f of DATA_FILES) { try { await d.add(f); } catch (err) {} }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== SHELL && k !== DATA).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 实时到站 / 天气接口（跨域）：直连，不缓存（离线时由界面提示）
  if (url.origin !== location.origin) return;

  // 本地数据文件：缓存优先，离线可用
  if (url.pathname.indexOf('/data/') >= 0) {
    e.respondWith((async () => {
      const c = await caches.open(DATA);
      const hit = await c.match(req, {ignoreSearch: true});
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res.ok) c.put(req, res.clone());
        return res;
      } catch (err) {
        return new Response('{"stops":[],"trips":[]}', {headers:{'Content-Type':'application/json'}});
      }
    })());
    return;
  }

  // 页面导航：网络优先，失败回退缓存
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try { return await fetch(req); }
      catch (err) {
        const c = await caches.open(SHELL);
        return (await c.match('./index.html')) || (await c.match('./')) || new Response('offline', {status:503});
      }
    })());
    return;
  }

  // 静态资源：先返回缓存，同时后台更新（下次打开即为新版）
  e.respondWith((async () => {
    const c = await caches.open(SHELL);
    const hit = await c.match(req, {ignoreSearch: true});
    const net = fetch(req).then(res => {
      if (res.ok) c.put(req, res.clone());
      return res;
    }).catch(() => null);
    if (hit) return hit;
    const res = await net;
    return res || new Response('', {status:504});
  })());
});
