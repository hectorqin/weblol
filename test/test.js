const C = require('./core-testable.js');
let passed = 0, failed = 0;

function test(name, fn) {
  try { fn(); console.log('  \x1b[32m✓\x1b[0m ' + name); passed++; }
  catch (e) { console.log('  \x1b[31m✗\x1b[0m ' + name + '\n      ' + e.message); failed++; }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }
function eq(a, b, msg) { if (a !== b) throw new Error((msg || '') + ` 期望 ${b}, 实际 ${a}`); }

console.log('\n=== 数学与碰撞 ===');
test('距离平方计算正确', () => { eq(C.dist2(0,0,3,4), 25); });
test('圆碰撞：重叠应命中', () => { assert(C.circleHit({x:0,z:0},{x:1,z:0}, 0.6, 0.5)); });
test('圆碰撞：远离应未命中', () => { assert(!C.circleHit({x:0,z:0},{x:5,z:0}, 0.6, 0.5)); });

test('桥面边界钳制', () => {
  const p = {x:100, z:100};
  C.clampToBridge(p, 4, 20);
  eq(p.x, 4); eq(p.z, 20);
  const p2 = {x:-100, z:-100};
  C.clampToBridge(p2, 4, 20);
  eq(p2.x, -4); eq(p2.z, -20);
});

console.log('\n=== 玩家与移动 ===');
const hero = C.makeHero();
const p1 = C.createPlayer(hero, -1);
const p2 = C.createPlayer(hero, 1);

test('玩家初始位置正确', () => { eq(p1.z, -16); eq(p2.z, 16); eq(p1.hp, 100); });
test('移动应改变位置', () => {
  const before = p1.x;
  C.updatePlayer(p1, {right:true}, 0.1, 0, p2);
  assert(p1.x > before, '向右移动后 x 应增大');
});
test('桥面边界不可越出', () => {
  const p = C.createPlayer(hero, -1);
  for (let i=0;i<100;i++) C.updatePlayer(p, {right:true, up:true}, 0.1, 0, p2);
  assert(p.x <= 4 && p.x >= -4, `x 越界: ${p.x}`);
  assert(p.z <= 20 && p.z >= -20, `z 越界: ${p.z}`);
});

console.log('\n=== 战斗与伤害 ===');
test('普攻造成掉血', () => {
  const a = C.createPlayer(hero, -1), b = C.createPlayer(hero, 1);
  const before = b.hp;
  C.damage(b, 20, a);
  eq(b.hp, before - 20);
});
test('击杀增加击杀数并触发复活', () => {
  const a = C.createPlayer(hero, -1), b = C.createPlayer(hero, 1);
  C.damage(b, 200, a);
  assert(!b.alive);
  eq(a.kills, 1);
  eq(b.respawn, 3);
});
test('死亡后 3 秒应复活', () => {
  const a = C.createPlayer(hero, -1), b = C.createPlayer(hero, 1);
  C.damage(b, 200, a);
  C.revive(b);
  assert(b.alive); eq(b.hp, 100);
});
test('对死亡目标不再扣血', () => {
  const a = C.createPlayer(hero, -1), b = C.createPlayer(hero, 1);
  C.damage(b, 200, a);
  const before = a.kills;
  C.damage(b, 50, a); // 对死亡目标再打，不应再+击杀
  eq(a.kills, before);
});

console.log('\n=== 技能 ===');
test('Q 技能发射子弹', () => {
  const a = C.createPlayer(hero, -1), b = C.createPlayer(hero, 1);
  C.castSkill(a, hero.skills.Q, 0, 1, b);
  eq(a.__bullets.length, 1);
});
test('E 冲锋命中造成伤害', () => {
  const a = C.createPlayer(hero, -1), b = C.createPlayer(hero, 1);
  b.x = 0; b.z = -15; // 贴近
  const before = b.hp;
  C.castSkill(a, hero.skills.E, 0, 1, b);
  assert(b.hp < before, '冲锋应造成伤害');
});
test('E 冲锋进入冷却', () => {
  const a = C.createPlayer(hero, -1), b = C.createPlayer(hero, 1);
  C.updatePlayer(a, {E:true}, 0.016, 0, b);
  assert(a.cd.E > 0, 'E 应在施放后进入冷却');
});

console.log('\n=== 胜负判定 ===');
test('击杀 5 次判定胜者', () => {
  const a = C.createPlayer(hero, -1), b = C.createPlayer(hero, 1);
  a.kills = 5;
  eq(C.checkWin(a, b), 'P1');
});
test('水晶归零判定胜者', () => {
  const a = C.createPlayer(hero, -1), b = C.createPlayer(hero, 1);
  C.crystals.red = 0;
  eq(C.checkWin(a, b), 'P1');
  C.crystals.red = 300; // 复原
});
test('无人达标返回 null', () => {
  const a = C.createPlayer(hero, -1), b = C.createPlayer(hero, 1);
  eq(C.checkWin(a, b), null);
});

console.log(`\n=== 结果: \x1b[32m${passed} 通过\x1b[0m, \x1b[31m${failed} 失败\x1b[0m ===`);
process.exit(failed > 0 ? 1 : 0);
