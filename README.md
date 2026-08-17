<p align="center">
  <img src="./docs/app-logo-flowers.png" width="380" alt="轴伊Joi 双衣装主题 · 双人 logo">
</p>

<h1 align="center">轴伊Joi 双衣装主题</h1>

<p align="center">
  <strong>把 DeepSeek Harness 变成她的房间。</strong><br>
  基于 VirtuaReal 虚拟主播轴伊Joi 制作的非官方、非商业 DeepSeek Harness 主题插件。
</p>

<p align="center">
  <a href="./README.en.md">English</a> ·
  <strong>简体中文</strong> ·
  <a href="./README.ja.md">日本語</a> ·
  <a href="./README.ko.md">한국어</a> ·
  <a href="./README.fr.md">Français</a>
</p>

<p align="center">
  <img alt="DeepSeek Harness" src="https://img.shields.io/badge/DeepSeek-Harness-4D6BFE?style=flat-square&logoColor=white">
  <img alt="Claude Fable 5" src="https://img.shields.io/badge/Claude-Fable%205-D97757?style=flat-square&logoColor=white">
  <a href="https://space.bilibili.com/61639371"><img alt="轴伊Joi 的哔哩哔哩个人主页" src="https://img.shields.io/badge/Bilibili-轴伊Joi-00A1D6?style=flat-square&logo=bilibili&logoColor=white"></a>
</p>

<p align="center">
  <img alt="dsh web plugin" src="https://img.shields.io/badge/dsh%20plugin-web-8B5CF6?style=flat-square">
  <img alt="两套衣装" src="https://img.shields.io/badge/衣装-Flowers%20%C2%B7%20Library-EE7F2D?style=flat-square">
  <a href="./LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/code-MIT-3DA639?style=flat-square"></a>
  <a href="./LICENSE-ASSETS.md"><img alt="CC BY-NC-SA 4.0" src="https://img.shields.io/badge/assets-CC%20BY--NC--SA%204.0-EF9421?style=flat-square"></a>
</p>

<p align="center">
  <a href="#overview">项目简介</a> ·
  <a href="#gallery">界面预览</a> ·
  <a href="#states">状态演出</a> ·
  <a href="#installation">安装</a> ·
  <a href="#wardrobe">换装与原生</a> ·
  <a href="#design">设计与技术</a> ·
  <a href="#license">许可说明</a>
</p>

---

<a id="overview"></a>

## 项目简介

轴伊Joi 是一名活跃于中国视频平台哔哩哔哩的虚拟主播，隶属于虚拟艺人团体 VirtuaReal。

喜欢像素风绘画、赛博朋克和电影《银翼杀手》；讨厌运动；特长是「一口能吃一个带橘子」，
并认为橘子是最完美的水果——「🍊」由此成为她的事实 emoji 代表（非公式）。

这套主题把她的**两套官设服装做成了两间完整的房间**：暖色舞台感的 **Joi·Flowers**，
和冷色书房感的 **Joi·Library**。不是同一张皮换个色相——底色、面板、气泡、代码高亮、
底纹、角色演出，两套各成体系，**互不混用**。而「换装」这个词本身，正是电影里
Joi 的叙事在这个界面上唯一落脚的地方。

| 衣装 | 明暗 | 语义色槽 | 角色 | 内联素材 |
| :---: | :---: | :---: | :---: | :---: |
| `2 套` | `浅 · 深 · 跟随系统` | `7 + 叶` | `轴伊 · 轴芯 · 鲸鱼娘` | `10 件 · 2.4 MB · 零外链` |

> [!IMPORTANT]
> **非官方粉丝作品。** 本项目与轴伊Joi、VirtuaReal、哔哩哔哩、DeepSeek 及相关权利方
> 不存在隶属、授权、合作、赞助或背书关系。角色名称、形象、人物设定及相关品牌权利
> 归各自合法权利人所有。

<a id="gallery"></a>

## 界面预览

新会话页：她站在房间门口，视线落在「探索未至之境」上；鲸鱼娘趴在标题上打盹，
爪尖恰好压进汉字 4 个像素——这是「趴在上面」唯一的深度线索。

| | Joi·Flowers | Joi·Library |
| ---: | :---: | :---: |
| **浅色** | <img src="./docs/new-chat-flowers.png" width="410" alt="Joi·Flowers 新会话页 · 浅色"> | <img src="./docs/new-chat-library.png" width="410" alt="Joi·Library 新会话页 · 浅色"> |
| **深色** | <img src="./docs/new-chat-flowers-dark.png" width="410" alt="Joi·Flowers 新会话页 · 深色"> | <img src="./docs/new-chat-library-dark.png" width="410" alt="Joi·Library 新会话页 · 深色"> |

明暗永远跟着 app 自己的外观设置走；衣装换的是色相，不是明暗。四个象限
（两套衣装 × 浅深）每一格都按同一份冻结基线逐值校过。

### 品牌双人照

侧栏左上角的鲸鱼图标，换成了一张**双人合照**——鲸鱼娘和轴伊挤在同一张
die-cut 贴纸里：引擎和她，一个都不能少。合照随衣装一起换装，白描边直接
烘焙进图，浅色底上也立得住；两张图按同一画布对齐，换装时脸的位置纹丝不动。

<p align="center">
  <img src="./docs/app-logo-flowers.png" width="360" alt="Flowers 双人 logo">
  &nbsp;&nbsp;
  <img src="./docs/app-logo-library.png" width="360" alt="Library 双人 logo">
</p>

<a id="states"></a>

## 状态演出

对话页上，输入框两侧坐着两个小家伙：左边是**轴芯**（粉丝形象），右边是**轴伊** Q 版。
它们跟着这一轮对话换表情——同一套词表、同一个时刻结算，绝不各说各的：

| | Joi·Flowers | Joi·Library |
| ---: | :---: | :---: |
| **待机** `info` | <img src="./docs/idle-flowers.png" width="380" alt="Flowers 待机"> | <img src="./docs/idle-library.png" width="380" alt="Library 待机"> |
| **执行中** `running` | <img src="./docs/working-flowers.png" width="380" alt="Flowers 执行中"> | <img src="./docs/working-library.png" width="380" alt="Library 执行中"> |
| **成功** `success` | <img src="./docs/success-flowers.png" width="380" alt="Flowers 成功"> | <img src="./docs/success-library.png" width="380" alt="Library 成功"> |
| **失败** `error` | <img src="./docs/failed-flowers.png" width="380" alt="Flowers 失败"> | <img src="./docs/failed-library.png" width="380" alt="Library 失败"> |

跑成了，两个人一起眯眼开心；跑砸了，一起垂眼掉一滴泪——难过五秒，然后打起精神
回到待机。失败从不被表演成嚎啕：那不是她们的性格。

长对话里文字压到角色身上时，重叠的那几行会自动获得一圈底色描边——
可读性永远排在可爱前面。

<a id="installation"></a>

## 安装

### 先确认两件事

| 前提 | 为什么 | 检查 |
| --- | --- | --- |
| **Node.js** `^22.19` 或 `>=24` | DeepSeek Harness 的运行底座 | `node -v` |
| **pnpm** | `dsh plugin` 本质是 pnpm 的转发器，缺了会报 `pnpm not found on PATH` | `pnpm -v` |

没有 pnpm 就先装一个（任选其一）：

```bash
npm install -g pnpm
```

```bash
corepack enable pnpm
```

### 情况 A：你平时用 `npx` 跑 harness

如果你习惯直接 `npx @deepseek-ai/dsh web`，那么 `dsh` 这个命令**并不在 PATH 上**
——单独敲 `dsh plugin ...` 会报 `command not found`。用同样的 `npx` 前缀即可：

```bash
npx @deepseek-ai/dsh plugin --profile web add dsh-joi-channel-theme
```

装完再照常启动：

```bash
npx @deepseek-ai/dsh web
```

> [!IMPORTANT]
> **profile 名必须是 `web`。** 只有 `web` 和 `headless` 两个名字带出厂模板；
> 换成别的名字只会得到一个没有网页界面的空 profile，页面起不来。

### 情况 B：你想少打点字

把 harness 装成全局命令，之后 `dsh` 直接可用：

```bash
npm install -g @deepseek-ai/dsh
```

```bash
dsh plugin --profile web add dsh-joi-channel-theme && dsh web
```

### 然后

浏览器打开终端里打印的地址（默认 `http://127.0.0.1:3080`），刷新一次，她就在了。

**如果 harness 正在运行**，插件不会热加载——插件集变更只在重启时生效。
按 `Ctrl+C` 停掉，装好插件，再重新启动。

### 卸载

```bash
npx @deepseek-ai/dsh plugin --profile web remove dsh-joi-channel-theme
```

> [!NOTE]
> **命令行只用这一次。** 装完之后所有操作都在界面里：换装、以及回到原生外观，
> 都在 设置 → 通用设置 的同一栏。DeepSeek Harness 目前没有图形化的插件安装入口，
> 所以这一步绕不开。

> [!TIP]
> 卸载后界面会逐项回到原生——token、图标、字标、代码高亮，零残留，
> 这一点经过实机逐项核对。

<details>
<summary><strong>常见问题</strong></summary>

**`dsh: command not found`** — 你没有全局安装 harness。用 `npx @deepseek-ai/dsh plugin ...`
（情况 A），或者先 `npm install -g @deepseek-ai/dsh`（情况 B）。

**`dsh: pnpm not found on PATH`** — `dsh plugin` 需要 pnpm 来管理 profile 的依赖。
先 `npm install -g pnpm` 或 `corepack enable pnpm`。

**装完了但界面没变** — 插件集变更只在重启时生效。停掉 harness 再启动，然后硬刷浏览器
（`Cmd/Ctrl+Shift+R`）。

**国内网络下 `npx` 拉不动** — 本包已发布到官方 npm；若你的默认源是镜像，
镜像通常几分钟内同步。急用可临时指定官方源：
`npx --registry=https://registry.npmjs.org/ @deepseek-ai/dsh plugin --profile web add dsh-joi-channel-theme`

**从本地检出安装（开发用）**

```bash
dsh plugin --profile web add /path/to/dsh-joi-channel-theme
```

从 GitHub 直装**不推荐**：pnpm ≥10 会拦下 `prepare` 构建脚本，首次安装必定失败，
需要手动把提示的包名写进 profile 的 `pnpm-workspace.yaml` 的 `allowBuilds` 再重跑。
npm 包已带构建产物，不需要任何构建授权。

</details>

<a id="wardrobe"></a>

## 换装与原生

**换装**入口在 设置 → 通用设置 → 换装：两张衣装卡，选一套，房间会跟着换。
下半部分仍是原生的浅色 / 深色 / 跟随系统三方块——明暗永远归 app 自己管。

**「DeepSeek 原生」是第三张卡**，就并排在两套衣装旁边：选它即回到 DeepSeek 原生外观，
插件保持安装；再选回任一套衣装即刻恢复。装了插件，不等于必须换肤。

它没有做成「插件开关」，因为它本来就不是——关掉不会停用插件，profile 里的 bundle
照样装着、照样加载，插件列表里的状态一动不动。它切换的自始至终只是外观。

<details>
<summary><strong>这间房间里藏了什么（设计彩蛋）</strong></summary>

- **会成熟的橘子** — 上下文用量不再是进度环，是一颗从深绿熟到橙红的橘子。
  熟过头本身就是警示；叶恒绿、蒂恒褐，因为身份不随状态变。
- **鲸蓝恒定** — 模型、用量、子代理的颜色两套衣装完全相同。
  人的颜色会换，工具的颜色不换。
- **金色配额** — 她的瞳色 `#FFCE65` 在 Flowers 里可以铺满用户气泡，
  在 Library 里只准出现在胸针尺度的点缀上。克制也是设计。
- **底纹即衣料** — Flowers 的花瓣点阵来自裙面印花，Library 的方格纸来自制图线。
- **字标手术** — 侧栏的 deepseek 字标被小心地重排成双行，HARNESS 徽章
  精确对齐到「ek」的 e——原生 SVG 一个字节都没改，随时可逆。
- **🍊 无处不在** — 标签页图标、一级列表记号，都是那颗最完美的水果。
- **子代理小鲸鱼** — 并发的子任务排成一排小鲸鱼：排队闭眼、运行喷水、完成眯眼。

</details>

<a id="design"></a>

## 设计与技术

这套主题先有一份**冻结的设计基线**，后有代码：每个色值、每个锚点、每条精灵格
比例都写在一份 `baseline-4q.json` 里，代码在构建期从基线生成常量，禁止手抄。回归脚本按同一份基线断言四个象限（283 项全绿才算过）。

| 项目 | 值 |
| --- | --- |
| 插件 ID | `dsh-joi-channel-theme` |
| 形态 | dsh bundle + web 客户端插件（官方安装链路，无需自打包前端） |
| 令牌覆盖 | 每套衣装 19 级中性色阶 + 44 条语义映射 + 9 项代码高亮，浅深双值 |
| 角色资产 | 轴伊 2×2 ×2 套 · 轴芯 2×2 · 鲸鱼娘趴/站 · 小鲸鱼 1×3 |
| 内联素材 | 10 件 WebP data URI，共 2.4 MB，零外链（CSP 友好） |
| 兼容 | DeepSeek Harness web `0.1.0-rc.5+` |
| 深入阅读 | [开发与设计文档](./docs/DEVELOPMENT.md) |

<details>
<summary><strong>查看仓库结构</strong></summary>

```text
dsh-joi-channel-theme/
├── README.md                 # 本文（en/ja/ko/fr 见同级）
├── LICENSE                   # 代码：MIT
├── LICENSE-ASSETS.md         # 素材：CC BY-NC-SA 4.0
├── THIRD_PARTY_NOTICES.md
├── cordis.patch.yml          # dsh bundle 配置层
├── src/                      # 宿主半边 + 浏览器半边
├── scripts/                  # 基线/素材生成 · 精灵对齐 · 四象限回归
├── stuff/                    # 原始素材（含未采用版本）
└── docs/                     # 截图与开发文档
```

</details>

<a id="license"></a>

## 许可与权利声明

本仓库采用分类授权：

- 代码、项目原创配置与文档文字采用 [MIT License](./LICENSE)；
- `stuff/` 与 `docs/` 中项目作者依法有权许可的原创视觉贡献采用
  [CC BY-NC-SA 4.0](./LICENSE-ASSETS.md)，要求署名、非商业性使用及相同方式共享。

> [!WARNING]
> 两份许可证均只覆盖项目维护者或贡献者依法有权许可的原创部分，不授予轴伊Joi 的
> 姓名、角色形象、设定，以及 VirtuaReal、哔哩哔哩、DeepSeek 或其他第三方名称、
> 商标、素材和参考资料的任何权利。

角色、品牌与资料来源的完整权利边界见 [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md)。

---

<p align="center">
  <sub>Unofficial fan project · Code MIT · Original assets CC BY-NC-SA 4.0 · 🍊</sub>
</p>
