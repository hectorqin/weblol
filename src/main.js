import { buildScene } from './scene.js';
import { randomHero } from './heroes.js';
import { createPlayer, crystals } from './entities.js';
import { updatePlayer, updateBullets } from './combat.js';
import { SCHEMES } from './input.js';
import { drawHud, checkWin } from './hud.js';

const { scene, renderer } = buildScene();

let p1, p2, state;

function disposePlayer(p) {
  if (!p || !p.mesh) return;
  if (p.mesh.parent) p.mesh.parent.remove(p.mesh);
  p.mesh.geometry.dispose(); p.mesh.material.dispose();
}

function newRound() {
  disposePlayer(p1); disposePlayer(p2);
  crystals.blue = 300; crystals.red = 300;

  p1 = createPlayer(randomHero(), -1, scene);
  p2 = createPlayer(randomHero(),  1, scene);

  state = { phase: 'playing', winner: null };
}

function reroll(p, other) {
  if (p.rerolled) return;
  let next;
  for (let i = 0; i < 6; i++) {
    next = randomHero();
    if (next.id !== other.hero.id) break;
  }
  p.hero = next;
  p.mesh.material.color.setHex(next.color);
  p.maxHp = next.hp; p.hp = next.hp;
  p.autoCd = 0;
  p.cd = { Q: 0, E: 0, flash: 0, snowball: 0 };
  p.slowUntil = 0; p.slowFactor = 1;
  p.rerolled = true;
}

newRound();

addEventListener('keydown', e => {
  if (state.phase === 'over' && e.code === 'Enter') newRound();
  if (e.code === SCHEMES.p1.reroll && p1 && p2) reroll(p1, p2);
  if (e.code === SCHEMES.p2.reroll && p1 && p2) reroll(p2, p1);
});

const clock = new THREE.Clock();

function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05); // 卡帧保护
  const now = performance.now() / 1000;

  if (state.phase === 'playing') {
    updatePlayer(p1, SCHEMES.p1, dt, now, p2);
    updatePlayer(p2, SCHEMES.p2, dt, now, p1);
    updateBullets(dt, [p1, p2]);

    const w = checkWin(p1, p2);
    if (w) { state.phase = 'over'; state.winner = w; }
  }

  drawHud(p1, p2, state);
  renderer.render(scene, camera);
}
loop();
