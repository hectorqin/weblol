import { crystals } from './entities.js';

function bar(w) {
  return `<div class="bar"><i style="width:${Math.max(0, Math.min(100, w))}%"></i></div>`;
}

function cd(p, key, label) {
  const v = p.cd[key];
  const cls = v > 0 ? 'cd-flash' : '';
  return `<div class="${cls}">${label}: ${v > 0 ? v.toFixed(1) + 's' : '就绪'}</div>`;
}

export function drawHud(p1, p2, state) {
  const el = document.getElementById('hud');
  const hp1 = (p1.hp / p1.maxHp) * 100;
  const hp2 = (p2.hp / p2.maxHp) * 100;

  let result = '';
  if (state.phase === 'over') {
    result = `<div class="result">
      <div class="title">${state.winner}</div>
      <div class="sub">按 Enter 再来一局</div>
    </div>`;
  }

  el.innerHTML = `
    <div class="top">
      <div class="side">
        <div class="hero" style="color:#64b5f6">${p1.hero.name}（P1）</div>
        ${bar(hp1)}
        <div class="info">击杀 ${p1.kills}${p1.alive ? '' : '　复活 ' + p1.respawn.toFixed(1) + 's'}</div>
        <div class="cooldowns">
          ${cd(p1, 'Q', p1.hero.skills.Q.name)}
          ${cd(p1, 'E', p1.hero.skills.E.name)}
          ${cd(p1, 'flash', '闪现')}${cd(p1, 'snowball', '雪球')}
        </div>
      </div>
      <div class="center">
        <div>水晶</div>
        <div class="crystal" style="color:#90caf9">蓝方 ${crystals.blue}</div>
        <div class="crystal" style="color:#ef9a9a">红方 ${crystals.red}</div>
      </div>
      <div class="side right">
        <div class="hero" style="color:#ef5350">${p2.hero.name}（P2）</div>
        ${bar(hp2)}
        <div class="info">击杀 ${p2.kills}${p2.alive ? '' : '　复活 ' + p2.respawn.toFixed(1) + 's'}</div>
        <div class="cooldowns">
          ${cd(p2, 'Q', p2.hero.skills.Q.name)}
          ${cd(p2, 'E', p2.hero.skills.E.name)}
          ${cd(p2, 'flash', '闪现')}${cd(p2, 'snowball', '雪球')}
        </div>
      </div>
    </div>
    ${result}
  `;
}

export function checkWin(p1, p2) {
  if (crystals.blue <= 0) return p2.hero.name;
  if (crystals.red <= 0)  return p1.hero.name;
  if (p1.kills >= 5) return p1.hero.name;
  if (p2.kills >= 5) return p2.hero.name;
  return null;
}
