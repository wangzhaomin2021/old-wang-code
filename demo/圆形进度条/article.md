# 圆形进度条-canvas 版

## 效果图

## 实现原理

> 利用 canvas 的绘制路径方法，绘制一个圆弧，并设置圆弧的起始角度和结束角度

## 代码实现

**圆环基本绘制代码实现**

```js
const ctx = cnv.getContext("2d");
const cnvWidth = cnv.width; // 画布宽度
const cnvHeight = cnv.height; // 画布高度
const r = 160; // 圆环半径
const center_x = cnvWidth / 2; // 圆环圆心x坐标
const center_y = cnvHeight / 2; // 圆环圆心y坐标
let timer = null; // 动画定时器接收

// 绘制圆环
function drawProgress(ctx, r, startAngle, endAngle, color) {
  // 清空画布
  ctx.clearRect(0, 0, cnvWidth, cnvHeight);
  ctx.save(); // 保存状态
  ctx.translate(center_x, center_y); // 移动画布原点到圆环圆心
  ctx.rotate(-Math.PI / 2); // 旋转画布方形到12点钟方形
  ctx.beginPath(); // 开始绘制路径
  ctx.arc(0, 0, r, startAngle, endAngle, false);
  ctx.lineWidth = 20;
  ctx.lineCap = "round"; // 设置线条的结束端点样式 两端圆形状
  ctx.strokeStyle = color; // 圆环颜色
  ctx.stroke();
  ctx.restore(); // 恢复状态
}
```

**完整代码**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>圆形进度条-canvas版</title>
    <link rel="stylesheet" href="../common.css" />
    <style>
      canvas {
        display: block;
        margin: 100px auto;
        background-color: black;
      }
      .angle {
        text-align: center;
      }
    </style>
  </head>
  <body>
    <canvas id="cnv" width="600" height="400"></canvas>
    <div class="angle">
      进度：
      <input id="ipt" type="number" min="0" max="100" step="1" value="30" />
      动画速度：
      <input id="rate" type="number" min="0" max="100" step="1" value="5" />
    </div>

    <script>
      const ctx = cnv.getContext("2d");
      const cnvWidth = cnv.width;
      const cnvHeight = cnv.height;
      const r = 160;
      const center_x = cnvWidth / 2;
      const center_y = cnvHeight / 2;
      let timer = null;

      const getAngle = () => {
        return (Math.PI * 2 * Math.min(parseFloat(ipt.value) || 0, 100)) / 100;
      };

      const getRate = () => {
        return Math.min(parseFloat(rate.value) || 0, 100) / 100;
      };

      // 绘制进度条
      function drawProgress(ctx, r, startAngle, endAngle, color) {
        ctx.clearRect(0, 0, cnvWidth, cnvHeight);
        ctx.save();
        ctx.translate(center_x, center_y);
        ctx.rotate(-Math.PI / 2);
        ctx.beginPath();
        ctx.arc(0, 0, r, startAngle, endAngle, false);
        ctx.lineWidth = 20;
        ctx.lineCap = "round";
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.restore();
      }

      // 圆弧绘制（带动画） 基于 `requestAnimationFrame`
      function draw(ctx, r, startAngle, endAngle, color, rate) {
        if (timer) cancelAnimationFrame(timer);
        const angle = 0;
        if (endAngle === 0) return ctx.clearRect(0, 0, cnvWidth, cnvHeight);

        drawFrame(ctx, r, startAngle, endAngle, color, angle, rate);
      }

      function drawFrame(ctx, r, startAngle, endAngle, color, angle, rate) {
        timer = requestAnimationFrame(function () {
          drawProgress(ctx, r, startAngle, angle, color);
          if (angle === endAngle) {
            cancelAnimationFrame(timer);
            timer = null;
            return;
          }

          if (angle + rate < endAngle) {
            angle += rate;
          } else {
            angle = endAngle;
          }

          drawFrame(ctx, r, startAngle, endAngle, color, angle, rate);
        });
      }

      // 初始绘制
      draw(ctx, r, 0, getAngle(), "blue", getRate());

      // 监听进度变化
      ipt.addEventListener("change", () => {
        draw(ctx, r, 0, getAngle(), "blue", getRate());
      });

      // 监听动画速度变化
      rate.addEventListener("change", () => {
        draw(ctx, r, 0, getAngle(), "blue", getRate());
      });
    </script>
  </body>
</html>
```
