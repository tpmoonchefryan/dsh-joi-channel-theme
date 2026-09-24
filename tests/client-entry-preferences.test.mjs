import assert from 'node:assert/strict'
import test from 'node:test'
import { tokensFor } from '../src/client/tokens.ts'

let client
const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
globalThis.window = {
  __ModuleLoader__: {
    load({ id, factory }) {
      assert.equal(id, 'dsh-joi-channel-theme')
      client = factory((specifier) => {
        if (specifier === 'react') return { useState: initial => [initial, () => {}] }
        if (specifier === 'react/jsx-runtime') return { jsx() {}, jsxs() {}, Fragment: Symbol('Fragment') }
        if (specifier === '@deepseek-ai/dsh-client-ui-primitives') {
          const icon = () => null
          return {
            IconDarkOutlineMedium: icon,
            IconFollowsystemOutlineMedium: icon,
            IconLightOutlineMedium: icon,
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

  append(...children) { this.children.push(...children) }
  remove() {}
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

  createElement(tag) { return new ElementStub(tag) }
  getElementById() { return null }
  querySelector() { return null }
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

function readySnapshot({ suit = 'flowers', user = {}, writable = true, revision = 1 } = {}) {
  return {
    status: 'ready', value: { suit }, user, base: { suit: 'flowers' },
    revision, writable, mode: 'host',
  }
}

function installBrowserGlobals(storage) {
  const descriptors = new Map()
  for (const key of ['window', 'document', 'MutationObserver', 'requestAnimationFrame', 'cancelAnimationFrame', 'localStorage']) {
    descriptors.set(key, Object.getOwnPropertyDescriptor(globalThis, key))
  }
  globalThis.window = { addEventListener() {}, removeEventListener() {}, innerWidth: 1280, innerHeight: 800 }
  globalThis.document = new DocumentStub()
  globalThis.MutationObserver = class { observe() {} disconnect() {} }
  globalThis.requestAnimationFrame = () => 1
  globalThis.cancelAnimationFrame = () => {}
  if (storage === undefined) Reflect.deleteProperty(globalThis, 'localStorage')
  else globalThis.localStorage = storage
  return () => {
    for (const [key, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor)
      else Reflect.deleteProperty(globalThis, key)
    }
  }
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
    return row.inject({ sync(suit, preference) { Object.assign(rowState, { suit, preference }) } })
  }

  return {
    theme,
    rowState,
    bindSettingsRow,
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
