/**
 * COS 部署前置处理：
 * 1. 为 SPA 每个路由生成独立的 index.html，避免刷新子页面 404、并保持 200 状态码
 * 2. 生成 404.html 兜底
 * 3. 移除 Cloudflare 专用的 _headers / _redirects
 */
import { existsSync, mkdirSync, copyFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const DIST = 'dist'
const source = join(DIST, 'index.html')

if (!existsSync(source)) {
  console.error('未找到 dist/index.html，请先执行 npm run build')
  process.exit(1)
}

// 与 src/App.tsx 中的路由保持一致
const routes = [
  '',
  'word-to-markdown',
  'markdown-to-html',
  'html-to-markdown',
  'markdown-to-pdf',
  'markdown-to-excel',
  'help',
  'about',
  'contact',
  'privacy-policy',
]

const targets = []
for (const route of routes) {
  if (route) {
    targets.push(route)
    targets.push(`en/${route}`)
  } else {
    targets.push('en')
  }
}

let created = 0
for (const target of targets) {
  const dir = join(DIST, target)
  mkdirSync(dir, { recursive: true })
  copyFileSync(source, join(dir, 'index.html'))
  created++
}

// 404 兜底页
copyFileSync(source, join(DIST, '404.html'))

// Cloudflare 专用文件在 COS 上无效，上传脚本已排除（见 scripts/deploy-cos.mjs）
for (const file of ['_headers', '_redirects']) {
  try {
    rmSync(join(DIST, file), { force: true })
  } catch {
    // 删除失败不影响部署，上传时会跳过
  }
}

console.log(`已生成 ${created} 个路由入口 + 404.html`)
