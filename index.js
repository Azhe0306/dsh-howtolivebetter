/**
 * 宿主半边。
 *
 * 只做一件事：把 tools/build-data.mjs 预生成的 JSON 挂在同源只读接口上，
 * 浏览器半边（client.js）按需取用。正文本身不在这里解析，也不联网——
 * 数据已经随包发布在 ./data 下，改了源仓库就重跑一次生成脚本。
 *
 *   GET|HEAD /howtolivebetter/api/meta
 *   GET|HEAD /howtolivebetter/api/search
 *   GET|HEAD /howtolivebetter/api/chapter/<1..34>
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const name = 'howtolivebetter'
export const inject = ['webServer']

const HERE = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(HERE, 'data')
const CHAPTER_DIR = join(DATA_DIR, 'chapters')
const API_PATH = '/howtolivebetter/api'
// 前缀路由的 path 不能带结尾斜杠：宿主按 `pathname === path || pathname.startsWith(path + '/')`
// 匹配（dsh-host-webserver lib/index.js match()），带斜杠就永远匹配不上。
const CHAPTER_PREFIX = `${API_PATH}/chapter`

/** 章节号 -> 文件名，启动时扫一次，之后只读缓存。 */
let chapterFiles = null

function readChapterFiles() {
  if (chapterFiles) return chapterFiles
  if (!existsSync(CHAPTER_DIR)) {
    throw new Error(
      '[howtolivebetter] 缺少数据目录 data/：请在插件目录里跑一次 `node tools/build-data.mjs`。',
    )
  }
  const map = new Map()
  for (const file of readdirSync(CHAPTER_DIR)) {
    const match = /^(\d+)\.json$/.exec(file)
    if (match) map.set(Number(match[1]), join(CHAPTER_DIR, file))
  }
  if (map.size === 0) {
    throw new Error('[howtolivebetter] data/chapters 是空的：请重跑 `node tools/build-data.mjs`。')
  }
  chapterFiles = map
  return map
}

function readJson(file, cache) {
  if (cache.has(file)) return cache.get(file)
  const value = JSON.parse(readFileSync(file, 'utf8'))
  cache.set(file, value)
  return value
}

const jsonCache = new Map()

function sendJson(response, status, body, method) {
  const text = JSON.stringify(body)
  response.statusCode = status
  response.setHeader('content-type', 'application/json; charset=utf-8')
  // 正文随包发布、不进浏览器缓存，避免重跑生成脚本后还看到旧数据。
  response.setHeader('cache-control', 'no-store')
  response.setHeader('x-content-type-options', 'nosniff')
  response.setHeader('content-length', String(Buffer.byteLength(text)))
  if (method === 'HEAD') {
    response.end()
    return
  }
  response.end(text)
}

function sendJsonError(response, status, message, method) {
  sendJson(response, status, { error: message }, method)
}

function methodOf(request) {
  const method = String(request.method || 'GET').toUpperCase()
  return method
}

export function apply(ctx) {
  readChapterFiles()

  const handlers = [
    ['exact', `${API_PATH}/meta`, (request, response) => {
      sendJson(response, 200, readJson(join(DATA_DIR, 'meta.json'), jsonCache), methodOf(request))
    }],
    ['exact', `${API_PATH}/search`, (request, response) => {
      sendJson(response, 200, readJson(join(DATA_DIR, 'search.json'), jsonCache), methodOf(request))
    }],
    ['prefix', CHAPTER_PREFIX, (request, response) => {
      const method = methodOf(request)
      const pathname = new URL(String(request.url || '/'), 'http://localhost').pathname
      const raw = pathname.slice(CHAPTER_PREFIX.length + 1).replace(/\/+$/, '')
      const number = /^\d{1,3}$/.test(raw) ? Number(raw) : NaN
      const file = Number.isInteger(number) ? readChapterFiles().get(number) : undefined
      if (!file) {
        sendJsonError(response, 404, `没有第 ${raw || '?'} 节`, method)
        return
      }
      sendJson(response, 200, readJson(file, jsonCache), method)
    }],
  ]

  ctx.effect(() => {
    const disposers = []
    for (const [kind, path, handler] of handlers) {
      disposers.push(
        ctx.webServer.register({
          kind,
          path,
          handler: async (request, response) => {
            const method = methodOf(request)
            if (method !== 'GET' && method !== 'HEAD') {
              sendJsonError(response, 405, '只提供 GET/HEAD', method)
              return
            }
            try {
              handler(request, response)
            } catch (error) {
              console.error('[howtolivebetter] 接口出错：', error)
              if (!response.headersSent) {
                sendJsonError(response, 500, '内部错误', method)
              } else {
                response.end()
              }
            }
          },
        }),
      )
    }
    return () => {
      for (const dispose of disposers.splice(0)) dispose()
    }
  }, 'howtolivebetter: 只读数据接口')
}
