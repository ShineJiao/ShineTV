# 灬灬TV

<div align="center">
  <img src="./public/logo.png" alt="灬灬TV Logo" width="50" height="50" />

  <p><strong>现代化的视频流媒体播放平台</strong></p>

  <p>
    一个功能丰富的视频流媒体应用，支持多源搜索、智能播放、弹幕互动和历史记录管理
  </p>
</div>

<div align="center">

![灬灬.js](https://img.shields.io/badge/灬灬.js-16.1.1-000?logo=灬灬dotjs)
![React](https://img.shields.io/badge/React-19.2.3-61dafb?logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.18-38bdf8?logo=tailwindcss)
![ArtPlayer](https://img.shields.io/badge/ArtPlayer-5.3.0-ff6b6b)
![HLS.js](https://img.shields.io/badge/HLS.js-1.6.15-ec407a)
![License](https://img.shields.io/badge/License-MIT-green)
![Docker Ready](https://img.shields.io/badge/Docker-ready-blue?logo=docker)

</div>

---

## 特性

- 🎬 **多源视频搜索** - 支持自定义多个视频源 API，聚合搜索电影和电视剧
- 🎯 **豆瓣推荐** - 集成豆瓣API，展示热门和高分影视内容
- 🎯 **红果短剧推荐** - 基于红果短剧数据，展示热门和高分短剧内容
- 🎌 **Bangumi 番组计划** - 集成 Bangumi API，提供专业动漫数据和每日放送
- 🏷️ **全类型标签管理** - 电影/电视剧/动漫/综艺/短剧均支持自定义标签分类
- 🎥 **高级播放器** - 基于 Artplayer，支持 HLS/M3U8 流媒体播放
- 💬 **弹幕系统** - 实时弹幕显示，支持多个弹幕源配置
- 🚀 **去广告功能** - 自动过滤 M3U8 流中的广告片段
- ⏭️ **智能跳过** - 自动跳过片头片尾，可自定义跳过时间点
- 📝 **播放历史** - 自动保存观看进度，随时继续观看
- ⭐ **收藏管理** - 收藏喜爱的视频，方便快速访问
- 🎯 **豆瓣推荐** - 集成豆瓣 API，展示热门和高分影视内容
- 🎯 **红果短剧推荐** - 基于红果短剧数据，展示热门和高分短剧内容
- 🎌 **Bangumi 番组计划** - 集成 Bangumi API，提供专业动漫数据和每日放送
- 🔗 **自定义豆瓣代理** - 自定义豆瓣 API 代理和图片代理，防止连接问题
- ⚙️ **灵活配置** - 可视化管理视频源和弹幕源，支持导入导出
- ⌨️ **快捷键支持** - 丰富的键盘快捷键，提升观看体验
- 🔔 **首页剧集更新提醒** - 首页继续观看区域展示剧集更新提醒
- 📱 **全平台响应式** - 完美适配 PC、平板、手机和 TV 设备
- 🎨 **墨绿色主题** - 统一的 UI 设计和配色方案

---

## 网站结构与布局

### 整体架构

```
灬灬TV/
├── app/                      # 灬灬.js App Router 页面
│   ├── layout.jsx           # 全局布局（导航栏 + 主内容区）
│   ├── page.jsx             # 首页（媒体分类展示）
│   ├── play/[id]/page.jsx   # 播放页面
│   ├── search/page.jsx      # 搜索结果页
│   ├── settings/page.jsx    # 设置页面
│   └── help/page.jsx        # 帮助页面
├── components/              # React 组件
│   ├── Navbar.jsx          # 顶部导航栏
│   ├── SideMenu.jsx        # 右侧滑动菜单
│   ├── MovieCard.jsx       # 影片卡片
│   ├── VideoPlayer.jsx     # 视频播放器
│   ├── ContinueWatching.jsx # 继续观看
│   └── ...
├── lib/                     # 工具函数和 API
│   ├── doubanApi.js        # 豆瓣 API 封装
│   ├── bangumiApi.js       # Bangumi API 封装
│   └── util.js             # 通用工具函数
└── store/                   # Zustand 状态管理
    ├── usePlayHistoryStore.js
    ├── useFavoritesStore.js
    └── useSettingsStore.js
```

### 页面详情

#### 1. **首页 (`/`)**
- **媒体类型**: 6 种分类（首页、电影、电视剧、动漫、综艺、短剧）
- **布局结构**:
  - 顶部：导航栏（Logo、搜索框、历史记录、收藏、设置）
  - 右侧：滑动菜单（媒体类型切换按钮）
  - 主内容区：
    - 标签管理栏（可横向滑动，支持增删改查）
    - 继续观看区域（有观看历史时显示）
    - 热门推荐区域（网格布局展示影片卡片）
- **特色功能**:
  - ⭐ 动漫使用 Bangumi API（每日放送、周一至周日、番剧、剧场版）
  - 📺 综艺按地区分类（最近热门、全部、国内、国外）
  - 🎭 短剧按题材分类（热门、最新、高分推荐、都市、言情、逆袭等）
  - 🎬 电影按热度和地区分类（热门、最新、豆瓣高分、华语、欧美等）
  - 支持自定义标签管理（添加、删除、恢复默认）

#### 2. **播放页面 (`/play/[id]`)**
- **布局结构**:
  - 面包屑导航
  - 左侧：视频播放器（可折叠选集列表）
  - 右侧：选集列表（默认展开，可收起）
  - 底部：详细信息卡片（海报、评分、演员表、剧情简介）
- **响应式设计**:
  - 桌面端：左右分栏布局（播放器 + 选集）
  - 移动端：单列布局，选集可折叠
  - 移动端专属操作栏（收藏、标题、来源）

#### 3. **设置页面 (`/settings`)**
- **功能模块**:
  - 视频源管理（增删改查、优先级调整）
  - 弹幕源管理（最多 1 个）
  - 豆瓣代理配置
  - 数据导入导出
- **模态框模式**: 从导航栏点击设置按钮弹出

#### 4. **搜索页面 (`/search`)**
- 简洁的搜索界面
- 支持关键词搜索
- 显示搜索结果

---

## 媒体类型详解

### 1. **首页**
- 默认标签：热门
- 展示综合内容

### 2. **电影** ⭐
- **默认标签**: 热门
- **筛选维度**:
  - 按热度/质量：热门、最新、豆瓣高分、冷门佳片、全部
  - 按地区：华语、欧美、韩国、日本
- **数据来源**: 豆瓣API
- **标签管理**: 支持自定义添加标签

### 3. **电视剧** ⭐
- **默认标签**: 国产剧
- **筛选维度**:
  - 按地区：国产剧、美剧、英剧、韩剧、日剧、其他
- **数据来源**: 豆瓣API
- **标签管理**: 支持自定义添加标签

### 4. **动漫** ⭐⭐ 重点推荐
- **默认标签**: 热门
- **特色标签**:
  - 📅 每日放送：自动显示今日更新的动画
  - 📆 周一至周日：分别查看每日新番
  - 📺 番剧：TV 动画合集
  - 🎬 剧场版：动画电影
- **数据来源**: Bangumi 番组计划 API
- **标签管理**: 支持自定义添加标签

### 5. **综艺** ⭐
- **默认标签**: 最近热门
- **固定标签**:
  - 🔥 最近热门：热门综艺推荐
  - 📺 全部：综艺大全
  - 🇨🇳 国内：大陆综艺
  - 🇰🇷 国外：韩国综艺
- **数据来源**: 豆瓣API
- **标签管理**: 支持自定义添加标签

### 6. **短剧** ⭐ 新增
- **默认标签**: 热门
- **筛选维度**:
  - 按热度/质量：热门、最新、高分推荐、全部
  - 按题材类型：都市、言情、逆袭、战神、神医、穿越
- **数据来源**: 红果短剧 API
- **标签管理**: 支持自定义添加标签

---

## 多设备适配方案

### 响应式断点

```css
/* 超大屏幕 (PC/TV) */
min-width: 1920px
  - 6 列网格布局
  - 完整功能和细节展示

/* 大屏幕 (PC/笔记本) */
min-width: 1024px
  - 6 列网格布局
  - 所有功能完整

/* 中等屏幕 (iPad/平板) */
max-width: 768px
  - 4 列网格布局
  - 导航栏简化
  - 播放器控件优化

/* 小屏幕 (手机竖屏) */
max-width: 380px
  - 3 列网格布局
  - 移动端专属 UI
  - 播放器控件精简
```

### 设备适配详情

#### 🖥️ **PC / 笔记本**
- ✅ 完整的导航栏和搜索框
- ✅ 右侧滑动菜单完整显示
- ✅ 6 列影片卡片网格
- ✅ 播放页面左右分栏布局
- ✅ 完整的播放器控制
- ✅ 详细信息卡片展示

#### 📱 **iPad / 平板**
- ✅ 导航栏适度简化
- ✅ 右侧滑动菜单正常显示
- ✅ 4 列影片卡片网格
- ✅ 播放器适配横竖屏切换
- ✅ 弹幕面板位置优化
- ✅ 触摸友好的按钮尺寸

#### 📱 **手机**
- ✅ 导航栏搜索框独立一行
- ✅ 右侧滑动菜单正常显示
- ✅ 3 列影片卡片网格
- ✅ 播放器全屏优化
- ✅ 隐藏网页全屏、音量、PiP 控件
- ✅ 移动端专属操作栏
- ✅ 弹幕面板自适应位置
- ✅ 按钮间距缩小至 28px

#### 📺 **TV / 超大屏**
- ✅ 最大 7xl 容器限制
- ✅ 6 列高清网格
- ✅ 字体和图标清晰显示
- ✅ 遥控器友好的焦点状态

---

## CSS 响应式优化

### 播放器移动端优化

```css
/* 平板及手机端 */
@media (max-width: 768px) {
  - 隐藏网页全屏按钮
  - 隐藏音量控制（物理按键）
  - 隐藏 PiP 画中画
  - 控制栏溢出隐藏
  - 按钮最小宽度 32px
}

/* 小屏手机 */
@media (max-width: 380px) {
  - 进一步缩小按钮至 28px
  - 字体大小调整为 13px
  - 进度条高度降至 3px
}
```

### 弹幕系统优化

- **横屏模式**（宽度≥512px）：弹幕面板居中显示
- **竖屏模式**（宽度<512px）：弹幕面板自适应位置
- **最大宽度**: calc(100vw - 40px) 避免溢出

---

<details>
  <summary>点击查看项目截图</summary>
  <img src="https://tncache1-f1.v3mh.com/image/2026/01/16/3c7155e313df3bdae29b66815a42b3db.png" alt="主页截图" style="max-width:600px">
  <img src="https://tncache1-f1.v3mh.com/image/2026/01/16/778e5b27c569b953924f7c803d788e83.png" alt="搜索截图" style="max-width:600px">
  <img src="https://tncache1-f1.v3mh.com/image/2026/01/16/0d13d14d462d7c9d7cb250e072f1fdea.png" alt="播放截图" style="max-width:600px">
  <img src="https://tncache1-f1.v3mh.com/image/2026/01/16/fc1aaa5124285bf4d02fc8df8193821c.png" alt="设置截图" style="max-width:600px">
</details>

---

---

### 重要说明：

- **本项目为空壳播放器，自带唯一播放源不稳定，仅供学习使用，请自行更换播放源**
- **本项目不添加用户登录以及认证功能**
- **本项目完全由 Claude Code 生成，仅作为学习参考，请勿用于商业用途**

---

## 技术栈

### 核心框架

- **灬灬.js** 16.1.1 - React 服务端渲染框架
- **React** 19.2.3 - 用户界面构建库
- **Tailwind CSS** 4.1.18 - 现代化 CSS 框架

### 播放器相关

- **Artplayer** 5.3.0 - 功能丰富的 HTML5 视频播放器
- **HLS.js** 1.6.15 - HTTP Live Streaming 支持
- **artplayer-plugin-danmuku** 5.2.0 - 弹幕插件

### 状态管理

- **Zustand** 5.0.10 - 轻量级状态管理库

---

## 快速开始

### 前置要求

- Node.js 18.0 或更高版本
- 包管理器选择（任选其一）：
  - **Bun** (推荐) - 更快的安装和运行速度
  - **npm** - Node.js 自带包管理器
  - **yarn** - Facebook 开发的包管理器

### 安装

```bash
# 克隆项目（请替换为您的实际仓库地址）
git clone https://github.com/your-username/灬灬TV.git
cd 灬灬TV

# 安装依赖
bun install

# 启动开发服务器
bun dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

> **注意**: 
> - 如果您是从 GitHub 克隆的项目，请将 URL 替换为实际的仓库地址
> - 本项目使用 `bun` 作为包管理器，如未安装可使用 `npm` 或 `yarn` 替代

### 构建生产版本

```bash
# 使用 Bun (推荐)
bun run build
bun start

# 或使用 npm
npm run build
npm start

# 或使用 yarn
yarn build
yarn start
```

---

## 主要功能

### 1. 视频搜索

- 支持多个视频源聚合搜索
- 分页浏览搜索结果
- 展示视频封面、标题和简介

### 2. 视频播放

- **HLS 流媒体支持**：原生 HLS 和 HLS.js 自动降级
- **自动去广告**：通过过滤 M3U8 中的 `#EXT-X-DISCONTINUITY` 标签去除广告
- **片头片尾跳过**：可配置自动跳过的起止时间
- **剧集切换**：上一集/下一集快速切换
- **进度保存**：自动保存播放进度（每 5 秒）
- **弹幕显示**：实时加载和显示弹幕评论

### 3. 如何设置弹幕播放源

请基于以上两个项目自行搭建弹幕源：

- [danmu_api](https://github.com/SeqCrafter/danmu_api)
- [fetch_danmu](https://github.com/SeqCrafter/fetch_danmu)

两个项目的请求参数完全一致，大概是这样：

```
https://<搭建地址>/api/douban?douban_id=36481469&episode_number=1
```

或者对于`danmu_api`来说

```
https://<搭建地址>/{token}/api/v2/douban?douban_id=36481469&episode_number=1
```

在 灬灬TV 的设置中，弹幕源应该为`?`之前的地址，例如：

```
https://<搭建地址>/api/douban
```

或者

```
https://<搭建地址>/{token}/api/v2/douban
```

### 4. 播放历史

- 自动记录观看历史（最多 20 条）
- 显示观看进度和剧集信息
- 快速跳转到历史记录
- 支持删除单条或清空全部历史

### 5. 收藏管理

- 收藏喜爱的影视作品
- 查看收藏列表
- 快速访问收藏内容

### 6. 豆瓣推荐

- 首页展示豆瓣热门和高分内容
- 支持按标签筛选（热门、最新、经典、豆瓣高分等）
- 自定义标签管理（添加、编辑、删除）
- 分页浏览推荐内容

### 7. 设置管理

- **视频源管理**：
  - 添加/编辑/删除视频源
  - 启用/禁用视频源
  - 调整源优先级
  - 导入/导出配置

- **弹幕源管理**：
  - 类似视频源的管理功能
  - 支持多个弹幕源配置

---

### 8. 导入导出功能

除了手动添加源外，如果你非要添加大量源，可以使用导入功能，格式如下：

```json
{
  "videoSources": [
    {
      "name": "xx资源",
      "key": "xxxx",
      "url": "https://xxxx/api.php/provide/vod",
      "description": ""
    }
  ],
  "danmakuSources": [
    {
      "name": "xxxx",
      "url": "https://xxxx/api/v2/douban"
    }
  ]
}
```

## 快捷键

播放器支持以下快捷键操作：

| 快捷键    | 功能       |
| --------- | ---------- |
| `空格`    | 播放/暂停  |
| `←`       | 快退 10 秒 |
| `→`       | 快进 10 秒 |
| `Alt + ←` | 上一集     |
| `Alt + →` | 下一集     |
| `↑`       | 增加音量   |
| `↓`       | 减少音量   |
| `F`       | 全屏切换   |

---

## 开发

### 启动开发服务器

```bash
# 使用 Bun (推荐)
bun dev

# 或使用 npm
npm run dev

# 或使用 yarn
yarn dev
```

### 代码检查

```bash
bun run lint
```

### 构建项目

```bash
bun run build
```

---

## 部署方案

### 1. 使用 Vercel 部署

Fork 项目后，点击 Vercel 按钮即可部署。

### 2. 使用 EdgeOne 部署

Fork 项目后，进入 EdgeOne pages 即可部署。

### 3. 其他支持 灬灬.js 的云函数都可以尝试

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

---

## 致谢

- [Artplayer](https://github.com/zhw2590582/ArtPlayer) - 优秀的 HTML5 视频播放器
- [LunaTV](https://github.com/SzeMeng76/LunaTV) - 功能复杂的 灬灬.js 的播放器
- [LibreTV](https://github.com/LibreSpark/LibreTV) - 简易但不简单的播放器，本项目修改自 LibreTV
- [豆瓣](https://movie.douban.com/) - 提供影视推荐数据
- [CMLiussss](https://github.com/cmliu) - 感谢 CMLiussss 的 douban 代理
- [灬灬.js](https://灬灬js.org/) - React 服务端渲染框架
- [Tailwind CSS](https://tailwindcss.com/) - 现代化 CSS 框架

---

<div align="center">
  <p>Made with ❤️ by Xiaoguang </p>
</div>
