import assert from 'node:assert/strict'
import test from 'node:test'
import { SuitRuntime } from '../src/client/suit.ts'
import { tokensFor } from '../src/client/tokens.ts'
import { Config } from '../lib/index.js'

const LOCAL_KEY = 'dsh-joi-channel-theme.suit'

class MemoryStorage {
  values = new Map()

  getItem(key) { return this.values.get(key) ?? null }
  setItem(key, value) { this.values.set(key, String(value)) }
  removeItem(key) { this.values.delete(key) }
}

class ConfigFormStub {
  listeners = new Set()
  writes = []

  constructor(snapshot) { this.snapshot = snapshot }
  getSnapshot = () => this.snapshot
  subscribe = listener => { this.listeners.add(listener); return () => this.listeners.delete(listener) }

  publish(snapshot) {
    this.snapshot = snapshot
    for (const listener of this.listeners) listener()
  }

  async set(field, value) {
    this.writes.push([field, value])
    const user = this.snapshot.user && typeof this.snapshot.user === 'object' ? this.snapshot.user : {}
    const current = this.snapshot.value && typeof this.snapshot.value === 'object' ? this.snapshot.value : {}
    this.publish({
      ...this.snapshot,
      value: { ...current, [field]: value },
      user: { ...user, [field]: value },
      revision: (this.snapshot.revision ?? 0) + 1,
    })
    return true
  }
}

function readySnapshot({ value = { suit: 'flowers', minimalMode: false, antiOcclusion: false }, user = {}, base = { suit: 'flowers' }, writable = true } = {}) {
  return { status: 'ready', value, user, base, revision: 0, writable, mode: 'host' }
}

function tokenHost() {
  const layers = new Map()
  return {
    layers,
    overrideTokens(source, tokens) {
      layers.set(source, tokens)
      return () => layers.delete(source)
    },
  }
}

async function withLocalStorage(storage, action) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage })
  try { return await action() } finally {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous)
    else Reflect.deleteProperty(globalThis, 'localStorage')
  }
}

const loadingSnapshot = {
  status: 'loading', value: undefined, user: undefined, base: undefined,
  revision: undefined, writable: false, mode: 'host',
}

for (const legacy of ['library', 'native']) {
  test(`a schema-default flowers value does not mask the legacy ${legacy} preference`, async () => {
    await withLocalStorage(new MemoryStorage(), async () => {
      globalThis.localStorage.setItem(LOCAL_KEY, legacy)
      const scope = new ConfigFormStub(readySnapshot())
      const host = tokenHost()
      const suits = new SuitRuntime(host, scope)

      suits.start()

      assert.equal(suits.skin, legacy)
      assert.equal(host.layers.size, legacy === 'native' ? 0 : 1)
      assert.deepEqual(scope.writes, [['suit', legacy]])
      assert.equal(scope.getSnapshot().user.suit, legacy)
      suits.dispose()
    })
  })
}

test('an explicit Host flowers choice wins over the legacy library value', async () => {
  await withLocalStorage(new MemoryStorage(), async () => {
    globalThis.localStorage.setItem(LOCAL_KEY, 'library')
    const scope = new ConfigFormStub(readySnapshot({
      value: { suit: 'flowers' }, user: { suit: 'flowers' },
    }))
    const host = tokenHost()
    const suits = new SuitRuntime(host, scope)

    suits.start()

    assert.equal(suits.skin, 'flowers')
    assert.equal(host.layers.size, 1)
    assert.deepEqual(scope.writes, [])
    suits.dispose()
  })
})

test('an explicit Host native choice wins over the legacy library value', async () => {
  await withLocalStorage(new MemoryStorage(), async () => {
    globalThis.localStorage.setItem(LOCAL_KEY, 'library')
    const scope = new ConfigFormStub(readySnapshot({
      value: { suit: 'native' }, user: { suit: 'native' },
    }))
    const host = tokenHost()
    const suits = new SuitRuntime(host, scope)

    suits.start()

    assert.equal(suits.skin, 'native')
    assert.equal(host.layers.size, 0)
    assert.deepEqual(scope.writes, [])
    suits.dispose()
  })
})

for (const [choice, lateHost] of [['flowers', 'library'], ['library', 'flowers'], ['native', 'library']]) {
  test(`a ${choice} selection during the first read overrides late Host ${lateHost}`, async () => {
    await withLocalStorage(new MemoryStorage(), async () => {
      globalThis.localStorage.setItem(LOCAL_KEY, lateHost)
      const scope = new ConfigFormStub(loadingSnapshot)
      const host = tokenHost()
      const suits = new SuitRuntime(host, scope)

      suits.start()
      suits.setSuit(choice)
      scope.publish(readySnapshot({ value: { suit: lateHost }, user: { suit: lateHost } }))
      await Promise.resolve()

      assert.equal(suits.skin, choice)
      assert.equal(scope.getSnapshot().value.suit, choice)
      assert.equal(scope.getSnapshot().user.suit, choice)
      assert.deepEqual(scope.writes, [['suit', choice]])
      assert.equal(host.layers.size, choice === 'native' ? 0 : 1)
      suits.dispose()
    })
  })
}

test('a late schema-default snapshot does not roll back a first-read user selection', async () => {
  await withLocalStorage(new MemoryStorage(), async () => {
    const scope = new ConfigFormStub(loadingSnapshot)
    const host = tokenHost()
    const suits = new SuitRuntime(host, scope)

    suits.start()
    suits.setSuit('library')
    scope.publish(readySnapshot())
    await Promise.resolve()

    assert.equal(suits.skin, 'library')
    assert.equal(scope.getSnapshot().user.suit, 'library')
    assert.deepEqual(scope.writes, [['suit', 'library']])
    suits.dispose()
  })
})

test('no explicit or legacy preference keeps flowers without writing a default', async () => {
  await withLocalStorage(new MemoryStorage(), async () => {
    const scope = new ConfigFormStub(readySnapshot())
    const host = tokenHost()
    const suits = new SuitRuntime(host, scope)

    suits.start()

    assert.equal(suits.skin, 'flowers')
    assert.deepEqual(scope.writes, [])
    suits.dispose()
  })
})

test('a read-only Host form keeps the legacy value local and reports the local channel', async () => {
  await withLocalStorage(new MemoryStorage(), async () => {
    globalThis.localStorage.setItem(LOCAL_KEY, 'library')
    const scope = new ConfigFormStub(readySnapshot({ writable: false }))
    const host = tokenHost()
    const suits = new SuitRuntime(host, scope)

    suits.start()

    assert.equal(suits.skin, 'library')
    assert.equal(suits.persistence.channel, 'local')
    assert.deepEqual(scope.writes, [])
    suits.dispose()
  })
})

test('native removes theme tokens, re-enables the prior suit, and restarts from Host preference', async () => {
  await withLocalStorage(new MemoryStorage(), async () => {
    const scope = new ConfigFormStub(readySnapshot())
    const host = tokenHost()
    const suits = new SuitRuntime(host, scope)

    suits.start()
    suits.setSuit('library')
    await Promise.resolve()
    assert.equal(scope.getSnapshot().user.suit, 'library')
    assert.equal(host.layers.size, 1)

    suits.setEnabled(false)
    await Promise.resolve()
    assert.equal(suits.skin, 'native')
    assert.equal(host.layers.size, 0)

    suits.setEnabled(true)
    await Promise.resolve()
    assert.equal(suits.skin, 'library')
    assert.equal(host.layers.size, 1)

    suits.setSuit('native')
    await Promise.resolve()
    assert.equal(scope.getSnapshot().user.suit, 'native')
    assert.equal(host.layers.size, 0)
    suits.dispose()

    globalThis.localStorage.removeItem(LOCAL_KEY)
    const restarted = new SuitRuntime(host, scope)
    restarted.start()
    assert.equal(restarted.skin, 'native')
    assert.equal(host.layers.size, 0)
    restarted.dispose()
  })
})

test('a selection made without localStorage is saved when the Host form becomes ready', async () => {
  await withLocalStorage(undefined, async () => {
    const scope = new ConfigFormStub(loadingSnapshot)
    const host = tokenHost()
    const suits = new SuitRuntime(host, scope)

    suits.start()
    suits.setSuit('library')
    scope.publish(readySnapshot())
    await Promise.resolve()

    assert.equal(suits.skin, 'library')
    assert.equal(scope.getSnapshot().user.suit, 'library')
    assert.deepEqual(scope.writes, [['suit', 'library']])
    suits.dispose()
  })
})


test('GWT1: new installation or empty config defaults minimalMode and antiOcclusion to false', async () => {
  const scope = new ConfigFormStub(readySnapshot())
  const host = tokenHost()
  const suits = new SuitRuntime(host, scope)

  suits.start()

  assert.equal(suits.isMinimalMode, false)
  assert.equal(suits.isAntiOcclusion, false)
  assert.deepEqual(suits.flags, {
    minimalMode: false,
    antiOcclusion: false,
  })
  suits.dispose()
})

test('feature switches can be toggled and persisted to scope', async () => {
  const scope = new ConfigFormStub(readySnapshot())
  const host = tokenHost()
  const suits = new SuitRuntime(host, scope)

  suits.start()
  suits.setMinimalMode(true)
  suits.setAntiOcclusion(true)

  assert.equal(suits.isMinimalMode, true)
  assert.equal(suits.isAntiOcclusion, true)
  assert.deepEqual(scope.writes, [
    ['minimalMode', true],
    ['antiOcclusion', true],
  ])
  suits.dispose()
})

test('GWT2: minimalMode preserves antiOcclusion value during toggle', async () => {
  const scope = new ConfigFormStub(readySnapshot())
  const host = tokenHost()
  const suits = new SuitRuntime(host, scope)

  suits.start()
  suits.setAntiOcclusion(true)
  assert.equal(suits.isAntiOcclusion, true)

  // 开启简约模式
  suits.setMinimalMode(true)
  assert.equal(suits.isMinimalMode, true)
  // antiOcclusion 保持原勾选值
  assert.equal(suits.isAntiOcclusion, true)

  // 关闭简约模式
  suits.setMinimalMode(false)
  assert.equal(suits.isMinimalMode, false)
  // 恢复后仍为 true
  assert.equal(suits.isAntiOcclusion, true)
  suits.dispose()
})

test('the Host schema exposes only the implemented preference fields', () => {
  assert.deepEqual(Object.keys(Config.dict).sort(), ['antiOcclusion', 'minimalMode', 'suit'])
})

for (const [field, setter] of [['minimalMode', 'setMinimalMode'], ['antiOcclusion', 'setAntiOcclusion']]) {
  test(`${field} selected during loading is saved when the Host becomes writable`, async () => {
    const scope = new ConfigFormStub(loadingSnapshot)
    const suits = new SuitRuntime(tokenHost(), scope)
    suits.start()
    suits[setter](true)
    assert.equal(suits.flags[field], true)
    assert.deepEqual(scope.writes, [])

    scope.publish(readySnapshot({ writable: false }))
    assert.equal(suits.flags[field], true)
    assert.deepEqual(scope.writes, [])

    scope.publish(readySnapshot())
    await new Promise(resolve => setImmediate(resolve))
    assert.equal(suits.flags[field], true)
    assert.equal(scope.snapshot.user[field], true)
    assert.deepEqual(scope.writes, [[field, true]])

    scope.publish(readySnapshot({ user: { [field]: false } }))
    assert.equal(suits.flags[field], false)
    suits.dispose()
  })

  test(`${field} preserves the last click while an earlier write is pending`, async () => {
    const scope = new ConfigFormStub(readySnapshot())
    const pending = []
    scope.set = (key, value) => {
      scope.writes.push([key, value])
      return new Promise(resolve => pending.push(() => {
        scope.publish({
          ...scope.snapshot,
          user: { ...scope.snapshot.user, [key]: value },
          value: { ...scope.snapshot.value, [key]: value },
          revision: scope.snapshot.revision + 1,
        })
        resolve(true)
      }))
    }
    const suits = new SuitRuntime(tokenHost(), scope)
    suits.start()
    suits[setter](true)
    suits[setter](false)
    assert.deepEqual(scope.writes, [[field, true]])
    pending.shift()()
    assert.equal(suits.flags[field], false)
    await new Promise(resolve => setImmediate(resolve))
    assert.deepEqual(scope.writes, [[field, true], [field, false]])
    pending.shift()()
    await new Promise(resolve => setImmediate(resolve))
    assert.equal(suits.flags[field], false)
    assert.equal(scope.snapshot.user[field], false)
    suits.dispose()
  })

  test(`${field} does not repeatedly write a rejected Host revision`, async () => {
    const scope = new ConfigFormStub(readySnapshot())
    scope.set = async (key, value) => { scope.writes.push([key, value]); return false }
    const suits = new SuitRuntime(tokenHost(), scope)
    suits.start()
    suits[setter](true)
    await new Promise(resolve => setImmediate(resolve))
    scope.publish(scope.snapshot)
    await new Promise(resolve => setImmediate(resolve))
    assert.deepEqual(scope.writes, [[field, true]])
    assert.equal(suits.flags[field], true)
    suits.dispose()
  })
}

for (const suit of ['flowers', 'library']) {
  test(`${suit} minimal texture follows the approved light/dark outlines and restores`, () => {
    const host = tokenHost()
    const scope = new ConfigFormStub(readySnapshot({ value: { suit }, user: { suit } }))
    const runtime = new SuitRuntime(host, scope)
    runtime.start()
    const classic = host.layers.get('dsh-joi-channel-theme')['--joi-texture-image']
    runtime.setMinimalMode(true, false)
    const minimal = host.layers.get('dsh-joi-channel-theme')['--joi-texture-image']
    for (const mode of ['light', 'dark']) {
      const image = minimal[mode]
      assert.notEqual(image, classic[mode])
      const uri = image.match(/url\("data:image\/svg\+xml,([^\"]+)"\)/)?.[1]
      assert.ok(uri, 'outline SVG is embedded')
      const svg = decodeURIComponent(uri)
      assert.match(svg, /fill="none"/)
      assert.match(svg, /rotate\(-15 64 64\)/)
      if (suit === 'flowers') assert.match(svg, /rotate\(15 64 64\)/)
      if (mode === 'dark') {
        assert.match(svg, /opacity="0\.34"/)
        assert.ok(svg.includes(suit === 'flowers' ? '#C8BCD0' : '#C0CCDF'))
      }
      assert.equal(image.includes('linear-gradient'), suit === 'library')
    }
    runtime.setMinimalMode(false, false)
    assert.deepEqual(host.layers.get('dsh-joi-channel-theme'), tokensFor(suit))
    runtime.setEnabled(false)
    runtime.setMinimalMode(true, false)
    assert.equal(host.layers.size, 0)
    runtime.setEnabled(true)
    assert.deepEqual(host.layers.get('dsh-joi-channel-theme'), tokensFor(suit, true))
    runtime.dispose()
  })
}
