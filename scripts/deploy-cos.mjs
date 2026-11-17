/**
 * 上传 dist 目录到腾讯云 COS，并按文件类型设置 Content-Type 与缓存策略
 * 运行：node scripts/deploy-cos.mjs
 * 配置来源：.env.cos.local
 */
import COS from 'cos-nodejs-sdk-v5'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, extname, sep } from 'node:path'

const DIST = 'dist'
const ENV_FILE = '.env.cos.local'

// ---------- 读取配置 ----------
if (!existsSync(ENV_FILE)) {
  console.error(`缺少配置文件 ${ENV_FILE}`)
  process.exit(1)
}

const env = {}
for (const line of readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const idx = trimmed.indexOf('=')
  if (idx === -1) continue
  env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim()
}

const { COS_SECRET_ID, COS_SECRET_KEY, COS_BUCKET, COS_REGION } = env
const missing = ['COS_SECRET_ID', 'COS_SECRET_KEY', 'COS_BUCKET', 'COS_REGION'].filter(
  (key) => !env[key],
)
if (missing.length) {
  console.error(`配置不完整，缺少：${missing.join('、')}`)
  process.exit(1)
}

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('未找到 dist/index.html，请先执行 npm run build:cos')
  process.exit(1)
}

// ---------- MIME 与缓存策略 ----------
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
}

// 带 hash 的静态资源长缓存；HTML 不缓存以便及时更新
function cacheControlFor(key, ext) {
  if (ext === '.html') return 'no-cache, no-store, must-revalidate'
  if (key.startsWith('assets/')) return 'public, max-age=31536000, immutable'
  if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico'].includes(ext)) {
    return 'public, max-age=604800'
  }
  return 'public, max-age=3600'
}

// Cloudflare 专用文件，COS 上无效，不参与上传
const EXCLUDE = new Set(['_headers', '_redirects'])

// ---------- 收集本地文件 ----------
function walk(dir, base = dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      walk(full, base, out)
    } else {
      out.push(relative(base, full).split(sep).join('/'))
    }
  }
  return out
}

const files = walk(DIST).filter((key) => !EXCLUDE.has(key))
console.log(`待上传文件：${files.length} 个`)

// ---------- 上传 ----------
const cos = new COS({ SecretId: COS_SECRET_ID, SecretKey: COS_SECRET_KEY })

const CONCURRENCY = 8
let cursor = 0
let done = 0
const failures = []

function uploadOne(key) {
  const ext = extname(key).toLowerCase()
  return new Promise((resolve) => {
    cos.putObject(
      {
        Bucket: COS_BUCKET,
        Region: COS_REGION,
        Key: key,
        Body: readFileSync(join(DIST, key)),
        // 静态网站端点只认对象级 ACL，桶级 public-read 不够
        ACL: 'public-read',
        ContentType: MIME_TYPES[ext] || 'application/octet-stream',
        CacheControl: cacheControlFor(key, ext),
      },
      (err) => {
        if (err) {
          failures.push({ key, message: err.message })
          console.error(`上传失败 ${key}: ${err.message}`)
        } else {
          done++
          if (done % 20 === 0 || done === files.length) {
            console.log(`进度 ${done}/${files.length}`)
          }
        }
        resolve()
      },
    )
  })
}

async function worker() {
  while (cursor < files.length) {
    const key = files[cursor++]
    await uploadOne(key)
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()))

// ---------- 静态网站配置（无权限时仅提示，可在控制台手动设置）----------
try {
  await new Promise((resolve, reject) => {
    cos.putBucketWebsite(
      {
        Bucket: COS_BUCKET,
        Region: COS_REGION,
        WebsiteConfiguration: {
          IndexDocument: { Suffix: 'index.html' },
          ErrorDocument: { Key: '404.html' },
        },
      },
      (err, data) => (err ? reject(err) : resolve(data)),
    )
  })
  console.log('静态网站配置已写入：索引文档 index.html / 错误文档 404.html')
} catch (err) {
  console.warn(`静态网站配置未写入（${err.message}），请在 COS 控制台手动设置`)
}

// ---------- 结果 ----------
console.log('')
if (failures.length) {
  console.error(`完成，但有 ${failures.length} 个文件失败：`)
  for (const f of failures.slice(0, 10)) console.error(`  ${f.key} - ${f.message}`)
  process.exit(1)
}

console.log(`全部上传成功，共 ${files.length} 个文件`)
console.log(`临时访问地址（仅 HTTP）：http://${COS_BUCKET}.cos-website.${COS_REGION}.myqcloud.com/`)
