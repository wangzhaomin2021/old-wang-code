## 主角介绍

`tiny-emitter` 是一个轻量级的事件发射器工具库，主要用于实现基于监听/发布者模式的简易事件派发和接收器。通过使用 Tiny-emitter，你可以轻松地实现发布订阅模式，以完成事件的处理、传递和响应。

Tiny-emitter 的核心函数包括 `on`、`once`、`emit` 和 `off`，分别用于订阅事件、订阅一次事件、触发事件以及取消订阅事件。通过这些函数，你可以方便地定义事件的处理方式，并控制事件的触发和传播。

## 摸索阶段

- 每个函数都返回this，可以链式调用
- 代码简洁凝练，容易阅读，最好自己写一遍练练

```js
function E () {}

E.prototype = {
  on: function (name, callback, ctx) {
    var e = this.e || (this.e = {});

    (e[name] || (e[name] = [])).push({
      fn: callback,
      ctx: ctx
    });

    return this;
  },

  once: function (name, callback, ctx) {
    var self = this;
    function listener () {
      self.off(name, listener); // 第一次执行就移除订阅达到订阅一次的效果
      callback.apply(ctx, arguments);
    };

    listener._ = callback // 将用户传入的回调包装，挂载在listener的_属性下，方便后面移除订阅
    return this.on(name, listener, ctx);
  },

  emit: function (name) {
    var data = [].slice.call(arguments, 1);
    var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
    var i = 0;
    var len = evtArr.length;

    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }

    return this;
  },

  off: function (name, callback) {
    var e = this.e || (this.e = {});
    var evts = e[name];
    var liveEvents = [];

    if (evts && callback) {
      for (var i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback && evts[i].fn._ !== callback)
          liveEvents.push(evts[i]);
      }
    }

    // Remove event from queue to prevent memory leak
    (liveEvents.length)
      ? e[name] = liveEvents
      : delete e[name];

    return this;
  }
};

module.exports = E;
module.exports.TinyEmitter = E;
```


## 盘它（实操）

### example 针眼观影

``` html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>针眼观影</title>
  <style>
    * {
      margin: 0;
      padding: 0;
    }

    .movie-container {
      position: relative;
      width: 80vw;
      height: 60vh;
      margin: 60px auto;
      border: 2px dotted orange;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: gray;
      & video {
        width: 100%;
        height: 100%;
        clip-path: circle(50px at 50% 50%);
      }
    }
  </style>
</head>
<body>
  <div class="movie-container">
    <video controls></video>
  </div>
  <div class="control">
    <div>选择视频<input type="file"></div>
    <div>针眼大小<input type="range" name="size" value="30" max="300"></div>
    <div>水平位置<input type="range" name="xpos" value="50"></div>
    <div>垂直位置<input type="range" name="ypos" value="50"></div>
  </div>

  <script>
    const oVideo = document.querySelector('video');
    const oSize = document.querySelector('input[type="range"][name="size"]');
    const oXpos = document.querySelector('input[type="range"][name="xpos"]');
    const oYpos = document.querySelector('input[type="range"][name="ypos"]');
    const oFile = document.querySelector('input[type="file"]');

    oFile.addEventListener('change', () => {
      const file = oFile.files[0];
      if (file) {
        console.log(file)
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = (e) => {
          oVideo.setAttribute('src', fileReader.result);
        }
      }
    })

    oVideo.addEventListener('canplay', () => {
      oVideo.play();
    })

    oSize.addEventListener('input', setClipPath);

    oXpos.addEventListener('input', setClipPath);

    oYpos.addEventListener('input', setClipPath);

    function setClipPath() {
      const size = oSize.value;
      const xpos = oXpos.value;
      const ypos = oYpos.value;
      const clipPath = `circle(${size}px at ${xpos}% ${ypos}%)`;
      oVideo.style.clipPath = clipPath;
    }

  </script>
</body>
</html>
```

> 各位不好意思，盘错了，上面写着写着发现没用上`tiny-emitter`,也懒得删掉（撑下字数）我们下面来一个简单的例子意思一下，不过上面的例子也不是和今天的主角没关系，不过是利用了dom自带的事件系统（发布订阅）完成了

### example2 猜数字

``` js
const readline = require('node:readline/promises');
const E = require('tiny-emitter');

const num = (Math.random() * 100).toFixed(0) * 1;
const e = new E();
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

e.on('大了', () => {
  console.log('大了');
  question('再来~~~\n');
});

e.on('小了', () => {
  console.log('小了');
  question('再来~~~\n');
});

e.on('猜对了', () => {
  console.log('猜对了');
  rl.close();
});

async function question(ques = '请猜一个0-99的整数\n') {
  const answer = parseInt(await rl.question(ques));
  if (Number.isNaN(answer)) {
    console.log('输入数字啊！！！');
    return question('再来~~~');
  }

  if (answer === num) {
    e.emit('猜对了');
  } else if (answer > num) {
    e.emit('大了');
  } else {
    e.emit('小了');
  }
}

question();
```
