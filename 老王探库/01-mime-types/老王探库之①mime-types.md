## 主角介绍

`mime-types` 是一个 JavaScript 库，用于确定文件的 MIME 类型。它可以帮助你在 web 应用程序中处理文件上传和下载，特别是在需要基于文件类型执行特定操作的情况下。

这个库的主要功能如下：

- **获取 MIME 类型**：通过文件扩展名，你可以使用 mime-types 库来获取相应的 MIME 类型。例如，对于一个 .jpg 文件，库会返回 'image/jpeg'。
- **类型验证**：mime-types 库也允许你验证一个给定的 MIME 类型是否是已知的类型。
- **匹配**：库还提供了一种方法来查找与一组给定 MIME 类型匹配的所有扩展名。

这个库非常适合在 Node.js 或浏览器环境中使用，尤其在处理上传和下载文件时，需要确定文件的 MIME 类型以进行适当的操作。

## 摸索阶段

```js
// db对象结构如下图展示 是一个对象，mime类型作为key，value是相应的信息
var db = require('mime-db')
// nodejs 的api 获取拓展名的
var extname = require('path').extname

// 正则 匹配MIME（MIME结构：  xxx/xxx）
// `text/html` or `text/html; charset=utf8` ...
var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/

// 正则 匹配文本类型的mime
var TEXT_TYPE_REGEXP = /^text\//i

exports.charset = charset
exports.charsets = { lookup: charset }
exports.contentType = contentType
exports.extension = extension
exports.extensions = Object.create(null)
exports.lookup = lookup
exports.types = Object.create(null)

// Populate 填充 the extensions/types maps
populateMaps(exports.extensions, exports.types)
```

看它的导出，知道它主要是由`charset`, `contentType`, `lookup`, `extension`, `populateMaps`5个函数组成。

**其中db的结构**

```js
{
  "application/1d-interleaved-parityfec": {
    "source": "iana"
  },
  "application/3gpdash-qoe-report+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
    "image/png": {
    "source": "iana",
    "compressible": false,
    "extensions": ["png"]
  },
  ...
}
```

### populateMaps函数：工具函数

`这边就是根据db的数据倒腾了一下，以不同的数据结构形式展现而已，可以自己打印出来看看具体结构`

```js
function populateMaps (extensions, types) {
  // source preference (least -> most)
  var preference = ['nginx', 'apache', undefined, 'iana']

  Object.keys(db).forEach(function forEachMimeType (type) {
    var mime = db[type]
    var exts = mime.extensions

    if (!exts || !exts.length) {
      return
    }

    // mime -> extensions
    extensions[type] = exts

    // extension -> mime
    for (var i = 0; i < exts.length; i++) {
      var extension = exts[i]

      if (types[extension]) {
        var from = preference.indexOf(db[types[extension]].source)
        var to = preference.indexOf(mime.source)

        if (types[extension] !== 'application/octet-stream' &&
          (from > to || (from === to && types[extension].substr(0, 12) === 'application/'))) {
          // skip the remapping
          continue
        }
      }

      // set the extension -> mime
      types[extension] = type
    }
  })
}
```

### charset函数：获取MIME类型的默认字符集

1. 根据传入的type获得mime
2. 如果db对象内对应的mime的值有charset，则返回
3. 没有对应charset的话，则判断是否是文本类mime，是的话返回utf-8

```js
function charset (type) {
  if (!type || typeof type !== 'string') {
    return false
  }

  // TODO: use media-typer
  var match = EXTRACT_TYPE_REGEXP.exec(type)
  // 1.
  var mime = match && db[match[1].toLowerCase()]

  if (mime && mime.charset) {
    // 2.
    return mime.charset
  }

  // default text/* to utf-8
  if (match && TEXT_TYPE_REGEXP.test(match[1])) {
   // 3.
    return 'UTF-8'
  }

  return false
}
```

### lookup函数： 查询MIME类型

1. 根据传入的path获取拓展名
2. 然后从db加工后的types（由extension指向mime的对象，如{png: "image/png", ...}）查找对应的mime类型

```js
function lookup (path) {
  if (!path || typeof path !== 'string') {
    return false
  }

  // get the extension ("ext" or ".ext" or full path)
  var extension = extname('x.' + path)
    .toLowerCase()
    .substr(1)

  if (!extension) {
    return false
  }

  return exports.types[extension] || false
}
```

### extension函数：查询MIME类型对应的扩展名

1. 根据传入的type由正则匹配出mime类型
2. db的mime对应的值有extensions的话取出第一个，否则返回false

```js
function extension (type) {
  if (!type || typeof type !== 'string') {
    return false
  }

  var match = EXTRACT_TYPE_REGEXP.exec(type)

  var exts = match && exports.extensions[match[1].toLowerCase()]

  if (!exts || !exts.length) {
    return false
  }

  return exts[0]
}
```

### contentType函数: 获取内容的类型

`在http请求中，请求头与响应头都有Content-Type，用来描述传递数据的类型`

1. 调用lookup查出mime
2. mime存在且str没有指定字符集且mime对应有默认的字符集的话会自动拼接上字符集

```js
function contentType (str) {
  // TODO: should this even be in this module?
  if (!str || typeof str !== 'string') {
    return false
  }

  var mime = str.indexOf('/') === -1
    ? exports.lookup(str)
    : str

  if (!mime) {
    return false
  }

  // TODO: use content-type or other module
  if (mime.indexOf('charset') === -1) {
    var charset = exports.charset(mime)
    if (charset) mime += '; charset=' + charset.toLowerCase()
  }

  return mime
}
```

## 盘它（实操）

### example 写一个js文件用来判断文件的MIME类型[获取源码](https://gitee.com/wzm_gitee/old-wang-code)

- 使用nodejs运行
- node 该js文件 待检查文件的路径[可以是绝对路径或者相对路径，相对于node命令的执行位置]

```js
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
```
