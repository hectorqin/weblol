const http = require('http');

// 通过 CDP 驱动 Chromium
const TARGET = 'http://localhost:8765/index.html';

// 启动 Chromium headless 并让它可以接受 CDP
const { spawn } = require('child_process');
const PORT = 9333;
const child = spawn('google-chrome', [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--remote-debugging-port=' + PORT,
  '--window-size=1280,720',
  'about:blank'
], { stdio: 'ignore' });

setTimeout(connect, 1500);

function connect() {
  http.get('http://localhost:' + PORT + '/json', res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      const tabs = JSON.parse(d);
      const tab = tabs.find(t => t.type === 'page') || tabs[0];
      attach(tab.webSocketDebuggerUrl, tab.id);
    });
  });
}

let ws, seq = 0, callbacks = {}, events = [];
function send(method, params) {
  return new Promise(resolve => {
    const id = ++seq;
    callbacks[id] = resolve;
    ws.send(JSON.stringify({ id, method, params }));
  });
}
function attach(url) {
  const WebSocket = require('ws');
  ws = new WebSocket(url);
  ws.on('open', run);
  ws.on('message', m => {
    const msg = JSON.parse(m);
    if (msg.id && callbacks[msg.id]) callbacks[msg.id](msg.result);
    if (msg.method === 'Runtime.exceptionThrown') {
      events.push('EXCEPTION: ' + msg.params.exceptionDetails.text + ' @ ' + (msg.params.exceptionDetails.exception?.description || ''));
    }
    if (msg.method === 'Runtime.consoleAPICalled') {
      const txt = msg.params.args.map(a => a.value ?? a.description ?? '').join(' ');
      events.push('[console.' + msg.params.type + '] ' + txt);
    }
  });
}

async function evalExpr(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
  return r.result;
}

async function run() {
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Page.navigate', { url: TARGET });

  // 等待加载
  await new Promise(r => setTimeout(r, 5000));

  // 检查关键对象是否存在
  const checks = [
    ['THREE loaded', 'typeof THREE'],
    ['module math2d', 'typeof __M["math2d"]'],
    ['module combat', 'typeof __M["combat"]'],
    ['player p1', 'typeof p1'],
    ['player p2', 'typeof p2'],
    ['canvas', 'document.querySelectorAll("canvas").length'],
  ];
  console.log('=== 初始化检查 ===');
  for (const [name, expr] of checks) {
    const r = await evalExpr(expr);
    console.log(name + ':', JSON.stringify(r));
  }

  // 检查是否有报错
  await new Promise(r => setTimeout(r, 1000));
  console.log('\n=== 事件日志 ===');
  if (events.length === 0) console.log('（无异常）');
  else events.forEach(e => console.log(e));

  // 模拟按键，确认输入层工作
  console.log('\n=== 模拟操作 ===');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', code: 'KeyD', key: 'd' });
  await new Promise(r => setTimeout(r, 500));
  const px = await evalExpr('p1.x');
  console.log('P1 按下 D 后 x =', px.value);
  await send('Input.dispatchKeyEvent', { type: 'keyUp', code: 'KeyD', key: 'd' });

  // 检查 HP / 水晶状态
  const st = await evalExpr('JSON.stringify({p1hp:p1.hp, p2hp:p2.hp, blue:crystals.blue, red:crystals.red, kills:[p1.kills,p2.kills]})');
  console.log('状态:', st.value);

  await send('Browser.close');
  child.kill();
  process.exit(0);
}
