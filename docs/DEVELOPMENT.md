# 开发与设计文档

> 本文是 `dsh-joi-channel-theme` 的工程正文：构建、实现要点、已知限制与验证方法。
> 面向用户的介绍见仓库根目录 [README](../README.md)。

## 两套衣装

取自两套官方服装集，**不得混用**——这是设计法条，不是偏好：

| | Joi-Flowers | Joi-Library |
|---|---|---|
| 性格 | 暖 · 舞台 · 陪伴 | 冷 · 整理 · 专注 |
| 底色 | `#FFFAF2` 暖白 | `#FAFBFC` 冷白 |
| 品牌色 | 梅 `#7B3B5C` | 青 `#3E4E6B` |
| 底纹 | 点阵（衣料樱花印花） | 方格纸（裙面制图线） |
| 瞳金 `#FFCE65` | 允许大面积（用户气泡即金底） | 仅状态与点缀，气泡改灰底 |

两套共用的：🍊（主播印象 emoji）、鲸蓝 `#3F51B5`/`#8C9BEA`（代表引擎，不随衣装变）、
Mini Joi、轴芯、Deepseek 鲸鱼娘。

明暗永远归 app 自己的外观设置。衣装换的是色相，不是明暗。

## 安装

```bash
dsh plugin --profile web add /path/to/dsh-joi-channel-theme
```

然后正常启动 `dsh web`。卸载：

```bash
dsh plugin --profile web remove dsh-joi-channel-theme
```

换装入口在 **设置 → 通用设置 → 换装**，它遮蔽了内置的「外观」行，
下半部分仍是原生的浅色/深色/跟随系统三方块。

**三张卡并排**：Joi·Flowers、Joi·Library、DeepSeek 原生。选原生即回到宿主原生外观，
插件保持安装；再选回任一套衣装即刻恢复。三者写的是同一个 `suit` 字段——
`native` 本就是它的合法取值（见 `contract.ts` 的 `SKINS`）。

原生曾被单独做成一张开关卡放进 **设置 → 插件 → 插件配置**，理由是它属于「插件治理」
而非外观偏好。该理由已废止：关掉它并不停用插件，profile 里的 bundle 照样装着、照样
加载，插件列表里的状态一动不动。摆在插件配置里反而暗示「这是插件开关」，
比「原生也算一套」的误解更严重。用户要回答的问题只有一个——这个房间用哪种外观。

关掉时做的事：卸掉 token 覆盖层、**停用整张静态样式表**、撤回全部装饰、还原字标手术。
停表这一步不能省——样式表里的结构类规则（品牌区留白、logoRow 高度、药丸 tab）
不依赖任何插件类名，留着就还在改布局，「原生」会变成「没有装饰的错位界面」。

## 从源码构建

```bash
npm install --ignore-scripts --legacy-peer-deps && npm run build
```

`--legacy-peer-deps` 是必需的：dsh 家族的 peer range 写成 `^4.0.1`，
按 semver 预发布规则匹配不上 `4.0.1-rc.4`。这只影响安装解析，不影响产物。

依赖 pin 在 `@next`（`0.1.0-rc.6`）。dsh 家族的 `latest` 停在占位版 `0.0.1-rc.1`，
装到那个版本会以难以诊断的方式失败。

```bash
npm run gen       # design/baseline-4q.json + stuff/ → src/generated/
npm run build     # gen + tsdown（宿主 ESM + 浏览器闭包工厂）
npm run verify    # 四象限回归（静态半）
```

## 设计与基线

本项目前端标准的唯一权威是一套设计基线（`design/`，**未随公开仓发布**），不挂任何外部设计系统。它包含：

| 文件 | 是什么 |
|---|---|
| `baseline-4q.json` | **取值权威**。色板、44 条 token 映射、19 级色阶、shiki 两套、底纹、成熟度、实测几何锚点 |
| `theme-design-pitch.html` | 设计提案：语义槽、金色配额、元素职责、两条状态机 |
| `implementation-baseline.html` | 四象限冻结值与五处结构冲突 |
| `detail-design.html` | 细节设计（计量、语法配色、反馈位、引导） |
| `chat-mockup.html` / `detail-mockup.html` | 可交互样机 |
| `theme-overlay.js` | 设计期在真实 UI 上验证过的参考实现 |

`src/generated/` 由 `baseline-4q.json` 与 `stuff/` 构建期生成，**不要手改**。
锚点手抄是漂移事故源：改了基线而代码不知道，表现为「某个象限某个值不对」，
回溯成本远高于生成成本。

## 实现要点

- **颜色**走 `ctx.theme.overrideTokens` 一层覆盖，明暗双向。19 级中性色阶兜住
  未列举组件，44 条语义 alias 负责分层（浅色主题里 bg-base / layer-1 / layer-3
  全映射到同一级 static-00，分层靠描边而非填色，所以必须直写 alias）。
- **样式表是静态的**。底纹图案、logo、描边色也做成 token，换装只换 token，
  一行 CSS 都不重建。文字自动描边（`.joi-halo`）同理：浅色是硬 1px die-cut
  白描边；深色地面近黑，1px 硬描边在小字号行上读作粗黑线，故改 0.5px 细边
  叠加 2/4px 地面色软衬（细边保字形、光晕撑出与浅色角色的分离带），
  用户气泡深色下无描边（不透明表面，角色透不出来，描边没有可读性功能）——
  三个取值都住在 `tokens.ts` 的 `--joi-halo-*` 里。
- **换装行**走 ui-slots 的 cell shadowing（同 id、priority −1），不 fork ui-theme；
  卸载后内置外观行自动回归。
- **装饰层**（立绘、鲸鱼娘、两个 Q 版角色、字标手术、底纹落点）没有官方接缝，
  只能认领 DOM。失败姿态一律 fail-soft：选择器失配就不出现，绝不弄坏原生界面。
  但**首次出错必须喊一声**（console.error 一次后闭嘴）——只吞不报会把「装饰没出现」
  变成无从下手的哑故障，这条实际救过两次场。
- **禁裸子串匹配**。CSS Modules 的命名是 `[hash]_[local]`，所以 `[class*=_tab]` 会
  一并命中 `_tabs`（容器）、`_table`、`_tableScroll`，`[class*=bubble]` 会命中
  Tooltip 自己的 `.bubble`。优先 ARIA 与 data 属性这类结构锚
  （`header > [role=tablist] > [role=tab]`、`[data-trajectory-scroll]`、
  `[data-disclosure-row]`），它们是 a11y／测试契约，比哈希类名稳得多。
  回归脚本有一节**选择器体检**守着这条：逐条统计命中集，多命中即失败。
  app 自带的 data 钩子已覆盖几处关键锚点：`[data-conversation-scroll]`（会话线程）、
  `[data-composer-card]`（输入卡）、`[data-chat-flow]`（会话流列）、
  `[data-trajectory-scroll]`、`[data-disclosure-row]`、`[role=toolbar]`、`[role=tablist]`。
- **改外观不要动布局**。药丸给 tab 加了横向 padding，就要用等量负外边距把占位还回去
  （负外边距收 margin 边、border 盒外溢，而 flex 的 gap 量的是 margin 盒），
  否则标签整排右移、与上下行全部错位。
- **层序一次到位**。角色是 `position:fixed; z-index:0`，按绘制顺序天然盖住所有普通流内容。
  逐个元素抬是抬不完的（抬了文字，动作行和工具输出还在下面）——给会话线程容器
  一个层叠上下文即可。上限是 7：composer 座位在那一层，且承载输入区渐隐遮罩。
- **素材**十件内联为 WebP data URI，共 2.48 MB（CSP 不放外链）。
  逐件在无损与 q95 之间取较小者，门槛是可见 PSNR ≥ 40dB 且 alpha 零偏差
  ——这十件都是 die-cut 图，白描边靠 alpha 边缘表达，PNG 调色板量化在 alpha 上
  实测峰值偏差 58/255，描边会发毛。

## 角色状态

两个角色共用一套词表 `info / success / running / error`，各自一张 2×2 精灵表。
分工是视角而非语义：**轴伊**是本轮当事人的反应，**轴芯**是旁边报信的那个。

原先轴伊是四段过程态（idle/thinking/working/done），里面没有失败——一轮跑砸了
只能给 `done`，而那格是眨眼微笑，等于让她冲着报错笑。重出后 thinking 与 working
合并成 `running`，空出来的格给 `error`。代价是失去「在想」与「在跑工具」的区分。

两张脸**同刻结算**：运行期都停在 `running`，出错也不提前切——结论是这一轮的结论，
轮没跑完就没有结论可报。之前让轴芯一探到错误就切哭脸，它会比轴伊早换一步。
结算表情停留 5.2 秒：一轮跑完时视线通常还在正文或工具输出上，短了会在人抬眼之前散掉。

判据全部取 DOM 的结构性标记，且**失败按基线计数**：失败的命令会永久留在记录里，
问「文档里有没有 error」的话，第一次失败之后每轮都会被判成失败（实测踩过）。
开跑时记下已有错误数，只认增量。

精灵表几何由 `scripts/align-sprite.mjs` 纯平移归一（不缩放、不重采样，
所以零画质损失、白描边不糊）：生成模型给不出像素级一致的构图，而按 112px 渲染，
1% 的偏差就是 1.1px——切表情时角色会上下跳、左右挪。

## 已知限制

1. **衣装偏好存在 localStorage，不进 `$DSH_HOME/settings.yaml`。**
   宿主 apiproxy 有一份硬编码命名空间白名单（`WEB_SETTINGS_NAMESPACES` /
   `PRODUCT_SETTINGS_NAMESPACES`），`settings.describe` 只把名单内的段发给浏览器，
   源码注释写明「未来的注册不会默认变成远端可读写」。宿主侧 `settings.register`
   成功，浏览器侧拿到的仍是 `unavailable`。本插件两条通道都试，官方通道可用时优先
   （名单若放开会自动用上），否则落 localStorage。后果：偏好绑在浏览器 origin 上，
   换浏览器或换机器不跟随。当前实况可在 `#joi-theme-css[data-joi-metrics]`
   的 `persistence` 字段看到。
2. **首帧闪烁。** host 的引导脚本只认明暗三值，衣装到不了那一步，
   所以刷新后会先出现一帧未着衣装的界面。不 hack index 注入。
3. **带 hash 的类名耦合。** `r91kyq_brand`、`KZiXvq_headline`、`PcWdmW_card` 等
   随 app 构建变化。全部集中在 `src/client/css.ts` 的 `SELECTORS`，失配时装饰不出现。
4. **底纹靠运行期认领表面。** 正式解法应是 app 侧出一个 `--dsh-bg-texture`
   由 AppFrame / ConversationRoot 消费；那是 upstream 议题，不在本轮范围。
5. **WebP。** 现代浏览器通吃，但确实不是 PNG。
6. **构建期版本差。** 类型按 npm `0.1.0-rc.6` 装，本机运行的 harness 是
   `0.1.0-rc.5`（该版本未发布到 npm）。已在 rc.5 上实机验证通过。

## 状态怎么来的

两条状态机都从 **DOM 的结构性标记** 推导，不订阅 client 侧投影——那条路要求
本插件与 ui-conversation 的投影键名耦合，而那些键名不在任何公开契约里。
判据一律取结构而非本地化文案：

| 判据 | 取自 |
|---|---|
| 这一轮在跑吗 | 输入区主按钮渲染的是停止方块 `<rect width="10" rx="3">` 还是发送箭头 `<path>` |
| 工具在执行吗 | `[class*=callRow] [data-state="running"]`（命令卡未结算即 running） |
| 出错了吗 | `[data-state="error"]` / `[role=alert]` |

按 `aria-label` 的「停止」两个字判断会把主题绑死在中文上，所以不用它。

真实会话实测的完整序列（含一次 `bash sleep 10`）：

```
idle/info → thinking/running → working/running → thinking/running → done/info → idle/info
```

第一版曾用 `[data-state="ongoing"]` 当运行信号，一轮纯文本对话就打脸了——
那颗点只在子代理活动位上出现；命令卡用的是自己的 `running/ok/error` 词表。
两套都要认。

## 验证

```bash
npm run verify
```

静态半断言基线→生成产物→覆盖层这条链，并检查三条法条
（鲸蓝恒定、金色配额、两套底纹是不同图案）。

实况半需要四个象限各抓一份量测：

```js
copy(document.getElementById('joi-theme-css').getAttribute('data-joi-metrics'))
```

存进 `capture/*.json` 后：

```bash
node scripts/verify-4q.mjs capture/*.json
```

`capture/` 里是 rc.5 实机证据：四象限 hero 读数、对话页落座读数、
真实会话的状态机序列，以及三处反馈面/鲸群/引导的合成宿主结构验证。245/245 通过。

反馈位、子代理鲸群、引导角色位这三处需要特定触发条件（分别是一次 toast、
一组子代理、一个新用户），实机不易复现，故以**合成宿主结构**验证——
结构按 app 源码的真实类名形状搭出来，验的是本插件的渲染与状态映射，
不是端到端。这条边界如实标在证据文件里。
