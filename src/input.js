// 输入层：统一键盘 + 鼠标状态，逻辑层每帧来读，不在事件里改状态
const keys = Object.create(null);
addEventListener('keydown', e => {
  keys[e.code] = true;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
});
addEventListener('keyup', e => { keys[e.code] = false; });

export const mouse = { x: 0, y: 0, down: false };
addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
addEventListener('mousedown', e => { if (e.button === 0) mouse.down = true; });
addEventListener('mouseup',   e => { if (e.button === 0) mouse.down = false; });

export const SCHEMES = {
  p1: { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD',
        q: 'KeyQ', e: 'KeyE', flash: 'Space', snowball: 'KeyF', reroll: 'KeyR' },
  p2: { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight',
        auto: 'Numpad5', q: 'Numpad1', e: 'Numpad2', flash: 'Numpad0', snowball: 'NumpadDecimal', reroll: 'Numpad3' },
};

export const isDown = code => !!keys[code];
