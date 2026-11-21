/**
 * Hero 3D scene: UL 508A control cabinet + 6-axis robot arm + machined billet
 * fixture on a CAD grid plinth. Ported from the client mockup (code.html, three r125)
 * to current three.js.
 *
 * mountAssemblyScene(THREE, container, { reducedMotion, onProject }) → cleanup()
 *
 * onProject(points) is called after every rendered frame with the on-screen
 * position of each named anchor (cabinet, robot, harness, fixture):
 *   { cabinet: { x, y, visible }, … }  — x/y in CSS px from the container's top-left.
 * HeroScene uses it to pin HTML hotspot links to the moving model.
 * Throws if WebGL is unavailable; the caller keeps the SVG fallback in that case.
 */

// Brand palette
const NAVY = 0x2d3142;
const STEEL = 0x3e4554;
const SLATE = 0x4f5d75;
const SILVER = 0xbfc0c0;
const ORANGE = 0xf47e1f;

export function mountAssemblyScene(THREE, container, { reducedMotion = false, onProject } = {}) {
  const size = () => ({ w: container.clientWidth || 560, h: container.clientHeight || 480 });
  let { w, h } = size();

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 1000);
  camera.position.set(12.5, 9.2, 15);
  camera.lookAt(0.2, 2.4, 0.2);

  // Lighting (re-balanced for current three.js physical light units)
  const PI = Math.PI;
  scene.add(new THREE.AmbientLight(0xdfe6ed, 1.4));
  const key = new THREE.DirectionalLight(0xffffff, 3.2);
  key.position.set(12, 20, 15);
  scene.add(key);
  const fill = new THREE.DirectionalLight(SLATE, 3.0);
  fill.position.set(-14, 10, -10);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(ORANGE, 1.4);
  rim.position.set(3, 6, 8);
  scene.add(rim);

  const mat = (color, roughness, metalness) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const navy = mat(NAVY, 0.45, 0.6);
  const steel = mat(STEEL, 0.35, 0.75);
  const silver = mat(SILVER, 0.28, 0.82);
  const orange = mat(ORANGE, 0.35, 0.3);

  const mesh = (geometry, material, [x = 0, y = 0, z = 0] = [], parent) => {
    const m = new THREE.Mesh(geometry, material);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };
  const group = (parent, [x = 0, y = 0, z = 0] = []) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  };

  const root = group(scene);

  // Plinth + CAD grid
  mesh(new THREE.BoxGeometry(9.5, 0.35, 7.5), navy, [0, -0.18, 0], root);
  const grid = new THREE.GridHelper(9, 18, SLATE, NAVY);
  grid.position.y = 0.01;
  root.add(grid);

  // --- UL 508A control cabinet ---
  const cabinet = group(root, [-2.6, 2.3, -0.8]);
  mesh(new THREE.BoxGeometry(2.1, 4.2, 1.4), steel, [], cabinet);
  mesh(new THREE.BoxGeometry(2.14, 4.24, 0.06), silver, [0, 0, 0.72], cabinet); // door flange
  mesh(new THREE.BoxGeometry(1.15, 0.75, 0.05), navy, [0, 0.75, 0.76], cabinet); // HMI bezel
  mesh(new THREE.BoxGeometry(1.05, 0.65, 0.02), mat(0x141822, 0.2, 0), [0, 0.75, 0.79], cabinet); // HMI screen
  const eStop = mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.07, 16), orange, [0.6, 0.75, 0.78], cabinet);
  eStop.rotation.x = PI / 2;
  const pilot = mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 14), silver, [0.6, 0.98, 0.78], cabinet);
  pilot.rotation.x = PI / 2;
  mesh(new THREE.BoxGeometry(1.3, 0.16, 0.28), steel, [-1.1, 0.1, -0.2], root); // wire raceway

  // Wire harness: cabinet → robot base, laid along the plinth
  const harnessPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.75, 0.55, 0.0),
    new THREE.Vector3(-1.45, 0.12, 0.45),
    new THREE.Vector3(-0.6, 0.1, 0.9),
    new THREE.Vector3(0.15, 0.12, 0.75),
    new THREE.Vector3(0.35, 0.3, 0.5),
  ]);
  mesh(new THREE.TubeGeometry(harnessPath, 48, 0.07, 10, false), mat(0x1b1e29, 0.6, 0.2), [], root);
  mesh(new THREE.TubeGeometry(harnessPath, 48, 0.025, 6, false), orange, [0, 0.06, 0], root); // tracer

  // --- 6-axis robot ---
  const robot = group(root, [1.1, 0, 0.3]);
  mesh(new THREE.CylinderGeometry(1.1, 1.25, 0.45, 32), steel, [0, 0.23, 0], robot);
  const baseRing = mesh(new THREE.TorusGeometry(1.12, 0.028, 10, 36), orange, [0, 0.45, 0], robot);
  baseRing.rotation.x = PI / 2;

  const shoulder = group(robot, [0, 0.46, 0]);
  mesh(new THREE.BoxGeometry(1.1, 0.9, 1.1), silver, [0, 0.45, 0], shoulder);
  const shoulderPin = mesh(new THREE.CylinderGeometry(0.46, 0.46, 1.3, 24), navy, [0, 0.9, 0], shoulder);
  shoulderPin.rotation.z = PI / 2;

  const boom = group(shoulder, [0, 0.9, 0]);
  mesh(new THREE.BoxGeometry(0.62, 2.9, 0.62), steel, [0, 1.45, 0], boom);
  mesh(new THREE.BoxGeometry(0.66, 2.2, 0.08), orange, [0, 1.45, 0.32], boom); // trim

  const elbow = group(boom, [0, 2.9, 0]);
  const elbowPin = mesh(new THREE.CylinderGeometry(0.38, 0.38, 1.0, 24), silver, [], elbow);
  elbowPin.rotation.z = PI / 2;

  const forearm = group(elbow);
  mesh(new THREE.CylinderGeometry(0.28, 0.34, 2.4, 24), silver, [0, 1.2, 0], forearm);

  const wrist = group(forearm, [0, 2.4, 0]);
  mesh(new THREE.SphereGeometry(0.32, 24, 24), navy, [], wrist);
  mesh(new THREE.CylinderGeometry(0.2, 0.28, 0.7, 24), steel, [0, 0.4, 0], wrist);
  const collet = mesh(new THREE.ConeGeometry(0.1, 0.42, 20), silver, [0, 0.85, 0], wrist);
  collet.rotation.x = PI;
  mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.9, 8),
    new THREE.MeshBasicMaterial({ color: ORANGE, transparent: true, opacity: 0.7 }),
    [0, 1.5, 0],
    wrist,
  ); // laser guide

  // --- Machined billet fixture ---
  mesh(new THREE.CylinderGeometry(1.15, 1.3, 0.38, 32), steel, [2.1, 0.19, 1.8], root);
  const workpiece = mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.8, 24), silver, [2.1, 0.68, 1.8], root);
  const calib = mesh(
    new THREE.TorusGeometry(1.25, 0.012, 8, 48),
    new THREE.MeshBasicMaterial({ color: SLATE, transparent: true, opacity: 0.5 }),
    [2.1, 0.52, 1.8],
    root,
  );
  calib.rotation.x = PI / 2;

  // --- Hotspot anchors (positions projected to screen each frame) ---
  const anchor = (parent, pos) => group(parent, pos);
  const anchors = {
    cabinet: anchor(cabinet, [0, 1.55, 0.75]),
    robot: elbow,
    harness: anchor(root, harnessPath.getPoint(0.55).toArray()),
    fixture: anchor(workpiece, [0, 0.45, 0]),
  };
  const v = new THREE.Vector3();
  function project() {
    if (!onProject) return;
    const out = {};
    for (const [name, obj] of Object.entries(anchors)) {
      obj.getWorldPosition(v).project(camera);
      out[name] = { x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h, visible: v.z < 1 };
    }
    onProject(out);
  }

  // --- Drag to rotate (mouse, pen and touch) ---
  let targetRotY = 0;
  let dragging = false;
  let lastX = 0;
  const onDown = (e) => {
    dragging = true;
    lastX = e.clientX;
    container.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    if (!dragging) return;
    targetRotY += (e.clientX - lastX) * 0.008;
    lastX = e.clientX;
    if (!running) frame(); // reduced motion: still respond to drag
  };
  const onUp = () => {
    dragging = false;
  };
  container.addEventListener('pointerdown', onDown);
  container.addEventListener('pointermove', onMove);
  container.addEventListener('pointerup', onUp);
  container.addEventListener('pointercancel', onUp);

  // --- Render loop: only while the hero is on screen ---
  const clock = new THREE.Clock();
  let raf = 0;
  let running = false;

  function frame() {
    const t = clock.getElapsedTime();
    if (!reducedMotion) {
      shoulder.rotation.y = Math.sin(t * 0.4) * 0.32;
      boom.rotation.z = Math.sin(t * 0.5) * 0.16 + 0.1;
      elbow.rotation.z = -Math.cos(t * 0.5) * 0.28 - 0.2;
      wrist.rotation.y = t * 0.5;
      workpiece.rotation.y = t * 0.3;
    }
    root.rotation.y += (targetRotY - root.rotation.y) * (reducedMotion ? 1 : 0.06);
    renderer.render(scene, camera);
    project();
  }
  function loop() {
    frame();
    raf = requestAnimationFrame(loop);
  }
  function start() {
    if (running || reducedMotion) return;
    running = true;
    clock.start();
    loop();
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  // Initial pose (also the static frame for reduced motion)
  boom.rotation.z = 0.1;
  elbow.rotation.z = -0.48;
  frame();

  const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { threshold: 0.05 });
  io.observe(container);

  const ro = new ResizeObserver(() => {
    ({ w, h } = size());
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    if (!running) frame();
  });
  ro.observe(container);

  return function cleanup() {
    stop();
    io.disconnect();
    ro.disconnect();
    container.removeEventListener('pointerdown', onDown);
    container.removeEventListener('pointermove', onMove);
    container.removeEventListener('pointerup', onUp);
    container.removeEventListener('pointercancel', onUp);
    scene.traverse((o) => {
      o.geometry?.dispose();
      if (o.material) [].concat(o.material).forEach((m) => m.dispose());
    });
    renderer.dispose();
    renderer.domElement.remove();
  };
}
