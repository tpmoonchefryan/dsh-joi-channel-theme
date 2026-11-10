import assert from 'node:assert/strict'
import test from 'node:test'
import { tokensFor } from '../src/client/tokens.ts'
import { SELECTORS } from '../src/client/css.ts'

let client
const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
globalThis.window = {
  __ModuleLoader__: {
    load({ id, factory }) {
      assert.equal(id, 'dsh-joi-channel-theme')
      client = factory((specifier) => {
        if (specifier === 'react') return { useState: initial => [initial, () => {}] }
        if (specifier === 'react/jsx-runtime') {
          const element = (type, props) => ({ type, props })
          return { jsx: element, jsxs: element, Fragment: Symbol('Fragment') }
        }
        if (specifier === '@deepseek-ai/dsh-client-ui-primitives') {
          const icon = () => null
          return {
            IconDarkOutlineMedium: icon,
            IconFollowsystemOutlineMedium: icon,
            IconLightOutlineMedium: icon,
            Switch: () => null,
          }
        }
        throw new Error(`unexpected client dependency: ${specifier}`)
      })
    },
  },
}
await import('../lib/client.js')
if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow)
else Reflect.deleteProperty(globalThis, 'window')

class ElementStub {
  attributes = new Map()
  children = []
  listeners = new Map()
  style = { cssText: '', display: '', removeProperty() {} }
  sheet = null
  classList = { add() {}, remove() {}, contains() { return false } }

  constructor(tag) {
    this.tagName = tag
    if (tag === 'style') this.sheet = { disabled: false }
  }

  append(...children) {
    for (const child of children) child.parentNode = this
    this.children.push(...children)
  }
  remove() {
    if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(child => child !== this)
  }
  querySelector() { return null }
  querySelectorAll() { return [] }
  getBoundingClientRect() {
    const left = parseFloat(this.style.left ?? '0')
    const top = parseFloat(this.style.top ?? '0')
    const width = parseFloat(this.style.width ?? '112')
    const height = parseFloat(this.style.height ?? '112')
    return { left, top, width, height, right: left + width, bottom: top + height }
  }
  addEventListener(type, listener) { this.listeners.set(type, listener) }
  removeEventListener(type) { this.listeners.delete(type) }
  setAttribute(name, value) { this.attributes.set(name, String(value)) }
  getAttribute(name) { return this.attributes.get(name) ?? null }
  removeAttribute(name) { this.attributes.delete(name) }
  hasAttribute(name) { return this.attributes.has(name) }
}

class DocumentStub {
  body = new ElementStub('body')
  head = new ElementStub('head')
  hidden = false
  chat = false
  card = new ElementStub('div')
  stack = new ElementStub('div')

  constructor() {
    this.card.getBoundingClientRect = () => ({ left: 240, right: 1040, top: 650, bottom: 750, width: 800, height: 100 })
    this.stack.className = 'test_composerStack'
    this.stack.getBoundingClientRect = () => ({ left: 0, right: 1280, top: 0, bottom: 800, width: 1280, height: 800 })
    this.stack.querySelector = selector => selector === SELECTORS.composerCard ? this.card : null
  }

  createElement(tag) { return new ElementStub(tag) }
  getElementById(id) { return [...this.body.children, ...this.head.children].find(el => el.id === id) ?? null }
  querySelector(selector) {
    if (!this.chat) return null
    if (selector === SELECTORS.composerCard) return this.card
    if (selector === SELECTORS.composerStack) return this.stack
    return null
  }
  querySelectorAll() { return [] }
}

class ConfigFormStub {
  listeners = new Set()
  pendingWrites = []
  writes = []

  constructor(snapshot) { this.snapshot = snapshot }
  getSnapshot = () => this.snapshot
  subscribe = listener => { this.listeners.add(listener); return () => this.listeners.delete(listener) }

  publish(snapshot) {
    this.snapshot = snapshot
    for (const listener of [...this.listeners]) listener()
  }

  set = (field, value) => {
    this.writes.push([field, value])
    return new Promise((resolve) => {
      this.pendingWrites.push(() => {
        const current = this.snapshot.value ?? {}
        const user = this.snapshot.user ?? {}
        this.publish({
          ...this.snapshot,
          value: { ...current, [field]: value },
          user: { ...user, [field]: value },
          revision: (this.snapshot.revision ?? 0) + 1,
        })
        resolve(true)
      })
    })
  }

  acceptNextWrite() { this.pendingWrites.shift()?.() }
}

function readySnapshot({ suit = 'flowers', user = {}, writable = true, revision = 1, minimalMode = false, antiOcclusion = false } = {}) {
  return {
    status: 'ready', value: { suit, minimalMode, antiOcclusion }, user, base: { suit: 'flowers' },
    revision, writable, mode: 'host',
  }
}

function installBrowserGlobals(storage) {
  const descriptors = new Map()
  for (const key of ['window', 'document', 'MutationObserver', 'requestAnimationFrame', 'cancelAnimationFrame', 'localStorage', 'getComputedStyle']) {
    descriptors.set(key, Object.getOwnPropertyDescriptor(globalThis, key))
  }
  globalThis.window = { addEventListener() {}, removeEventListener() {}, innerWidth: 1280, innerHeight: 800, scrollX: 0, scrollY: 0 }
  globalThis.document = new DocumentStub()
  globalThis.MutationObserver = class { observe() {} disconnect() {} }
  const frames = new Map()
  let frameId = 0
  globalThis.requestAnimationFrame = run => { frames.set(++frameId, run); return frameId }
  globalThis.cancelAnimationFrame = id => { frames.delete(id) }
  globalThis.getComputedStyle = () => ({ backgroundColor: 'rgb(255, 250, 242)' })
  if (storage === undefined) Reflect.deleteProperty(globalThis, 'localStorage')
  else globalThis.localStorage = storage
  const restore = () => {
    for (const [key, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor)
      else Reflect.deleteProperty(globalThis, key)
    }
  }
  restore.flushFrames = () => {
    const current = [...frames.values()]
    frames.clear()
    for (const run of current) run()
  }
  return restore
}

function memoryStorage(value) {
  const values = new Map(value === undefined ? [] : [['dsh-joi-channel-theme.suit', value]])
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, item) => values.set(key, String(item)),
  }
}

function createEntry(scope) {
  const effects = []
  const rows = []
  const rowState = { suit: undefined, preference: undefined }
  const theme = {
    layers: new Map(),
    overrideTokens(source, tokens) {
      this.layers.set(source, tokens)
      return () => { this.layers.delete(source) }
    },
    getTheme: () => ({ preference: 'system' }),
    setTheme() {},
  }
  client.apply({
    theme,
    slots: {
      inject(_slot, install) { install() },
      register(registration, component) {
        rows.push({ registration, component })
        return () => {}
      },
    },
    configForms: { get: () => scope },
    effect(install) {
      const dispose = install()
      if (typeof dispose === 'function') effects.push(dispose)
    },
    on() {},
  })
  function bindSettingsRow() {
    const row = rows.find(({ registration }) => registration.id === 'appearance')?.registration
    assert.ok(row, 'the client entry registers the Settings appearance row')
    return row.inject({ sync(suit, preference, flags) { Object.assign(rowState, { suit, preference }, flags) } })
  }

  return {
    theme,
    rowState,
    bindSettingsRow,
    renderSettingsRow() {
      const row = rows.find(({ registration }) => registration.id === 'appearance')
      return row.component({ ...bindSettingsRow(), useStore: selector => selector(rowState) })
    },
    chooseSuit(skin) {
      bindSettingsRow().setSuit(skin)
    },
    dispose() { for (const effect of effects.reverse()) effect() },
  }
}

const loadingSnapshot = {
  status: 'loading', value: undefined, user: undefined, base: undefined,
  revision: undefined, writable: false, mode: 'host',
}

function switches(tree) {
  if (!tree || typeof tree !== 'object') return []
  const own = typeof tree.props?.checked === 'boolean' ? [tree.props] : []
  const children = tree.props?.children
  return own.concat((Array.isArray(children) ? children : [children]).flatMap(switches))
}

for (const field of ['minimalMode', 'antiOcclusion']) {
  test(`client entry applies already-ready ${field} before the first decoration frame`, () => {
    const restoreGlobals = installBrowserGlobals(memoryStorage())
    document.chat = true
    const scope = new ConfigFormStub(readySnapshot({ [field]: true, user: { suit: 'flowers', [field]: true } }))
    const app = createEntry(scope)
    try {
      app.bindSettingsRow()
      restoreGlobals.flushFrames()
      assert.equal(app.rowState[field], true)
      const joi = document.getElementById('joi-theme-joi')
      const zhouxin = document.getElementById('joi-theme-zhouxin')
      if (field === 'minimalMode') {
        assert.equal(joi.style.display, 'none')
        assert.equal(zhouxin.style.display, 'none')
      } else {
        assert.equal(joi.style.left, '1056px')
        assert.equal(zhouxin.style.left, '112px')
      }
      assert.deepEqual(scope.writes, [])
    } finally {
      app.dispose()
      restoreGlobals()
    }
  })
}

test('Settings renders implemented switches and restores anti-occlusion after minimal mode', async () => {
  const restoreGlobals = installBrowserGlobals(memoryStorage())
  const scope = new ConfigFormStub(readySnapshot())
  const app = createEntry(scope)
  try {
    const actions = app.bindSettingsRow()
    assert.deepEqual(switches(app.renderSettingsRow()).map(props => props.label), ['简约模式', 'Q版形象防遮挡'])
    actions.setAntiOcclusion(true)
    scope.acceptNextWrite()
    await new Promise(resolve => setImmediate(resolve))
    actions.setMinimalMode(true)
    scope.acceptNextWrite()
    await new Promise(resolve => setImmediate(resolve))
    assert.deepEqual(switches(app.renderSettingsRow()).map(props => props.label), ['简约模式'])
    assert.equal(app.rowState.antiOcclusion, true)
    actions.setMinimalMode(false)
    scope.acceptNextWrite()
    await new Promise(resolve => setImmediate(resolve))
    const antiOcclusion = switches(app.renderSettingsRow()).find(props => props.label === 'Q版形象防遮挡')
    assert.equal(antiOcclusion.checked, true)
  } finally {
    app.dispose()
    restoreGlobals()
  }
})

for (const legacy of ['library', 'native']) {
  test(`client entry keeps legacy ${legacy} when ConfigForm becomes ready with default flowers`, async () => {
    const restoreGlobals = installBrowserGlobals(memoryStorage(legacy))
    const scope = new ConfigFormStub(loadingSnapshot)
    const app = createEntry(scope)
    try {
      scope.publish(readySnapshot())

      const layer = app.theme.layers.get('dsh-joi-channel-theme')
      assert.equal(app.theme.layers.has('dsh-joi-channel-theme'), legacy !== 'native')
      if (legacy !== 'native') assert.equal(
        layer?.['--dsw-alias-bg-base']?.light,
        tokensFor(legacy)['--dsw-alias-bg-base'].light,
      )
      assert.deepEqual(scope.writes, [['suit', legacy]])

      scope.acceptNextWrite()
      await new Promise(resolve => setImmediate(resolve))
      assert.equal(scope.snapshot.user.suit, legacy)
      assert.deepEqual(scope.writes, [['suit', legacy]])

      const laterHostChoice = legacy === 'native' ? 'library' : 'native'
      scope.publish(readySnapshot({ suit: laterHostChoice, user: { suit: laterHostChoice }, revision: 3 }))
      const updatedLayer = app.theme.layers.get('dsh-joi-channel-theme')
      assert.equal(app.theme.layers.has('dsh-joi-channel-theme'), laterHostChoice !== 'native')
      if (laterHostChoice !== 'native') assert.equal(
        updatedLayer?.['--dsw-alias-bg-base']?.light,
        tokensFor(laterHostChoice)['--dsw-alias-bg-base'].light,
      )
      assert.deepEqual(scope.writes, [['suit', legacy]])
    } finally {
      app.dispose()
      restoreGlobals()
    }
  })
}

test('client entry keeps a legacy preference when the ready Host form is read-only', () => {
  const restoreGlobals = installBrowserGlobals(memoryStorage('library'))
  const scope = new ConfigFormStub(loadingSnapshot)
  const app = createEntry(scope)
  try {
    scope.publish(readySnapshot({ writable: false }))

    assert.equal(
      app.theme.layers.get('dsh-joi-channel-theme')?.['--dsw-alias-bg-base']?.light,
      tokensFor('library')['--dsw-alias-bg-base'].light,
    )
    assert.deepEqual(scope.writes, [])
  } finally {
    app.dispose()
    restoreGlobals()
  }
})

test('client entry accepts a later explicit Host choice after a local choice is acknowledged', async () => {
  const restoreGlobals = installBrowserGlobals(memoryStorage())
  const scope = new ConfigFormStub(readySnapshot())
  const app = createEntry(scope)
  let restarted
  try {
    app.chooseSuit('library')
    assert.deepEqual(scope.writes, [['suit', 'library']])

    scope.acceptNextWrite()
    await new Promise(resolve => setImmediate(resolve))
    assert.equal(scope.snapshot.user.suit, 'library')
    assert.equal(app.rowState.suit, 'library')

    const acknowledgedWrites = scope.writes.length
    scope.publish(readySnapshot({ suit: 'native', user: { suit: 'native' }, revision: 3 }))

    assert.equal(app.theme.layers.has('dsh-joi-channel-theme'), false)
    assert.equal(app.rowState.suit, 'native')
    assert.equal(scope.snapshot.user.suit, 'native')
    assert.equal(scope.writes.length, acknowledgedWrites)

    app.dispose()
    restarted = createEntry(new ConfigFormStub(readySnapshot({ suit: 'native', user: { suit: 'native' } })))
    assert.equal(restarted.theme.layers.has('dsh-joi-channel-theme'), false)
    restarted.bindSettingsRow()
    assert.equal(restarted.rowState.suit, 'native')
  } finally {
    app.dispose()
    restarted?.dispose()
    restoreGlobals()
  }
})

for (const [choice, lateHostChoice] of [['flowers', 'library'], ['library', 'flowers'], ['native', 'flowers']]) {
  test(`client Settings choice ${choice} survives a late explicit Host snapshot and restart`, async () => {
    const restoreGlobals = installBrowserGlobals(memoryStorage())
    const scope = new ConfigFormStub(loadingSnapshot)
    const app = createEntry(scope)
    let restarted
    try {
      app.chooseSuit(choice)
      scope.publish(readySnapshot({ suit: lateHostChoice, user: { suit: lateHostChoice } }))

      assert.equal(app.theme.layers.has('dsh-joi-channel-theme'), choice !== 'native')
      if (choice !== 'native') assert.equal(
        app.theme.layers.get('dsh-joi-channel-theme')?.['--dsw-alias-bg-base']?.light,
        tokensFor(choice)['--dsw-alias-bg-base'].light,
      )
      assert.deepEqual(scope.writes, [[ 'suit', choice ]])

      scope.acceptNextWrite()
      await new Promise(resolve => setImmediate(resolve))
      assert.equal(scope.snapshot.user.suit, choice)
      assert.deepEqual(scope.writes, [[ 'suit', choice ]])

      app.dispose()
      restarted = createEntry(new ConfigFormStub(readySnapshot({ suit: choice, user: { suit: choice } })))
      assert.equal(restarted.theme.layers.has('dsh-joi-channel-theme'), choice !== 'native')
      if (choice !== 'native') assert.equal(
        restarted.theme.layers.get('dsh-joi-channel-theme')?.['--dsw-alias-bg-base']?.light,
        tokensFor(choice)['--dsw-alias-bg-base'].light,
      )
    } finally {
      app.dispose()
      restarted?.dispose()
      restoreGlobals()
    }
  })
}
