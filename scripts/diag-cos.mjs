/**
 * COS 连接与权限诊断（不打印密钥）
 */
import COS from 'cos-nodejs-sdk-v5'
import { existsSync, readFileSync } from 'node:fs'

const ENV_FILE = '.env.cos.local'
if (!existsSync(ENV_FILE)) {
  console.error(`缺少 ${ENV_FILE}`)
  process.exit(1)
}

const env = {}
for (const line of readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
  const t = line.trim()
  if (!t || t.startsWith('#')) continue
  const i = t.indexOf('=')
  if (i === -1) continue
  env[t.slice(0, i).trim()] = t.slice(i + 1).trim()
}

const id = env.COS_SECRET_ID || ''
const key = env.COS_SECRET_KEY || ''
const bucket = env.COS_BUCKET || ''
const region = env.COS_REGION || ''

console.log('配置检查：')
console.log(`  SecretId   长度 ${id.length}，前缀 ${id.slice(0, 4)}，结尾 ${id.slice(-4)}`)
console.log(`  SecretKey  长度 ${key.length}`)
console.log(`  Bucket     ${bucket}`)
console.log(`  Region     ${region}`)
console.log('')

const cos = new COS({ SecretId: id, SecretKey: key })

function run(label, fn) {
  return new Promise((resolve) => {
    fn((err, data) => {
      if (err) {
        console.log(`[失败] ${label}`)
        console.log(`       code=${err.code} status=${err.statusCode}`)
        console.log(`       message=${err.message}`)
      } else {
        console.log(`[成功] ${label}`)
        if (data && typeof data === 'object') {
          const keys = Object.keys(data).slice(0, 5)
          if (keys.length) console.log(`       ${JSON.stringify(data)[0] === '[' ? '' : ''}字段: ${keys.join(', ')}`)
        }
      }
      resolve()
    })
  })
}

// 1. 列出该密钥能看到的桶
await run('getService 列出账号下的桶', (cb) => cos.getService({}, cb))

// 2. 桶是否存在 / 是否可访问
await run('headBucket 检查桶', (cb) => cos.headBucket({ Bucket: bucket, Region: region }, cb))

// 3. 尝试列对象，验证读权限
await run('getBucket 列出对象（验证读权限）', (cb) =>
  cos.getBucket({ Bucket: bucket, Region: region, MaxKeys: 5 }, cb),
)

// 4. 尝试写入一个探针文件，验证写权限
await run('putObject 写入探针文件（验证写权限）', (cb) =>
  cos.putObject(
    {
      Bucket: bucket,
      Region: region,
      Key: '.__deploy_probe__.txt',
      Body: Buffer.from('probe'),
      ContentType: 'text/plain',
    },
    cb,
  ),
)
