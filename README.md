<div align="center">

# HKBusETA · 巴士到站

**香港公交实时到站 PWA —— 实时数据、班表推算、离线可用、三语界面**

[![Version](https://img.shields.io/badge/version-1.4.3-blue.svg)](https://github.com/qrltu/HKBusETA)
[![License](https://img.shields.io/badge/license-learning%20%2F%20personal-orange.svg)](#license)
[![Platform](https://img.shields.io/badge/platform-web%20%7C%20PWA-lightgrey.svg)](#quick-start)
[![Data Source](https://img.shields.io/badge/data-DATA.GOV.HK-green.svg)](https://data.gov.hk/)
[![Language](https://img.shields.io/badge/i18n-%E7%AE%80%20%7C%20%E7%B9%81%20%7C%20EN-blueviolet.svg)](#features)

[🌐 在线演示（GitHub Pages）](https://qrltu.github.io/HKBusETA/) · [📱 备用演示站点](https://a3c1438eb28ab453b.app.workbuddy.host/?sharecode=LZ3H55GS7P) · [🐛 反馈问题](https://github.com/qrltu/HKBusETA/issues)

</div>

---

## 目录

- [项目简介](#overview)
- [功能详解](#features)
- [界面预览](#screenshots)
- [技术架构](#architecture)
- [数据源](#data-sources)
- [班表推算算法](#schedule-estimation)
- [项目结构](#structure)
- [快速开始](#quick-start)
- [部署](#deployment)
- [配置与开发](#configuration)
- [数据迁移](#data-migration)
- [版本历史](#changelog)
- [许可与致谢](#license)

---

## 项目简介 <a id="overview"></a>

HKBusETA 是一个面向**香港公交**的渐进式 Web 应用（PWA）。它以 [`DATA.GOV.HK`](https://data.gov.hk/) 开放数据为主数据源，覆盖**九巴 / 龙运（KMB / LWB）、城巴（CTB）、屿巴（NLB）**的实时到站，并对**没有实时数据的九巴线路**依据官网班表推算下一班开出与到站时间。应用为纯前端实现、无构建步骤，可离线使用、可安装到手机主屏幕，提供简体 / 繁体 / 英文三语与浅色 / 深色主题。

> 首个常用站点为「**云汇 / St. Martin**」，围绕白石角、香港科学园、沙田一带的通勤场景设计。

### 核心亮点

| 亮点 | 说明 |
|---|---|
| 🚌 **多运营商** | 一套界面覆盖 KMB / LWB / CTB / NLB，专线小巴 27A / 806A / 806B 内置静态时刻表 |
| ⏱️ **班表推算** | 无实时数据时，按官网班表智能推算下一班开出与到站时间，区分精确班次与班距窗口 |
| 📍 **附近站点** | 1 公里内站牌，GPS 实时定位 + 手动输入，同名站柱按距离合并 |
| 🔄 **离线优先** | Service Worker 缓存应用外壳与静态数据，断网可读缓存并显示更新时间 |
| 🌐 **三语三主题** | 简 / 繁 / 英三语，浅色 / 深色主题，自动跟随系统 |
| ⚙️ **零依赖部署** | 纯静态文件，`git clone` 后任意静态服务器即可运行 |

---

## 功能详解 <a id="features"></a>

应用底部有五个页签，功能按页签组织：

### 1. 到站（Stop）

- **常用站点快捷栏**：顶部显示当前站点，点按展开纵向列表——第 1 项为「📍 定位附近站点」，其后是全部常用站点（含距离），一键切换。
- **实时到站板**：按线路分组显示到站时间，含「即将到站」放大提示、无实时数据时的班表推算、缓存兜底。
- **天气**：顶部位置旁显示所选位置当日实时天气简报（简短描述 + 温湿度），每天只更新一次，自动匹配最近观测站。
- **自动刷新**：仅「到站」与「行程」页签自动刷新（可调 15s / 30s / 60s），带环形倒计时与手动刷新按钮；刷新采用软刷新（DOM 复用，只更新 ETA，不重建固定信息）。

### 2. 行程（Trip）

- **快捷行程**：预置青沙转机、去旺角东等常用行程，可自行添加。
- **多方式排序**：按到站时间 / 添加顺序 / 线路号排序。
- **沿途到站**：每条行程展开后显示沿途站点的到站信息，逐项软刷新、失败不阻断整页。

### 3. 线路（Route）

- **线路搜索**：输线路号（如 `272A` / `582` / `806A`）查沿途站点、首末班、车费与推算到站。
- **关注线路**：收藏后在此集中查看，支持编辑；每条一行显示首末班、车费、推算到站。
- **静态时刻表**：27A / 806A / 806B 三条专线小巴内置完整时刻表（双向站点、班距、服务时段与票价），按方向展示为普通条目排版。

### 4. 附近（Nearby）

- **实时定位**：GPS 定位 1 公里内站牌；定位失败或加载中自动回退到默认坐标（云汇）。
- **手动定位**：可输入站名或坐标定位，超过 10 个站柱时分页「显示更多」。
- **站柱合并**：同名站柱按 90 米半径合并，避免重复。

### 5. 我的（Settings）

- **外观与语言**：界面语言（简 / 繁 / EN）、主题（浅 / 深）、自动刷新间隔。
- **内容管理**：常用站点与关注线路的增删改。
- **数据与离线**：查看本地数据更新时间、手动更新本地数据、导出 / 导入个人数据（JSON）。
- **安装**：支持「安装到主屏幕」的 PWA 提示。
- **关于**：显示数据来源版权与版本号。

### 数据可靠性策略

> 所有实时数据获取失败时，均回退到 `localStorage` 缓存并明确标注「缓存于 …（时间）+ 提示」，**绝不出现空白页**。

---

## 界面预览 <a id="screenshots"></a>

应用图标（BusETA 站牌 + 抽象化 RTKG 车身字样）：

<p align="center">
  <img src="icons/icon-512.png" width="160" alt="App Icon 512">
  &nbsp;&nbsp;
  <img src="icons/icon-512-maskable.png" width="160" alt="Maskable Icon">
</p>

> 在线可交互预览请见顶部 [在线演示](#overview)。

---

## 技术架构 <a id="architecture"></a>

| 层次 | 技术 |
|---|---|
| 视图层 | 原生 HTML / CSS / JavaScript（ES Modules 风格组织，无框架、无构建） |
| 样式 | 单文件 `style.css`，顶部 `:root` 定义主题变量，支持浅 / 深色 |
| 状态 | 浏览器 `localStorage`（键前缀 `bp_`），单文件 `app.js` 分区管理 |
| 离线 | Service Worker：外壳缓存 + stale-while-revalidate + 数据缓存优先 |
| PWA | Web App Manifest（standalone、竖屏、maskable 图标） |
| 数据 | 实时接口浏览器直连；官网补充接口本地缓存 7 / 30 天 |

### 请求与缓存策略

```text
实时到站 / 天气接口（跨域）
  └─ 浏览器直连，不缓存；失败 → 界面显示本地缓存 + 缓存时间

九巴官网补充接口（班表 / 车费 / 行车时间 / 站牌编号）
  └─ 本地缓存 7 / 30 天，2~3 worker + 间隔限流，失败重试

应用外壳（HTML/CSS/JS）
  └─ Service Worker：stale-while-revalidate（先缓存后更新）

本地静态数据（data/*.json）
  └─ 缓存优先，离线可用
```

---

## 数据源 <a id="data-sources"></a>

| 来源 | 用途 | 规模 |
|---|---|---|
| `data.etabus.gov.hk/v1/transport/kmb/*` | 九巴 / 龙运实时到站、站点、线路-站点 | 6,744 站 / 1,569 线 |
| `rt.data.gov.hk/v1,1.1/v2/transport/{citybus,nlb}/*` | 城巴、屿巴实时到站与站点 | 2,577 CTB 站 / 66 NLB 线 |
| `data.weather.gov.hk/weatherAPI/opendata/weather.php` | 香港天文台实时天气（27 个观测站） | 27 站 |
| `search.kmb.hk/.../FunctionRequest.ashx` | 九巴官网补充：站点、时刻表、行车时间、实体站牌编号 | 6,287 站牌编号 |
| `16seats.net`（人工核对，2026-11） | 专线小巴 27A / 806A / 806B 静态时刻表 | 3 条线路 |

本地静态数据概览：

- `stops.json`：9,321 个站点（KMB 6,744 + CTB 2,577）
- `routes.json`：2,044 条线路（KMB 1,569 / CTB 409 / NLB 66）
- `routestop.json`：52,911 条线路-站点记录
- `links.json`：线路方向 / 终点对照（KMB / LWB / CTB / NLB / 联营 / 轻铁接驳 / 过海）
- `quickstops.json` / `trips.json`：预置常用站点与快捷行程
- `stopcodes.json`：6,287 个实体站牌编号映射（KMB 官网 `getallstops`）

> 数据版权归各自来源所有，见 [许可与致谢](#license)。

---

## 班表推算算法 <a id="schedule-estimation"></a>

针对没有实时到站数据的九巴 / 龙运线路，应用依据九巴官网班表推算下一班开出与到站时间。核心在 `app.js` 的 `scheduleInfo()` / `nextDeparture()`，将班表**严格区分为两类**：

| 类型 | 官网数据形态 | 处理方式 |
|---|---|---|
| **单点发车时刻** | `BoundText1` 为单个时间，如 82D 每日 `07:15`、`18:10` | 只在这些真实时刻点查找下一班，**绝不按班距循环**，避免推算出不存在的班次；过了末班自动取次日首班 |
| **班距窗口** | `BoundText1` 为时段，如 272A `06:00-07:00`，`BoundTime1` 为班距 | 仅在真实服务时段内按班距推算 |

到站时间由 `getjtbyfromtostop` 取得起点至目标站的行车时间后叠加到开出时间。推算结果在到站板、收藏线路、线路详情、线路搜索四处统一呈现。

> 🐞 已修复的历史 Bug：旧算法把 82D 的单点时刻误当作 24 小时班距窗口，从 07:15 每 15 分钟循环，凭空算出 10:00 等不存在的班次。现按上述两类分别处理。

---

## 项目结构 <a id="structure"></a>

```text
HKBusETA/
├── index.html               # 页面骨架：顶栏 + 五个页签容器 + 弹层
├── app.js                   # 全部业务逻辑（单文件，按 /* ===== 注释分区）
│                            #   i18n / API / 状态 / ETA / 班表推算 / 天气 /
│                            #   到站板 / 行程 / 线路 / 附近 / 设置 / SW 注册
├── style.css                # 全部样式（:root 主题变量）
├── sw.js                    # Service Worker：离线缓存 / stale-while-revalidate
├── manifest.webmanifest     # PWA 清单（standalone / maskable 图标）
├── data/                    # 本地静态数据
│   ├── stops.json           #   站点（KMB / CTB）
│   ├── routes.json          #   线路（KMB / CTB / NLB）
│   ├── routestop.json       #   线路-站点映射
│   ├── links.json           #   线路方向 / 终点对照
│   ├── stopcodes.json       #   实体站牌编号映射
│   ├── quickstops.json      #   预置常用站点
│   └── trips.json           #   预置快捷行程
├── icons/                   # PWA 图标（180 / 192 / 512 / maskable / preview）
├── push-to-github.sh        # 一键建仓并推送的辅助脚本
└── README.md
```

---

## 快速开始 <a id="quick-start"></a>

纯静态站点，无需安装依赖或构建。克隆后用任意静态服务器以项目根目录为起点运行：

```bash
git clone https://github.com/qrltu/HKBusETA.git
cd HKBusETA

# 任一静态服务器均可
python3 -m http.server 3000 --bind 0.0.0.0
# 或： npx serve .
```

打开 <http://localhost:3000/> 即可。

> ⚠️ **PWA 注意事项**：Service Worker 与 Web App Manifest 需要 **HTTPS** 或 `localhost` 才能生效；直接用 `file://` 打开会导致 PWA 能力失效、接口跨域受限。

---

## 部署 <a id="deployment"></a>

项目为纯静态文件，可部署到任意静态托管平台：

| 平台 | 方式 |
|---|---|
| **GitHub Pages** | Settings → Pages → Source 选 `main` 分支根目录。当前已启用：https://qrltu.github.io/HKBusETA/ |
| **Cloudflare Pages / Netlify / Vercel** | 连接仓库，构建命令留空，输出目录填项目根目录 |
| **自有服务器 / Nginx** | 将项目目录作为站点根目录，配置 HTTPS |

> 关键：本项目所有资源均为**相对路径**，`start_url` 为 `./index.html`、`scope` 为 `./`，因此可安全部署在子路径（如 `/HKBusETA/`）下，无需额外配置。

---

## 配置与开发 <a id="configuration"></a>

`app.js` 为单文件实现，按 `/* ================= 分区名 ================= */` 注释组织，定位改动点非常方便：

| 需求 | 位置 |
|---|---|
| 改文案 / 加语言 | 文件顶部 `I18N` 三语对象（简 / 繁 / 英各约 116 词条） |
| 加数据源接口 | `API` 常量对象 |
| 改默认坐标 / 附近半径 | `DEFAULT_LOC` / `NEARBY_R` / `NEARBY_GROUP_M` |
| 改班表推算 | `scheduleInfo()` / `nextDeparture()` |
| 改刷新间隔选项 | `index.html` 的 `#sel-interval` |
| 改小巴时刻表 | `GMB_TIMETABLE` |

**升级版本需同步 4 处**（否则离线缓存不会更新）：

1. `app.js` 的 `VERSION`
2. `index.html` 的 `app.js?v=` / `style.css?v=`
3. `sw.js` 的 `SHELL_FILES` 资源号与 `SHELL`（如 `bus-shell-v9` → `v10`）
4. `manifest.webmanifest` 的 `version`

运行时用户数据存于浏览器 `localStorage`（前缀 `bp_`），不会随源码提交。

---

## 数据迁移 <a id="data-migration"></a>

个人数据（常用站点、关注线路、行程、缓存、设置）保存在浏览器本地，不随源码/包迁移。可用「我的」页的 **导出 / 导入** 功能在设备间搬运：

- **导出**：生成 `bus-eta-backup-YYYY-MM-DD.json`，含 stops / routes / trips / tt / info / settings。
- **导入**：选择上述 JSON，按 ID 去重合并（不会覆盖同名项目）。

---

## 版本历史 <a id="changelog"></a>

| 版本 | 主要变更 |
|---|---|
| **v1.4.3** | 图标更新为 BusETA 站牌 + 抽象化 RTKG；顶部文字改为 BusETA、车身字样缩小 |
| **v1.4.2** | 修复班表推算算法（区分单点时刻与班距窗口）；到站页快捷栏改为「实时定位 + 常用站点」纵向列表 |
| **v1.4.1** | 班表推算、线路排序、转乘排版、线路摘要、附近分页 / 手工定位、站牌编号、缓存兜底、即将到站放大 |
| **v1.3.1** | 定时刷新、线路搜索、附近 1 公里、天气简报、安全区适配等 |
| **v1.2.0** | 默认坐标兜底、主题切换、三语、青沙转机、收藏编辑、本地时刻表缓存 / 导入导出、离线优先 |
| **v1.0** | 首版：雲滙站实时到站 PWA |

完整提交记录见 [Git 历史](https://github.com/qrltu/HKBusETA/commits/main)。

---

## 许可与致谢 <a id="license"></a>

**代码**：本项目代码仅供**学习与个人使用**，可自由查看与参考。

**数据版权归各自来源所有**：

- [DATA.GOV.HK](https://data.gov.hk/) — 九巴 / 龙运 / 城巴 / 屿巴实时交通数据
- [香港天文台](https://www.hko.gov.hk/) — 实时天气数据
- [九龙巴士（1933）有限公司](https://www.kmb.hk/) — 官网班表、车费、行车时间、站牌编号
- [16seats.net](https://www.16seats.net/) — 专线小巴营运资料

本项目为非官方工具，与上述机构无隶属关系。数据仅供参考，出行请以运营商官方信息为准。

---

<div align="center">

如果这个项目对你有帮助，欢迎 ⭐ Star 或提出 Issue / PR。

Made with 🚌 for Hong Kong commuters.

</div>
