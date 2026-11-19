import { isDown, mouse } from './input.js';
import { circleHit, clampToBridge, dist2 } from './math2d.js';
import { spawnBullet, bullets, crystals } from './entities.js';
import { SUMMONER } from './heroes.js';

export const HALF_W = 4;
export const HALF_L = 20;

export function updatePlayer(p, scheme, dt, now, opponent) {
  if (!p.alive) {
    p.respawn -= dt;
    if (p.respawn <= 0) revive(p);
    return;
  }

  // —— 移动 ——
  let ix = 0, iz = 0;
  if (isDown(scheme.left))  ix -= 1;
  if (isDown(scheme.right)) ix += 1;
  if (isDown(scheme.up))    iz -= 1;
  if (isDown(scheme.down))  iz += 1;
  const len = Math.hypot(ix, iz) || 1;
  const slow = now < p.slowUntil ? p.slowFactor : 1;
  p.x += (ix / len) * p.hero.speed * slow * dt;
  p.z += (iz / len) * p.hero.speed * slow * dt;
  clampToBridge(p, HALF_W, HALF_L);

  // —— 朝向对手 ——
  p.facing = Math.atan2(opponent.x - p.x, opponent.z - p.z);
  const dx = Math.sin(p.facing), dz = Math.cos(p.facing);

  // —— 普攻 ——
  p.autoCd -= dt;
  const wantAuto = p.side === -1 ? mouse.down : isDown(scheme.auto);
  if (wantAuto && p.autoCd <= 0) {
    spawnBullet(p, p.hero.auto, dx, dz);
    p.autoCd = p.hero.auto.cd;
  }

  // —— 技能 ——
  for (const key of ['Q', 'E']) {
    p.cd[key] = Math.max(0, p.cd[key] - dt);
    if (isDown(scheme[key.toLowerCase()]) && p.cd[key] <= 0) {
      castSkill(p, p.hero.skills[key], dx, dz, opponent);
      p.cd[key] = p.hero.skills[key].cd;
    }
  }

  // —— 召唤师技能 ——
  p.cd.flash = Math.max(0, p.cd.flash - dt);
  p.cd.snowball = Math.max(0, p.cd.snowball - dt);
  if (isDown(scheme.flash) && p.cd.flash <= 0) {
    p.x += dx * SUMMONER.flash.dash;
    p.z += dz * SUMMONER.flash.dash;
    clampToBridge(p, HALF_W, HALF_L);
    p.cd.flash = SUMMONER.flash.cd;
  }
  if (isDown(scheme.snowball) && p.cd.snowball <= 0) {
    spawnBullet(p, SUMMONER.snowball, dx, dz);
    p.cd.snowball = SUMMONER.snowball.cd;
  }

  p.mesh.position.set(p.x, 0.8, p.z);
  p.mesh.rotation.y = p.facing;
}

function castSkill(p, sk, dx, dz, target) {
  switch (sk.type) {
    case 'projectile':
      spawnBullet(p, sk, dx, dz); break;
    case 'dash': {
      p.x += dx * sk.dash; p.z += dz * sk.dash;
      clampToBridge(p, HALF_W, HALF_L);
      if (circleHit(p, target, 0.6, 0.4)) damage(target, sk.dmg, p);
      break;
    }
    case 'aoe': {
      if (dist2(p.x, p.z, target.x, target.z) <= sk.radius * sk.radius) {
        damage(target, sk.dmg, p);
        applySlow(target, sk);
      }
      break;
    }
    case 'zone': {
      applySlow(target, sk);
      break;
    }
  }
}

function applySlow(t, sk) {
  if (!sk.slow) return;
  t.slowUntil = performance.now() / 1000 + sk.duration;
  t.slowFactor = Math.max(t.slowFactor, 1 - sk.slow);
}

export function damage(t, amount, from) {
  if (!t.alive || amount <= 0) return;
  t.hp -= amount;
  if (t.hp <= 0) {
    t.alive = false; t.respawn = 3; t.hp = 0;
    if (from && from.kills !== undefined) from.kills += 1;
    t.mesh.visible = false;
  }
}

function revive(p) {
  p.alive = true; p.hp = p.maxHp;
  p.slowUntil = 0; p.slowFactor = 1;
  p.x = 0; p.z = p.side * 16;
  p.mesh.visible = true;
  p.mesh.position.set(p.x, 0.8, p.z);
}

export function updateBullets(dt, players) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx * dt; b.z += b.vz * dt;
    b.life -= dt;
    b.mesh.position.set(b.x, 0.8, b.z);

    let dead = b.life <= 0 ||
      Math.abs(b.x) > HALF_W + 1 || Math.abs(b.z) > HALF_L + 1;

    if (!dead) {
      for (const p of players) {
        if (p === b.owner || !p.alive) continue;
        if (circleHit(b, p, b.radius, 0.4)) {
          damage(p, b.dmg, b.owner);
          if (b.slow) {
            p.slowUntil = performance.now() / 1000 + b.slowDuration;
            p.slowFactor = Math.max(p.slowFactor, 1 - b.slow);
          }
          dead = true; break;
        }
      }
    }

    if (!dead) {
      // 水晶判定
      const enemyBase = b.owner.side > 0 ? -HALF_L : HALF_L;
      if (Math.abs(b.z - enemyBase) < 1.2 && Math.abs(b.x) < 1.5) {
        const key = b.owner.side > 0 ? 'blue' : 'red';
        crystals[key] = Math.max(0, crystals[key] - b.dmg);
        dead = true;
      }
    }

    if (dead) {
      b.mesh.parent && b.mesh.parent.remove(b.mesh);
      b.mesh.geometry.dispose(); b.mesh.material.dispose();
      bullets.splice(i, 1);
    }
  }
}
