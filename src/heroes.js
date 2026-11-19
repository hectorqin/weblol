// 英雄数值表：加英雄只改这里，逻辑层不用动
export const HEROES = [
  {
    id: 'marksman', name: '游侠',
    color: 0x4fc3f7, hp: 100, speed: 6.2,
    auto: { cd: 0.42, dmg: 8, speed: 24, radius: 0.25 },
    skills: {
      Q: { name: '穿刺箭', cd: 4, dmg: 18, speed: 28, radius: 0.3, type: 'projectile' },
      E: { name: '翻滚',   cd: 8, dash: 5 },
    },
  },
  {
    id: 'mage', name: '术士',
    color: 0xba68c8, hp: 88, speed: 5.2,
    auto: { cd: 0.7, dmg: 6, speed: 16, radius: 0.3 },
    skills: {
      Q: { name: '火球', cd: 3.5, dmg: 24, speed: 14, radius: 0.5, type: 'projectile' },
      E: { name: '冰封', cd: 11, slow: 0.5, duration: 2, type: 'zone' },
    },
  },
  {
    id: 'tank', name: '铁卫',
    color: 0xffb74d, hp: 165, speed: 4.6,
    auto: { cd: 0.8, dmg: 7, speed: 12, radius: 0.4 },
    skills: {
      Q: { name: '冲锋', cd: 7, dash: 8, dmg: 16, type: 'dash' },
      E: { name: '怒吼', cd: 12, radius: 4, dmg: 10, slow: 0.3, duration: 1.5, type: 'aoe' },
    },
  },
  {
    id: 'assassin', name: '影刃',
    color: 0xef5350, hp: 78, speed: 6.8,
    auto: { cd: 0.5, dmg: 9, speed: 20, radius: 0.25 },
    skills: {
      Q: { name: '飞镖', cd: 3, dmg: 15, speed: 30, radius: 0.28, type: 'projectile' },
      E: { name: '瞬步', cd: 6, dash: 7, dmg: 12, type: 'dash' },
    },
  },
];

// 大乱斗标配：闪现 + 雪球
export const SUMMONER = {
  flash:    { cd: 12, dash: 4 },
  snowball: { cd: 18, dmg: 12, speed: 20, radius: 0.4, slow: 0.45, duration: 1.5 },
};

export function randomHero() {
  return HEROES[Math.floor(Math.random() * HEROES.length)];
}
