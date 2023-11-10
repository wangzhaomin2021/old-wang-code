const path = require('node:path')
const fs = require('node:fs/promises')
const { argv, cwd } = require('node:process')
const mime = require('mime-types')

let filepath = argv[2]

if (!filepath) {
  console.error('请输入文件路径')
  process.exit(1)
}

filepath = path.resolve(cwd(), filepath)

fs.stat(filepath).then(stats => {
  if (!stats.isFile()) {
    console.error('请输入文件路径')
    process.exit(1)
  }

  const ext = path.extname(filepath)
  const filename = path.basename(filepath, ext)
  const mimeType = mime.lookup(ext)
  console.log(`===> ${filename}的MIME类型为：${mimeType}`)
}).catch(err => {
  console.error(err)
  process.exit(1)
})