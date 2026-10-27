/**
 * 冒烟测试：不开浏览器、不装插件，用一套极小的 React 替身把 client.js 的面板
 * 真渲染一遍，再模拟点击/输入，检查导航、搜索、筛选、条目渲染有没有炸。
 *
 *   node tools/smoke-test.mjs
 *
 * 读的是本地 data/*.json（和宿主接口返回的内容一致），require('react') 换成
 * 这个文件里的假 React，其余按浏览器里的调用顺序走：__ModuleLoader__.load →
 * factory → apply(ctx) → main 面板工厂。
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const PKG = dirname(HERE)
const DATA = join(PKG, 'data')
const DEBUG = process.argv.includes('--debug')
// 设了 HTLB_HTTP 就走真实宿主接口，例如：
//   $env:HTLB_HTTP='http://127.0.0.1:11452'; node tools/smoke-test.mjs
const HTTP_BASE = process.env.HTLB_HTTP || ''
const realFetch = globalThis.fetch

// ---------------------------------------------------------------------------
// 假 React：够跑函数组件 + hooks，渲染成可检查的元素树。
// ---------------------------------------------------------------------------

let current = null
let dirty = false
// 还在路上的数据请求数；renderRoot 要等它归零才算这一轮收敛。
let inflight = 0
const instances = new Map()

function createElement(type, config, ...children) {
  const props = Object.assign({}, config || {})
  const flat = []
  const collect = (value) => {
    if (value === null || value === undefined || typeof value === 'boolean') return
    if (Array.isArray(value)) {
      value.forEach(collect)
      return
    }
    flat.push(value)
  }
  children.forEach(collect)
  if ('children' in props) collect(props.children)
  delete props.children
  if (flat.length > 0) props.children = flat.length === 1 ? flat[0] : flat
  return { type, props }
}

function instanceAt(path, type) {
  const existing = instances.get(path)
  if (existing && existing.type === type) return existing
  const fresh = { type, hooks: [] }
  instances.set(path, fresh)
  return fresh
}

function hookCell() {
  const inst = current.inst
  const index = current.hookIndex++
  return { inst, index }
}

const fakeReact = {
  createElement,
  useState(initial) {
    const { inst, index } = hookCell()
    if (!(index in inst.hooks)) inst.hooks[index] = typeof initial === 'function' ? initial() : initial
    const set = (next) => {
      const value = typeof next === 'function' ? next(inst.hooks[index]) : next
      if (!Object.is(value, inst.hooks[index])) {
        inst.hooks[index] = value
        dirty = true
      }
    }
    return [inst.hooks[index], set]
  },
  useEffect(fn, deps) {
    const { inst, index } = hookCell()
    const cell = inst.hooks[index]
    const changed =
      !cell ||
      !cell.deps ||
      !deps ||
      deps.length !== cell.deps.length ||
      deps.some((value, i) => !Object.is(value, cell.deps[i]))
    inst.hooks[index] = { deps: deps || null, pending: changed ? fn : null }
  },
  useMemo(fn, deps) {
    const { inst, index } = hookCell()
    const cell = inst.hooks[index]
    const changed = !cell || !cell.deps || !deps || deps.some((value, i) => !Object.is(value, cell.deps[i]))
    if (changed) inst.hooks[index] = { deps, value: fn() }
    return inst.hooks[index].value
  },
  useCallback(fn) {
    return fn
  },
  useRef(initial) {
    const { inst, index } = hookCell()
    if (!(index in inst.hooks)) inst.hooks[index] = { current: initial }
    return inst.hooks[index]
  },
}

// ---------------------------------------------------------------------------
// 渲染 + 副作用调度
// ---------------------------------------------------------------------------

let interactive = []
let tree = null

function flattenChildren(props) {
  const value = props.children
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

function walk(element, path) {
  if (element === null || element === undefined || typeof element === 'boolean') return null
  if (Array.isArray(element)) {
    return element.map((child, index) => walk(child, path + '.' + index)).filter(Boolean)
  }
  if (typeof element === 'string' || typeof element === 'number') {
    return { kind: 'text', text: String(element) }
  }
  const type = element.type
  const props = element.props || {}
  if (typeof type === 'function') {
    const inst = instanceAt(path, type)
    const previous = current
    current = { inst, hookIndex: 0 }
    let output
    try {
      output = type(props)
    } catch (error) {
      error.message = '[render ' + (type.name || path) + '] ' + error.message
      throw error
    } finally {
      current = previous
    }
    return { kind: 'comp', name: type.name || 'anon', rendered: walk(output, path + '>') }
  }
  const children = flattenChildren(props)
    .map((child, index) => walk(child, path + '.' + index))
    .filter(Boolean)
  const node = { kind: 'host', tag: String(type), props, children, path }
  if (typeof props.onClick === 'function') {
    interactive.push({ kind: 'click', label: textOf(node).trim(), node })
  }
  if (String(type) === 'input') {
    interactive.push({ kind: 'input', node })
  }
  return node
}

function textOf(node) {
  if (!node) return ''
  if (node.kind === 'text') return node.text
  if (node.kind === 'comp') return textOf(node.rendered)
  return (node.children || []).map(textOf).join(' ')
}

function collectEffects() {
  const due = []
  for (const inst of instances.values()) {
    for (const cell of inst.hooks) {
      if (cell && cell.pending) {
        due.push(cell.pending)
        cell.pending = null
      }
    }
  }
  return due
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function renderRoot(root) {
  for (let pass = 0; pass < 200; pass += 1) {
    dirty = false
    interactive = []
    tree = walk(root, 'root')
    const due = collectEffects()
    if (DEBUG) console.log('  pass', pass, 'effects=', due.length, 'dirty=', dirty, 'inflight=', inflight)
    for (const fn of due) fn()
    // HTTP 模式下 meta/search/章节是真的走网络，等这些请求回来再判断收敛。
    for (let wait = 0; inflight > 0 && wait < 400; wait += 1) await sleep(5)
    await sleep(2)
    if (!dirty && due.length === 0 && inflight === 0) {
      await sleep(2)
      if (!dirty && inflight === 0) return tree
    }
  }
  throw new Error('渲染没有收敛（可能 state 更新死循环）')
}

let activeRoot = null

// 渲染两轮、中间留出防抖/请求的时间，模拟「等数据到了再看」。
async function settle(ms = 260) {
  await renderRoot(activeRoot)
  await sleep(ms)
  await renderRoot(activeRoot)
}

function click(labelPart) {
  const found = interactive.filter((item) => item.kind === 'click' && item.label.indexOf(labelPart) >= 0)
  if (found.length === 0) throw new Error('找不到可点的元素：' + labelPart)
  found[0].node.props.onClick({ preventDefault() {}, stopPropagation() {} })
}

function type(value) {
  const field = interactive.find((item) => item.kind === 'input')
  if (!field) throw new Error('找不到输入框')
  field.node.props.onChange({ target: { value } })
}

function texts(root) {
  const output = []
  const visit = (node) => {
    if (!node) return
    if (node.kind === 'text') output.push(node.text)
    else if (node.kind === 'comp') visit(node.rendered)
    else (node.children || []).forEach(visit)
  }
  visit(root)
  return output.join('\n')
}

function countClass(root, className) {
  let count = 0
  const visit = (node) => {
    if (!node) return
    if (node.kind === 'comp') visit(node.rendered)
    else if (node.kind === 'host') {
      if (String(node.props.className || '').split(/\s+/).includes(className)) count += 1
      ;(node.children || []).forEach(visit)
    }
  }
  visit(root)
  return count
}

// ---------------------------------------------------------------------------
// 浏览器环境替身
// ---------------------------------------------------------------------------

const meta = JSON.parse(readFileSync(join(DATA, 'meta.json'), 'utf8'))
const search = JSON.parse(readFileSync(join(DATA, 'search.json'), 'utf8'))

const chapterFile = (number) => join(DATA, 'chapters', String(number).padStart(2, '0') + '.json')

const fetchStub = async (url) => {
  const path = String(url)
  inflight += 1
  try {
    if (HTTP_BASE) {
      const response = await realFetch(new URL(path, HTTP_BASE).href)
      const payload = await response.json()
      return { ok: response.ok, status: response.status, json: async () => payload }
    }
    const respond = (payload) => ({ ok: true, status: 200, json: async () => payload })
    if (path.endsWith('/meta')) return respond(meta)
    if (path.endsWith('/search')) return respond(search)
    const match = /chapter\/(\d+)$/.exec(path)
    if (match) return respond(JSON.parse(readFileSync(chapterFile(Number(match[1])), 'utf8')))
    return { ok: false, status: 404, json: async () => ({}) }
  } finally {
    inflight -= 1
  }
}

globalThis.fetch = fetchStub
console.log(HTTP_BASE ? `数据来源：HTTP ${HTTP_BASE}` : '数据来源：本地 data/ 目录')
globalThis.document = {
  baseURI: 'http://127.0.0.1:11452/',
  createElement: () => ({ dataset: {}, textContent: '' }),
  head: { appendChild() {} },
}

let loaded = null
globalThis.window = { __ModuleLoader__: { load: (mod) => { loaded = mod } } }

// eslint-disable-next-line no-new-func
new Function(readFileSync(join(PKG, 'client.js'), 'utf8'))()

if (!loaded || loaded.id !== 'dsh-howtolivebetter') throw new Error('client.js 没有按约定注册模块')

const factories = []
const dictionary = loaded.factory((id) => {
  if (id === 'react') return fakeReact
  throw new Error('client.js 要求了意外的依赖：' + id)
})

const interpolate = (template, vars) =>
  String(template).replace(/\{(\w+)\}/g, (whole, name) => (vars && name in vars ? String(vars[name]) : whole))
const t = (key, vars) => interpolate(dictionary.__dict ? dictionary.__dict.zh[key] : key, vars)

// apply() 里 locale.register 收下字典，供 t() 用。
let panelFactory = null
const ctx = {
  effect(fn) {
    fn()
    return () => {}
  },
  locale: {
    register(namespace, dict) {
      dictionary.__dict = dict
      return () => {}
    },
    bind() {
      return t
    },
  },
  slots: {
    inject(name, callback) {
      return callback()
    },
    register(desc, factory) {
      factories.push({ desc, factory })
      if (desc.name === 'main') panelFactory = factory
      return () => {}
    },
  },
}

dictionary.apply(ctx)

if (!panelFactory) throw new Error('apply() 没有往 main 面板注册渲染函数')
const sidebar = factories.find((item) => item.desc.name === 'sidebar.panellist')
if (!sidebar) throw new Error('apply() 没有往 sidebar.panellist 注册图标')
if (sidebar.desc.id !== 'howtolivebetter') throw new Error('侧栏注册项 id 不对：' + sidebar.desc.id)
if (!sidebar.desc.label()) throw new Error('侧栏注册项没有标签')
if (typeof sidebar.desc.order !== 'number') throw new Error('侧栏注册项没有 order')

const failures = []
const check = (condition, message) => {
  if (condition) {
    console.log('  ok  ' + message)
  } else {
    failures.push(message)
    console.log('  FAIL ' + message)
  }
}

// ---------------------------------------------------------------------------
// 场景
// ---------------------------------------------------------------------------

const rootElement = panelFactory({ t })
activeRoot = rootElement
await renderRoot(rootElement)
let view = texts(tree)

console.log('\n[1] 导语页')
check(view.indexOf('高性价比人生指南') >= 0, '标题渲染')
check(view.indexOf('这本书想回答的问题') >= 0, '34 个问题区块渲染')
check(countClass(tree, 'htlb-navitem') === 35, '侧栏是导语 + 34 节（实际 ' + countClass(tree, 'htlb-navitem') + '）')
check(countClass(tree, 'htlb-q') === 34, '问题按钮 34 个')
check(countClass(tree, 'htlb-sec') === 6, '六个说明折叠块')

console.log('\n[2] 点进第 13 节')
click('紧急情况')
await settle()
view = texts(tree)
check(view.indexOf('紧急情况') >= 0, '章节标题渲染')
check(countClass(tree, 'htlb-card') > 20, '条目卡片渲染（' + countClass(tree, 'htlb-card') + ' 张）')
check(view.indexOf('来源') >= 0 || view.indexOf('出处') >= 0, '来源折叠块出现')

console.log('\n[3] 全文搜索')
type('加班费')
await settle()
view = texts(tree)
if (DEBUG) console.log('  hits=', countClass(tree, 'htlb-hit'))
check(view.indexOf('找到') >= 0, '显示结果计数')
check(countClass(tree, 'htlb-hit') > 0, '搜索结果条目（' + countClass(tree, 'htlb-hit') + ' 条）')
check(view.indexOf('加班费') >= 0, '结果里出现关键词')

const firstHit = interactive.find((item) => item.kind === 'click' && String(item.node.props.className || '') === 'htlb-hit')
check(Boolean(firstHit), '搜索结果可点')
if (firstHit) {
  firstHit.node.props.onClick()
  await settle()
  check(countClass(tree, 'htlb-card') > 0, '点结果跳到章节')
}

console.log('\n[4] 回章节 + 筛选叠加')
type('')
await settle()
click('紧急情况')
await settle()
const cardsBefore = countClass(tree, 'htlb-card')
const chips = interactive.filter((item) => item.kind === 'click' && item.label === 'A 有数字')
check(chips.length > 0, '证据 A 筛选按钮存在')
if (chips.length > 0) {
  chips[0].node.props.onClick()
  await settle()
  const cardsAfter = countClass(tree, 'htlb-card')
  check(cardsAfter > 0 && cardsAfter < cardsBefore, '筛选后条目变少（' + cardsBefore + ' → ' + cardsAfter + '）')
  check(texts(tree).indexOf('只显示') >= 0 || texts(tree).indexOf('筛选') >= 0, '筛选状态提示可见')
}

console.log('\n[5] 回导语并随机一条')
const introNav = interactive.find((item) => item.kind === 'click' && item.label.indexOf('导语') >= 0)
check(Boolean(introNav), '侧栏能回导语')
if (introNav) {
  introNav.node.props.onClick()
  await settle()
  check(texts(tree).indexOf('这本书想回答的问题') >= 0, '导语页回来了')
  const randomButton = interactive.find((item) => item.kind === 'click' && item.label.indexOf('随机') >= 0)
  check(Boolean(randomButton), '随机按钮存在')
  if (randomButton) {
    randomButton.node.props.onClick()
    await settle()
    check(countClass(tree, 'htlb-card') > 0, '随机跳到了某一节')
  }
}

console.log('\n结果')
if (failures.length > 0) {
  console.error('失败 ' + failures.length + ' 项：\n- ' + failures.join('\n- '))
  process.exit(1)
}
console.log('全部通过')
