/* 巴士到站 PWA v1.3 — 实时数据源: DATA.GOV.HK (KMB/LWB, CTB, NLB) + 香港天文台 */
/* 27A / 806A / 806B 为内置静态时刻表（首末班时间 + 停靠站点），无实时查询 */
'use strict';

const VERSION = '1.5.0';
const BUILD = '2026-11-25';
const DEFAULT_LOC = [22.4297, 114.203329];   // 雲滙：定位未更新时的默认坐标
const NEARBY_R = 1000;                       // 附近站点半径（米）
const NEARBY_GROUP_M = 90;                   // 同名站柱合并半径（米）

/* ================= i18n ================= */
const I18N = {
  sc: {
    tabStops:'到站', tabTrips:'行程', tabRoute:'线路', tabNearby:'附近', tabMe:'我的',
    secAppearance:'外观与语言', language:'界面语言', theme:'主题', themeLight:'浅色', themeDark:'深色',
    refreshInterval:'自动刷新间隔', myStops:'常用站点', myRoutes:'关注线路', dataSec:'数据与离线',
    lastUpdate:'本地数据更新于', updateData:'更新本地数据', exportData:'导出我的数据', importData:'导入我的数据',
    install:'安装到主屏幕', version:'版本', copyright:'© 2026 巴士到站 · 保留所有权利',
    about:'数据来源：香港特区政府 DATA.GOV.HK（运输署开放数据）及香港天文台。到站数据约 1 分钟更新，班次信息仅供参考，请以现场为准。',
    addStopBtn:'+ 添加站点', addStop:'添加站点', searchStop:'搜索站点名称，如 金钟 / 大学站', searchHint:'输入站名或站码',
    noResult:'没有匹配结果', addOk:'已添加', addedAlready:'已存在', addFail:'请先输入站名',
    min:'分钟', arriving:'即将到站', noEta:'暂无实时数据', offService:'非服务时间 / 暂无班次',
    updated:'更新于', locating:'正在定位…', locFail:'定位失败，请检查权限',
    locDefault:'定位未更新 · 默认使用云汇坐标', locUpdated:'定位已更新',
    nearTitle:'附近车站', nearbyNone:'1 公里内未找到车站', locateBtn:'定位附近站点',
    stopCode:'站码', routesAtStop:'停靠线路', nearHint:'距离常用站点较近',
    timetable:'班次表（推断）', timetableStatic:'时刻表', official:'官网班表', fare:'全程车费',
    journeyTime:'行车时间', boardStop:'候车站', interval:'班距', next:'下一班', later:'稍后', to:'往',
    noRouteAtStop:'该站点没有此线路', noService:'暂无实时班次', noRoutes:'没有匹配线路', loading:'加载中…',
    fail:'加载失败，请重试', builtin:'内置',
    addTrip:'添加行程', tripFrom:'选择出发地', tripRoute:'输入该站停靠的线路号', tripHint:'从该常用站点出发',
    favEdit:'编辑', favDone:'完成', favOn:'已收藏', favAdd:'收藏', favEmpty:'还没有关注线路，搜索后点 ☆ 即可收藏',
    offlineData:'离线数据 · 更新于', updateStart:'正在更新本地数据…', updateDone:'本地数据已更新',
    updateFail:'更新失败，请检查网络', exportOk:'已导出备份文件', importOk:'已导入',
    importFail:'文件格式不正确', loadedCache:'已载入本地缓存的线路数据', favRemoved:'已取消收藏', offline:'离线状态 · 实时到站不可用',
    refresh:'刷新', weather:'天气', humidity:'湿度', nearCount:'个站牌', nearbyRadius:'1 公里内',
    showMore:'显示更多', loadingStops:'正在载入沿途站点…', offlineStops:'离线 · 显示已缓存的沿途站点',
    cacheWarming:'正在缓存线路时刻表…', cacheDone:'线路时刻表已缓存，可离线查看', tripEmpty:'暂无行程，点下方按钮添加',
    offlineNoData:'离线且没有缓存数据，请连网后重试', unknownDest:'终点未明', wxUnavailable:'天气暂不可用',
    updating:'更新中…', tapDetail:'点击查看详情', stopsOnRoute:'沿途站点', nowService:'服务中', offlineShort:'离线',
    transfer:'转乘', nextDep:'下一班', depAt:'开出', estArrive:'推算到站', cachedAt:'缓存数据 · 更新于', cacheHint:'点击刷新或等待自动更新',
    sort:'排序', sortEta:'按到站时间', sortAdd:'按添加顺序', sortRoute:'按线路号', nearLocInput:'输入站名或坐标定位', locateShort:'定位',
    locatingFallback:'定位中 · 暂用云汇坐标', firstTime:'首班', lastTime:'末班', kbEstimate:'按官网班表推算',
    nearLocBad:'未找到该位置，可试 雲滙 或 22.4297,114.2033',
    refreshing:'正在刷新…', hkOnly:'仅提供香港境内巴士查询', locModeLabel:'实时定位如下', nearSuffix:'附近',
    offlineEst:'离线推算 · 仅供参考', schedOn:'班表', schedStale:'班表可能已过期', freshNote:'基于', nextDay:'次日',
  },
  tc: {
    tabStops:'到站', tabTrips:'行程', tabRoute:'線路', tabNearby:'附近', tabMe:'我的',
    secAppearance:'外觀與語言', language:'介面語言', theme:'主題', themeLight:'淺色', themeDark:'深色',
    refreshInterval:'自動刷新間隔', myStops:'常用站點', myRoutes:'關注線路', dataSec:'數據與離線',
    lastUpdate:'本地數據更新於', updateData:'更新本地數據', exportData:'匯出我的數據', importData:'匯入我的數據',
    install:'安裝到主畫面', version:'版本', copyright:'© 2026 巴士到站 · 保留所有權利',
    about:'資料來源：香港特區政府 DATA.GOV.HK（運輸署開放數據）及香港天文台。到站數據約 1 分鐘更新，班次資訊僅供參考，請以現場為準。',
    addStopBtn:'+ 添加站點', addStop:'添加站點', searchStop:'搜尋站點名稱，如 金鐘 / 大學站', searchHint:'輸入站名或站碼',
    noResult:'沒有匹配結果', addOk:'已添加', addedAlready:'已存在', addFail:'請先輸入站名',
    min:'分鐘', arriving:'即將到站', noEta:'暫無實時數據', offService:'非服務時間 / 暫無班次',
    updated:'更新於', locating:'正在定位…', locFail:'定位失敗，請檢查權限',
    locDefault:'定位未更新 · 預設使用雲滙座標', locUpdated:'定位已更新',
    nearTitle:'附近車站', nearbyNone:'1 公里內未找到車站', locateBtn:'定位附近站點',
    stopCode:'站碼', routesAtStop:'停靠線路', nearHint:'距離常用站點較近',
    timetable:'班次表（推斷）', timetableStatic:'班次表', official:'官網班表', fare:'全程車費',
    journeyTime:'行車時間', boardStop:'候車站', interval:'班距', next:'下一班', later:'稍後', to:'往',
    noRouteAtStop:'該站點沒有此線路', noService:'暫無實時班次', noRoutes:'沒有匹配線路', loading:'載入中…',
    fail:'載入失敗，請重試', builtin:'內置',
    addTrip:'添加行程', tripFrom:'選擇出發地', tripRoute:'輸入該站停靠的線路號', tripHint:'從該常用站點出發',
    favEdit:'編輯', favDone:'完成', favOn:'已收藏', favAdd:'收藏', favEmpty:'還沒有關注線路，搜尋後點 ☆ 即可收藏',
    offlineData:'離線數據 · 更新於', updateStart:'正在更新本地數據…', updateDone:'本地數據已更新',
    updateFail:'更新失敗，請檢查網絡', exportOk:'已匯出備份檔案', importOk:'已匯入',
    importFail:'檔案格式不正確', loadedCache:'已載入本地緩存的線路數據', favRemoved:'已取消收藏', offline:'離線狀態 · 實時到站不可用',
    refresh:'刷新', weather:'天氣', humidity:'濕度', nearCount:'個站牌', nearbyRadius:'1 公里內',
    showMore:'顯示更多', loadingStops:'正在載入沿途站點…', offlineStops:'離線 · 顯示已緩存的沿途站點',
    cacheWarming:'正在緩存線路班次表…', cacheDone:'線路班次表已緩存，可離線查看', tripEmpty:'暫無行程，點下方按鈕添加',
    offlineNoData:'離線且沒有緩存數據，請連網後重試', unknownDest:'終點未明', wxUnavailable:'天氣暫不可用',
    updating:'更新中…', tapDetail:'點擊查看詳情', stopsOnRoute:'沿途站點', nowService:'服務中', offlineShort:'離線',
    transfer:'轉乘', nextDep:'下一班', depAt:'開出', estArrive:'推算到站', cachedAt:'緩存數據 · 更新於', cacheHint:'點擊刷新或等待自動更新',
    sort:'排序', sortEta:'按到站時間', sortAdd:'按添加順序', sortRoute:'按線路號', nearLocInput:'輸入站名或坐標定位', locateShort:'定位',
    locatingFallback:'定位中 · 暫用雲滙座標', firstTime:'首班', lastTime:'末班', kbEstimate:'按官網班表推算',
    nearLocBad:'找不到該位置，可試 雲滙 或 22.4297,114.2033',
    refreshing:'正在刷新…', hkOnly:'僅提供香港境內巴士查詢', locModeLabel:'實時定位如下', nearSuffix:'附近',
    offlineEst:'離線推算 · 僅供參考', schedOn:'班表', schedStale:'班表可能已過期', freshNote:'基於', nextDay:'次日',
  },
  en: {
    tabStops:'Arrivals', tabTrips:'Trips', tabRoute:'Routes', tabNearby:'Nearby', tabMe:'Me',
    secAppearance:'Appearance & Language', language:'Language', theme:'Theme', themeLight:'Light', themeDark:'Dark',
    refreshInterval:'Auto refresh', myStops:'Saved stops', myRoutes:'Favourite routes', dataSec:'Data & Offline',
    lastUpdate:'Local data updated', updateData:'Update local data', exportData:'Export my data', importData:'Import my data',
    install:'Add to Home Screen', version:'Version', copyright:'© 2026 Bus ETA · All rights reserved',
    about:'Source: DATA.GOV.HK (Transport Department open data) and Hong Kong Observatory. ETA refreshed within 1 minute. For reference only.',
    addStopBtn:'+ Add stop', addStop:'Add stop', searchStop:'Search stop name, e.g. Admiralty / University', searchHint:'Name or stop code',
    noResult:'No match', addOk:'Added', addedAlready:'Already added', addFail:'Please type a name first',
    min:'min', arriving:'Arriving', noEta:'No live data', offService:'Outside service hours / no trips',
    updated:'Updated', locating:'Locating…', locFail:'Location failed, check permission',
    locDefault:'No GPS · using St Martin coordinates', locUpdated:'Location updated',
    nearTitle:'Nearby stops', nearbyNone:'No stop within 1 km', locateBtn:'Locate nearby stops',
    stopCode:'Code', routesAtStop:'Routes', nearHint:'Close to saved stop',
    timetable:'Timetable (inferred)', timetableStatic:'Timetable', official:'Official timetable', fare:'Fare',
    journeyTime:'Journey', boardStop:'Boarding stop', interval:'Headway', next:'Next', later:'Later', to:'to',
    noRouteAtStop:'This route does not serve the stop', noService:'No live trip', noRoutes:'No route found', loading:'Loading…',
    fail:'Load failed, retry', builtin:'Built-in',
    addTrip:'Add trip', tripFrom:'Pick a starting stop', tripRoute:'Type route number at this stop', tripHint:'From this saved stop',
    favEdit:'Edit', favDone:'Done', favOn:'Saved', favAdd:'Save', favEmpty:'No favourite route yet. Tap ☆ after searching',
    offlineData:'Offline data · updated', updateStart:'Updating local data…', updateDone:'Local data updated',
    updateFail:'Update failed, check network', exportOk:'Backup exported', importOk:'Imported',
    importFail:'Invalid file', loadedCache:'Loaded cached route data', favRemoved:'Removed from favourites', offline:'Offline · live ETA unavailable',
    refresh:'Refresh', weather:'Weather', humidity:'Humidity', nearCount:'stops', nearbyRadius:'within 1 km',
    showMore:'Show more', loadingStops:'Loading stops…', offlineStops:'Offline · showing cached stops',
    cacheWarming:'Caching route timetable…', cacheDone:'Timetable cached for offline use', tripEmpty:'No trip yet. Add one below',
    offlineNoData:'Offline with no cached data. Please retry online', unknownDest:'Destination unknown', wxUnavailable:'Weather unavailable',
    updating:'Updating…', tapDetail:'Tap for details', stopsOnRoute:'Stops', nowService:'In service', offlineShort:'Offline',
    transfer:'Transfer', nextDep:'Next dep.', depAt:'departs', estArrive:'Est. arrival', cachedAt:'Cached data · updated', cacheHint:'Tap refresh or wait for auto update',
    sort:'Sort', sortEta:'By arrival', sortAdd:'By added order', sortRoute:'By route no.', nearLocInput:'Enter stop name or coordinates', locateShort:'Locate',
    locatingFallback:'Locating · using St Martin temporarily', firstTime:'First', lastTime:'Last', kbEstimate:'Estimated from official timetable',
    nearLocBad:'Location not found. Try St Martin or 22.4297,114.2033',
    refreshing:'Refreshing…', hkOnly:'Bus service is available in Hong Kong only', locModeLabel:'Live location below', nearSuffix:'nearby',
    offlineEst:'Offline estimate · for reference only', schedOn:'sched', schedStale:'schedule may be out of date', freshNote:'based on', nextDay:'next day',
  }
};
let lang = localStorage.getItem('bp_lang');
if (!lang){
  const nl = navigator.language || 'zh-Hans';
  lang = /-(tw|hk|mo)/i.test(nl) || /hant/i.test(nl) ? 'tc' : 'sc';   // 默认简体，英文可在「我的」切换
}
if (!I18N[lang]) lang = 'sc';
const T = k => (I18N[lang] && I18N[lang][k]) || I18N.sc[k] || k;
const pickB = o => { if (!o) return ''; const v = lang === 'en' ? (o.en || o.sc) : lang === 'tc' ? (o.tc || o.sc) : (o.sc || o.tc); return v || ''; };
const nm = o => pickB(o);

/* ================= API ================= */
const LQ = () => lang === 'tc' ? 'zh-hant' : 'zh-hans';
const API = {
  kmbEta: (s, r, st) => `https://data.etabus.gov.hk/v1/transport/kmb/eta/${s}/${r}/${st}`,
  kmbRouteStop: (r, d, st) => `https://data.etabus.gov.hk/v1/transport/kmb/route-stop/${r}/${d === 'I' ? 'inbound' : 'outbound'}/${st}`,
  kmbStop: s => `https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/${s}`,
  ctbStopEta: s => `https://rt.data.gov.hk/v1/transport/batch/stop-eta/CTB/${s}?lang=${LQ()}`,
  ctbEta: (s, r) => `https://rt.data.gov.hk/v2/transport/citybus/eta/CTB/${s}/${r}`,
  ctbStopRoute: s => `https://rt.data.gov.hk/v1.1/transport/batch/stop-route/CTB/${s}?lang=${LQ()}`,
  ctbRouteStop: (r, d) => `https://rt.data.gov.hk/v2/transport/citybus/route-stop/CTB/${r}/${d === 'I' ? 'inbound' : 'outbound'}`,
  nlbStopEta: s => `https://rt.data.gov.hk/v1/transport/batch/stop-eta/NLB/${s}?lang=${LQ()}`,
  nlbStops: rid => `https://rt.data.gov.hk/v2/transport/nlb/stop.php?action=list&routeId=${rid}`,
  weather: 'https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=tc',
};
const CO_COLOR = { KMB:'var(--kmb)', CTB:'var(--ctb)', LWB:'var(--lwb)', NLB:'var(--nlb)', GMB:'var(--gmb)' };
const CO_NAME = {
  KMB:{sc:'九巴',tc:'九巴',en:'KMB'}, LWB:{sc:'龙运',tc:'龍運',en:'LWB'}, CTB:{sc:'城巴',tc:'城巴',en:'CTB'},
  NLB:{sc:'屿巴',tc:'嶼巴',en:'NLB'}, GMB:{sc:'专线小巴',tc:'專線小巴',en:'Minibus'}
};
const coName = co => pickB(CO_NAME[co] || {sc:co,tc:co,en:co});

/* ================= 香港天文台实时天气（27 个观测站） ================= */
const WX_STATIONS = [
  {tc:'京士柏',sc:'京士柏',en:"King's Park",lat:22.3105,lng:114.1725},
  {tc:'香港天文台',sc:'香港天文台',en:'Hong Kong Observatory',lat:22.3020,lng:114.1740},
  {tc:'黃竹坑',sc:'黄竹坑',en:'Wong Chuk Hang',lat:22.2480,lng:114.1690},
  {tc:'打鼓嶺',sc:'打鼓岭',en:'Ta Kwu Ling',lat:22.5280,lng:114.1550},
  {tc:'流浮山',sc:'流浮山',en:'Lau Fau Shan',lat:22.4690,lng:113.9830},
  {tc:'大埔',sc:'大埔',en:'Tai Po',lat:22.4480,lng:114.1690},
  {tc:'沙田',sc:'沙田',en:'Sha Tin',lat:22.4025,lng:114.1853},
  {tc:'屯門',sc:'屯门',en:'Tuen Mun',lat:22.3910,lng:113.9760},
  {tc:'將軍澳',sc:'将军澳',en:'Tseung Kwan O',lat:22.3180,lng:114.2570},
  {tc:'西貢',sc:'西贡',en:'Sai Kung',lat:22.3830,lng:114.2720},
  {tc:'長洲',sc:'长洲',en:'Cheung Chau',lat:22.2010,lng:114.0280},
  {tc:'赤鱲角',sc:'赤鱲角',en:'Chek Lap Kok',lat:22.3090,lng:113.9140},
  {tc:'青衣',sc:'青衣',en:'Tsing Yi',lat:22.3450,lng:114.1070},
  {tc:'石崗',sc:'石岗',en:'Shek Kong',lat:22.4360,lng:114.0850},
  {tc:'荃灣可觀',sc:'荃湾可观',en:'Tsuen Wan Ho Koon',lat:22.3730,lng:114.1150},
  {tc:'荃灣城門谷',sc:'荃湾城门谷',en:'Tsuen Wan Shing Mun Valley',lat:22.3810,lng:114.1350},
  {tc:'香港公園',sc:'香港公园',en:'Hong Kong Park',lat:22.2780,lng:114.1620},
  {tc:'筲箕灣',sc:'筲箕湾',en:'Shau Kei Wan',lat:22.2810,lng:114.2230},
  {tc:'九龍城',sc:'九龙城',en:'Kowloon City',lat:22.3320,lng:114.1850},
  {tc:'跑馬地',sc:'跑马地',en:'Happy Valley',lat:22.2700,lng:114.1830},
  {tc:'黃大仙',sc:'黄大仙',en:'Wong Tai Sin',lat:22.3400,lng:114.1950},
  {tc:'赤柱',sc:'赤柱',en:'Stanley',lat:22.2160,lng:114.2180},
  {tc:'觀塘',sc:'观塘',en:'Kwun Tong',lat:22.3180,lng:114.2240},
  {tc:'深水埗',sc:'深水埗',en:'Sham Shui Po',lat:22.3320,lng:114.1590},
  {tc:'啟德跑道公園',sc:'启德跑道公园',en:'Kai Tak Runway Park',lat:22.3050,lng:114.2130},
  {tc:'元朗公園',sc:'元朗公园',en:'Yuen Long Park',lat:22.4420,lng:114.0220},
  {tc:'大美督',sc:'大美督',en:'Tai Mei Tuk',lat:22.4660,lng:114.2380},
];
function wxIcon(code){
  if (code === 50 || code === 51) return '☀️';
  if (code === 52 || code === 53) return '⛅';
  if (code === 54) return '☁️';
  if (code >= 55 && code <= 57) return '🌫️';
  if (code === 58 || code === 59) return '🌧️';
  if (code >= 60 && code <= 65) return '☁️';
  if (code >= 70 && code <= 77) return '🌤️';
  if (code >= 80 && code <= 85) return '🌦️';
  if (code >= 90) return '⛈️';
  return '🌤️';
}
function wxDesc(code){
  const groups = [
    {codes:[50,51,70,71,72,73,74,75,76,77], sc:'天晴', tc:'天晴', en:'Fine'},
    {codes:[52], sc:'大致天晴', tc:'大致天晴', en:'Mainly fine'},
    {codes:[53], sc:'间有阳光', tc:'間有陽光', en:'Sunny intervals'},
    {codes:[54,60,61,62,63,64,65], sc:'多云', tc:'多雲', en:'Cloudy'},
    {codes:[55,56,57], sc:'有雾', tc:'有霧', en:'Mist'},
    {codes:[58,59], sc:'有雨', tc:'有雨', en:'Rain'},
    {codes:[80,81,82,83,84,85], sc:'骤雨', tc:'驟雨', en:'Showers'},
    {codes:[90,91,92,93,94,95], sc:'雷暴', tc:'雷暴', en:'Thunderstorm'},
  ];
  const g = groups.find(x => x.codes.indexOf(code) >= 0);
  return g ? g[lang] || g.sc : (lang === 'en' ? 'Fine' : '天晴');
}
/* ================= 内置小巴时刻表 27A / 806A / 806B ================= */
/* 数据来源：16seats.net（专线小巴营运资料），2026-11 核对；小巴按班距营运，非固定发车时刻 */
const GMB_TIMETABLE = {
  '27A': {
    fare:'9.2', updated:'2026-11',
    orig:{sc:'白石角',tc:'白石角',en:'Pak Shek Kok'}, dest:{sc:'沙田站',tc:'沙田站',en:'Sha Tin Station'},
    name:{sc:'白石角 ⇄ 沙田站（循环线，经香港科学园）',tc:'白石角 ⇄ 沙田站（循環線，經香港科學園）',en:'Pak Shek Kok ⇄ Sha Tin Station (circular via HK Science Park)'},
    dirs:[
      {from:{sc:'白石角(科城路)公共运输交汇处',tc:'白石角(科城路)公共運輸交匯處'},
       to:{sc:'沙田站(排头街)',tc:'沙田站(排頭街)'},
       first:{sc:'平日 09:00 · 周六日及假期 07:00',tc:'平日 09:00 · 週六日及假期 07:00'},
       last:{sc:'20:00',tc:'20:00'},
       note:{sc:'约每 20 分钟一班；每日 10:00-17:00 及 19:00 后部分班次改经科技大道西',tc:'約每 20 分鐘一班；每日 10:00-17:00 及 19:00 後部分班次改經科技大道西'},
       stops:[['白石角(科城路)公共运输交汇处','白石角(科城路)公共運輸交匯處'],['科进路(天赋海湾·溋玥 / 海日湾)','科進路(天賦海灣·溋玥 / 海日灣)'],['创新路(雲滙 / 嘉熙·海日湾II)','創新路(雲滙 / 嘉熙·海日灣II)'],['科研路(逸瓏湾8 / 朗涛)','科研路(逸瓏灣8 / 朗濤)'],['香港科学园(一期 / 三期)','香港科學園(一期 / 三期)'],['科学园路(香港生物科技研究院 / 马料水渡轮码头)','科學園路(香港生物科技研究院 / 馬料水渡輪碼頭)'],['沙田站(排头街)','沙田站(排頭街)']]},
      {from:{sc:'沙田站(排头街)',tc:'沙田站(排頭街)'},
       to:{sc:'白石角(科城路)公共运输交汇处',tc:'白石角(科城路)公共運輸交匯處'},
       first:{sc:'10:00',tc:'10:00'}, last:{sc:'23:00',tc:'23:00'},
       note:{sc:'约每 20 分钟一班（17:00-19:00 不设服务）',tc:'約每 20 分鐘一班（17:00-19:00 不設服務）'},
       stops:[['沙田站(排头街)','沙田站(排頭街)'],['科学园路(马料水渡轮码头 / 中大水上活动中心)','科學園路(馬料水渡輪碼頭 / 中大水上活動中心)'],['香港科学园(一期 / 三期)','香港科學園(一期 / 三期)'],['科研路(朗涛 / 逸瓏湾8)','科研路(朗濤 / 逸瓏灣8)'],['创新路(雲滙 / 嘉熙)','創新路(雲滙 / 嘉熙)'],['科进路(天赋海湾·溋玥 / 逸瓏湾II / 海日湾)','科進路(天賦海灣·溋玥 / 逸瓏灣II / 海日灣)'],['白石角(科城路)公共运输交汇处','白石角(科城路)公共運輸交匯處']]}
    ]
  },
  '806A': {
    fare:'13.8', updated:'2026-11',
    orig:{sc:'运头塘',tc:'運頭塘',en:'Wan Tau Tong'}, dest:{sc:'黄泥头',tc:'黃泥頭',en:'Wong Nai Tau'},
    name:{sc:'运头塘 ⇄ 黄泥头（经白石角、香港科学园、沙田第一城、恒生大学）',tc:'運頭塘 ⇄ 黃泥頭（經白石角、香港科學園、沙田第一城、恒生大學）',en:'Wan Tau Tong ⇄ Wong Nai Tau (via Pak Shek Kok, Science Park, City One, HSUHK)'},
    dirs:[
      {from:{sc:'运头塘公共运输交汇处',tc:'運頭塘公共運輸交匯處'}, to:{sc:'黄泥头公共运输交汇处',tc:'黃泥頭公共運輸交匯處'},
       first:{sc:'06:30',tc:'06:30'}, last:{sc:'22:00',tc:'22:00'},
       note:{sc:'每日服务，每 12-20 分钟一班',tc:'每日服務，每 12-20 分鐘一班'},
       stops:[['运头塘公共运输交汇处','運頭塘公共運輸交匯處'],['逸雅苑 / 新达广场','逸雅苑 / 新達廣場'],['港铁大埔墟站','港鐵大埔墟站'],['广福球场 / 大埔中心第四期','廣福球場 / 大埔中心第四期'],['宝乡街 / 广福道 / 绿汇学苑','寶鄉街 / 廣福道 / 綠匯學苑'],['广福邨','廣福邨'],['创新路(天赋海湾)','創新路(天賦海灣)'],['科进路(海钻·天赋海湾 / 逸瓏湾)','科進路(海鑽·天賦海灣 / 逸瓏灣)'],['创新路(雲滙 / 嘉熙)','創新路(雲滙 / 嘉熙)'],['海日湾II','海日灣II'],['科技大道西17号(集成电路开发中心)','科技大道西17號(集成電路開發中心)'],['科学园路(香港生物科技研究院)','科學園路(香港生物科技研究院)'],['马料水公众码头 / 马料水海滨','馬料水公眾碼頭 / 馬料水海濱'],['滨景花园(大涌桥路)','濱景花園(大涌橋路)'],['小沥源路 / 沙田第一城','小瀝源路 / 沙田第一城'],['威尔斯亲王医院 / 港铁第一城站','威爾斯親王醫院 / 港鐵第一城站'],['愉翠苑','愉翠苑'],['香港恒生大学 / 广源邨','香港恒生大學 / 廣源邨'],['帝堡城 / 绿怡雅苑','帝堡城 / 綠怡雅苑'],['黄泥头公共运输交汇处','黃泥頭公共運輸交匯處']]},
      {from:{sc:'黄泥头公共运输交汇处',tc:'黃泥頭公共運輸交匯處'}, to:{sc:'运头塘公共运输交汇处',tc:'運頭塘公共運輸交匯處'},
       first:{sc:'06:30',tc:'06:30'}, last:{sc:'22:00',tc:'22:00'},
       note:{sc:'每日服务，每 12-20 分钟一班',tc:'每日服務，每 12-20 分鐘一班'},
       stops:[['黄泥头公共运输交汇处','黃泥頭公共運輸交匯處'],['帝堡城 / 绿怡雅苑','帝堡城 / 綠怡雅苑'],['香港恒生大学 / 广源邨','香港恒生大學 / 廣源邨'],['愉翠苑','愉翠苑'],['港铁第一城站 / 沙田第一城','港鐵第一城站 / 沙田第一城'],['滨景花园(大涌桥路)','濱景花園(大涌橋路)'],['马料水海滨 / 马料水公众码头','馬料水海濱 / 馬料水公眾碼頭'],['科学园路(香港生物科技研究院)','科學園路(香港生物科技研究院)'],['科技大道西17号(集成电路开发中心)','科技大道西17號(集成電路開發中心)'],['海日湾II','海日灣II'],['创新路(雲滙 / 嘉熙)','創新路(雲滙 / 嘉熙)'],['科进路(逸瓏湾 / 海钻·天赋海湾)','科進路(逸瓏灣 / 海鑽·天賦海灣)'],['创新路(天赋海湾)','創新路(天賦海灣)'],['广福邨','廣福邨'],['宝乡街 / 广福道 / 绿汇学苑','寶鄉街 / 廣福道 / 綠匯學苑'],['大埔中心第四期 / 广福球场','大埔中心第四期 / 廣福球場'],['港铁大埔墟站','港鐵大埔墟站'],['逸雅苑 / 新达广场','逸雅苑 / 新達廣場'],['运头塘公共运输交汇处','運頭塘公共運輸交匯處']]}
    ]
  },
  '806B': {
    fare:'13.8', updated:'2026-11',
    orig:{sc:'运头塘',tc:'運頭塘',en:'Wan Tau Tong'}, dest:{sc:'硕门邨',tc:'碩門邨',en:'Shek Mun Estate'},
    name:{sc:'运头塘 ⇄ 硕门邨（经白石角、香港科学园、马鞍山）',tc:'運頭塘 ⇄ 碩門邨（經白石角、香港科學園、馬鞍山）',en:'Wan Tau Tong ⇄ Shek Mun Estate (via Pak Shek Kok, Science Park, Ma On Shan)'},
    dirs:[
      {from:{sc:'运头塘公共运输交汇处',tc:'運頭塘公共運輸交匯處'}, to:{sc:'硕门邨',tc:'碩門邨'},
       first:{sc:'06:30',tc:'06:30'}, last:{sc:'22:00',tc:'22:00'},
       note:{sc:'每日服务，每 12-25 分钟一班',tc:'每日服務，每 12-25 分鐘一班'},
       stops:[['运头塘公共运输交汇处','運頭塘公共運輸交匯處'],['新达广场 / 港铁大埔墟站','新達廣場 / 港鐵大埔墟站'],['大埔中心第四期 / 广福道','大埔中心第四期 / 廣福道'],['广福邨','廣福邨'],['创新路(天赋海湾)','創新路(天賦海灣)'],['科进路(海钻·天赋海湾 / 逸瓏湾)','科進路(海鑽·天賦海灣 / 逸瓏灣)'],['创新路(雲滙 / 嘉熙)','創新路(雲滙 / 嘉熙)'],['海日湾II','海日灣II'],['科技大道西17号','科技大道西17號'],['科学园路(香港生物科技研究院)','科學園路(香港生物科技研究院)'],['马料水公众码头 / 马料水海滨','馬料水公眾碼頭 / 馬料水海濱'],['We Go Mall(西沙路)','We Go Mall(西沙路)'],['欣安邨','欣安邨'],['港铁恒安站 / 海典湾','港鐵恆安站 / 海典灣'],['锦泰苑 / 德信中学','錦泰苑 / 德信中學'],['亚公角街(沙田医院)','亞公角街(沙田醫院)'],['滨景花园','濱景花園'],['沙田第一城 / 港铁石门站','沙田第一城 / 港鐵石門站'],['硕门邨','碩門邨']]},
      {from:{sc:'硕门邨',tc:'碩門邨'}, to:{sc:'运头塘公共运输交汇处',tc:'運頭塘公共運輸交匯處'},
       first:{sc:'06:30',tc:'06:30'}, last:{sc:'22:00',tc:'22:00'},
       note:{sc:'每日服务，每 12-25 分钟一班；特快班次（周一至五 07:00、17:00）不经科学园及白石角',tc:'每日服務，每 12-25 分鐘一班；特快班次（週一至五 07:00、17:00）不經科學園及白石角'},
       stops:[['硕门邨','碩門邨'],['港铁石门站 / 沙田第一城','港鐵石門站 / 沙田第一城'],['滨景花园','濱景花園'],['亚公角街(沙田医院)','亞公角街(沙田醫院)'],['锦泰苑 / 德信中学','錦泰苑 / 德信中學'],['港铁恒安站 / 海典湾','港鐵恆安站 / 海典灣'],['欣安邨 / We Go Mall','欣安邨 / We Go Mall'],['马料水海滨 / 马料水公众码头','馬料水海濱 / 馬料水公眾碼頭'],['科学园路(香港生物科技研究院)','科學園路(香港生物科技研究院)'],['科技大道西17号','科技大道西17號'],['海日湾II','海日灣II'],['创新路(雲滙 / 嘉熙)','創新路(雲滙 / 嘉熙)'],['科进路(逸瓏湾 / 海钻·天赋海湾)','科進路(逸瓏灣 / 海鑽·天賦海灣)'],['创新路(天赋海湾)','創新路(天賦海灣)'],['广福邨','廣福邨'],['大埔中心第四期 / 广福道','大埔中心第四期 / 廣福道'],['港铁大埔墟站 / 新达广场','港鐵大埔墟站 / 新達廣場'],['运头塘公共运输交汇处','運頭塘公共運輸交匯處']]}
    ]
  },
};
/* ================= 状态 ================= */
let QUICK = [], TRIPS = [], ROUTES = null, RSTOPS = null, STOPS = null, LINKS = null, STOP_ROUTES = null;
let curGroup = localStorage.getItem('bp_cur') || null;
let userStops = loadJSON('bp_stops', []);
let favRoutes = loadJSON('bp_routes', []);
let userTrips = loadJSON('bp_trips', []);
let TT = loadJSON('bp_tt', {});
let INFO = loadJSON('bp_info', {trip:{}, route:{}});
if (!INFO || typeof INFO !== 'object') INFO = {trip:{}, route:{}};
if (!INFO.trip) INFO.trip = {};
if (!INFO.route) INFO.route = {};
let CTBSTAT = loadJSON('bp_ctbstat', {});
let BOARD = loadJSON('bp_board', {});
let WXC = loadJSON('bp_wx', null);
let interval = +(localStorage.getItem('bp_interval') || 30);
let theme = localStorage.getItem('bp_theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
let countdown = 0, timerId = null, refreshing = false;
let routeCtx = null, nearbyCtx = null, deferredInstall = null, favEditMode = false;
let nearOpen = new Set(), nearRows = new Map();
let boardGroup = null, boardSeq = 0, routeSeq = 0, tripSeq = 0, routeSearchT = null;
let tripJobs = [], tripRendered = false;
let STOPCODES = loadJSON('bp_stopcodes', {});
let nearLimit = 10, tripSort = localStorage.getItem('bp_trip_sort') || 'eta';
// 实时定位展示态：locPlaceName = 最近站点名（含「附近」），非空时下拉弱化文案、顶部大字隐藏、地址行显示
let locPlaceName = null, hkOutOfRange = false, userPickedGroup = localStorage.getItem('bp_user_picked') === '1';
try { const _nl = loadJSON('bp_nearloc', null); if (_nl && _nl.length === 2) window._myLoc = _nl; } catch(e){}

const $ = s => document.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const badge = r => `<span class="badge" style="background:${CO_COLOR[r.co]||'var(--grey)'}">${esc(r.route)}</span>`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const activeView = () => (document.querySelector('.tab.active') || {}).dataset?.view || 'stop';

function loadJSON(k, def){ try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; } catch(e){ return def; } }
function saveJSON(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
function toast(msg){ const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(t._t); t._t = setTimeout(()=>{ t.hidden = true; }, 2400); }
async function jget(url, timeout=15000){
  const ctl = new AbortController(); const t = setTimeout(()=>ctl.abort(), timeout);
  try { const r = await fetch(url, {signal: ctl.signal}); if (!r.ok) throw new Error(r.status); return await r.json(); }
  finally { clearTimeout(t); }
}
async function jgetSoft(url, timeout=15000){ try { return await jget(url, timeout); } catch(e){ return null; } }
function dist(a, b, c, d){ const R=6371000, p=Math.PI/180, dLa=(c-a)*p, dLo=(d-b)*p;
  const x = Math.sin(dLa/2)**2 + Math.cos(a*p)*Math.cos(c*p)*Math.sin(dLo/2)**2;
  return Math.round(2*R*Math.asin(Math.sqrt(x))); }
function mins(iso){ if(!iso) return null; const ms = new Date(iso) - Date.now(); if (isNaN(ms)) return null; return Math.floor(ms/60000); }
function fmtMin(m){ if (m === null || m === undefined) return `<span class="eta-none">${T('noEta')}</span>`;
  if (m <= 0) return `<div class="eta-min arriving"><span class="u">${T('arriving')}</span></div>`;
  return `<div class="eta-min">${m}<span class="u"> ${T('min')}</span></div>`; }
function hm(iso){ const d = new Date(iso); return isNaN(d) ? '' : d.toTimeString().slice(0,5); }
function dtStr(ts){ const d = new Date(ts); return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }
function myLoc(){ return window._myLoc || DEFAULT_LOC; }
function hasGps(){ return !!window._myLoc; }
/* 香港境内判定：经纬度范围 + 最近天文台观测站距离双保险 */
function inHongKong(lat, lng){
  if (!isFinite(lat) || !isFinite(lng)) return false;
  if (lat < 22.15 || lat > 22.60 || lng < 113.80 || lng > 114.60) return false;
  const st = nearestWxStation(lat, lng);
  return !!st && dist(lat, lng, st.lat, st.lng) <= 60000;
}
/* 就近站点名（离线可用）：取用户语言对应站名 */
let nearestStopName = (lat, lng) => {
  if (!STOPS) return null;
  let best = null, bd = Infinity;
  const scan = arr => (arr || []).forEach(s => {
    const la = +s[4], lo = +s[5];
    if (!isFinite(la) || !isFinite(lo)) return;
    const d = dist(lat, lng, la, lo);
    if (d < bd){ bd = d; best = s; }
  });
  scan(STOPS.kmb); scan(STOPS.ctb);
  if (!best) return null;
  return lang === 'tc' ? best[1] : lang === 'en' ? best[3] : best[2];
};
/* 实时定位展示态：更新下拉文案、地址行、顶部大字、位置状态行 */
function renderLocDisplay(){
  const label = $('#quick-label'), pin = $('#quick-trigger .quick-pin');
  const place = $('#loc-place'), placeTxt = $('#loc-place-text');
  const title = $('#station-title'), line = $('#loc-line');
  const locating = !!locPlaceName;
  if (label){
    if (hkOutOfRange){ label.textContent = T('hkOnly'); label.style.color = ''; }
    else if (locating){ label.textContent = T('locModeLabel'); label.style.color = 'var(--muted)'; }
    else { label.style.color = ''; }
  }
  if (pin) pin.textContent = (locating && !hkOutOfRange) ? '◎' : '▦';
  if (place){
    if (locating && !hkOutOfRange && placeTxt){ placeTxt.textContent = locPlaceName + ' ' + T('nearSuffix'); place.classList.add('show'); }
    else place.classList.remove('show');
  }
  if (line){
    if (hkOutOfRange){ line.textContent = T('hkOnly'); line.classList.add('hk-warn'); }
    else { line.classList.remove('hk-warn'); line.textContent = hasGps() ? T('locUpdated') : T('locDefault'); }
  }
  // 顶部大字：定位展示态 / 境外态时隐藏；且只影响到站页
  if (title){
    if (activeView() === 'stop' && (locating || hkOutOfRange)) title.textContent = '';
    else if (activeView() === 'stop'){
      const g = findGroup(curGroup);
      title.textContent = g ? groupName(g) : (lang === 'en' ? 'Bus ETA' : '巴士到站');
    }
  }
  syncTopbar();
}
/* 用户在下拉里重新选了快捷站点：清除定位展示态，恢复字体颜色与顶部大字 */
function clearLocDisplay(){
  locPlaceName = null; hkOutOfRange = false;
  userPickedGroup = true; localStorage.setItem('bp_user_picked', '1');
}
async function loadStopCodes(){
  if (Object.keys(STOPCODES).length > 100) return;
  try { const d = await jget('data/stopcodes.json'); STOPCODES = (d && d.codes) || STOPCODES; saveJSON('bp_stopcodes', STOPCODES); } catch(e){}
}
function stopCode(co, id){
  if (co === 'CTB') return String(id);
  const c = STOPCODES[String(id)];
  return c || ('#' + String(id).slice(0, 6).toUpperCase());
}
function isRealCode(co, id){ const c = stopCode(co, id); return !!c && c[0] !== '#'; }
function nameWithCode(co, id, name){ if (co !== 'KMB' && co !== 'LWB') return name; const c = stopCode(co, id); return (c && c[0] !== '#') ? `${name} (${c})` : name; }
function cacheTip(t){ return `${T('cachedAt')} ${dtStr(t)} · ${T('cacheHint')}`; }
function syncTopbar(){
  const h = $('#topbar').offsetHeight;
  if (h) document.documentElement.style.setProperty('--tb-h', h + 'px');
}
async function runPool(items, n, fn){
  let i = 0;
  const worker = async () => { while (i < items.length){ const k = i++; try { await fn(items[k]); } catch(e){} } };
  await Promise.all(Array.from({length: Math.min(n, items.length)}, worker));
}

/* ================= 数据加载 ================= */
let tripsLoaded = false;
async function loadQuick(){
  if (!QUICK.length){
    const d = await jget('data/quickstops.json');
    QUICK = d.stops || [];
  }
  if (!tripsLoaded){
    const t = await jgetSoft('data/trips.json');
    if (t){ TRIPS = t.trips || []; tripsLoaded = true; }
  }
}
async function loadRoutes(){ if (ROUTES) return; ROUTES = await jget('data/routes.json'); }
async function loadRStops(){ if (RSTOPS) return; RSTOPS = await jget('data/routestop.json'); }
async function loadStops(){ if (STOPS) return; STOPS = await jget('data/stops.json'); }
async function loadLinks(){ if (LINKS) return; LINKS = await jget('data/links.json'); }

function lookupDest(co, route, dir, stype){
  if (!ROUTES) return null;
  try {
    if (co === 'KMB' || co === 'LWB'){
      let x = (ROUTES.kmb||[]).find(a => a[0] === route && String(a[1]) === String(stype) && a[2] === dir);
      if (!x) x = (ROUTES.kmb||[]).find(a => a[0] === route && a[2] === dir);
      return x ? {tc:x[7], sc:x[8], en:x[9]} : null;
    }
    if (co === 'CTB'){
      const x = (ROUTES.ctb||[]).find(a => a[0] === route && a[1] === dir);
      return x ? {tc:x[5], sc:x[6], en:x[7]} : null;
    }
    if (co === 'NLB'){
      const x = (ROUTES.nlb||[]).find(a => a[1] === route);
      return x ? {tc:x[2], sc:x[3], en:x[4]} : null;
    }
  } catch(e){}
  return null;
}

/* ================= ETA ================= */
const memCache = new Map();
async function cached(url, ttl){
  const hit = memCache.get(url);
  if (hit && Date.now() - hit.t < ttl) return hit.v;
  const v = await jgetSoft(url);
  if (v) memCache.set(url, {v, t: Date.now()});
  return v;
}
function pickEtas(list){
  return list.map(x => ({min: mins(x.eta || x.eta_1), iso: x.eta || x.eta_1, rmk: (x.rmk && x.rmk.length < 22) ? x.rmk : ''})).filter(e => e.min !== null);
}
function rowFromStopEta(x, stop){
  return {co: x.co, route: x.route, dir: x.dir, stype: x.service_type ?? null, stop,
    dest: x.dest_tc != null ? {tc: x.dest_tc, sc: x.dest_sc, en: x.dest_en} : {sc: x.dest, tc: x.dest, en: x.dest}};
}
async function fetchKmbStop(stop){
  const r = await jgetSoft(API.kmbStop(stop));
  if (!r || !r.data) return [];
  const groups = new Map();
  r.data.forEach(x => { const k = x.route+'|'+x.service_type+'|'+x.dir; if(!groups.has(k)) groups.set(k, {row: rowFromStopEta(x, stop), raw: []}); groups.get(k).raw.push(x); });
  return [...groups.values()].map(g => ({...g.row, etas: pickEtas(g.raw)}));
}
async function fetchKmbRoute(stop, route, stype){
  const r = await jgetSoft(API.kmbEta(stop, route, stype));
  if (!r || !r.data || !r.data.length) return [];
  const x0 = r.data[0];
  return [{co:'KMB', route, stype, dir:x0.dir, stop, dest:{sc:x0.dest_sc, tc:x0.dest_tc, en:x0.dest_en}, etas: pickEtas(r.data)}];
}
async function fetchCtbStopLive(stop){
  const r = await jgetSoft(API.ctbStopEta(stop));
  if (!r || !r.data) return [];
  const groups = new Map();
  r.data.forEach(x => { const k = x.route+'|'+x.dir; if(!groups.has(k)) groups.set(k, {row: rowFromStopEta(x, stop), raw: []}); groups.get(k).raw.push(x); });
  return [...groups.values()].map(g => ({...g.row, etas: pickEtas(g.raw)}));
}
/* CTB 站点线路清单只在首次（或 7 天后）下载，之后从本地读取 */
async function ctbStatic(stop){
  const hit = CTBSTAT[stop];
  if (hit && Date.now() - hit.u < 7 * 864e5) return hit.r;
  const r = await jgetSoft(API.ctbStopRoute(stop));
  if (r && Array.isArray(r.data)){
    CTBSTAT[stop] = {u: Date.now(), r: r.data.map(x => ({route:x.route, dir:x.dir}))};
    const ks = Object.keys(CTBSTAT);
    if (ks.length > 400) ks.slice(0, 120).forEach(k => delete CTBSTAT[k]);
    saveJSON('bp_ctbstat', CTBSTAT);
    return CTBSTAT[stop].r;
  }
  return hit ? hit.r : null;
}
async function fetchCtbStopFull(stop){
  const [live, stat] = await Promise.all([fetchCtbStopLive(stop), ctbStatic(stop)]);
  const rows = new Map();
  (live||[]).forEach(r => rows.set(r.route+'|'+r.dir, r));
  (stat||[]).forEach(x => {
    const k = x.route+'|'+x.dir;
    if (!rows.has(k)) rows.set(k, {co:'CTB', route:x.route, dir:x.dir, stype:null, stop, dest:{}, etas:[]});
  });
  const need = [...rows.values()].some(r => !r.dest || !r.dest.sc);
  if (need){
    await loadRoutes().catch(()=>null);
    rows.forEach(r => { if (!r.dest || !r.dest.sc){ const d = lookupDest('CTB', r.route, r.dir, null); if (d) r.dest = d; } });
  }
  return [...rows.values()];
}
async function fetchCtbRoute(stop, route){
  const r = await jgetSoft(API.ctbEta(stop, route));
  if (!r || !r.data || !r.data.length) return [];
  const x0 = r.data[0];
  return [{co:'CTB', route, stype:null, dir:x0.dir, stop, dest:{sc:x0.dest_sc, tc:x0.dest_tc, en:x0.dest_en}, etas: pickEtas(r.data)}];
}
async function fetchNlbStop(stop, filter){
  const r = await jgetSoft(API.nlbStopEta(stop));
  if (!r || !r.data) return [];
  const groups = new Map();
  r.data.forEach(x => { const k = x.route+'|'+x.dest; if(!groups.has(k)) groups.set(k, {row: rowFromStopEta(x, stop), raw: []}); groups.get(k).raw.push(x); });
  let rows = [...groups.values()].map(g => ({...g.row, etas: pickEtas(g.raw)}));
  if (filter) rows = rows.filter(filter);
  return rows;
}
async function fetchStopLive(co, id){
  if (co === 'KMB' || co === 'LWB') return await fetchKmbStop(id);
  if (co === 'CTB') return await fetchCtbStopFull(id);
  return [];
}

/* ================= 九巴官网班表 / 车费 / 实体站牌编号 ================= */
const KMBW = 'https://search.kmb.hk/KMBWebSite/Function/FunctionRequest.ashx?';
async function kmbWeb(action, params, ttl){
  ttl = ttl || 7 * 86400e3;
  const q = `action=${action}` + (params ? '&' + params : '');
  const key = 'bp_kw:' + q;
  const hit = loadJSON(key, null);
  if (hit && Date.now() - hit.t < ttl) return hit.d;
  if (!navigator.onLine) return hit ? hit.d : null;
  try {
    const ctl = new AbortController(); const to = setTimeout(()=>ctl.abort(), 10000);
    const res = await fetch(KMBW + q, {method:'POST', headers:{'Content-Type':'application/json; charset=utf-8'}, body:'{}', signal:ctl.signal});
    clearTimeout(to);
    const j = await res.json();
    if (!j || !j.result) return hit ? hit.d : null;
    saveJSON(key, {t:Date.now(), d:j.data});
    // 限制官网数据缓存数量，避免 localStorage 超限
    try {
      const keys = Object.keys(localStorage).filter(k => k.indexOf('bp_kw:') === 0);
      if (keys.length > 90){
        keys.sort((a,b) => (loadJSON(a,{t:0}).t||0) - (loadJSON(b,{t:0}).t||0));
        keys.slice(0, 20).forEach(k => localStorage.removeItem(k));
      }
    } catch(e){}
    return j.data;
  } catch(e){ return hit ? hit.d : null; }
}
/* 预置班表（离线推算兜底）：随包发布、SW 缓存，用户清空 localStorage 后仍可用 */
let SCHED_PRESET = null, schedPresetTried = false;
async function loadSchedulePreset(){
  if (schedPresetTried) return SCHED_PRESET;
  schedPresetTried = true;
  try { SCHED_PRESET = await jgetSoft('data/schedule.json'); } catch(e){ SCHED_PRESET = null; }
  return SCHED_PRESET;
}
function presetMeta(c){
  if (!SCHED_PRESET || !SCHED_PRESET.lines) return null;
  const bound = (c.dir === 'I' || String(c.dir) === '2') ? 2 : 1, stype = String(c.stype || '1');
  const L = SCHED_PRESET.lines[`${c.route}|${bound}|${stype}`];
  if (!L || !Array.isArray(L.list)) return null;
  return {route:c.route, bound, stype:Number(stype), list:L.list, sched:L.sched || {}, fare:L.fare || 0,
    basic:L.basic || {}, jt:L.jt || {}, t:L.capturedAt || 0, capturedAt:L.capturedAt || 0, preset:true};
}
async function kmbRouteMeta(c){
  if (c.co !== 'KMB' && c.co !== 'LWB') return null;
  const route = c.route, bound = (c.dir === 'I' || String(c.dir) === '2') ? 2 : 1, stype = c.stype || '1';
  const q1 = `route=${encodeURIComponent(route)}&bound=${bound}&serviceType=${stype}`;
  const [stops, sched] = await Promise.all([
    kmbWeb('getstops', q1),
    kmbWeb('getschedule', `route=${encodeURIComponent(route)}&bound=${bound}&serviceType=${stype}`)
  ]);
  // 缓存缺失（离线且官网缓存被清）：回落到随包预置班表
  if (!stops || !Array.isArray(stops.routeStops)){
    await loadSchedulePreset();
    return presetMeta({co:c.co, route, dir:c.dir, stype});
  }
  const list = stops.routeStops.filter(x => /^F/i.test(String(x.Direction || '').trim()) && /^\d+$/.test(String(x.Seq)))
    .sort((a,b) => (+a.Seq) - (+b.Seq))
    .map(x => ({seq:+x.Seq, code:((String(x.CName).match(/\(([A-Z]{2}\d{2,5})\)/) || [])[1]) || '',
      name:{tc:x.CName, sc:x.SCName || x.CName, en:x.EName}, fare:+x.AirFare || 0}));
  const fare = list.reduce((m,x) => Math.max(m, x.fare || 0), 0);
  const kwHit = loadJSON(`bp_kw:action=getschedule&route=${encodeURIComponent(route)}&bound=${bound}&serviceType=${stype}`, null);
  return {route, bound, stype:Number(stype), list, sched, fare, basic:stops.basicInfo || {},
    t:Date.now(), capturedAt:(kwHit && kwHit.t) || Date.now(), preset:false};
}
function hhmmToMin(str){
  const m = String(str || '').replace(/[\*\s]/g,'').match(/(\d{1,2}):(\d{2})/);
  return m ? (+m[1]) * 60 + (+m[2]) : null;
}
function headwayMin(str){
  const nums = String(str || '').match(/\d+(?:\.\d+)?/g);
  if (!nums || !nums.length) return null;
  const v = nums.map(Number);
  return v.reduce((a,b)=>a+b,0) / v.length;
}
function minToHm(m){
  const v = ((m % 1440) + 1440) % 1440;
  return String(Math.floor(v/60)).padStart(2,'0') + ':' + String(v%60).padStart(2,'0');
}
function scheduleInfo(meta, date){
  if (!meta || !meta.sched) return null;
  const day = date.getDay(), type = day === 0 ? 'H' : day === 6 ? 'S' : 'MF';
  const rows = [];    // 班距窗口：BoundText1 为 "HH:MM-HH:MM"，配 BoundTime1 班距
  const points = [];  // 精确发车时刻：BoundText1 为单个 "HH:MM"（如 82D 每日两班 07:15 / 18:10）
  Object.keys(meta.sched).forEach(k => (meta.sched[k] || []).forEach(x => {
    const st = String(x.ServiceType || '').trim();
    if (st && Number(st) !== Number(meta.stype)) return;
    if (String(x.DayType || '').trim() !== type && String(x.DayType || '').trim() !== 'D') return;
    const raw = String(x.BoundText1 || '').replace(/\*/g,'').trim();
    const p = raw.split('-');
    // 单个精确时刻（无 "-"、无班距文字）——按点处理，绝不按班距循环
    if (p.length === 1 && /^\d{1,2}:\d{2}$/.test(raw.trim())){
      const a = hhmmToMin(raw); if (a != null) points.push(a);
      return;
    }
    const a = hhmmToMin(p[0]), b = p.length > 1 ? hhmmToMin(p[1]) : null;
    if (a == null || b == null) return;
    let end = b <= a ? b + 1440 : b;
    const head = headwayMin(x.BoundTime1) || 15;
    rows.push({start:a, end, head, win:raw});
  }));
  if (!rows.length && !points.length) return null;
  rows.sort((a,b)=>a.start-b.start);
  points.sort((a,b)=>a-b);
  const allTimes = [...points, ...rows.flatMap(r=>[r.start, r.end])];
  return {
    windows: rows,
    points,
    first: minToHm(Math.min(...allTimes)),
    last: minToHm(Math.max(...points.length ? [...points, ...rows.map(r=>r.end)] : rows.map(r=>r.end)))
  };
}
function nextDeparture(sched, date){
  if (!sched || (!sched.windows.length && !sched.points.length)) return null;
  const base = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const now = date.getHours()*60 + date.getMinutes() + date.getSeconds()/60;
  const cand = [];  // {t, head}  t 为当天分钟数（可能 >1440 表示次日）
  // 精确发车点：只取今天尚未发车的具体时刻
  (sched.points || []).forEach(t => { if (t > now) cand.push({t, head:0}); });
  // 班距窗口：仅在真实服务时段内按班距推算
  sched.windows.forEach(w => {
    if (now < w.start) cand.push({t:w.start, head:w.head});
    else if (now <= w.end) cand.push({t:Math.ceil((now - w.start) / w.head) * w.head + w.start, head:w.head});
  });
  let pick;
  if (cand.length){
    pick = cand.reduce((a,b)=> b.t < a.t ? b : a);
  } else {
    // 今日所有班次已过：取次日最早的一班车（精确点优先，否则窗口起点）
    const nexts = [...(sched.points||[]).map(t=>({t:t+1440, head:0})),
      ...sched.windows.map(w=>({t:w.start+1440, head:w.head}))];
    if (!nexts.length) return null;
    pick = nexts.reduce((a,b)=> b.t < a.t ? b : a);
  }
  return {time:new Date(base + pick.t*60000), head:pick.head || (sched.windows[0]?.head || 0), sched, nextDay:pick.t >= 1440};
}
async function kmbJourney(meta, seq1, seq2){
  if (seq1 == null || seq2 == null || seq1 === seq2) return 0;
  // 预置数据：行车时间按 seq 存，离线直接取
  if (meta.preset && meta.jt && meta.jt[String(seq2)] != null){
    const pv = Number(meta.jt[String(seq2)]);
    if (pv >= 0) return pv;
  }
  const q = `route=${encodeURIComponent(meta.route)}&bound=${meta.bound}&serviceType=${meta.stype}&seq1=${seq1}&seq2=${seq2}`;
  const d = await kmbWeb('getjtbyfromtostop', q, 30*86400e3);
  const v = d && Number(d.Journey_time);
  return v > 0 ? v : null;
}
async function kmbEstimate(c, stopId){
  const meta = await kmbRouteMeta(c);
  if (!meta) return null;
  const sched = scheduleInfo(meta, new Date());
  if (!sched) return null;
  const dep = nextDeparture(sched, new Date());
  if (!dep) return null;
  const code = isRealCode('KMB', stopId) ? stopCode('KMB', stopId) : '';
  const target = code ? meta.list.find(x => x.code === code) : null;
  const jt = target ? await kmbJourney(meta, 0, target.seq) : null;
  return {dep:dep.time, head:dep.head, arrive:jt != null ? new Date(dep.time.getTime() + jt*1000) : null,
    fare:meta.fare, first:sched.first, last:sched.last, code:code || (target ? target.code : ''), stopName:target ? nm(target.name) : '',
    capturedAt:meta.capturedAt || 0, preset:!!meta.preset, nextDay:!!dep.nextDay};
}
async function enrichBoardEstimates(rows){
  const jobs = rows.filter(r => !r.etas || !r.etas.length || r.etas[0].min == null)
    .filter(r => r.co === 'KMB' || r.co === 'LWB').slice(0, 16);
  if (!jobs.length) return false;
  let changed = false;
  await runPool(jobs, 3, async r => {
    try {
      const e = await kmbEstimate({co:r.co, route:r.route, dir:r.dir, stype:r.stype || '1'}, r.stop);
      if (e){ r.tt = e; changed = true; }
    } catch(e){}
  });
  return changed;
}

/* ================= 天气 ================= */
let wxLoading = false;
function localDay(){ const d = new Date(); return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`; }
function nearestWxStation(lat, lng){
  let best = null, bd = Infinity;
  WX_STATIONS.forEach(s => { const d = dist(lat, lng, s.lat, s.lng); if (d < bd){ bd = d; best = s; } });
  return best;
}
async function loadWeather(force){
  // 每天只更新一次：当天已拉取过就直接用本地缓存（切换站点由本地观测站数据就近匹配，无需再联网）
  if (WXC && WXC.day === localDay() && WXC.v) return WXC.v;
  if (wxLoading) return WXC ? WXC.v : null;
  wxLoading = true;
  try {
    const d = await jgetSoft(API.weather, 12000);
    if (!d || !d.temperature || !Array.isArray(d.temperature.data)) return WXC ? WXC.v : null;
    const loc = myLoc();
    const st = nearestWxStation(loc[0], loc[1]);
    const temps = d.temperature.data.map(x => ({p: x.place, v: Number(x.value)}));
    const row = st ? temps.find(x => x.p === st.tc) : null;
    const first = temps[0];
    const temp = row ? row.v : (first ? first.v : null);
    const hum = d.humidity && d.humidity.data && d.humidity.data[0] ? Number(d.humidity.data[0].value) : null;
    const code = Array.isArray(d.icon) ? d.icon[0] : 54;
    const warn = typeof d.warningMessage === 'string' ? d.warningMessage.trim() : '';
    WXC = {day: localDay(), t: Date.now(), v: {place: st, temp, temps, hum, code, warn, update: d.updateTime || ''}};
    saveJSON('bp_wx', WXC);
    return WXC.v;
  } finally { wxLoading = false; }
}
async function refreshWeather(force){
  const v = await loadWeather(force);
  renderWeather(v);
}
function renderWeather(v){
  const box = $('#stop-weather');
  if (!box) return;
  const w = v || (WXC && WXC.v);
  if (!w){ box.hidden = true; return; }
  if (!navigator.onLine && !WXC){ box.hidden = true; return; }
  box.hidden = false;
  // 以当前选中的常用站点为准取最近观测站（切换站点即时切换，无需重新联网）
  const g = curGroup ? findGroup(curGroup) : null;
  const loc = (g && g.lat) ? [+g.lat, +g.lng] : myLoc();
  // 只在该站确有观测值时采用，避免「显示 A 站名却用 B 站温度」
  const avail = w.temps ? new Set(w.temps.map(x => x.p)) : null;
  let place = null, bd = Infinity;
  WX_STATIONS.forEach(s => {
    if (avail && !avail.has(s.tc)) return;
    const d0 = dist(loc[0], loc[1], s.lat, s.lng);
    if (d0 < bd){ bd = d0; place = s; }
  });
  if (!place) place = nearestWxStation(loc[0], loc[1]);
  let temp = w.temp;
  if (w.temps && place){
    const row = w.temps.find(x => x.p === place.tc);
    if (row){ temp = row.v; }
  }
  const p = place ? (lang === 'en' ? place.en : lang === 'tc' ? place.tc : place.sc) : '';
  // 简短文字描述 + 温度 + 湿度，一行小字显示在「位置」右侧
  const parts = [wxDesc(w.code), temp != null ? temp + '°' : '', w.hum != null ? `${T('humidity')} ${w.hum}%` : ''].filter(Boolean);
  box.innerHTML = `${wxIcon(w.code)} ${esc(parts.join(' · '))}`;
  box.title = `${p} ${temp != null ? temp + '°C' : ''} · ${wxDesc(w.code)}${w.hum != null ? ' · ' + T('humidity') + ' ' + w.hum + '%' : ''}`;
  box.onclick = () => {
    const more = [p, temp != null ? temp + '°C' : '', wxDesc(w.code), w.hum != null ? T('humidity') + ' ' + w.hum + '%' : ''].filter(Boolean);
    toast(more.join(' · ') + (w.warn ? ' · ⚠️ ' + w.warn : ''));
  };
  syncTopbar();   // 天气胶囊换行会改变顶栏高度，及时同步 --tb-h 避免遮挡
}

/* ================= 刷新调度 ================= */
const AUTO_VIEWS = {stop: 1, trip: 1};   // 只有「到站」「行程」自动刷新
function setRing(sec){ $('#ring-fg').style.strokeDashoffset = 100.5 * (1 - sec/interval); $('#ring-num').textContent = sec; }
function startTimer(){ stopTimer(); countdown = interval; setRing(countdown);
  timerId = setInterval(()=>{
    if (document.hidden) return;
    countdown--;
    if (countdown <= 0){
      countdown = interval;
      if (AUTO_VIEWS[activeView()]) refreshCurrent();
    }
    setRing(countdown);
  }, 1000);
}
function stopTimer(){ if (timerId) clearInterval(timerId); timerId = null; }
async function refreshCurrent(){ if (refreshing) return; refreshing = true;
  try { await renderCurrent(); } finally { refreshing = false; }
}

/* ================= 视图切换 ================= */
function switchView(v, opts){
  opts = opts || {};
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === v));
  ['stop','trip','route','nearby','settings'].forEach(x => { $('#view-'+x).hidden = (x !== v); });
  const row = $('#chips-row'); if (row) row.hidden = (v !== 'stop');
  const appName = lang === 'en' ? 'Bus ETA' : '巴士到站';
  const onStop = (v === 'stop');
  $('#loc-line').style.visibility = onStop ? 'visible' : 'hidden';
  const wxb = $('#stop-weather');
  if (wxb) wxb.style.visibility = onStop ? 'visible' : 'hidden';
  const ring = $('#refresh-ring');
  if (ring) ring.style.visibility = AUTO_VIEWS[v] ? 'visible' : 'hidden';
  if (!onStop) $('#station-title').textContent = appName;
  if (v === 'stop'){ renderBoard(); refreshWeather(false); }
  if (v === 'trip') renderTrips();
  if (v === 'route'){
    if (opts.noRouteRender) { /* 由 openRouteView 负责 */ }
    else if (routeCtx) renderRouteBoard();
    else if ($('#route-input').value.trim()) doRouteSearch();
    else renderFavRoutes();
  }
  if (v === 'nearby') renderNearby();
  if (v === 'settings') renderSettings();
  syncTopbar();
  setTimeout(syncTopbar, 80);
}
function renderCurrent(){
  const v = activeView();
  if (v === 'stop') return renderBoard().then(()=>refreshWeather(false));
  if (v === 'trip') return renderTrips(true);
  if (v === 'route') return routeCtx ? renderRouteBoard() : Promise.resolve();
  if (v === 'nearby') return renderNearby(true);
  return Promise.resolve();
}

/* ================= 常用站点 chips ================= */
function groupList(){
  return [
    ...QUICK.map(g => ({...g, builtin:true})),
    ...userStops.map(u => ({id:'u_'+u.id, name_sc:u.name_sc, name_tc:u.name_tc, name_en:u.name_en,
      lat:+u.lat, lng:+u.lng, stops:{[String(u.co).toUpperCase()]:[u.id]}, builtin:false}))
  ];
}
function findGroup(id){ return groupList().find(g => g.id === id); }
function groupName(g){ return lang==='tc' ? g.name_tc : lang==='en' ? (g.name_en||g.name_sc) : g.name_sc; }
function renderChips(){
  const menu = $('#chips'); if (!menu) return;
  const gs = groupList();
  if (!curGroup && gs.length) curGroup = gs[0].id;
  const cur = gs.find(g => g.id === curGroup) || gs[0];
  const label = $('#quick-label');
  if (label) label.textContent = cur ? groupName(cur) : T('nearTitle');
  // 展开列表：第 1 项实时定位，其后为全部常用站点（含用户自行添加）
  menu.innerHTML = '';
  const gps = el('button', 'quick-item gps');
  gps.innerHTML = `<span class="qi-ico">📍</span><span class="qi-name">${esc(T('locateBtn'))}</span>`;
  gps.onclick = (ev) => { ev.stopPropagation(); closeQuickMenu(); locateAndRender(); };
  menu.appendChild(gps);
  const loc = myLoc();
  gs.forEach(g => {
    const b = el('button', 'quick-item' + (g.id === curGroup ? ' active' : ''));
    let distHtml = '';
    if (g.lat){ const d = dist(loc[0], loc[1], g.lat, g.lng); distHtml = `<span class="dist">${d<1000? Math.round(d)+'m' : (d/1000).toFixed(1)+'km'}</span>`; }
    b.innerHTML = `<span class="qi-ico">▦</span><span class="qi-name">${esc(groupName(g))}</span>${distHtml}`;
    b.onclick = (ev) => {
      ev.stopPropagation(); clearLocDisplay();
      curGroup = g.id; localStorage.setItem('bp_cur', g.id);
      closeQuickMenu(); renderChips(); renderBoard(); renderLocDisplay();
    };
    menu.appendChild(b);
  });
  renderLocDisplay();
  renderWeather(WXC && WXC.v);
}
function toggleQuickMenu(){
  const m = $('#chips'), t = $('#quick-trigger'); if (!m) return;
  const open = m.hidden;
  m.hidden = !open;
  if (t) t.setAttribute('aria-expanded', open ? 'true' : 'false');
}
function closeQuickMenu(){ const m = $('#chips'); if (m) m.hidden = true; }

/* ================= 到站板 ================= */
async function groupRows(g){
  const stops = g.stops || {};
  const tasks = [];
  (stops.KMB||[]).forEach(s => tasks.push(fetchKmbStop(s)));
  (stops.CTB||[]).forEach(s => tasks.push(fetchCtbStopFull(s)));
  (stops.NLB||[]).forEach(n => tasks.push(fetchNlbStop(n.stopId)));
  const res = await Promise.all(tasks);
  return res.flat().filter(Boolean);
}
/* 同一路线在同一常用站点多个站柱重复出现时合并，取最早一班 */
function mergeRows(rows){
  const map = new Map();
  rows.forEach(r => {
    const k = [r.co, r.route, r.dir ?? '', nm(r.dest)].join('|');
    const cur = map.get(k);
    if (!cur){ map.set(k, r); return; }
    const a = cur.etas[0] ? cur.etas[0].min : null;
    const b = r.etas[0] ? r.etas[0].min : null;
    if (a == null || (b != null && b < a)) map.set(k, r);
  });
  return [...map.values()];
}
function sortRows(rows){
  return rows.sort((a,b) => {
    const ma = a.etas[0] && a.etas[0].min, mb = b.etas[0] && b.etas[0].min;
    if (ma == null && mb == null) return (a.route||'').localeCompare(b.route||'', undefined, {numeric:true});
    if (ma == null) return 1; if (mb == null) return -1;
    return ma - mb;
  });
}
function rowKey(r){ return [r.co, r.route, r.stype ?? '', r.dir ?? '', r.stop ?? ''].join('|'); }
function isFav(r){ return favRoutes.some(f => f.co === r.co && f.route === r.route); }
function ttFreshTag(tt){
  if (!tt || !tt.capturedAt) return '';
  const d = new Date(tt.capturedAt);
  if (isNaN(d)) return '';
  const md = `${d.getMonth()+1}/${d.getDate()}`;
  const stale = Date.now() - tt.capturedAt > 30*86400e3;
  return `<span class="tt-fresh${stale ? ' stale' : ''}">(${esc(T('schedOn'))} ${md}${stale ? ' · '+esc(T('schedStale')) : ''})</span>`;
}
function rowHtml(r){
  const dest = nm(r.dest);
  const e0 = (r.etas && r.etas[0]) || {min:null};
  const live = e0.min != null;
  const etaHtml = live ? fmtMin(e0.min)
    : (r.tt ? `<div class="eta-min tt-eta">${r.tt.nextDay ? '<span class="tt-day">'+esc(T('nextDay'))+'</span>' : ''}${esc(hm(r.tt.arrive || r.tt.dep))}</div><div class="eta-next">${esc(T('nextDep'))} ${esc(hm(r.tt.dep))} ${esc(T('depAt'))}${r.tt.arrive ? ' · '+esc(T('estArrive'))+' '+esc(hm(r.tt.arrive)) : ''}</div>${ttFreshTag(r.tt)}` : fmtMin(null));
  const nextHtml = live && r.etas.length > 1 ? `<div class="eta-next">${T('later')} ${r.etas.slice(1).map(e=>e.min+'′').join(' / ')}</div>` : '';
  const rmkTag = e0.rmk ? `<span class="tag">${esc(e0.rmk)}</span>` : '';
  const code = isRealCode(r.co, r.stop) ? ' · ' + esc(stopCode(r.co, r.stop)) : '';
  const sub = `${coName(r.co)}${e0.iso ? ' · '+hm(e0.iso) : ''}${code}`;
  return `<div class="row" data-key="${esc(rowKey(r))}">
    ${badge(r)}
    <div class="row-mid">
      <div class="row-dest">${rmkTag}${esc(dest || T('unknownDest'))}${isFav(r)? '<span class="star">★</span>':''}</div>
      <div class="row-sub">${esc(sub)}</div>
    </div>
    <div class="row-eta">${etaHtml}${nextHtml}</div>
  </div>`;
}
function paintBoard(rows){
  const live = rows.filter(r => r.etas && r.etas[0] && r.etas[0].min != null);
  const est = rows.filter(r => !(r.etas && r.etas[0] && r.etas[0].min != null) && r.tt);
  const off = rows.filter(r => !(r.etas && r.etas[0] && r.etas[0].min != null) && !r.tt);
  let html = '';
  if (live.length) html += `<div class="board-group">${live.map(r=>rowHtml(r)).join('')}</div>`;
  if (est.length) html += `<div class="group-title">${T('kbEstimate')}</div><div class="board-group">${est.map(r=>rowHtml(r)).join('')}</div>`;
  if (off.length) html += `<div class="group-title">${navigator.onLine ? T('offService') : T('offlineShort')}</div><div class="board-group">${off.map(r=>rowHtml(r)).join('')}</div>`;
  if (!rows.length) html = `<div class="board-group"><div class="row"><div class="row-mid"><div class="row-sub">${navigator.onLine ? T('noRoutes') : T('offline')}</div></div></div></div>`;
  $('#board').innerHTML = html;
  document.querySelectorAll('#board .row').forEach(d => d.addEventListener('click', () => {
    const r = rows.find(x => rowKey(x) === d.dataset.key);
    if (r) openRouteView({co:r.co, route:r.route, stype:r.stype, dir:r.dir, dest:r.dest, hlStop:r.stop});
  }));
}
/* 到站板静态信息缓存：首次刷新后保存，之后即使离线也能显示线路名 */
function boardCache(gid){
  const c = BOARD[gid];
  if (!c) return null;
  if (Array.isArray(c)) return {rows: c, t: 0};
  return c.rows ? c : null;
}
function saveBoardStatic(gid, rows){
  BOARD[gid] = {t: Date.now(), rows: rows.slice(0, 90).map(r => ({co:r.co, route:r.route, dir:r.dir, stype:r.stype, stop:r.stop, dest:r.dest, tt:r.tt || null}))};
  const ks = Object.keys(BOARD);
  if (ks.length > 12) ks.slice(0, ks.length - 12).forEach(k => delete BOARD[k]);
  saveJSON('bp_board', BOARD);
}
async function renderBoard(){
  let g = findGroup(curGroup);
  const seq = ++boardSeq;
  if (!g){
    const gs = groupList();
    if (!gs.length){ $('#board').innerHTML = ''; return; }
    curGroup = gs[0].id; localStorage.setItem('bp_cur', curGroup);
    g = gs[0]; renderChips();
  }
  renderLocDisplay();   // 统一处理顶部大字 / 位置状态行（定位展示态时隐藏大字）
  renderWeather(WXC && WXC.v);   // 只更新天气，不重建 chips（避免定时刷新把横向滚动位置重置）
  syncTopbar();
  const cache = boardCache(g.id);
  const changed = boardGroup !== g.id;
  if (cache && changed){
    paintBoard(cache.rows.map(r => ({...r, etas:[]})));
    $('#board-status').textContent = T('updating');
  } else if (changed){
    $('#board-status').textContent = T('loading');
  }
  // 离线：用本地缓存的线路清单，并按班表推算下一班（在线缓存 → 官网缓存 → 随包预置）
  if (!navigator.onLine){
    const liveRows = cache ? cache.rows.map(r => ({...r, etas:[]})) : [];
    paintBoard(liveRows);
    $('#board-status').textContent = `${T('offline')}${cache && cache.t ? ' · ' + T('offlineData') + ' ' + dtStr(cache.t) : ''}`;
    if (liveRows.length){
      const offlineChanged = await enrichBoardEstimates(liveRows);
      if (offlineChanged && seq === boardSeq){
        paintBoard(liveRows);
        saveBoardStatic(g.id, liveRows);
        $('#board-status').textContent = `${T('offline')} · ${T('offlineEst')}`;
      }
    }
    return;
  }
  let rows = [];
  try { rows = sortRows(mergeRows(await groupRows(g))); }
  catch(e){
    if (seq !== boardSeq) return;
    if (cache){ paintBoard(cache.rows.map(r => ({...r, etas:[]}))); $('#board-status').textContent = cacheTip(cache.t); }
    else $('#board-status').textContent = T('fail');
    return;
  }
  if (seq !== boardSeq) return;
  if (!rows.length && cache){
    paintBoard(cache.rows.map(r => ({...r, etas:[]})));
    $('#board-status').textContent = cacheTip(cache.t);
    return;
  }
  boardGroup = g.id;
  $('#board-status').textContent = navigator.onLine
    ? `${T('updated')} ${new Date().toTimeString().slice(0,8)}`
    : `${T('offline')} · ${new Date().toTimeString().slice(0,8)}`;
  saveBoardStatic(g.id, rows);
  paintBoard(rows);
  // 无实时班次的九巴线路：按官网班表推算下一班开出与到达本站时间（结果缓存 7 天）
  if (navigator.onLine) enrichBoardEstimates(rows).then(changed => {
    if (changed && seq === boardSeq){ paintBoard(rows); saveBoardStatic(g.id, rows); }
  });
}

/* ================= 行程 ================= */
function tripStoreKey(e){ return [e.co, e.routeNo || e.route || '', e.stopId || '', e.stype ?? '', e.dir ?? ''].join('|'); }
async function renderTrips(soft){
  const seq = ++tripSeq;
  const box = $('#trips-list');
  // 自动刷新：只更新到站时刻，线路名 / 终点 / 候车站等固定信息保持原样，不重绘不闪烁
  if (soft && tripRendered && tripJobs.length && box.children.length){
    await runPool(tripJobs, 3, async job => {
      if (job.kind === 'extra') await fillTripExtra(job, true);
      else await fillTripRow(job, true);
    });
    if (seq === tripSeq) saveJSON('bp_info', INFO);
    return;
  }
  tripRendered = false; tripJobs = [];
  box.innerHTML = '';
  const addBtn = $('#btn-add-trip'); if (addBtn) addBtn.textContent = '+ ' + T('addTrip');
  let quickOk = true;
  try { await loadQuick(); } catch(e){ quickOk = false; }
  if (seq !== tripSeq) return;
  const all = [...TRIPS.map(t => ({...t, builtin:true})), ...userTrips]
    .filter(t => t && Array.isArray(t.entries))
    .map(t => ({...t, entries: t.entries.filter(e => e && e.co), extras: (t.extras||[]).filter(e => e && e.co)}))
    .filter(t => t.entries.length);
  if (!all.length){
    box.innerHTML = `<div class="status-line">${quickOk ? T('tripEmpty') : T('offlineNoData')}</div>`;
    return;
  }
  const jobs = [];
  all.forEach((t, idx) => {
    const card = el('div','trip-card');
    card.dataset.add = idx;
    card.dataset.route = String((t.entries[0] && (t.entries[0].routeNo || t.entries[0].route)) || '').padStart(6,'0');
    card.dataset.eta = 99999;
    const fromTxt = lang==='en' ? (t.from_en || t.from_sc) : lang==='tc' ? t.from_tc : t.from_sc;
    const toTxt = lang==='en' ? (t.to_en || t.to_sc) : lang==='tc' ? t.to_tc : t.to_sc;
    card.innerHTML = `<div class="trip-head"><div class="trip-title">${esc(fromTxt)}<span class="arrow">→</span>${esc(toTxt)}</div>${t.builtin?'':`<button class="trip-del">✕</button>`}</div>`;
    const rowsBox = el('div');
    t.entries.forEach(e => {
      const row = el('div','row loading');
      const ci = INFO.trip[tripStoreKey(e)];
      row.innerHTML = `<span class="badge" style="background:${CO_COLOR[e.co]||'var(--grey)'}">${esc(e.routeNo||e.route||'')}</span>
        <div class="row-mid">
          <div class="row-dest">${esc(ci ? nm(ci.dest) : (e.stopName || ''))}</div>
          <div class="row-sub">${esc(coName(e.co))} · ${T('boardStop')}: ${esc(e.stopName||'')}</div>
        </div>
        <div class="row-eta"><span class="eta-none">…</span></div>`;
      rowsBox.appendChild(row);
      jobs.push({kind:'eta', row, e, cached: ci || null});
    });
    card.appendChild(rowsBox);
    if (t.hint) card.insertAdjacentHTML('beforeend', `<div class="trip-hint">${esc(pickB(t.hint))}</div>`);
    if (t.extras && t.extras.length){
      const extraBox = el('div','trip-extra');
      t.extras.forEach(ex => {
        const span = el('div','row extra-line');
        span.innerHTML = `${badge(ex)}<div class="row-mid"><div class="row-dest">${esc(pickB(ex.label))}</div><div class="row-sub">${esc(coName(ex.co))} · ${esc(T('transfer'))}</div></div><div class="row-eta ex-time"><span class="eta-none">…</span></div>`;
        const ck = 'x:' + [ex.co, ex.route, ex.stopId].join('|');
        span.dataset.cache = ck;
        extraBox.appendChild(span);
        jobs.push({kind:'extra', span, ex, cacheKey:ck});
      });
      card.appendChild(extraBox);
    }
    if (!t.builtin) card.querySelector('.trip-del').onclick = () => { userTrips = userTrips.filter(x => x !== t); saveJSON('bp_trips', userTrips); renderTrips(); };
    box.appendChild(card);
  });
  tripJobs = jobs;
  await runPool(jobs, 3, async job => {
    if (job.kind === 'extra') return await fillTripExtra(job);
    await fillTripRow(job);
  });
  if (seq !== tripSeq) return;
  tripRendered = true;
  sortTripCards();
  saveJSON('bp_info', INFO);
}
function sortTripCards(){
  const box = $('#trips-list'); if (!box) return;
  const cards = [...box.querySelectorAll('.trip-card')];
  const key = tripSort;
  cards.sort((a,b) => key === 'add' ? (+a.dataset.add) - (+b.dataset.add)
    : key === 'route' ? a.dataset.route.localeCompare(b.dataset.route)
    : (+a.dataset.eta) - (+b.dataset.eta));
  cards.forEach(c => box.appendChild(c));
  document.querySelectorAll('#seg-trip-sort button').forEach(b => b.classList.toggle('active', b.dataset.sort === key));
}
async function fillTripRow(job, soft){
  const {row, e, cached} = job;
  if (soft && !row.isConnected) return;
  let r = null;
  if (navigator.onLine){
    try { r = await tripEntryEta(e); } catch(err){ r = null; }
  }
  if (soft && r){
    const e0 = r.etas[0] || {min:null};
    const gaps = r.etas.slice(1).map((x, idx) => `+${x.min - r.etas[idx].min}${T('min')}`).join(' / ');
    const dEl = row.querySelector('.row-dest');
    if (dEl && nm(r.dest)) dEl.textContent = nm(r.dest);
    const sEl = row.querySelector('.row-sub');
    if (sEl) sEl.textContent = `${coName(r.co)} · ${T('boardStop')}: ${e.stopName || ''}${e0.iso ? ' · ' + hm(e0.iso) : ''}`;
    const etaEl = row.querySelector('.row-eta');
    if (etaEl) etaEl.innerHTML = fmtMin(e0.min) + (gaps ? `<div class="eta-next">${gaps}</div>` : '');
    const card = row.closest('.trip-card'); if (card) card.dataset.eta = e0.min != null ? e0.min : 99999;
    INFO.trip[tripStoreKey(e)] = {dest: r.dest, stop: r.stop, ts: Date.now()};
    return;
  }
  if (!r){
    row.classList.remove('loading');
    const d = row.querySelector('.row-dest'); if (d) d.textContent = cached ? nm(cached.dest) : (e.stopName || '');
    const s = row.querySelector('.row-sub');
    if (s) s.textContent = navigator.onLine ? `${coName(e.co)} · ${T('noService')}${cached && cached.ts ? ' · ' + dtStr(cached.ts) : ''}` : `${coName(e.co)} · ${T('offlineShort')}${cached && cached.ts ? ' · ' + dtStr(cached.ts) : ''}`;
    const eta = row.querySelector('.row-eta'); if (eta) eta.innerHTML = '<span class="eta-none">—</span>';
    return;
  }
  const e0 = r.etas[0] || {min:null};
  const gaps = r.etas.slice(1).map((x, idx) => `+${x.min - r.etas[idx].min}${T('min')}`).join(' / ');
  row.classList.remove('loading');
  row.innerHTML = `${badge(r)}<div class="row-mid">
      <div class="row-dest">${esc(nm(r.dest) || T('unknownDest'))}</div>
      <div class="row-sub">${esc(coName(r.co))} · ${T('boardStop')}: ${esc(e.stopName||'')}${e0.iso? ' · '+hm(e0.iso):''}</div></div>
      <div class="row-eta">${fmtMin(e0.min)}${gaps? `<div class="eta-next">${gaps}</div>`:''}</div>`;
  row.onclick = () => openRouteView({...r, hlStop: r.stop});
  const card = row.closest('.trip-card'); if (card) card.dataset.eta = e0.min != null ? e0.min : 99999;
  INFO.trip[tripStoreKey(e)] = {dest: r.dest, stop: r.stop, ts: Date.now()};
}
async function fillTripExtra(job, soft){
  const {span, ex, cacheKey} = job;
  if (soft && (!span || !span.isConnected)) return;
  let r = null;
  if (navigator.onLine){
    try {
      const rr = ex.co === 'CTB' ? await fetchCtbRoute(ex.stopId, ex.route) : await fetchKmbRoute(ex.stopId, ex.route, ex.stype);
      r = rr[0];
    } catch(e){}
  }
  let minsTxt;
  if (r && r.etas[0]) minsTxt = r.etas[0].min <= 0 ? T('arriving') : r.etas[0].min + ' ' + T('min');
  else if (cacheKey && INFO.trip[cacheKey]){
    minsTxt = '—';
    const s = span.querySelector('.row-sub');
    if (s) s.textContent += ' · ' + dtStr(INFO.trip[cacheKey].ts);
  } else minsTxt = navigator.onLine ? T('noService') : T('offlineShort');
  const timeEl = span.querySelector('.ex-time');
  if (timeEl) timeEl.innerHTML = `<span class="${minsTxt === T('arriving') ? 'eta-min arriving' : ''}">${esc(minsTxt)}</span>`;
  if (r && r.etas[0] && cacheKey) INFO.trip[cacheKey] = {dest:r.dest, stop:r.stop, ts:Date.now()};
}
async function tripEntryEta(e){
  if (e.co === 'KMB' || e.co === 'LWB') return (await fetchKmbRoute(e.stopId, e.route, e.stype))[0] || null;
  if (e.co === 'CTB') return (await fetchCtbRoute(e.stopId, e.route))[0] || null;
  if (e.co === 'NLB'){
    const nz = s => String(s || '').replace(/崗/g, '岗');
    return (await fetchNlbStop(e.stopId, r => r.route === e.routeNo && (!e.destKey || nz(r.dest.tc).includes(nz(e.destKey)) || nz(r.dest.sc).includes(nz(e.destKey)))))[0] || null;
  }
  return null;
}

/* ================= 线路时刻表本地缓存 ================= */
function ttKey(c){
  if (c.co === 'NLB') return 'NLB:' + c.routeId;
  return [c.co === 'LWB' ? 'KMB' : c.co, c.route, c.stype ?? '', c.dir ?? ''].join(':');
}
function ttCtxFromKey(k){
  const p = k.split(':');
  if (p[0] === 'NLB') return {co:'NLB', routeId:p[1]};
  return {co:p[0], route:p[1], stype:p[2] || null, dir:p[3] || null};
}
function saveTT(){ saveJSON('bp_tt', TT); }
function ttCached(c){
  const e = TT[ttKey(c)];
  if (!e || !e.s || !e.s.length) return null;
  return {stops: e.s.map(a => ({seq:a[0], id:a[1], name:{tc:a[2], sc:a[3], en:a[4]}})), ts: e.u, cached: true};
}
async function fetchRouteStopsApi(c){
  if (c.co === 'KMB' || c.co === 'LWB'){
    const r = await jgetSoft(API.kmbRouteStop(c.route, c.dir, c.stype), 20000);
    if (!r || !r.data) return null;
    await loadStops(); const m = new Map(STOPS.kmb.map(s => [s[0], s]));
    return r.data.map(x => ({seq:x.seq, id:x.stop, name:{tc:m.get(x.stop)?.[1], sc:m.get(x.stop)?.[2], en:m.get(x.stop)?.[3]}}));
  }
  if (c.co === 'CTB'){
    const r = await jgetSoft(API.ctbRouteStop(c.route, c.dir), 20000);
    if (!r || !r.data) return null;
    await loadStops(); const m = new Map(STOPS.ctb.map(s => [s[0], s]));
    return r.data.map(x => ({seq:x.seq, id:x.stop, name:{tc:m.get(x.stop)?.[1], sc:m.get(x.stop)?.[2], en:m.get(x.stop)?.[3]}}));
  }
  if (c.co === 'NLB'){
    const r = await jgetSoft(API.nlbStops(c.routeId), 30000);
    if (!r || !r.stops) return null;
    return r.stops.map((x, i) => ({seq:i+1, id:String(x.stopId), name:{tc:x.stopName_c, sc:x.stopName_s, en:x.stopName_e}}));
  }
  return null;
}
async function getRouteStops(c, force){
  const key = ttKey(c);
  const hit = ttCached(c);
  if (hit && !force) return hit;
  const stops = await fetchRouteStopsApi(c);
  if (!stops) return hit || null;
  TT[key] = {u: Date.now(), s: stops.map(s => [s.seq, s.id, s.name.tc||'', s.name.sc||'', s.name.en||''])};
  saveTT();
  return {stops, ts: TT[key].u, cached: false};
}

/* ================= 线路视图 ================= */
function showFavSection(show){
  $('#fav-head').hidden = !show;
  if (!show) $('#fav-routes').innerHTML = '';
}
function renderFavRoutes(){
  if (routeCtx) return;
  $('#fav-head').hidden = false;
  const box = $('#fav-routes'); box.innerHTML = '';
  const jobs = [];
  if (!favRoutes.length && !Object.keys(GMB_TIMETABLE).length){
    box.innerHTML = `<div class="status-line">${T('favEmpty')}</div>`;
  } else {
    favRoutes.forEach((f, i) => {
      const c = el('div','rt-result');
      c.innerHTML = `${badge(f)}<div class="row-mid"><div class="row-dest">${esc(f.label || '')}</div><div class="row-sub">${esc(coName(f.co))} · ${esc(f.route)}</div></div>${favEditMode? '<button class="trip-del">✕</button>' : ''}`;
      c.onclick = ev => {
        if (favEditMode && ev.target && ev.target.classList.contains('trip-del')){
          favRoutes.splice(i,1); saveJSON('bp_routes', favRoutes); renderFavRoutes(); renderSettings();
        } else openRouteView({...f});
      };
      box.appendChild(c); jobs.push({r:f, node:c});
    });
    Object.keys(GMB_TIMETABLE).forEach(k => {
      const g = GMB_TIMETABLE[k];
      const c = el('div','rt-result');
      c.innerHTML = `${badge({co:'GMB', route:k})}<div class="row-mid"><div class="row-dest">${esc(pickB(g.name))}</div><div class="row-sub">${esc(coName('GMB'))} · ${T('timetableStatic')}</div></div>`;
      c.onclick = () => openRouteView({co:'GMB', route:k, static:true});
      box.appendChild(c); jobs.push({r:{co:'GMB', route:k, static:true}, node:c});
    });
  }
  runPool(jobs, 3, async job => { try { await enrichSearchResult(job.r, job.node); } catch(e){} });
  $('#btn-fav-edit').textContent = favEditMode ? T('favDone') : T('favEdit');
  $('#fav-title').textContent = T('myRoutes');
}
function renderGmbTimetable(c){
  const g = GMB_TIMETABLE[c.route]; if (!g) return;
  const box = $('#route-board');
  const meta = el('div','route-meta');
  meta.innerHTML = `${badge(c)} <b style="font-size:16px">${esc(c.route)}</b> · ${coName('GMB')} · ${esc(pickB(g.name))}${g.fare? ` · ${T('fare')} $${esc(g.fare)}`:''}`;
  box.appendChild(meta);
  g.dirs.forEach(d => {
    const card = el('div','tt-box gmb-tt');
    const zh = lang === 'en' ? 'sc' : lang;
    const head = `<div class="tt-title">${T('to')} ${esc(pickB(d.to))} <span class="muted" style="font-weight:400">(${esc(pickB(d.from))})</span></div>
      <div class="gmb-times"><span class="gmb-time"><b>${lang==='en'?'First':'首班'}</b> ${esc(pickB(d.first))}</span><span class="gmb-time"><b>${lang==='en'?'Last':'末班'}</b> ${esc(pickB(d.last))}</span></div>
      ${d.note? `<div class="gmb-note">${esc(pickB(d.note))}</div>`:''}`;
    const list = `<div class="stop-line static">${d.stops.map((s,i) =>
      `<div class="stop-item"><span class="stop-dot"></span><div class="stop-name">${i+1}. ${esc(zh==='tc'? s[1] : s[0])}</div></div>`).join('')}</div>`;
    card.innerHTML = head + list;
    box.appendChild(card);
  });
  const note = lang==='en'
    ? 'Minibus operates by headway, no live ETA. Stop names in Chinese. Source: 16seats.net (' + g.updated + ')'
    : `小巴按班距营运，无实时到站数据 · 资料来源：16seats.net（${g.updated} 核对），请以现场为准`;
  box.insertAdjacentHTML('beforeend', `<div class="status-line">${esc(note)}</div>`);
}

/* ---- 线路搜索 ---- */
function searchRouteResults(q){
  const out = [], seen = new Set();
  const add = o => {
    const k = [o.co, o.route, o.dir || '', o.routeId || ''].join('|');
    if (seen.has(k)) return;
    seen.add(k); out.push(o);
  };
  const kmb = [...(ROUTES.kmb || [])].sort((a,b) => (+a[1] || 0) - (+b[1] || 0));   // 优先常规班次（service_type 1）
  kmb.forEach(x => {
    if (!String(x[0]).toUpperCase().startsWith(q)) return;
    add({co:x[3], route:x[0], stype:x[1], dir:x[2],
      orig:{tc:x[4],sc:x[5],en:x[6]}, dest:{tc:x[7],sc:x[8],en:x[9]}});
  });
  (ROUTES.ctb || []).forEach(x => {
    if (!String(x[0]).toUpperCase().startsWith(q)) return;
    add({co:'CTB', route:x[0], stype:null, dir:x[1],
      orig:{tc:x[2],sc:x[3],en:x[4]}, dest:{tc:x[5],sc:x[6],en:x[7]}});
  });
  (ROUTES.nlb || []).forEach(x => {
    if (!String(x[1]).toUpperCase().startsWith(q)) return;
    add({co:'NLB', route:x[1], routeId:x[0], stype:null, dir:null, orig:null, dest:{tc:x[2],sc:x[3],en:x[4]}});
  });
  Object.keys(GMB_TIMETABLE).forEach(k => {
    if (!k.toUpperCase().startsWith(q)) return;
    const g = GMB_TIMETABLE[k];
    add({co:'GMB', route:k, static:true, orig:g.orig, dest:g.dest});
  });
  out.sort((a,b) => a.route.localeCompare(b.route, undefined, {numeric:true}) || a.co.localeCompare(b.co));
  return out.slice(0, 40);
}
async function doRouteSearch(){
  const q = $('#route-input').value.trim().toUpperCase();
  const box = $('#route-results');
  if (!q){
    box.innerHTML = '';
    showFavSection(true);
    renderFavRoutes();
    return;
  }
  showFavSection(false);
  box.innerHTML = `<div class="status-line">${T('loading')}</div>`;
  try { await loadRoutes(); } catch(e){ box.innerHTML = `<div class="status-line">${T('fail')}</div>`; return; }
  const out = searchRouteResults(q);
  if (!out.length){ box.innerHTML = `<div class="status-line">${T('noRoutes')}</div>`; return; }
  box.innerHTML = '';
  const jobs = [];
  out.forEach(r => {
    const d = el('div','rt-result');
    const on = favRoutes.some(f => f.co === r.co && f.route === r.route);
    d.innerHTML = `${badge(r)}<div class="row-mid"><div class="row-dest">${esc(nm(r.orig) || '')} → ${esc(nm(r.dest) || '')}</div><div class="row-sub">${esc(coName(r.co))}</div></div>
      <button class="star-add${on?' on':''}" title="${esc(T('favAdd'))}">${on?'★ '+T('favOn'):'☆ '+T('favAdd')}</button>`;
    d.querySelector('.star-add').addEventListener('click', ev => {
      ev.stopPropagation();
      const exists = favRoutes.findIndex(f => f.co === r.co && f.route === r.route);
      if (exists >= 0){
        favRoutes.splice(exists,1); saveJSON('bp_routes', favRoutes);
        ev.target.textContent='☆ '+T('favAdd'); ev.target.classList.remove('on'); toast(T('favRemoved'));
        renderFavRoutes(); renderSettings();
      } else {
        favRoutes.push({co:r.co, route:r.route, stype:r.stype, dir:r.dir, routeId:r.routeId, static:r.static||false, label:nm(r.dest)});
        saveJSON('bp_routes', favRoutes);
        ev.target.textContent='★ '+T('favOn'); ev.target.classList.add('on'); toast(T('addOk'));
        renderSettings();
        if (!r.static && r.co !== 'GMB'){
          toast(T('cacheWarming'));
          getRouteStops(r).then(()=>toast(T('cacheDone'))).catch(()=>null);
        }
      }
    });
    d.addEventListener('click', () => openRouteView(r));
    box.appendChild(d);
    if (jobs.length < 14) jobs.push({r, node:d});
  });
  // 首末班、车费与下一班推算在后台逐行补齐；请求失败时保留本地缓存的文字
  runPool(jobs, 3, async job => { try { await enrichSearchResult(job.r, job.node); } catch(e){} });
}
async function enrichSearchResult(r, node){
  const line = node.querySelector('.row-sub'); if (!line) return;
  if (r.static || r.co === 'GMB'){
    const g = GMB_TIMETABLE[r.route];
    if (g && g.dirs && g.dirs.length) line.textContent = `${coName('GMB')} · ${T('firstTime')} ${pickB(g.dirs[0].first)} · ${T('lastTime')} ${pickB(g.dirs[0].last)} · ${T('fare')} $${g.fare}`;
    return;
  }
  if (r.co !== 'KMB' && r.co !== 'LWB') return;
  const meta = await kmbRouteMeta(r);
  if (!meta) return;
  const info = scheduleInfo(meta, new Date());
  if (info) line.textContent = `${coName(r.co)} · ${T('firstTime')} ${info.first} · ${T('lastTime')} ${info.last} · ${T('fare')} $${meta.fare.toFixed(1)}`;
  if (!node.isConnected) return;
  const g = findGroup(curGroup);
  const ids = (g && g.stops && g.stops.KMB) || [];
  let est = null;
  for (const id of ids.slice(0, 8)){
    if (!isRealCode('KMB', id)) continue;
    if (!meta.list.some(x => x.code === stopCode('KMB', id))) continue;
    try { est = await kmbEstimate(r, id); } catch(e){}
    if (est) break;
  }
  if (est && node.isConnected){
    const e = el('div','rt-eta', `${est.nextDay ? esc(T('nextDay'))+' · ' : ''}${T('nextDep')} ${esc(hm(est.dep))} ${esc(T('depAt'))}${est.arrive ? ' · '+T('estArrive')+' '+esc(hm(est.arrive)) : ''}`);
    const tag = ttFreshTag(est);
    if (tag) e.insertAdjacentHTML('beforeend', tag);
    node.appendChild(e);
  }
}
function exitRouteToSearch(){
  if (!routeCtx) return;
  routeCtx = null; routeSeq++;
  $('#route-board').innerHTML = '';
  showFavSection(true);
}
$('#route-input').addEventListener('input', () => {
  if (routeCtx) exitRouteToSearch();
  clearTimeout(routeSearchT);
  routeSearchT = setTimeout(doRouteSearch, 160);
});
$('#route-input').addEventListener('keydown', e => {
  if (e.key === 'Enter'){ e.preventDefault(); clearTimeout(routeSearchT); doRouteSearch(); }
});
$('#btn-fav-edit').addEventListener('click', () => { favEditMode = !favEditMode; renderFavRoutes(); });

/* ---- 线路详情 ---- */
async function openRouteView(ctx){
  // NLB 的 route-stop 接口需要 routeId（同一路线号有上行/下行两个 id），从索引补齐
  if (ctx.co === 'NLB' && !ctx.routeId){
    try {
      await loadRoutes();
      const cands = (ROUTES.nlb || []).filter(a => a[1] === ctx.route);
      const dv = ctx.dest ? (ctx.dest.tc || ctx.dest.sc) : '';
      const tail = x => String(x || '').split('>').pop().trim();
      const hit = (dv && cands.find(a => tail(a[2]) === dv || tail(a[3]) === dv))
        || (dv && cands.find(a => (a[2] || '').includes(dv) || (a[3] || '').includes(dv)))
        || cands[0];
      if (hit) ctx = {...ctx, routeId: hit[0]};
    } catch(e){}
  }
  routeCtx = {...ctx};
  $('#route-input').value = ctx.route || '';
  $('#route-results').innerHTML = '';
  $('#fav-head').hidden = true;
  $('#fav-routes').innerHTML = '';
  $('#route-board').innerHTML = `<div class="status-line">${T('loading')}</div>`;
  switchView('route', {noRouteRender:true});
  await renderRouteBoard();
}
function defaultBoardStop(stops, c){
  // 优先使用「到站」页当前站点里该线路实际在用的站柱（通常就是有实时数据的那根）
  const cache = boardCache(curGroup);
  if (cache && c){
    const row = cache.rows.find(r => r.route === c.route && (r.co === c.co || (c.co === 'KMB' && r.co === 'LWB')));
    if (row){
      const hit = stops.find(s => String(s.id) === String(row.stop));
      if (hit) return hit;
    }
  }
  if (curGroup){
    const g = findGroup(curGroup);
    if (g && g.stops){
      const ids = new Set([...(g.stops.KMB||[]), ...(g.stops.CTB||[]), ...((g.stops.NLB||[]).map(n=>String(n.stopId)))]);
      const hit = stops.find(s => ids.has(String(s.id)));
      if (hit) return hit;
    }
  }
  return stops[0];
}
function setStopEta(cell, arr){
  const e = arr && arr[0];
  if (!e || e.min == null){ cell.className = 'stop-eta none'; cell.textContent = '—'; return; }
  cell.className = 'stop-eta';
  cell.textContent = e.min <= 0 ? T('arriving') : e.min + '′';
}
function buildTimetable(arr, stop, link){
  if (!arr || !arr.length) return null;
  const tt = el('div','tt-box');
  let inner = `<div class="tt-title">${T('timetable')} · ${T('boardStop')}: ${esc(nm(stop.name))}</div>`;
  let prev = null;
  arr.forEach(e => {
    const gap = prev != null ? `${T('interval')} +${e.min - prev}${T('min')}` : T('next');
    inner += `<div class="tt-row"><span class="tt-time">${hm(e.iso)}</span><span>${e.min <= 0 ? T('arriving') : e.min + ' ' + T('min')}</span><span class="tt-gap">${gap}</span></div>`;
    prev = e.min;
  });
  if (link) inner += `<div class="tt-row"><a href="${esc(link)}" target="_blank" rel="noopener">${T('official')} ↗</a></div>`;
  tt.innerHTML = inner;
  return tt;
}
async function renderRouteBoard(){
  const c0 = routeCtx; if (!c0) return;
  const seq = ++routeSeq;
  const c = c0.co === 'LWB' ? {...c0, co:'KMB'} : c0;
  const box = $('#route-board'); box.innerHTML = '';
  const back = el('button','back-btn','← ' + T('tabRoute'));
  back.onclick = () => { routeCtx = null; routeSeq++; box.innerHTML = ''; $('#route-input').value = ''; $('#route-results').innerHTML = ''; renderFavRoutes(); };
  box.appendChild(back);
  if (c.static || c.co === 'GMB'){ renderGmbTimetable(c); return; }

  let kmeta = null, kinfo = null;
  if (c.co === 'KMB' || c.co === 'LWB'){
    try { kmeta = await kmbRouteMeta(c); if (kmeta) kinfo = scheduleInfo(kmeta, new Date()); } catch(e){}
  }
  if (seq !== routeSeq) return;

  let lk = null;
  try { await loadLinks(); } catch(e){}
  if (seq !== routeSeq) return;
  const lkKey = c.co === 'NLB' ? (c.route || String(c.routeId)) : c.route;
  lk = LINKS && LINKS[c.co] && (LINKS[c.co][lkKey] || LINKS[c.co][String(c.routeId || '')]);
  const link = lk ? (lang === 'tc' ? lk.lc : lk.ls) : null;
  const meta = el('div','route-meta');
  const favOn = favRoutes.some(f => f.co === c.co && f.route === c.route);
  meta.innerHTML = `${badge(c)} <b style="font-size:16px">${esc(c.route)}</b> · ${coName(c.co)}`
    + (link ? ` · <a href="${esc(link)}" target="_blank" rel="noopener">${T('official')} ↗</a>` : '')
    + (kinfo ? ` · ${T('firstTime')} ${esc(kinfo.first)} · ${T('lastTime')} ${esc(kinfo.last)}` : '')
    + (kmeta && kmeta.fare ? ` · ${T('fare')} $${kmeta.fare.toFixed(1)}` : (lk && lk.fare ? ` · ${T('fare')} $${esc(lk.fare)}` : ''))
    + (lk && lk.jt ? ` · ${T('journeyTime')} ${esc(lk.jt)} ${T('min')}` : '')
    + `<button class="fav-toggle${favOn?' on':''}">${favOn?'★ '+T('favOn'):'☆ '+T('favAdd')}</button>`;
  meta.querySelector('.fav-toggle').onclick = (ev) => {
    const i = favRoutes.findIndex(f => f.co === c.co && f.route === c.route);
    if (i >= 0) favRoutes.splice(i,1);
    else favRoutes.push({co:c.co, route:c.route, stype:c.stype, dir:c.dir, routeId:c.routeId, label: nm(c.dest) || '', static: !!c.static});
    saveJSON('bp_routes', favRoutes);
    ev.target.classList.toggle('on', i < 0);
    ev.target.textContent = i < 0 ? '★ '+T('favOn') : '☆ '+T('favAdd');
    renderFavRoutes(); renderSettings();
    if (i < 0){
      toast(T('cacheWarming'));
      getRouteStops(c).then(()=>toast(T('cacheDone'))).catch(()=>null);
    }
  };
  box.appendChild(meta);

  let rs = ttCached(c);
  if (!rs){
    const loading = el('div','status-line', T('loadingStops'));
    box.appendChild(loading);
    try { rs = await getRouteStops(c); } catch(e){ rs = null; }
    if (seq !== routeSeq) return;
    loading.remove();
  }
  if (!rs){
    box.insertAdjacentHTML('beforeend', `<div class="status-line">${navigator.onLine ? T('fail') : T('offlineStops')}</div>`);
    return;
  }
  if (rs.cached || !navigator.onLine){
    const tip = el('div','status-line cache-tip', cacheTip(rs.ts));
    box.appendChild(tip);
  }
  const stops = rs.stops;
  const boardStop = (c.hlStop && stops.find(s => String(s.id) === String(c.hlStop))) || defaultBoardStop(stops, c);
  const boardIdx = boardStop ? stops.indexOf(boardStop) : -1;

  const wrap = el('div','stop-line');
  const cells = [];
  stops.forEach(s => {
    const item = el('div', 'stop-item' + (boardStop && s.id === boardStop.id ? ' hl' : ''));
    item.innerHTML = `<span class="stop-dot"></span><div class="stop-name">${s.seq}. ${esc(nameWithCode(c.co, s.id, nm(s.name)))}</div><span class="stop-eta none">—</span>`;
    wrap.appendChild(item);
    cells.push(item.querySelector('.stop-eta'));
  });
  box.appendChild(wrap);

  if (!navigator.onLine){
    box.insertAdjacentHTML('beforeend', `<div class="status-line">${T('offline')}</div>`);
    return;
  }

  // 逐站拉实时 ETA（2 路并发 + 间隔，避免官方接口限流）；每站到达即更新，页面不白屏
  const etaFn = s => {
    if (c.co === 'CTB') return fetchCtbRoute(s.id, c.route).then(rows => (rows[0] && rows[0].etas) || []);
    if (c.co === 'NLB') return fetchNlbStop(s.id, r => r.route === c.route).then(a => (a[0] && a[0].etas) || []);
    return fetchKmbRoute(s.id, c.route, c.stype).then(rows => (rows[0] && rows[0].etas) || []);
  };
  let idx = 0, ttDone = false;
  // 先取候车站，班次表优先出现，不必等整条线 20-50 个站
  if (boardIdx >= 0){
    let arr = [];
    try { arr = (await etaFn(stops[boardIdx])) || []; } catch(e){ arr = []; }
    if (seq !== routeSeq) return;
    if (!arr.length && (c.co === 'KMB' || c.co === 'LWB')){
      try {
        const e = await kmbEstimate(c, boardStop.id);
        if (e){
          if (cells[boardIdx]){ cells[boardIdx].className = 'stop-eta tt-eta'; cells[boardIdx].textContent = hm(e.arrive || e.dep); }
          const tt = el('div','tt-box');
          tt.innerHTML = `<div class="tt-title">${T('kbEstimate')} · ${esc(nameWithCode('KMB', boardStop.id, nm(boardStop.name)))}</div>
            <div class="tt-row"><span>${esc(T('nextDep'))}</span><span>${esc(hm(e.dep))} ${esc(T('depAt'))}</span></div>
            ${e.arrive ? `<div class="tt-row"><span>${esc(T('estArrive'))}</span><span>${esc(hm(e.arrive))}</span></div>` : ''}
            ${kinfo ? `<div class="tt-row"><span>${esc(T('firstTime'))}/${esc(T('lastTime'))}</span><span>${esc(kinfo.first)} – ${esc(kinfo.last)}</span></div>` : ''}`;
          box.insertBefore(tt, wrap); ttDone = true;
        }
      } catch(e){}
    }
    if (cells[boardIdx] && arr.length) setStopEta(cells[boardIdx], arr);
    if (arr.length){
      ttDone = true;
      const tb = buildTimetable(arr, boardStop, link);
      if (tb) box.insertBefore(tb, wrap);
    }
  }
  const worker = async () => {
    while (idx < stops.length){
      if (seq !== routeSeq) return;
      const i = idx++;
      if (i === boardIdx) continue;
      let arr = [];
      try { arr = (await etaFn(stops[i])) || []; } catch(e){ arr = []; }
      if (seq !== routeSeq) return;
      if (cells[i]) setStopEta(cells[i], arr);
      await sleep(250);
    }
  };
  await Promise.all([worker(), worker()]);
  if (!ttDone && seq === routeSeq){
    const tip = el('div','status-line', T('noService'));
    box.insertBefore(tip, wrap);
  }
}
/* ================= 快捷站点栏交互 ================= */
$('#quick-trigger').addEventListener('click', e => { e.stopPropagation(); toggleQuickMenu(); });
$('#quick-locate').addEventListener('click', e => { e.stopPropagation(); closeQuickMenu(); locateAndRender(); });
document.addEventListener('click', e => {
  const row = $('#chips-row'), menu = $('#chips');
  if (menu && !menu.hidden && row && !row.contains(e.target)) closeQuickMenu();
});

/* ================= 附近（1 公里，同名站柱合并） ================= */
$('#btn-locate').addEventListener('click', locateAndRender);
$('#btn-nearby-refresh').addEventListener('click', () => renderNearby(true));
$('#loc-line').style.cursor = 'pointer';
$('#loc-line').addEventListener('click', locateAndRender);
function setManualLoc(loc, msg){
  window._myLoc = [loc[0], loc[1]]; saveJSON('bp_nearloc', window._myLoc);
  if (msg) toast(msg);
  if (activeView() === 'nearby') renderNearby(true);
  else { renderChips(); renderBoard(); }
}
function locateAndRender(){
  const st = $('#nearby-status');
  // 定位不可用或仍在加载时一律先显示云汇坐标，不出现空白或旧位置
  if (!navigator.geolocation){ st.textContent = T('locDefault'); toast(T('locFail')); return; }
  window._myLoc = DEFAULT_LOC.slice();
  st.textContent = T('locatingFallback');
  if (activeView() === 'nearby') renderNearby(true);
  else { const ll = $('#loc-line'); if (ll){ ll.classList.remove('hk-warn'); ll.textContent = T('locating'); } }
  navigator.geolocation.getCurrentPosition(async pos => {
    const la = pos.coords.latitude, lo = pos.coords.longitude;
    if (!inHongKong(la, lo)){
      // 境外：提示 + 不采用境外坐标；下拉默认切到机场（仅在用户未手动选过时）
      hkOutOfRange = true; locPlaceName = null;
      window._myLoc = DEFAULT_LOC.slice(); saveJSON('bp_nearloc', window._myLoc);
      toast(T('hkOnly'));
      if (!userPickedGroup){
        const ap = groupList().find(g => g.id === 'airport');
        if (ap){ curGroup = ap.id; localStorage.setItem('bp_cur', curGroup); }
      }
      st.textContent = T('hkOnly');
      if (activeView() === 'nearby') renderNearby(true);
      else { renderChips(); renderBoard(); }
      renderLocDisplay();
      return;
    }
    // 境内：正常采用 GPS，默认站点组在用户未手动选过时切回雲滙
    hkOutOfRange = false;
    setManualLoc([la, lo], null);
    if (!userPickedGroup){
      const yh = groupList().find(g => g.id === 'yunhui');
      if (yh){ curGroup = yh.id; localStorage.setItem('bp_cur', curGroup); }
    }
    await loadStops();
    const nm = nearestStopName(la, lo);
    locPlaceName = nm || null;
    renderChips(); renderBoard(); renderLocDisplay();
  }, () => { st.textContent = T('locDefault'); toast(T('locFail')); }, {enableHighAccuracy:true, timeout:10000});
}
$('#near-go').addEventListener('click', async () => {
  const q = ($('#near-input').value || '').trim();
  if (!q){ toast(T('addFail')); return; }
  const m = q.match(/^\s*(-?\d+(?:\.\d+)?)\s*[,，\s]\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (m){ setManualLoc([+m[1], +m[2]], T('locUpdated')); return; }
  try {
    await loadStops();
    const norm = x => String(x || '').toLowerCase().replace(/\s/g,'');
    const hit = [...(STOPS.kmb||[]), ...(STOPS.ctb||[])].find(s =>
      norm(s[1]) === norm(q) || norm(s[2]) === norm(q) || norm(s[3]) === norm(q)
      || norm(s[1]).includes(norm(q)) || norm(s[2]).includes(norm(q)));
    if (hit){ setManualLoc([+hit[4], +hit[5]], T('locUpdated')); }
    else toast(T('nearLocBad'));
  } catch(e){ toast(T('nearLocBad')); }
});
$('#near-input').addEventListener('keydown', e => { if (e.key === 'Enter') $('#near-go').click(); });
async function stopRouteIndex(){
  if (STOP_ROUTES) return STOP_ROUTES;
  await loadRStops();
  const map = new Map();
  const push = (sid, item) => { if (!map.has(sid)) map.set(sid, []); const a = map.get(sid); if (!a.some(x => x.co === item.co && x.route === item.route)) a.push(item); };
  (RSTOPS.kmb||[]).forEach(x => push(x[4], {co:x[3]||'KMB', route:x[0], stype:x[1], dir:x[2]}));
  (RSTOPS.ctb||[]).forEach(x => push(x[3], {co:'CTB', route:x[0], dir:x[1]}));
  STOP_ROUTES = map;
  return map;
}
function groupNearby(all){
  const groups = [];
  all.forEach(s => {
    let g = groups.find(x => x.co === s.co && x.name.sc === s.name.sc && Math.abs(x.d - s.d) < 200
      && dist(x.lat, x.lng, s.lat, s.lng) <= NEARBY_GROUP_M);
    if (g){ g.stops.push(s); if (s.d < g.d){ g.d = s.d; g.lat = s.lat; g.lng = s.lng; } }
    else groups.push({co:s.co, name:s.name, d:s.d, lat:s.lat, lng:s.lng, stops:[s], routes:null, key:''});
  });
  groups.forEach(g => {
    g.key = g.co + '|' + g.name.sc + '|' + g.stops.map(s => s.id).sort()[0];
    const set = new Map();
    g.stops.forEach(s => (STOP_ROUTES.get(s.id) || []).forEach(r => set.set([r.co, r.route, r.dir || ''].join('|'), r)));
    g.routes = [...set.values()];
  });
  return groups.sort((a,b) => a.d - b.d);
}
async function renderNearby(force){
  const loc = myLoc();
  const st = $('#nearby-status'), list = $('#nearby-list');
  if (force) nearLimit = 10;
  const src = hasGps() ? T('locUpdated') : T('locDefault');
  st.textContent = `${T('nearbyRadius')} · ${src}`;
  list.innerHTML = `<div class="status-line">${T('loading')}</div>`;
  $('#btn-locate').textContent = T('locateBtn');
  let cache = loadJSON('bp_near', null);
  try { await loadStops(); await stopRouteIndex(); }
  catch(e){
    if (cache && cache.groups && cache.groups.length){
      paintNearGroups(cache.groups, `${T('nearbyRadius')} · ${cache.all || cache.groups.length} ${T('nearCount')}`, cache.t);
    } else {
      list.innerHTML = `<div class="status-line">${navigator.onLine ? T('fail') : T('offlineNoData')}</div>`;
    }
    return;
  }
  if (force) nearRows.clear();
  const all = [];
  const addAll = (co, arr) => arr.forEach(s => {
    const d = dist(loc[0], loc[1], +s[4], +s[5]);
    if (d <= NEARBY_R) all.push({co, id:s[0], name:{tc:s[1], sc:s[2], en:s[3]}, d, lat:+s[4], lng:+s[5]});
  });
  addAll('KMB', STOPS.kmb || []); addAll('CTB', STOPS.ctb || []);
  const groups = groupNearby(all);
  nearbyCtx = {groups, loc: loc.slice(), t: Date.now()};
  if (!groups.length){
    st.textContent = `${T('nearbyRadius')} · 0 ${T('nearCount')}`;
    list.innerHTML = `<div class="status-line">${T('nearbyNone')}</div>`;
    return;
  }
  const t = Date.now();
  saveJSON('bp_near', {t, all:all.length, loc:loc.slice(), groups});
  paintNearGroups(groups, `${T('nearbyRadius')} · ${all.length} ${T('nearCount')} · ${T('updated')} ${new Date(t).toTimeString().slice(0,8)}`,
    (!navigator.onLine && cache && cache.t) ? cache.t : null);
}
function paintNearGroups(groups, statusText, cacheTime){
  const st = $('#nearby-status'), list = $('#nearby-list');
  st.textContent = statusText;
  list.innerHTML = '';
  if (cacheTime){
    const tip = el('div','status-line cache-tip', cacheTip(cacheTime));
    list.appendChild(tip);
  }
  const loc = myLoc();
  const hintG = groupList().map(g => ({g, d: g.lat ? dist(loc[0], loc[1], g.lat, g.lng) : 1e9})).sort((a,b)=>a.d-b.d)[0];
  if (hintG && hintG.d <= NEARBY_R){
    const hint = el('div','near-hint');
    hint.innerHTML = `<span>${T('nearHint')}：<b>${esc(lang==='tc'?hintG.g.name_tc:lang==='en'?(hintG.g.name_en||hintG.g.name_sc):hintG.g.name_sc)}</b></span>`;
    hint.onclick = () => { curGroup = hintG.g.id; localStorage.setItem('bp_cur', hintG.g.id); switchView('stop'); };
    list.appendChild(hint);
  }
  groups.slice(0, nearLimit).forEach(g => list.appendChild(nearGroupEl(g)));
  if (groups.length > nearLimit){
    const more = el('button','btn-main ghost near-more', T('showMore') + ` (+${Math.min(10, groups.length - nearLimit)})`);
    more.onclick = () => { nearLimit += 10; paintNearGroups(groups, statusText, cacheTime); };
    list.appendChild(more);
  }
}
function nearGroupEl(g){
  const item = el('div','near-item');
  const codes = [...new Set(g.stops.map(s => stopCode(g.co, s.id)).filter(c => c && c[0] !== '#'))].slice(0, 3);
  const shown = codes.length ? codes : g.stops.slice(0, 3).map(s => stopCode(g.co, s.id));
  const extra = shown.length < g.stops.length ? `+${g.stops.length - shown.length}` : '';
  item.innerHTML = `<div class="near-head">
      <span class="co-dot" style="background:${CO_COLOR[g.co]}"></span>
      <div class="nm">${esc(nm(g.name))}</div>
      <span class="near-codes">${shown.map(c=>`<span class="stop-code">${esc(c)}</span>`).join('')}${extra?`<span class="stop-code">${esc(extra)}</span>`:''}</span>
      <span class="dist">${g.d}${lang==='en'?' m':'米'}</span>
    </div>
    <div class="near-routes"></div>`;
  const rbox = item.querySelector('.near-routes');
  g.routes.slice(0, 14).forEach(r => {
    const b = el('button','rchip',`<span class="dot" style="background:${CO_COLOR[r.co]}"></span>${esc(r.route)}`);
    b.onclick = ev => {
      ev.stopPropagation();
      const hit = g.stops.find(s => (STOP_ROUTES.get(s.id)||[]).some(x => x.co === r.co && x.route === r.route));
      openRouteView({...r, hlStop: hit ? hit.id : g.stops[0].id});
    };
    rbox.appendChild(b);
  });
  if (g.routes.length > 14) rbox.insertAdjacentHTML('beforeend', `<span class="rchip" style="border-style:dashed">+${g.routes.length - 14}</span>`);

  const body = el('div','near-body');
  body.hidden = !nearOpen.has(g.key);
  if (!body.hidden) fillNearBody(body, g);
  item.querySelector('.near-head').addEventListener('click', () => {
    if (body.hidden){
      body.hidden = false; nearOpen.add(g.key);
      fillNearBody(body, g);
    } else {
      body.hidden = true; nearOpen.delete(g.key);
    }
  });
  item.appendChild(body);
  return item;
}
async function fillNearBody(body, g){
  const cache = nearRows.get(g.key);
  if (cache){
    body.innerHTML = cache.html; bindNearRows(body, cache.rows);
    if (Date.now() - cache.t >= 60e3) body.insertAdjacentHTML('afterbegin', `<div class="status-line cache-tip">${esc(cacheTip(cache.t))}</div>`);
    return;
  }
  body.innerHTML = `<div class="status-line">${T('loading')}</div>`;
  let rows = [];
  try {
    const res = await Promise.all(g.stops.slice(0, 4).map(s => fetchStopLive(g.co, s.id).catch(()=>[])));
    rows = sortRows(mergeRows(res.flat()));
  } catch(e){}
  const html = rows.length ? rows.map(r => rowHtml(r)).join('')
    : `<div class="status-line">${navigator.onLine ? T('offService') : T('offlineNoData')}</div>`;
  body.innerHTML = html;
  bindNearRows(body, rows);
  nearRows.set(g.key, {t: Date.now(), html, rows});
}
function bindNearRows(body, rows){
  body.querySelectorAll('.row[data-key]').forEach(d => {
    const r = rows.find(x => rowKey(x) === d.dataset.key);
    if (r) d.addEventListener('click', () => openRouteView({...r, hlStop: r.stop}));
  });
}

/* ================= 我的 ================= */
function renderSettings(){
  document.querySelectorAll('#seg-lang button').forEach(b => b.classList.toggle('on', b.dataset.lang === lang));
  $('#btn-theme').textContent = theme === 'dark' ? T('themeDark') : T('themeLight');
  const box = $('#mgr-stops'); box.innerHTML = '';
  groupList().forEach(g => {
    const it = el('div','mgr-item');
    it.innerHTML = `<div class="nm">${esc(lang==='tc'?g.name_tc:lang==='en'?(g.name_en||g.name_sc):g.name_sc)}</div>`
      + (g.builtin ? `<span class="muted" style="font-size:11px">${T('builtin')}</span>` : '<button class="mgr-del">✕</button>');
    const del = it.querySelector('.mgr-del');
    if (del) del.onclick = () => { userStops = userStops.filter(u => 'u_'+u.id !== g.id); saveJSON('bp_stops', userStops); renderSettings(); renderChips(); };
    box.appendChild(it);
  });
  const rb = $('#mgr-routes'); rb.innerHTML = '';
  if (!favRoutes.length) rb.innerHTML = `<div class="status-line">${T('favEmpty')}</div>`;
  favRoutes.forEach((f, i) => {
    const it = el('div','mgr-item');
    it.innerHTML = `<span class="co-dot" style="background:${CO_COLOR[f.co]}"></span><div class="nm">${esc(f.route)}${f.label? ' · '+esc(f.label):''}</div><button class="mgr-del">✕</button>`;
    it.querySelector('.mgr-del').onclick = () => { favRoutes.splice(i,1); saveJSON('bp_routes', favRoutes); renderSettings(); renderFavRoutes(); };
    rb.appendChild(it);
  });
  $('#sel-interval').value = String(interval);
  renderDataTs();
  $('#btn-add-stop').textContent = T('addStopBtn');
  $('#about-text').textContent = T('about');
  $('#ver-line').textContent = `${T('version')} v${VERSION} (${BUILD}) · ${T('copyright')}`;
  $('#btn-update-data').textContent = T('updateData');
  $('#btn-export').textContent = T('exportData');
  $('#btn-import').textContent = T('importData');
  $('#btn-nearby-refresh').title = T('refresh');
}
function renderDataTs(){
  const ts = +localStorage.getItem('bp_data_ts') || 0;
  $('#data-ts').textContent = ts ? dtStr(ts) : '—';
}
$('#seg-lang').addEventListener('click', e => {
  const b = e.target.closest('button[data-lang]'); if (!b) return;
  setLang(b.dataset.lang);
});
function setLang(l){
  lang = l; localStorage.setItem('bp_lang', lang);
  applyLang();
  renderChips(); renderSettings();
  const v = activeView();
  if (v === 'stop'){ renderBoard(); refreshWeather(false); }
  if (v === 'trip') renderTrips();
  if (v === 'route') { if (routeCtx) renderRouteBoard(); else renderFavRoutes(); }
  if (v === 'nearby') renderNearby();
  syncTopbar();
}
$('#btn-theme').addEventListener('click', () => { theme = theme === 'dark' ? 'light' : 'dark'; localStorage.setItem('bp_theme', theme); applyTheme(); renderSettings(); });
function applyTheme(){
  document.documentElement.dataset.theme = theme;
  const m = document.querySelector('meta[name="theme-color"]');
  if (m) m.setAttribute('content', theme === 'dark' ? '#111318' : '#f5f6fa');
}
$('#sel-interval').addEventListener('change', () => { interval = +$('#sel-interval').value; localStorage.setItem('bp_interval', interval); startTimer(); toast(interval + 's'); });
$('#btn-add-stop').addEventListener('click', () => openModal('stop'));

/* ================= 数据更新 / 导入导出 ================= */
const DATA_FILES = ['data/quickstops.json','data/trips.json','data/links.json','data/stops.json','data/routes.json','data/routestop.json'];
async function precacheStatic(){
  if (!('caches' in window)) return;
  const c = await caches.open('bus-data-v1');
  for (const f of DATA_FILES){
    try {
      const url = new URL(f, location.href).href;
      const r = await fetch(url, {cache:'reload'});
      if (r.ok) await c.put(new Request(url), r.clone());
    } catch(e){}
  }
}
$('#btn-update-data').addEventListener('click', async () => {
  const btn = $('#btn-update-data');
  btn.disabled = true; toast(T('updateStart'));
  try {
    await precacheStatic();
    const keys = new Set(Object.keys(TT));
    favRoutes.forEach(f => { if (!f.static && f.co !== 'GMB') keys.add(ttKey(f)); });
    for (const k of keys){
      const c = ttCtxFromKey(k);
      await getRouteStops(c, true).catch(()=>null);
    }
    await loadWeather(true);
    localStorage.setItem('bp_data_ts', Date.now());
    renderDataTs(); toast(T('updateDone'));
  } catch(e){ toast(T('updateFail')); }
  btn.disabled = false;
});
function exportData(){
  const data = {app:'bus-eta', version:VERSION, exportedAt:new Date().toISOString(),
    stops:userStops, routes:favRoutes, trips:userTrips, tt:TT, info:INFO, settings:{lang, theme, interval}};
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `bus-eta-backup-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href), 4000);
  toast(T('exportOk'));
}
$('#btn-export').addEventListener('click', exportData);
$('#btn-import').addEventListener('click', () => $('#file-import').click());
$('#file-import').addEventListener('change', async e => {
  const f = e.target.files && e.target.files[0]; if (!f) return;
  try {
    const d = JSON.parse(await f.text());
    if (d.app !== 'bus-eta') throw new Error('bad');
    if (Array.isArray(d.stops)) { const ids = new Set(userStops.map(u=>u.id)); d.stops.forEach(u => { if (!ids.has(u.id)) userStops.push(u); }); }
    if (Array.isArray(d.routes)) { const ids = new Set(favRoutes.map(x=>x.co+':'+x.route)); d.routes.forEach(x => { if (!ids.has(x.co+':'+x.route)) favRoutes.push(x); }); }
    if (Array.isArray(d.trips)) { const ids = new Set(userTrips.map(x=>x.id)); d.trips.forEach(x => { if (!ids.has(x.id)) userTrips.push(x); }); }
    if (d.tt && typeof d.tt === 'object') Object.assign(TT, d.tt);
    if (d.info && d.info.trip) Object.assign(INFO.trip, d.info.trip);
    saveJSON('bp_stops', userStops);
    saveJSON('bp_routes', favRoutes);
    saveJSON('bp_trips', userTrips);
    saveJSON('bp_info', INFO);
    saveTT();
    renderSettings(); renderChips(); renderFavRoutes();
    toast(T('importOk'));
  } catch(err){ toast(T('importFail')); }
  e.target.value = '';
});

/* ================= 弹层（添加站点 / 添加行程） ================= */
let modalMode = null, modalTripFrom = null, modalResults = [];
function openModal(mode){
  modalMode = mode; modalTripFrom = null; modalResults = [];
  $('#modal').hidden = false;
  $('#modal-search').value = '';
  $('#modal-results').innerHTML = '';
  $('#modal-foot').innerHTML = '';
  $('#modal-title').textContent = mode === 'stop' ? T('addStop') : T('addTrip');
  $('#modal-search').placeholder = mode === 'stop' ? T('searchStop') : T('tripRoute');
  if (mode === 'trip') showTripFrom();
  setTimeout(()=>$('#modal-search').focus(), 60);
}
function closeModal(){ $('#modal').hidden = true; modalMode = null; }
async function showTripFrom(){
  await loadQuick().catch(()=>null);
  const box = $('#modal-results');
  box.innerHTML = `<div class="status-line">${T('tripFrom')}</div>`;
  groupList().forEach(g => {
    const it = el('div','mr-item');
    it.innerHTML = `<div class="grow"><div class="n1">${esc(lang==='tc'?g.name_tc:lang==='en'?(g.name_en||g.name_sc):g.name_sc)}</div></div>`;
    it.onclick = () => { modalTripFrom = g; showTripRoutes(g); };
    box.appendChild(it);
  });
  $('#modal-foot').innerHTML = '';
}
async function showTripRoutes(g){
  await loadRStops(); await loadRoutes();
  $('#modal-results').innerHTML = `<div class="status-line">${esc(lang==='tc'?g.name_tc:g.name_sc)} · ${T('tripRoute')}</div>`;
  $('#modal-search').value = '';
  $('#modal-search').focus();
  modalMode = 'trip-route';
}
function stopSearchList(q){
  const out = [];
  [['KMB', STOPS.kmb],['CTB', STOPS.ctb]].forEach(([co, arr]) => {
    (arr||[]).forEach(s => {
      const hit = (s[1]+' '+s[2]+' '+s[3]).toUpperCase().includes(q) || String(s[0]).toUpperCase().includes(q);
      if (hit) out.push({co, s});
    });
  });
  return out.slice(0, 40);
}
async function doModalSearch(){
  const q = $('#modal-search').value.trim().toUpperCase();
  const box = $('#modal-results');
  if (modalMode === 'stop'){
    if (q.length < 1){ box.innerHTML = ''; modalResults = []; return; }
    try { await loadStops(); } catch(e){ box.innerHTML = `<div class="status-line">${T('fail')}</div>`; return; }
    modalResults = stopSearchList(q);
    if (!modalResults.length){ box.innerHTML = `<div class="status-line">${T('noResult')}</div>`; return; }
    box.innerHTML = '';
    modalResults.forEach(({co, s}, i) => {
      const it = el('div','mr-item');
      it.innerHTML = `<div class="grow"><div class="n1">${esc(lang==='tc'?s[1]:lang==='en'?s[3]:s[2])}</div>
        <div class="n2">${esc(lang === 'en' ? s[3] : (lang === 'tc' ? s[1] : s[2]))} · ${coName(co)} · ${esc(stopCode(co, s[0]))}</div></div>
        <button class="plus">+</button>`;
      it.onclick = () => addStopFromResult(i);
      box.appendChild(it);
    });
  } else if (modalMode === 'trip-route' && modalTripFrom){
    const g = modalTripFrom; const res = [];
    (g.stops.KMB||[]).forEach(sid => { (RSTOPS.kmb||[]).forEach(x => { if (x[4] === sid && x[0].toUpperCase().startsWith(q)) res.push({co:x[3]||'KMB', route:x[0], stype:x[1], dir:x[2], stop:sid}); }); });
    (g.stops.CTB||[]).forEach(sid => { (RSTOPS.ctb||[]).forEach(x => { if (x[3] === sid && x[0].toUpperCase().startsWith(q)) res.push({co:'CTB', route:x[0], dir:x[1], stop:sid}); }); });
    const seen = new Set(); modalResults = [];
    res.filter(r => { const k = JSON.stringify(r); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 20).forEach(r => { modalResults.push(r); });
    if (q.length < 1 || !modalResults.length){ box.innerHTML = `<div class="status-line">${q.length<1? T('tripRoute') : T('noRoutes')}</div>`; return; }
    box.innerHTML = '';
    modalResults.forEach((r, i) => {
      let dest = '';
      if (r.co === 'KMB' || r.co === 'LWB'){ const rt = (ROUTES.kmb||[]).find(x => x[0]===r.route && String(x[1])===String(r.stype) && x[2]===r.dir); dest = rt ? (lang==='tc'?rt[7]:lang==='en'?rt[9]:rt[8]) : ''; }
      if (r.co === 'CTB'){ const rt = (ROUTES.ctb||[]).find(x => x[0]===r.route && x[1]===r.dir); dest = rt ? (lang==='tc'?rt[5]:lang==='en'?rt[7]:rt[6]) : ''; }
      const it = el('div','mr-item');
      it.innerHTML = `<div class="grow"><div class="n1">${esc(r.route)}</div><div class="n2">${T('to')} ${esc(dest)}</div></div><button class="plus">+</button>`;
      it.onclick = () => addTripFromResult(i, dest);
      box.appendChild(it);
    });
  }
}
function addStopFromResult(i){
  const {co, s} = modalResults[i]; if (!s) return;
  const id = s[0];
  if (userStops.some(u => u.id === id)){ toast(T('addedAlready')); return; }
  userStops.push({id, co: co.toLowerCase(), name_tc:s[1], name_sc:s[2], name_en:s[3], lat:s[4], lng:s[5]});
  saveJSON('bp_stops', userStops);
  curGroup = 'u_' + id; localStorage.setItem('bp_cur', curGroup);
  closeModal(); toast(T('addOk'));
  switchView('stop'); renderChips(); renderBoard(); renderSettings();
}
function addTripFromResult(i, dest){
  const r = modalResults[i]; const g = modalTripFrom; if (!r || !g) return;
  const entry = r.co === 'CTB'
    ? {co:'CTB', route:r.route, dir:r.dir, stopId:r.stop, routeNo:r.route}
    : {co:'KMB', route:r.route, stype:r.stype, dir:r.dir, stopId:r.stop, routeNo:r.route};
  userTrips.push({id:'t'+Date.now(), from_sc:g.name_sc, from_tc:g.name_tc, from_en:g.name_en,
    to_sc:dest || r.route, to_tc:dest || r.route, to_en:dest || r.route,
    entries:[entry], stopName: g.name_sc});
  saveJSON('bp_trips', userTrips);
  closeModal(); toast(T('addOk')); switchView('trip');
}
$('#modal-search').addEventListener('input', doModalSearch);
$('#modal-search').addEventListener('keydown', e => {
  if (e.key === 'Enter'){
    e.preventDefault();
    if (modalMode === 'stop' && modalResults.length) addStopFromResult(0);
    else if (modalMode === 'trip-route' && modalResults.length) addTripFromResult(0, '');
  }
});
$('#modal-close').addEventListener('click', closeModal);
$('#modal .modal-mask').addEventListener('click', closeModal);
$('#btn-add-trip').addEventListener('click', () => openModal('trip'));

/* ================= 语言 / 导航 / 刷新 ================= */
function applyLang(){
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = T(e.dataset.i18n); });
  document.documentElement.lang = lang === 'sc' ? 'zh-Hans' : lang === 'tc' ? 'zh-Hant' : 'en';
  $('#route-input').placeholder = lang === 'sc' ? '输入路线号，如 272A / 582 / 806A'
    : lang === 'tc' ? '輸入路線號，如 272A / 582 / 806A'
    : 'Route no., e.g. 272A / 582 / 806A';
  $('#modal-search').placeholder = T('searchStop');
  if ($('#btn-nearby-refresh')) $('#btn-nearby-refresh').title = T('refresh');
  document.querySelectorAll('#seg-trip-sort button').forEach(b => { b.textContent = T('sort' + b.dataset.sort[0].toUpperCase() + b.dataset.sort.slice(1)); });
  if ($('#near-go')) $('#near-go').textContent = T('locateShort');
  if ($('#near-input')) $('#near-input').placeholder = T('nearLocInput');
}
$('#btn-refresh').addEventListener('click', async () => {
  const b = $('#btn-refresh');
  b.classList.add('spinning');
  toast(T('refreshing'));
  startTimer();   // 手动刷新后自动刷新倒计时重新开始
  try {
    await refreshCurrent();
    if (activeView() === 'stop') await refreshWeather(true);
  } finally {
    b.classList.remove('spinning');
    toast(T('updated') + ' ' + new Date().toTimeString().slice(0,5));
  }
});
document.querySelectorAll('#seg-trip-sort button').forEach(b => b.addEventListener('click', () => {
  tripSort = b.dataset.sort; localStorage.setItem('bp_trip_sort', tripSort); sortTripCards();
}));
document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => switchView(t.dataset.view)));
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; $('#btn-install').hidden = false; });
$('#btn-install').addEventListener('click', async () => { if (deferredInstall){ deferredInstall.prompt(); deferredInstall = null; $('#btn-install').hidden = true; } });
window.addEventListener('pagehide', () => { saveJSON('bp_board', BOARD); saveJSON('bp_info', INFO); });
window.addEventListener('resize', syncTopbar);
window.addEventListener('orientationchange', () => setTimeout(syncTopbar, 200));

/* ================= Service Worker ================= */
if ('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  });
}

/* ================= 初始化 ================= */
(async function init(){
  applyTheme();
  applyLang();
  await loadStopCodes();
  try { await loadQuick(); } catch(e){ toast(T('fail')); }
  renderChips();
  switchView('stop');
  startTimer();
  syncTopbar();
  refreshWeather(false);
  // 附近定位不自动更新：默认云汇坐标，只有用户点「定位」或手工输入时才改变
})();
