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