/**
 * 全局样式表。
 *
 * 这里一行衣装色都不写死——衣装差异全部走 token 层（见 tokens.ts），
 * 样式表只引用 var(...)。所以它是**静态**的：装载一次，换装时不重建，
 * 也就不存在「样式表还停在上一套衣装」这种状态。
 *
 * 内容分三类：
 *   ① 五处结构冲突的修法（implementation-baseline structuralConflicts）——
 *      全是在真实 UI 上撞出来的，不是推演。
 *   ② 零散令牌项（detail-design 07）——焦点环、药丸 tab、🍊 列表。
 *   ③ 本插件自己那些浮层的定位骨架。
 *
 * 失配时的姿态是「装饰不出现」，不是「原生 UI 坏掉」。
 */

/**
 * app 侧选择器。
 *
 * 一条铁律：**不许出现 CSS Modules 的 hash 前缀**。命名是 [hash]_[local]，
 * 而 hash 随 app 的每次构建整批重排——宿主升到 0.1.0-rc.6 那次
 * r91kyq→hHd-Xa、KZiXvq→pXSMma、PcWdmW→uV2eYG 同时变脸，四条选择器一起失配，
 * 字标、立绘、鲸鱼娘当场全灭，而且是无声的。
 *
 * 只锚在两种东西上：app 自己给的语义钩子（data-* 与 role/aria），
 * 以及未哈希的 local 名。local 名撞车时用 :has() 按结构消歧，不许退回 hash。
 * verify-4q 的选择器体检会拦下 hash 前缀。
 */
export const SELECTORS = {
  /** 品牌区（左上角字标）。app 里 `_brand` 只此一家。 */
  brand: '[class*=_brand]',
  /** 品牌区所在行，默认 overflow:hidden。 */
  logoRow: '[class*=logoRow]',
  /** 侧栏列。 */
  sidebarCol: '[class*=sidebarCol]',
  /** 侧栏已收起。app 自带的未哈希钩子；收起时品牌区整个不渲染。 */
  sidebarCollapsed: '[data-sidebar-collapsed=true]',
  /** 输入区外层容器（满宽），新会话页会多一个 composerHero 修饰类。 */
  composerStack: '[class*=composerStack]',
  /** 输入区里那张可见卡片（780px，水平居中）。app 自带的未哈希钩子。 */
  composerCard: '[data-composer-card]',
  /** 会话线程的滚动体。 */
  thread: '[data-conversation-scroll]',
  /**
   * 新会话页的大标题行。
   *
   * `headline` 这个 local 名 ContextMeter 与 ApprovalPanel 也各有一个，裸匹配当场命中 2 个；
   * `fishHitbox` 则是 HeroShell 独有，用它把正主认出来。
   */
  headline: '[class*=headline]:has(> [class*=fishHitbox])',
  /** HeroShell 的竖排容器（标题 + 输入区），要整体压在角色之上。同样靠 fishHitbox 消歧。 */
  heroStack: '[class*=_stack]:has(> [class*=headline] > [class*=fishHitbox])',
  /** 原生小鲸鱼的悬浮热区。 */
  fishHitbox: '[class*=fishHitbox]',
  /** 会话列表行。 */
  sessionRow: '[class*=sessionRow]',
  /**
   * 会话页的 tab（对话/轨迹）。
   *
   * 用 ARIA 结构而不是类名子串：CSS Modules 的命名是 [hash]_[local]，
   * 所以 `[class*=_tab]` 会一并命中 _tabs（容器）、_tablePane、_table、
   * _tableScroll —— 轨迹页那次「行标签被裁掉」就是 <table> 被强加了
   * border-radius:999px 与 padding。role/aria-selected 是 a11y 契约，
   * 比任何哈希类名都稳，且 header> 这一层把设置页与轨迹详情的 tab 排除在外。
   */
  tab: 'header > [role=tablist] > [role=tab]',
  /** 激活中的会话 tab。 */
  tabActive: 'header > [role=tablist] > [role=tab][aria-selected=true]',
  /** 轨迹页的滚动面（app 自带的未哈希钩子）。 */
  trajectory: '[data-trajectory-scroll]',
  /** DisclosureRow 给 Think 行/工具行/命令卡统一打的未哈希钩子。 */
  disclosureRow: '[data-disclosure-row]',
  /** 输入区主按钮（发送/停止）。`_primary` 有四个模块在用，靠输入卡片把作用域收住。 */
  composerSend: '[data-composer-card] button[class*=_primary]',
} as const

/** 本插件所有 DOM 节点的 id 前缀。 */
export const ID = 'joi-theme'

/** 贴了底纹的表面所带的类名。 */
export const TEX_CLASS = 'joi-tex'

/** 与角色浮层重叠、需要加描边保可读性的文字块所带的类名。 */
export const HALO_CLASS = 'joi-halo'

/**
 * 整张静态样式表。
 * @returns CSS 文本。
 */
export function stylesheet(): string {
  return [
    structuralFixes(),
    textureRules(),
    accentRules(),
    overlayRules(),
  ].join('\n')
}

/**
 * 五处结构冲突的修法。逐条对应 implementation-baseline 的 structuralConflicts。
 * @returns CSS 文本。
 */
function structuralFixes(): string {
  return `
/* ①  composer 必须压在角色之上。app 自己给 composerStack 设了 z-index:1，
      不加 !important 会被它压过去，角色就从「从卡片后面探出来」变成「贴在
      卡片前面」——遮挡关系反了，深度线索也就没了。 */
${SELECTORS.composerStack},
[class*=heroWorkspaceRow],
${SELECTORS.heroStack} { position: relative !important; z-index: 5 !important; }

/* ②  logoRow 默认 overflow:hidden，会把移到第二行的 HARNESS 徽章整个裁掉。
      放开溢出并让出上方空间。 */
${SELECTORS.logoRow} {
  overflow: visible !important;
  min-height: 74px !important;
  align-items: flex-end !important;
  padding-top: 18px !important;
}
${SELECTORS.sidebarCol} { overflow: visible !important; }

/* ③  app 对品牌区用了 background 简写，会把外部设的 background-image 整条
      抹掉——只剩 padding 生效，位置留出来了却没有图。整族都要 !important。 */
${SELECTORS.brand} {
  background-image: var(--joi-brand-logo) !important;
  background-position: left center !important;
  background-repeat: no-repeat !important;
  background-size: auto 46px !important;
  padding-left: 98px !important;
  min-height: 54px !important;
  overflow: visible !important;
  filter: var(--joi-logo-rim);
}
${SELECTORS.brand} svg { overflow: visible !important; transform: translateX(-27px); }

/* ④  底纹没有可贴的表面 —— 见下面 textureRules 与 paintTexture。 */

/* ⑤  body[data-ds-dark-theme] 归 ui-layout presenter 所有，本插件永不写它。
      明暗全程由 app 的外观设置驱动，这里只是把这条约定记在代码里。 */

/* ⑥  滚动物理一律不碰，保持 app 原生。
      橡皮筋回弹靠 overlayRules 的分层安置来支持（内容锚定的浮层住文档滚动层，
      合成器平移时带着走），不靠禁令。这里曾给会话滚动面设过
      overscroll-behavior:none，结果把回弹整个弄没了：滚动容器设了 none，
      哪怕毫无可滚内容，落在它上面的手势也终结在它这里、不再传给文档——
      而它盖着侧栏以右的全部区域，文档层因此永远收不到手势。 */
`
}

/**
 * 底纹。
 *
 * 纹理不能贴在 body 上：AppFrame 与 ConversationRoot 都把 --dsw-alias-bg-base
 * 画成不透明底色压在上面，body 的图案永远看不见。运行期找出那些真正画底色的
 * 大容器，给它们打上 TEX_CLASS（见 surfaces.ts 的 paintTexture）。
 * @returns CSS 文本。
 */
function textureRules(): string {
  return `
.${TEX_CLASS} {
  background-image: var(--joi-texture-image);
  background-size: var(--joi-texture-size);
}

/* 轨迹页把 --dsw-alias-bg-layer-1 画成不透明底盖在上面，paintTexture 只认
   「背景色 == body 底色」的容器，够不着它。那张 split 实为页面主表面而非浮层，
   「纹理不透进面板」的规则在这里判错了对象——用 app 自带的属性钩子直接接管。 */
${SELECTORS.trajectory} {
  background-color: var(--dsw-alias-bg-base) !important;
  background-image: var(--joi-texture-image) !important;
  background-size: var(--joi-texture-size) !important;
}
/* 滚动面里那张表自绘 layer-1 白底，会把刚贴上的纹理整片盖回去。
   让它透明，纹理才透得出来；行的斑马纹在 tr/td 上，不受影响。 */
${SELECTORS.trajectory} > table { background: transparent !important; }
`
}

/**
 * 零散令牌项：焦点环、侧栏竖条、药丸 tab、🍊 列表、危险色。
 * @returns CSS 文本。
 */
function accentRules(): string {
  const gold = 'var(--dsw-alias-state-warn-primary)'
  return `
/* 侧栏左侧竖条：构图逻辑那节从 VirtuaReal 官方页映射过来的第一条。 */
${SELECTORS.sidebarCol} { box-shadow: inset 3px 0 0 var(--dsw-alias-brand-primary); }

/* 会话选中态改成金色焦点环（原为左侧 inset 标记，Owner 现场裁定）。
   键盘焦点在同一处再叠一圈半透明外环：两者可以共存且能区分——
   选中是持续状态，键盘焦点是瞬时位置。 */
${SELECTORS.sessionRow}[class*=selected] { box-shadow: 0 0 0 2px ${gold} !important; }
${SELECTORS.sessionRow}:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px ${gold},
              0 0 0 4px color-mix(in srgb, ${gold} 40%, transparent) !important;
}

/* 其余控件的焦点环统一走瞳金。 */
:where(button, a, input, textarea, select, [tabindex]):focus-visible {
  outline: 2px solid ${gold};
  outline-offset: 2px;
}

/* 会话/轨迹 tab 药丸化：激活态用墨底反白字，与侧栏那套圆角语言对齐。
   非激活态只是圆角热区，不给底色——两个都上底色就分不出主次。 */
/* 药丸只向外溢墨，占位一格不动：横向 padding 加多少、margin 就负多少。
   负外边距把 margin 边往里收，border 盒因此向外溢出，而 flex 的 gap 量的是
   margin 盒——每个标签的 x 与原来逐像素相同。纵向 -Y 抵消 padding-top，
   margin-bottom 用 11px 减回来，让「标签底 → tab 条底」仍是 app 那 11px。
   app 原值：.tab{padding:0 0 11px; line-height:16px}、.tabs{gap:36px; padding-left:8px}。
   不这么补的话标签会整体右移 12px，与上方标题和下方工具栏都对不齐。 */
${SELECTORS.tab} {
  --joi-tab-ink-x: 12px;
  --joi-tab-ink-y: 4px;
  border-radius: 999px !important;
  padding: var(--joi-tab-ink-y) var(--joi-tab-ink-x) !important;
  margin:
    calc(-1 * var(--joi-tab-ink-y))
    calc(-1 * var(--joi-tab-ink-x))
    calc(11px - var(--joi-tab-ink-y)) !important;
}
${SELECTORS.tabActive} {
  background: var(--dsw-alias-label-primary) !important;
  color: var(--dsw-alias-bg-base) !important;
}
/* app 自己那条 2px 激活下划线（ConversationRoot.module.css .tabActive::after）
   读的正是 --dsw-alias-state-business-primary —— 也就是本插件设的鲸蓝，
   于是主题反而把它染得更显眼。药丸已经表达了选中，再压一条横杠是两套语言打架。
   只熄色不动伪元素盒子：display:none 会连同未来可能加的指示器一起抹掉，
   而且会引起布局位移。 */
${SELECTORS.tabActive}::after { background: transparent !important; }

/* ── 轨迹工具栏 ───────────────────────────────────────────────
   三条都锁在 [role=toolbar] 内。该 role 全仓唯一（TrajectoryToolbar），
   比任何哈希类名稳。 */

/* 竖直居中。工具栏 .root 是 border-box 32px 且带 1px 下边框，内容盒只有 31px，
   里面那层在 31px 里居中，于是上下恒差 1px、看着偏高。把这 1px 补回 padding 盒，
   22px 搜索框与 20px 按钮就同时落在整像素上，工具栏总高不变。 */
[role=toolbar] > div { padding-top: 1px; }

/* 搜索框「没样式」的真因：app 在 :focus-within 时把底色换成 bg-layer-1，
   而 layer-1 恰好就是工具栏自己的底色——原生调色板里两者同值，所以看得见；
   本插件把 layer-1/layer-2 映射成了不同的 panel/panel2，填色就消失了。
   不去写 background，而是在这一层上把 layer-1 的取值改回与工具栏底色有别，
   app 自己的规则随即恢复原意，hover 态也一并正确。 */
[role=toolbar] div:has(> input[type=search]) {
  --dsw-alias-bg-layer-1: var(--dsw-alias-bg-layer-2);
  /* 同一手法顺带统一焦点色：app 的聚焦边框读 state-business-primary（鲸蓝），
     配上瞳金外环会让一个控件出现两种焦点色。焦点归瞳金是语义槽表定的，
     鲸蓝代表引擎、不该跑到焦点上来。只在这一层改取值，别处的鲸蓝不受影响。 */
  --dsw-alias-state-business-primary: var(--dsw-alias-state-warn-primary);
}

/* 焦点环错位的真因：可见边框画在外层 div 上，里面的 input 是 border:0/padding:0，
   环打在 input 上左缘会缩进约 20px（边框+内距+图标+间隙）。把环移到承载边框的那层。
   两条都带 :has()：引擎不支持时「抑制」与「补环」一起失效、回到现状，
   而不是留下一个没有焦点提示的输入框。 */
[role=toolbar] div:has(> input[type=search]) input:focus-visible { outline: none; }
[role=toolbar] div:has(> input[type=search]:focus-visible) {
  outline: 2px solid ${gold};
  outline-offset: 1px;
}

/* 用户气泡的文字色随气泡底走。
   限定 div：Tooltip 自己的局部类也叫 .bubble（哈希后仍含该子串），
   不限定就会把气泡的深棕字泼到深底提示上，变成深底配深字。
   提示条是 span[role=tooltip]，据此排除。div 限定同时把特异度提到 (0,1,1)，
   稳胜 harness 的 (0,1,0)，不必 !important 也不依赖样式表插入顺序。 */
div[class*=bubble], div[class*=Bubble] { color: var(--joi-bubble-ink); }

/* 发送键：app 读的是 --dsw-alias-button-info-fill，本插件把它映射为 brandSoft，
   于是浅色下成了淡粉底配白字形。不整体改那个 token（全仓 8 处消费，其中 3 处
   当前景色用，改成橘会波及无关面），改为按结构锚定作用域。
   :not(:disabled) 是必须的——否则禁用态会被 !important 强行点亮。 */
${SELECTORS.composerSend}:not(:disabled) {
  background: var(--dsw-alias-button-primary-fill) !important;
  color: var(--joi-send-ink) !important;
}
/* 不补 hover 就会被 app 的 .primary:hover 换回 info-hover。
   与 label-primary 混色：浅色下压深、深色下提亮，一条式子两态都对。 */
${SELECTORS.composerSend}:not(:disabled):hover {
  background: color-mix(in srgb, var(--dsw-alias-button-primary-fill) 85%, var(--dsw-alias-label-primary)) !important;
}

/* Markdown 一级列表的记号换成 🍊；二级退回圆点——
   每一层都放橘子会从点缀变成图案。 */
[class*=markdown] > ul > li::marker,
[class*=Markdown] > ul > li::marker { content: '🍊 '; }
`
}

/**
 * 本插件浮层的定位骨架（立绘、鲸鱼娘、两个 Q 版角色）。
 * @returns CSS 文本。
 */
function overlayRules(): string {
  return `
/* 定位模式是每个浮层的锚定语义，不是实现细节：
   —— 立绘 fixed：钉在视口上，是场所身份，内容怎么动它都不动（Owner 裁定）。
   —— 其余 absolute：锚在内容上，所以要住进文档滚动层。macOS 橡皮筋回弹由
      合成器平移「文档滚动层」，fixed 不在其中、JS 也读不到那次平移——
      住错层的浮层会在回弹时当场脱锚，且脚本层无解。住对了层，回弹、
      文档滚动都由合成器带着走，一行 JS 都不用。 */
#${ID}-portrait {
  position: fixed;
  pointer-events: none;
  z-index: 0 !important;
}
#${ID}-whale, #${ID}-joi, #${ID}-zhouxin {
  position: absolute;
  pointer-events: none;
  z-index: 0 !important;
}
#${ID}-portrait { filter: var(--joi-rim); }
#${ID}-whale { filter: var(--joi-contact-shadow); }

/* 两个 Q 版角色坐在输入卡片上沿。切态时只换 background-position，
   step-end 让它一步到位而不是渐变——表情不该有中间帧。 */
#${ID}-joi, #${ID}-zhouxin {
  background-repeat: no-repeat;
  transition: top .28s cubic-bezier(.34, 1.4, .5, 1), background-position .12s step-end;
}
@media (prefers-reduced-motion: reduce) {
  #${ID}-joi, #${ID}-zhouxin { transition: none; }
}

/* 会话线程整体抬到角色之上。
   逐元素抬升治不了这件事：抬了文字，消息下面那排复制/重跑图标还压在角色底下，
   看不见就等于用不了。给线程容器一个层叠上下文，它里面的一切（文字、按钮、
   工具输出）就都在角色之上；容器自身透明，角色在空白处照样露得出来。
   composer 是 z-index 5，仍在最上层，不受影响。 */
${SELECTORS.thread} { position: relative; z-index: 1; }

/* 与角色重叠的文字加一圈底色描边保可读性。相交检测纯 CSS 做不到，
   由 JS 判定后打这个类（见 chat.ts）。层序由上面那条容器规则给，
   这里只负责描边——两者一个管层、一个管可读。 */
.${HALO_CLASS} {
  /* 只留描边。层序归上面那条线程容器规则，这里再写 position/z-index 有两害：
     一是把 position:fixed 的元素拽进普通流（提示条闪烁的直接成因），
     二是 z-index:7 在列的层叠上下文里会盖过代码块的粘性标题（app 用 6）。 */
  text-shadow:
     1px 0 0 var(--dsw-alias-bg-base), -1px 0 0 var(--dsw-alias-bg-base),
     0 1px 0 var(--dsw-alias-bg-base), 0 -1px 0 var(--dsw-alias-bg-base);
}
`
}
