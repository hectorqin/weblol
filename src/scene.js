import * as THREE from 'three';

export function buildScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b1020);
  scene.fog = new THREE.Fog(0x0b1020, 24, 70);

  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 200);
  camera.position.set(0, 26, 0.01);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  document.body.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const sun = new THREE.DirectionalLight(0xffffff, 0.9);
  sun.position.set(10, 20, 10);
  scene.add(sun);

  // 桥面
  const bridge = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 40),
    new THREE.MeshLambertMaterial({ color: 0x26304a })
  );
  bridge.rotation.x = -Math.PI / 2;
  scene.add(bridge);

  // 桥两侧装饰
  const edgeMat = new THREE.MeshLambertMaterial({ color: 0x1a2238 });
  for (const sx of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 40), edgeMat);
    e.position.set(sx * 4.2, 0.3, 0);
    scene.add(e);
  }

  const mkCrystal = (z, c) => {
    const m = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.2),
      new THREE.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: 0.4 })
    );
    m.position.set(0, 1.4, z);
    scene.add(m);
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.4, 0.4, 12),
      new THREE.MeshLambertMaterial({ color: 0x333b55 })
    );
    base.position.set(0, 0.2, z);
    scene.add(base);
    return m;
  };
  const crystalBlue = mkCrystal(-20, 0x64b5f6);
  const crystalRed  = mkCrystal( 20, 0xef5350);

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  return { scene, camera, renderer, crystalBlue, crystalRed };
}
