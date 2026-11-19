// 2D 数学工具：碰撞判定一律用距离平方，避免开根号
export const dist2 = (ax, az, bx, bz) => {
  const dx = ax - bx, dz = az - bz;
  return dx * dx + dz * dz;
};

export const circleHit = (a, b, ra, rb) => {
  const r = ra + rb;
  return dist2(a.x, a.z, b.x, b.z) <= r * r;
};

export const clampToBridge = (p, halfW, halfL) => {
  p.x = Math.max(-halfW, Math.min(halfW, p.x));
  p.z = Math.max(-halfL, Math.min(halfL, p.z));
};
