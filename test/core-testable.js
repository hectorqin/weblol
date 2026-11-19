// 可测试的游戏核心：纯数据，无 DOM / Three 依赖
// 复制自 src/combat.js 与 src/math2d.js，把 THREE.Mesh 操作去掉

function dist2(ax, az, bx, bz) { const dx = ax - bx, dz = az - bz; return dx*dx + dz*dz; }
function circleHit(a, b, ra, rb) { const r = ra + rb; return dist2(a.x, a.z, b.x, b.z) <= r*r; }
function clampToBridge(p, halfW, halfL) {
  p.x = Math.max(-halfW, Math.min(halfW, p.x));
  p.z = Math.max(-halfL, Math.min(halfL, p.z));
}

const HALF_W = 4, HALF_L = 20;
const crystals = { blue: 300, red: 300 };

function makeHero() {
  return { color: 0xff0000, hp: 100, speed: 6, auto: { cd: 0.5, dmg: 10 },
           skills: { Q: { type: 'projectile', dmg: 20, speed: 10, radius: 0.3, cd: 2 },
                     E: { type: 'dash', dash: 5, dmg: 10, cd: 3 } } };
}

function createPlayer(hero, side) {
  return { hero, side, x: 0, z: side * 16, facing: 0, hp: hero.hp, maxHp: hero.hp,
           alive: true, respawn: 0, autoCd: 0, cd: { Q:0, E:0, flash:0, snowball:0 },
           slowUntil: 0, slowFactor: 1, kills: 0, __bullets: [] };
}

function updatePlayer(p, input, dt, now, opponent) {
  if (!p.alive) { p.respawn -= dt; if (p.respawn <= 0) revive(p); return; }
  let ix = 0, iz = 0;
  if (input.left) ix -= 1; if (input.right) ix += 1;
  if (input.up) iz -= 1; if (input.down) iz += 1;
  const len = Math.hypot(ix, iz) || 1;
  const slow = now < p.slowUntil ? p.slowFactor : 1;
  const prev = { x: p.x, z: p.z };
  p.x += (ix/len) * p.hero.speed * slow * dt;
  p.z += (iz/len) * p.hero.speed * slow * dt;
  clampToBridge(p, HALF_W, HALF_L);
  p._moved = (prev.x !== p.x || prev.z !== p.z);

  p.facing = Math.atan2(opponent.x - p.x, opponent.z - p.z);
  const dx = Math.sin(p.facing), dz = Math.cos(p.facing);

  p.autoCd -= dt;
  if (input.auto && p.autoCd <= 0) {
    p.__bullets.push({ owner: p, x: p.x, z: p.z, vx: dx*20, vz: dz*20, radius: 0.25, dmg: p.hero.auto.dmg, life: 3 });
    p.autoCd = p.hero.auto.cd;
  }
  for (const key of ['Q','E']) {
    p.cd[key] = Math.max(0, p.cd[key] - dt);
    if (input[key] && p.cd[key] <= 0) {
      castSkill(p, p.hero.skills[key], dx, dz, opponent);
      p.cd[key] = p.hero.skills[key].cd;
    }
  }
}

function castSkill(p, sk, dx, dz, target) {
  switch (sk.type) {
    case 'projectile':
      p.__bullets.push({ owner: p, x: p.x, z: p.z, vx: dx*sk.speed, vz: dz*sk.speed, radius: sk.radius, dmg: sk.dmg, life: 3 }); break;
    case 'dash':
      p.x += dx*sk.dash; p.z += dz*sk.dash; clampToBridge(p, HALF_W, HALF_L);
      if (circleHit(p, target, 0.6, 0.4)) damage(target, sk.dmg, p); break;
  }
}

function damage(t, amount, from) {
  if (!t.alive || amount <= 0) return;
  t.hp -= amount;
  if (t.hp <= 0) { t.alive = false; t.respawn = 3; t.hp = 0; from.kills++; }
}

function revive(p) {
  p.alive = true; p.hp = p.maxHp; p.slowUntil = 0; p.slowFactor = 1;
  p.x = 0; p.z = p.side * 16;
}

function checkWin(p1, p2) {
  if (crystals.blue <= 0) return p2.hero.name || 'P2';
  if (crystals.red <= 0)  return p1.hero.name || 'P1';
  if (p1.kills >= 5) return p1.hero.name || 'P1';
  if (p2.kills >= 5) return p2.hero.name || 'P2';
  return null;
}

module.exports = { dist2, circleHit, clampToBridge, createPlayer, makeHero, updatePlayer,
                   castSkill, damage, revive, checkWin, crystals, HALF_W, HALF_L };
