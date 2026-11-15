import assert from 'node:assert/strict'
import test from 'node:test'
import { stylesheet, SELECTORS } from '../src/client/css.ts'
import { Surfaces } from '../src/client/surfaces.ts'

class ElementStub {
  attributes = new Map()
  children = []
  classes = new Set()
  classList = {
    add: name => this.classes.add(name),
    remove: name => this.classes.delete(name),
    contains: name => this.classes.has(name),
  }
  parentElement = null
  parentNode = null
  style = { cssText: '', display: '', removeProperty(name) { this[name] = '' } }
  sheet = null

  constructor(tagName) {
    this.tagName = tagName
    if (tagName === 'style') this.sheet = { disabled: false }
  }

  append(...nodes) {
    for (const node of nodes) {
      node.remove()
      node.parentElement = this
      node.parentNode = this
      this.children.push(node)
    }
  }

  remove() {
    if (this.parentElement !== null) {
      this.parentElement.children = this.parentElement.children.filter(child => child !== this)
    }
    this.parentElement = null
    this.parentNode = null
  }

  matches(selector) {
    return selector === SELECTORS.isolatedRoot
      && this.hasAttribute('data-phase')
      && this.className?.includes('root') === true
  }

  closest(selector) {
    for (let node = this; node !== null; node = node.parentElement) {
      if (node.matches(selector)) return node
    }
    return null
  }

  querySelector() { return null }
  querySelectorAll() { return [] }

  getBoundingClientRect() {
    if (this.rect !== undefined) return this.rect
    const left = Number.parseFloat(this.style.left ?? '0')
    const top = Number.parseFloat(this.style.top ?? '0')
    const width = Number.parseFloat(this.style.width ?? '0')
    const height = Number.parseFloat(this.style.height ?? '0')
    return { left, top, width, height, right: left + width, bottom: top + height }
  }

  addEventListener() {}
  removeEventListener() {}
  setAttribute(name, value) { this.attributes.set(name, String(value)) }
  getAttribute(name) { return this.attributes.get(name) ?? null }
  hasAttribute(name) { return this.attributes.has(name) }
  removeAttribute(name) { this.attributes.delete(name) }
}

class DocumentStub {
  body = new ElementStub('body')
  head = new ElementStub('head')
  hidden = false
  mode = 'none'
  root = null
  stack = null
  card = new ElementStub('div')
  headline = null
  text = null
  surface = new ElementStub('div')

  constructor() {
    this.card.rect = { left: 240, right: 1040, top: 650, bottom: 750, width: 800, height: 100 }
    this.surface.rect = { left: 0, right: 1280, top: 0, bottom: 800, width: 1280, height: 800 }
    this.body.append(this.surface)
  }

  createElement(tagName) { return new ElementStub(tagName) }

  getElementById(id) {
    const find = node => {
      if (node.id === id) return node
      for (const child of node.children) {
        const match = find(child)
        if (match !== null) return match
      }
      return null
    }
    return find(this.body) ?? find(this.head)
  }

  showHero(name, isolated = true) {
    this.removeScene()
    this.mode = 'hero'
    const root = new ElementStub('div')
    root.className = `test_conversation_root_${name}`
    if (isolated) root.setAttribute('data-phase', 'hero')
    const stack = new ElementStub('div')
    stack.className = 'test_composerStack test_composerHero test_heroStack'
    const headline = new ElementStub('div')
    headline.className = 'test_headline'
    const text = new ElementStub('span')
    text.rect = { left: 510, right: 730, top: 300, bottom: 340, width: 220, height: 40 }
    headline.querySelector = selector => selector.startsWith('span:not(') ? text : null
    stack.querySelector = selector => selector === SELECTORS.composerCard ? this.card : null
    stack.append(headline, this.card)
    root.append(stack)
    this.body.append(root)
    this.root = root
    this.stack = stack
    this.headline = headline
    this.text = text
    return root
  }

  showConversation(name) {
    this.removeScene()
    this.mode = 'chat'
    const root = new ElementStub('div')
    root.className = `test_conversation_root_${name}`
    root.setAttribute('data-phase', 'active')
    const stack = new ElementStub('div')
    stack.className = 'test_composerStack'
    stack.querySelector = selector => selector === SELECTORS.composerCard ? this.card : null
    stack.append(this.card)
    root.append(stack)
    this.body.append(root)
    this.root = root
    this.stack = stack
    this.headline = null
    this.text = null
    return root
  }

  removeScene() {
    this.root?.remove()
    this.root = null
    this.stack = null
    this.headline = null
    this.text = null
    this.mode = 'none'
  }

  querySelector(selector) {
    if (this.mode === 'none') return null
    if (selector === SELECTORS.composerStack) return this.stack
    if (selector === SELECTORS.composerCard) return this.card
    if (selector === SELECTORS.headline) return this.mode === 'hero' ? this.headline : null
    if (selector === SELECTORS.heroStack) return this.mode === 'hero' ? this.stack : null
    if (selector === SELECTORS.isolatedRoot) return this.root?.matches(selector) ? this.root : null
    return null
  }

  querySelectorAll(selector) {
    const nodes = []
    const visit = node => {
      for (const child of node.children) {
        nodes.push(child)
        visit(child)
      }
    }
    visit(this.body)
    if (selector === 'body div') return nodes.filter(node => node.tagName === 'div')
    if (selector === '.joi-tex') return nodes.filter(node => node.classList.contains('joi-tex'))
    if (selector === '.joi-minimal') return nodes.filter(node => node.classList.contains('joi-minimal'))
    if (selector === '.joi-halo') return nodes.filter(node => node.classList.contains('joi-halo'))
    return []
  }
}

function installBrowserGlobals() {
  const keys = ['window', 'document', 'MutationObserver', 'requestAnimationFrame', 'cancelAnimationFrame', 'getComputedStyle']
  const previous = new Map(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
  const document = new DocumentStub()
  globalThis.document = document
  globalThis.window = {
    addEventListener() {}, removeEventListener() {},
    innerWidth: 1280, innerHeight: 800, scrollX: 0, scrollY: 0,
  }
  const observers = new Set()
  globalThis.MutationObserver = class {
    constructor(run) { this.run = run; observers.add(this) }
    observe() {}
    disconnect() { observers.delete(this) }
  }
  const frames = new Map()
  let nextFrame = 0
  globalThis.requestAnimationFrame = run => {
    const id = ++nextFrame
    frames.set(id, run)
    return id
  }
  globalThis.cancelAnimationFrame = id => frames.delete(id)
  globalThis.getComputedStyle = () => ({ backgroundColor: 'rgb(255, 250, 242)' })

  const restore = () => {
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor)
      else Reflect.deleteProperty(globalThis, key)
    }
  }
  restore.document = document
  restore.flushFrames = () => {
    const current = [...frames.values()]
    frames.clear()
    for (const run of current) run()
  }
  restore.notifyMutation = () => {
    for (const observer of [...observers]) observer.run()
  }
  return restore
}

test('fixed portrait follows hero root replacements and stays owned across navigation and costume changes', () => {
  const restore = installBrowserGlobals()
  const document = restore.document
  const firstRoot = document.showHero('first')
  const surfaces = new Surfaces('flowers')

  try {
    restore.flushFrames()
    const portrait = document.getElementById('joi-theme-portrait')
    assert.ok(portrait)
    assert.equal(portrait.parentElement, firstRoot)
    assert.equal(portrait.style.display, 'block')
    assert.equal(portrait.style.width, '540px')

    const css = stylesheet()
    assert.match(css, /#joi-theme-portrait\s*\{[^}]*position: fixed;[^}]*pointer-events: none;/s)
    assert.doesNotMatch(css, /\[data-phase\]\[class\*=root\]\s*\{\s*isolation:\s*auto/i)

    const replacement = document.showHero('replacement')
    restore.notifyMutation()
    restore.flushFrames()
    assert.equal(portrait.parentElement, replacement)
    assert.equal(firstRoot.children.includes(portrait), false)

    document.showConversation('active-session')
    restore.notifyMutation()
    restore.flushFrames()
    assert.equal(portrait.style.display, 'none')
    assert.equal(portrait.parentElement, document.body)

    const returnedHome = document.showHero('returned-home')
    restore.notifyMutation()
    restore.flushFrames()
    assert.equal(portrait.parentElement, returnedHome)
    assert.equal(portrait.style.display, 'block')
    const flowersSrc = portrait.src

    surfaces.setSuit('native')
    restore.flushFrames()
    assert.equal(portrait.style.display, 'none')
    assert.equal(portrait.parentElement, document.body)

    const nativeRoot = document.showHero('native-root-replaced')
    restore.notifyMutation()
    restore.flushFrames()
    assert.equal(portrait.parentElement, document.body)

    surfaces.setSuit('library')
    restore.flushFrames()
    assert.equal(portrait.parentElement, nativeRoot)
    assert.equal(portrait.style.display, 'block')
    assert.notEqual(portrait.src, flowersSrc)

    surfaces.dispose()
    assert.equal(document.getElementById('joi-theme-portrait'), null)
    assert.equal(nativeRoot.children.includes(portrait), false)
  } finally {
    surfaces.dispose()
    restore()
  }
})

test('fixed portrait keeps the body fallback on hosts without an isolated hero root', () => {
  const restore = installBrowserGlobals()
  const document = restore.document
  document.showHero('legacy', false)
  const surfaces = new Surfaces('library')

  try {
    restore.flushFrames()
    const portrait = document.getElementById('joi-theme-portrait')
    assert.ok(portrait)
    assert.equal(portrait.parentElement, document.body)
    assert.equal(portrait.style.display, 'block')
    assert.equal(portrait.style.width, '540px')
  } finally {
    surfaces.dispose()
    restore()
  }
})
