/**
 * 把《高性价比人生指南》的正文（book/*.md + README.md）转成这个插件读的数据文件。
 *
 * 用法：node tools/build-data.mjs [源仓库目录]
 * 源目录优先级：命令行参数 > 环境变量 HTLB_SRC > vendor/HowToLiveBetter（见 README 的 clone 命令）。
 * 输出到本包 data/。
 *
 * 解析只依赖正文本身的固定格式：每章一个 `# N. 标题`，每条以 `### N. 标题` 开头，
 * 紧跟一行 `<!-- 成本标签: … -->`，然后固定六个 `- 字段：` 行。README 只取
 * 导语、问答表、四份说明和目录里每节的提要。
 */
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const PKG = path.resolve(import.meta.dirname, '..')
const OUT = path.join(PKG, 'data')
const SRC = process.argv[2] ?? process.env.HTLB_SRC ?? path.join(PKG, 'vendor', 'HowToLiveBetter')

// 和 tools/lib/book.mjs 里的 COST_W / ratioOf 一致（检索页同一套算法）。
const COST_W = {
  money: { 0: 0, 少: 1, 多: 2 },
  time: { 少: 0, 中: 1, 多: 2 },
  will: { 否: 0, 些: 1, 是: 2 },
}
function ratioOf(cost, gain) {
  if (gain === '大') return cost === 0 ? '极高' : cost <= 2 ? '高' : '一般'
  return gain === '中' && cost === 0 ? '高' : '一般'
}

const read = (p) => fs.readFileSync(path.join(SRC, p), 'utf8').replace(/\r\n/g, '\n')
const squash = (s) => s.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim()
/** 术语表整段包在 <details>/<summary> 里，插件自己渲染 markdown，所以把壳去掉。 */
const stripHtmlShell = (s) =>
  squash(
    s
      .replace(/<\/?details>/g, '')
      .replace(/<\/?summary[^>]*>/g, '')
      .replace(/<br\s*\/?>/g, '\n'),
  )

fs.mkdirSync(path.join(OUT, 'chapters'), { recursive: true })

const warnings = []
const warn = (m) => warnings.push(m)

// ---------------------------------------------------------------- README
const readme = read('README.md')
const rl = readme.split('\n')

// 按 `## ` 切段；第一段是导语（含标题、徽章、下载表格）。
const sections = []
{
  let cur = { title: '导语', buf: [] }
  for (const line of rl) {
    const m = /^## (.+?)\s*$/.exec(line)
    if (m) {
      sections.push(cur)
      cur = { title: m[1], buf: [] }
      continue
    }
    cur.buf.push(line)
  }
  sections.push(cur)
}
const sectionBy = (title) => sections.find((s) => s.title === title)

// 导语：去掉徽章、图片、html 表格和「打开在线检索页」这类页面导航行。
const intro = squash(
  sections[0].buf
    .filter((l) => {
      const t = l.trim()
      if (t === '') return true
      if (t.startsWith('<')) return false
      if (t.startsWith('[![')) return false
      if (/^\[← /.test(t)) return false
      if (t.startsWith('# ')) return false
      if (t.startsWith('### ')) return false
      return true
    })
    .join('\n')
    .replace(/<br>/g, '\n\n')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .trim(),
)

// 「这本书想回答的问题」是一张表：左列问题，右列指向某一节。
const questions = []
{
  const sec = sectionBy('这本书想回答的问题')
  if (!sec) warn('README 里没找到「这本书想回答的问题」')
  for (const line of sec?.buf ?? []) {
    const row = /^\|\s*(.+?)\s*\|\s*\[[^\]]*\]\(book\/(\d+)-[^)]*\.md\)\s*\|\s*$/.exec(line)
    if (row) questions.push({ q: row[1], n: Number(row[2]) })
  }
}

// 「目录」每行：N. [标题](book/NN-slug.md)：提要
const chapterDesc = new Map()
{
  const sec = sectionBy('目录')
  if (!sec) warn('README 里没找到「目录」')
  for (const line of sec?.buf ?? []) {
    const row = /^(\d+)\.\s*\[([^\]]+)\]\(book\/(\d+)-([^)]+)\.md\)\s*[：:]?\s*(.*)$/.exec(line)
    if (!row) continue
    const n = Number(row[3])
    chapterDesc.set(n, squash(row[5] ?? ''))
    if (Number(row[1]) !== n) warn(`目录序号和文件名不一致：${row[1]} vs ${row[3]}`)
  }
}

// 术语表：`| 术语 | 意思 |` 行。
const glossary = []
for (const line of sectionBy('读懂数字（术语表）')?.buf ?? []) {
  const row = /^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*$/.exec(line)
  if (!row) continue
  const term = row[1].trim()
  if (!term || term === '术语' || /^-+$/.test(term)) continue
  glossary.push({ term, def: row[2].trim() })
}
if (glossary.length === 0) warn('术语表没解析出来')

// 只留下有说明价值的段落。
const keepSections = ['怎么读', '四种资源', '证据分级', '性价比档', '读懂数字（术语表）', '许可']
const noteSections = keepSections
  .map((title) => {
    const sec = sectionBy(title)
    if (!sec) {
      warn(`README 缺段：${title}`)
      return null
    }
    const md = stripHtmlShell(sec.buf.join('\n'))
    if (!md) return null
    return { id: title, title, md }
  })
  .filter(Boolean)

// ---------------------------------------------------------------- 正文
const bookDir = path.join(SRC, 'book')
const files = fs
  .readdirSync(bookDir)
  .filter((f) => f.endsWith('.md'))
  .sort((a, b) => Number(a.slice(0, 2)) - Number(b.slice(0, 2)))

function parseSources(raw) {
  const items = []
  for (const chunk of raw.split('；')) {
    const c = chunk.trim()
    if (!c) continue
    const urls = [...c.matchAll(/<([^>\s]+)>/g)].map((m) => m[1]).filter((u) => /^https?:\/\//.test(u))
    const label = c
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .replace(/^[\s：:，,]+|[\s：:，,]+$/g, '')
      .trim()
    if (urls.length === 0) {
      if (label) items.push({ label })
      continue
    }
    items.push(label ? { label, urls } : { urls })
  }
  return items
}

const chapters = []
const searchEntries = []
const stat = { entries: 0, grades: { A: 0, B: 0, C: 0 }, ratio: {}, controversial: 0, links: 0, scope: {}, who: {} }

for (const file of files) {
  const n = Number(file.slice(0, 2))
  let raw = read(path.join('book', file)).replace(/^\[← 回总目录\]\([^)]*\)\s*\n/, '')

  // 第 26 节末尾挂了一段「## 许可」，不属于任何条目，单独存。
  let chapterLicense = null
  const licIdx = raw.indexOf('\n## 许可')
  if (licIdx >= 0) {
    chapterLicense = squash(raw.slice(licIdx + 1).replace(/^## 许可\s*\n?/, ''))
    raw = raw.slice(0, licIdx + 1)
  }

  const headMatch = /^#\s+(.+?)\s*$/m.exec(raw)
  if (!headMatch) throw new Error(`${file}: 找不到一级标题`)
  const rawTitle = headMatch[1]
  const title = rawTitle.replace(/^\d+\.\s*/, '').trim()
  const introMd = squash(
    raw
      .slice(headMatch.index + headMatch[0].length)
      .split(/^### (?=\d+\.\s)/m)[0]
      .replace(/^\s*\n/, ''),
  )

  const parts = raw.split(/^### (?=\d+\.\s)/m).slice(1)
  if (parts.length === 0) throw new Error(`${file}: 没有条目`)

  const entries = []
  for (const part of parts) {
    const lines = part.split('\n')
    const h = /^(\d+)\.\s*(.+?)\s*$/.exec(lines[0])
    if (!h) throw new Error(`${file}: 条目标题解析失败：${lines[0]}`)
    const en = Number(h[1])
    const etitle = h[2]

    const body = lines.slice(1)
    let tags = {}
    let i = 0
    for (; i < body.length; i++) {
      if (body[i].trim() === '') continue
      const tag = /^<!--\s*成本标签[:：]\s*(.*?)\s*-->\s*$/.exec(body[i])
      if (tag) {
        for (const m of tag[1].matchAll(/([^\s=]+)=([^\s]+)/g)) tags[m[1]] = m[2]
        i++
      }
      break
    }

    const fields = {}
    let cur = null
    for (; i < body.length; i++) {
      const line = body[i]
      const fm = /^-\s*([^\s：:]{1,12})[：:]\s*(.*)$/.exec(line)
      if (fm) {
        cur = fm[1]
        fields[cur] = fm[2].trim()
        continue
      }
      if (line.trim() === '') continue
      if (cur) fields[cur] = `${fields[cur]}\n${line.trim()}`.trim()
    }
    for (const need of ['成本', '说人话', '收益', '证据等级', '来源']) {
      if (!fields[need]) throw new Error(`${file} 第 ${en} 条缺字段：${need}`)
    }

    const money = tags['钱'] ?? '0'
    const time = tags['时间'] ?? '少'
    const will = tags['毅力'] ?? '否'
    const gain = tags['收益'] ?? '中'
    const cost = (COST_W.money[money] ?? 0) + (COST_W.time[time] ?? 0) + (COST_W.will[will] ?? 0)
    if (COST_W.money[money] === undefined) warn(`未知成本标签 钱=${money}（${file} 第 ${en} 条）`)
    const ratio = ratioOf(cost, gain)
    const who = (tags['人群'] ?? '')
      .split(/[,，+＋]/)
      .map((s) => s.trim())
      .filter(Boolean)
    const scope = tags['口径'] ?? ''
    const grade = fields['证据等级'].trim().replace(/[^ABC]/g, '') || 'C'
    const sources = parseSources(fields['来源'])
    const note = fields['备注'] ?? ''
    const controversial = /^争议/.test(note)

    entries.push({
      n: en,
      title: etitle,
      tags: { money, time, will, gain, scope, who },
      cost,
      ratio,
      plain: fields['说人话'].trim(),
      costText: fields['成本'].trim(),
      gainText: fields['收益'].trim(),
      grade,
      sources,
      note,
      controversial,
    })

    stat.entries++
    stat.grades[grade] = (stat.grades[grade] ?? 0) + 1
    stat.ratio[ratio] = (stat.ratio[ratio] ?? 0) + 1
    if (controversial) stat.controversial++
    stat.links += sources.reduce((acc, s) => acc + (s.urls?.length ?? 0), 0)
    if (scope) for (const s of scope.split(/[\/、，,]/)) if (s.trim()) stat.scope[s.trim()] = (stat.scope[s.trim()] ?? 0) + 1
    for (const w of who) stat.who[w] = (stat.who[w] ?? 0) + 1

    searchEntries.push({
      c: n,
      n: en,
      t: etitle,
      p: fields['说人话'].trim(),
      // 收益/成本原文各截一段，够判断要不要点进去，剩下的点开条目再看。
      g: fields['收益'].trim().slice(0, 140),
      k: fields['成本'].trim().slice(0, 90),
      e: grade,
      a: gain,
      m: cost,
      r: ratio,
      s: scope,
      w: who,
      ct: title,
      cv: controversial ? 1 : 0,
    })
  }

  const chapter = {
    n,
    title,
    intro: introMd,
    license: chapterLicense,
    entries,
  }
  chapters.push(chapter)
  fs.writeFileSync(path.join(OUT, 'chapters', `${String(n).padStart(2, '0')}.json`), JSON.stringify(chapter))
}

// ---------------------------------------------------------------- 汇总
let commit = ''
try {
  commit = execSync('git rev-parse HEAD', { cwd: SRC, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
} catch {
  warn('取不到源仓库 commit')
}

const meta = {
  schema: 1,
  title: '高性价比人生指南',
  subtitle: '用最少的钱、时间和精力，换回最多的寿命、金钱和人身自由',
  repo: 'https://github.com/eternity4719/HowToLiveBetter',
  site: 'https://eternity4719.github.io/HowToLiveBetter/',
  license: { name: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' },
  source: { repo: 'eternity4719/HowToLiveBetter', commit, builtAt: new Date().toISOString() },
  stats: { chapters: chapters.length, ...stat },
  intro,
  questions,
  sections: noteSections,
  glossary,
  chapters: chapters.map((c) => ({
    n: c.n,
    title: c.title,
    desc: chapterDesc.get(c.n) ?? '',
    entries: c.entries.length,
    grades: c.entries.reduce((acc, e) => ({ ...acc, [e.grade]: (acc[e.grade] ?? 0) + 1 }), {}),
    ratio: c.entries.reduce((acc, e) => ({ ...acc, [e.ratio]: (acc[e.ratio] ?? 0) + 1 }), {}),
  })),
}

fs.mkdirSync(path.join(OUT, 'chapters'), { recursive: true })
fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify(meta))
fs.writeFileSync(path.join(OUT, 'search.json'), JSON.stringify({ v: 1, entries: searchEntries }))

const kb = (p) => `${(fs.statSync(p).size / 1024).toFixed(0)} KB`
console.log(`chapters: ${chapters.length}, entries: ${stat.entries}`)
console.log(`grades: ${JSON.stringify(stat.grades)}  ratio: ${JSON.stringify(stat.ratio)}`)
console.log(`controversial: ${stat.controversial}  links: ${stat.links}  commit: ${commit.slice(0, 8)}`)
console.log(`meta.json ${kb(path.join(OUT, 'meta.json'))}, search.json ${kb(path.join(OUT, 'search.json'))}`)
const bad = chapters.filter((c) => c.entries.length === 0 || !c.intro)
if (bad.length) warn(`空章或空导语：${bad.map((c) => c.n).join(',')}`)
if (warnings.length) console.log(`WARNINGS (${warnings.length}):\n- ${warnings.join('\n- ')}`)
