/**
 * 构建后处理：为每个路由生成带正确 SEO head 的静态 HTML 入口
 *
 * 解决的问题：SPA 的 index.html 里 head 是中文兜底，英文页面 /en/* 的
 * title/description 原本只能靠 JS 注入。对不执行 JS 或渲染延迟的抓取器，
 * 英文页会被当作中文页。此脚本在构建产物中按路由写入对应语言的 head。
 *
 * 产物：
 *   dist/index.html                    中文首页
 *   dist/<route>/index.html            中文内页
 *   dist/en/index.html                 英文首页
 *   dist/en/<route>/index.html         英文内页
 *   dist/404.html                      兜底页（沿用原 head）
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const DIST = 'dist'
const ORIGIN = 'https://www.md2tool.com'

/** 路由（相对路径，空串代表首页）与 SEO 配置键的映射，需与 src/App.tsx 保持一致 */
const ROUTES = [
  ['', 'home'],
  ['word-to-markdown', 'wordToMarkdown'],
  ['markdown-to-html', 'markdownToHtml'],
  ['html-to-markdown', 'htmlToMarkdown'],
  ['markdown-to-pdf', 'markdownToPdf'],
  ['markdown-to-excel', 'markdownToExcel'],
  ['help', 'help'],
  ['about', 'about'],
  ['contact', 'contact'],
  ['privacy-policy', 'privacyPolicy'],
]

const source = join(DIST, 'index.html')
if (!existsSync(source)) {
  console.error('未找到 dist/index.html，请先执行 vite build')
  process.exit(1)
}

/**
 * 从 seo.ts 源码中提取 SEO_CONFIGS 对象字面量
 *
 * 不直接 import seo.ts 的原因：该文件连带引入了 React / lucide-react 等
 * 浏览器依赖，在纯 Node 构建脚本里无法加载。这里只取纯数据部分。
 */
function loadSeoConfigs() {
  const src = readFileSync('src/utils/seo.ts', 'utf8')
  const idx = src.indexOf('export const SEO_CONFIGS')
  if (idx === -1) throw new Error('seo.ts 中未找到 SEO_CONFIGS')

  const braceStart = src.indexOf('{', idx)
  let depth = 0
  let end = -1
  for (let i = braceStart; i < src.length; i++) {
    if (src[i] === '{') depth++
    else if (src[i] === '}') {
      depth--
      if (depth === 0) { end = i; break }
    }
  }
  if (end === -1) throw new Error('SEO_CONFIGS 对象字面量不完整')

  const literal = src.slice(braceStart, end + 1)
  return new Function(`return ${literal}`)()
}

const SEO_CONFIGS = loadSeoConfigs()

if (!SEO_CONFIGS) {
  console.error('未能从 seo.ts 读取 SEO_CONFIGS')
  process.exit(1)
}

/** HTML 属性转义 */
function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** 生成某语言下某路由的绝对地址 */
function urlFor(lang, route) {
  if (lang === 'en') return route ? `${ORIGIN}/en/${route}` : `${ORIGIN}/en`
  return route ? `${ORIGIN}/${route}` : `${ORIGIN}/`
}

/**
 * 用指定配置替换模板中的 head 信息
 * @param {string} template 原始 index.html
 * @param {'zh'|'en'} lang 目标语言
 * @param {string} route 相对路由（空串为首页）
 */
function render(template, lang, route) {
  const cfg = SEO_CONFIGS[route ? ROUTES.find(([r]) => r === route)[1] : 'home'][lang]
  const canonical = urlFor(lang, route)
  const zhUrl = urlFor('zh', route)
  const enUrl = urlFor('en', route)

  let html = template

  // html lang
  html = html.replace(/<html lang="[^"]*">/, `<html lang="${lang === 'en' ? 'en' : 'zh-CN'}">`)

  // title
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(cfg.title)}</title>`)

  // 基础 meta
  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${esc(cfg.description)}"`
  )
  if (cfg.keywords) {
    html = html.replace(
      /<meta name="keywords" content="[^"]*"/,
      `<meta name="keywords" content="${esc(cfg.keywords)}"`
    )
  }

  // canonical
  html = html.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${canonical}"`
  )

  // Open Graph
  html = html.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${esc(cfg.title)}"`
  )
  html = html.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${esc(cfg.description)}"`
  )
  html = html.replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="${canonical}"`
  )

  // Twitter
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${esc(cfg.title)}"`
  )
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${esc(cfg.description)}"`
  )

  // og:locale 与 hreflang 互指（原 index.html 没有，构建时补充）
  const extra = [
    `<meta property="og:locale" content="${lang === 'en' ? 'en_US' : 'zh_CN'}" />`,
    `<meta property="og:locale:alternate" content="${lang === 'en' ? 'zh_CN' : 'en_US'}" />`,
    `<link rel="alternate" hreflang="zh-CN" href="${zhUrl}" />`,
    `<link rel="alternate" hreflang="en" href="${enUrl}" />`,
    `<link rel="alternate" hreflang="x-default" href="${zhUrl}" />`,
  ].join('\n    ')
  html = html.replace(/<link rel="canonical"[^>]*>/, (m) => `${m}\n    ${extra}`)

  return html
}

const template = readFileSync(source, 'utf8')
let count = 0

for (const [route] of ROUTES) {
  for (const lang of /** @type {const} */ (['zh', 'en'])) {
    const html = render(template, lang, route)

    // 目标文件路径
    const segments = []
    if (lang === 'en') segments.push('en')
    if (route) segments.push(route)

    if (segments.length === 0) {
      // 中文首页直接覆盖 dist/index.html
      writeFileSync(join(DIST, 'index.html'), html)
    } else {
      // 输出为 <route>.html 而非 <route>/index.html
      // 避免 Cloudflare Pages 对目录路径做 308 尾斜杠重定向（/en -> /en/）
      const dir = join(DIST, ...segments.slice(0, -1))
      const file = join(dir, `${segments[segments.length - 1]}.html`)
      mkdirSync(dir, { recursive: true })
      writeFileSync(file, html)
    }
    count++
  }
}

// 404 兜底沿用中文首页 head
writeFileSync(join(DIST, '404.html'), readFileSync(join(DIST, 'index.html'), 'utf8'))

console.log(`已为 ${count} 个路由写入静态 SEO head（含 og:locale / hreflang）`)
