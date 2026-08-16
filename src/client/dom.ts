/**
 * DOM 小工具：受生命周期管理的节点与样式表。
 *
 * 每个创建函数都返回 disposer，插件 fiber 卸载时逐个回收。设计阶段的教训是
 * 「清理名单漏一个」：重复注入后 getElementById 拿到的是最旧那个孤儿，
 * 读到的全是过期值，表现为「切换没反应」。所以这里不留裸的 createElement，
 * 所有节点都从 owned() 出生，由同一份名单收走。
 */

/** 一组同生共死的 DOM 节点。 */
export class OwnedNodes {
  private readonly nodes: Element[] = []

  /**
   * 造一个受管节点。同 id 的历史残留会先被清掉（HMR / 重复注入下的自愈）。
   * @param tag - 标签名。
   * @param id - 元素 id。
   * @param parent - 挂载点，默认 body。
   * @returns 新建的元素。
   */
  own<K extends keyof HTMLElementTagNameMap>(
    tag: K, id: string, parent: ParentNode = document.body,
  ): HTMLElementTagNameMap[K] {
    let stale: HTMLElement | null
    while ((stale = document.getElementById(id)) !== null) stale.remove()
    const el = document.createElement(tag)
    el.id = id
    parent.append(el)
    this.nodes.push(el)
    return el
  }

  /**
   * 装一张样式表。
   * @param id - 元素 id。
   * @param css - CSS 文本。
   * @returns 该 style 元素。
   */
  style(id: string, css: string): HTMLStyleElement {
    const el = this.own('style', id, document.head)
    el.textContent = css
    return el
  }

  /** 移除全部受管节点。幂等。 */
  dispose(): void {
    for (const node of this.nodes) node.remove()
    this.nodes.length = 0
  }
}

/**
 * 把一串回调合成一个 disposer。
 * @param parts - 待合并的清理函数。
 * @returns 逐个调用（吞掉异常，一个失败不该挡住其余）的 disposer。
 */
export function disposeAll(...parts: ReadonlyArray<(() => void) | undefined>): () => void {
  return () => {
    for (const part of parts) {
      try { part?.() } catch { /* 清理阶段的异常没有接手的人，吞掉即可 */ }
    }
  }
}

/**
 * 把高频触发合并到下一帧。resize / MutationObserver 一秒能来上百次，
 * 每次都重算布局会让滚动明显发涩。
 * @param run - 真正要做的事。
 * @returns 触发器与它的 disposer。
 */
export function framed(run: () => void): { schedule: () => void, dispose: () => void } {
  let cancel: (() => void) | undefined
  let reported = false

  const tick = (): void => {
    cancel = undefined
    // 装饰层出错绝不能连累 app：吞掉并继续，界面顶多少一个挂件。
    // 但只吞不说会把「装饰没出现」变成无从下手的哑故障——所以第一次
    // 出错要喊一声。之后闭嘴：这个回调每帧都可能跑，刷屏没有意义。
    try {
      run()
    } catch (reason) {
      if (!reported) {
        reported = true
        console.error('[joi-theme] 装饰层重算失败，已降级（后续同类错误不再重复报告）：', reason)
      }
    }
  }

  const schedule = (): void => {
    if (cancel !== undefined) return
    if (document.hidden) {
      // 隐藏的标签页里 requestAnimationFrame 根本不触发。app 在后台标签页
      // 打开时整个装饰层会一直不出现，直到用户切过去——所以隐藏时退到定时器。
      const id = setTimeout(tick, 16)
      cancel = () => { clearTimeout(id) }
    } else {
      const id = requestAnimationFrame(tick)
      cancel = () => { cancelAnimationFrame(id) }
    }
  }

  return {
    schedule,
    dispose: () => {
      cancel?.()
      cancel = undefined
    },
  }
}

/**
 * 两个矩形是否相交。
 * @param a - 矩形 a。
 * @param b - 矩形 b。
 * @returns 是否有重叠区域。
 */
export function intersects(a: DOMRect, b: DOMRect): boolean {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom)
}
