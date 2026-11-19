import * as THREE from 'three';

// 全局子弹池
export const bullets = [];
export const crystals = { blue: 300, red: 300 };

export function createPlayer(hero, side, scene) {
  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.4, 0.8, 4, 8),
    new THREE.MeshLambertMaterial({ color: hero.color })
  );
  mesh.position.set(0, 0.8, side * 16);
  scene.add(mesh);

  return {
    hero, side, mesh, scene,
    x: 0, z: side * 16,
    facing: side > 0 ? Math.PI : 0,
    hp: hero.hp, maxHp: hero.hp,
    alive: true, respawn: 0,
    autoCd: 0,
    cd: { Q: 0, E: 0, flash: 0, snowball: 0 },
    slowUntil: 0, slowFactor: 1,
    kills: 0, rerolled: false,
  };
}

export function spawnBullet(owner, cfg, dirX, dirZ) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(cfg.radius, 8, 8),
    new THREE.MeshBasicMaterial({ color: owner.hero.color })
  );
  mesh.position.set(owner.x, 0.8, owner.z);
  owner.scene.add(mesh);
  bullets.push({
    mesh, owner, x: owner.x, z: owner.z,
    vx: dirX * cfg.speed, vz: dirZ * cfg.speed,
    radius: cfg.radius,
    dmg: cfg.dmg,
    life: 3, slow: cfg.slow, slowDuration: cfg.duration,
  });
}
