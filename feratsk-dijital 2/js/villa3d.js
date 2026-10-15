/* ==========================================================================
   FERATSK DİJİTAL — 3D VILLA CONSTRUCTION ANIMATION (sample)
   Scroll-driven three.js scene: foundation → frame → walls → façade/glass/roof
   → landscape/pool → camera moves inside. Illustrative model, not a real project.
   Falls back to a static frame if WebGL or three.js is unavailable.
   ========================================================================== */
(function () {
  "use strict";
  const section = document.getElementById("villa");
  const host = document.getElementById("villa3d");
  if (!section || !host) return;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const lerp = (a, b, t) => a + (b - a) * t;
  const mobile = window.matchMedia("(max-width: 734px)").matches;

  // Stage windows on the scroll progress (0..1)
  const STAGES = [[0.02, 0.14], [0.14, 0.30], [0.30, 0.44], [0.44, 0.58], [0.58, 0.72]];
  const stageAt = (p) => (p < 0.14 ? 0 : p < 0.30 ? 1 : p < 0.44 ? 2 : p < 0.58 ? 3 : p < 0.76 ? 4 : 5);

  /* ---------- Overlay (stage label + bars) ---------- */
  const elNo = document.getElementById("villa-stage-no");
  const elT = document.getElementById("villa-stage-t");
  const elD = document.getElementById("villa-stage-d");
  const bars = document.getElementById("villa-bars");
  if (bars) bars.innerHTML = Array.from({ length: 6 }, () => "<i></i>").join("");
  let lastStage = -1, lastLang = "";
  function updateOverlay(p) {
    const st = stageAt(p);
    const lang = document.documentElement.lang === "en" ? "en" : "tr";
    if (st === lastStage && lang === lastLang) return;
    lastStage = st; lastLang = lang;
    const dict = (window.I18N && window.I18N[lang] && window.I18N[lang].villa) || null;
    if (dict && elT) {
      elNo.textContent = `${dict.stage} ${st + 1} / 6`;
      elT.textContent = dict.stages[st].t;
      elD.textContent = dict.stages[st].d;
    }
    if (bars) Array.from(bars.children).forEach((b, k) => { b.classList.toggle("done", k < st); b.classList.toggle("on", k === st); });
  }

  function progress() {
    const r = section.getBoundingClientRect();
    const span = r.height - window.innerHeight;
    return span > 0 ? clamp(-r.top / span, 0, 1) : 0;
  }

  function fallback() {
    section.classList.add("villa-static");
    if (window.SCENES) host.innerHTML = window.SCENES.render("villa");
    const note = document.getElementById("villa-fallback");
    if (note) note.hidden = false;
    const onScroll = () => updateOverlay(progress());
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  const THREE = window.THREE;
  if (!THREE) { fallback(); return; }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  } catch (e) { fallback(); return; }

  try {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = !mobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");

    const scene = new THREE.Scene();
    const SKY = new THREE.Color("#F1ECFA");
    scene.background = SKY;
    scene.fog = new THREE.Fog(SKY, 70, 150);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 400);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xd9c7b8, 0.8));
    const sun = new THREE.DirectionalLight(0xfff1e0, 0.95);
    sun.position.set(18, 28, 16);
    sun.castShadow = !mobile;
    sun.shadow.mapSize.set(1024, 1024);
    const sc = sun.shadow.camera; sc.left = -26; sc.right = 26; sc.top = 26; sc.bottom = -26; sc.near = 1; sc.far = 80;
    scene.add(sun);
    const warm = new THREE.PointLight(0xffd2a6, 0, 16, 2);
    warm.position.set(1.5, 2.7, -1.5);
    scene.add(warm);

    const M = (color, opts) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0 }, opts || {}));
    const mat = {
      dirt: M("#C9B39B"), lawn: new THREE.Color("#B5DBA8"), dirtC: new THREE.Color("#C9B39B"),
      concrete: M("#BDB8B2"), plaster: M("#F7F3EE"), wood: M("#B4805A", { roughness: 0.7 }),
      floor: M("#E2CBAE", { roughness: 0.6 }), dark: M("#2D2A28", { roughness: 0.5 }),
      glass: M("#BFE3F2", { transparent: true, opacity: 0.28, roughness: 0.05, metalness: 0.2, depthWrite: false }),
      water: M("#86D6E4", { roughness: 0.15, metalness: 0.1 }), deck: M("#CDA27A"), coping: M("#F2EEE8"),
      leaf: M("#8CC08A"), trunk: M("#6B4F3A"), sofa: M("#ECE5DA"), rug: M("#CBBDEB"), art: M("#FFC4AE"),
      island: M("#FAF8F5"), lamp: M("#FFE2B8", { emissive: new THREE.Color("#FFC98A"), emissiveIntensity: 0.9 }),
      shrub: M("#9FCB93")
    };

    const parts = [];
    function add(geo, material, x, y, z, stage, delay, mode) {
      const m = new THREE.Mesh(geo, material);
      m.position.set(x, y, z);
      m.castShadow = !mobile && material !== mat.glass;
      m.receiveShadow = !mobile;
      m.visible = false;
      scene.add(m);
      parts.push({ m, stage, delay: delay || 0, mode: mode || "y" });
      return m;
    }
    function box(w, h, d, material, x, y, z, stage, delay, mode) {
      const g = new THREE.BoxGeometry(w, h, d);
      g.translate(0, h / 2, 0);
      return add(g, material, x, y, z, stage, delay, mode);
    }

    // Ground
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(220, 220), mat.dirt);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = !mobile;
    scene.add(ground);

    // Stage 0 — foundation
    box(15.4, 0.3, 10.4, mat.concrete, 0, 0, 0.4, 0, 0);
    box(15.6, 0.04, 10.6, mat.dark, 0, 0.3, 0.4, 0, 0.6);

    // Stage 1 — frame
    let k = 0;
    [-7, -3.5, 0, 3.5, 7].forEach((x) => [-4.5, 4.5].forEach((z) => { box(0.35, 3.0, 0.35, mat.concrete, x, 0.3, z, 1, (k++) * 0.04); }));
    box(14.6, 0.3, 9.6, mat.concrete, 0, 3.3, 0, 1, 0.45);
    k = 0;
    [-7, -2, 3].forEach((x) => [-4, 5.4].forEach((z) => { box(0.35, 3.0, 0.35, mat.concrete, x, 3.6, z, 1, 0.6 + (k++) * 0.04); }));
    box(11, 0.3, 10.6, mat.concrete, -2, 6.6, 0.75, 1, 0.92);
    box(10.4, 0.3, 1.2, mat.concrete, -2, 3.3, 5.0, 1, 0.5); // cantilever slab

    // Stage 2 — walls
    box(14, 3.0, 0.25, mat.plaster, 0, 0.3, -4.4, 2, 0);
    box(0.25, 3.0, 9, mat.plaster, -6.9, 0.3, 0, 2, 0.1);
    box(0.25, 3.0, 9, mat.plaster, 6.9, 0.3, 0, 2, 0.2);
    box(4, 3.0, 0.25, mat.plaster, -5, 0.3, 4.4, 2, 0.3);
    box(10, 3.0, 0.25, mat.plaster, -2, 3.6, -3.9, 2, 0.45);
    box(0.25, 3.0, 9.6, mat.plaster, -6.9, 3.6, 0.75, 2, 0.55);
    box(0.25, 3.0, 9.6, mat.plaster, 2.9, 3.6, 0.75, 2, 0.65);
    box(3, 3.0, 0.25, mat.plaster, -5.5, 3.6, 5.45, 2, 0.75);

    // Stage 3 — façade, glazing, roof, interior floor
    box(10, 2.98, 0.06, mat.glass, 2, 0.31, 4.45, 3, 0.1);
    box(7, 2.98, 0.06, mat.glass, -0.5, 3.61, 5.5, 3, 0.2);
    [-3, 0.6, 3.5, 6.9].forEach((x, i) => box(0.09, 3.0, 0.12, mat.dark, x, 0.3, 4.47, 3, 0.15 + i * 0.03));
    [-4, -1.2, 1.6, 2.9].forEach((x, i) => box(0.09, 3.0, 0.12, mat.dark, x, 3.6, 5.52, 3, 0.25 + i * 0.03));
    box(3.1, 3.0, 0.1, mat.wood, -5.5, 3.6, 5.62, 3, 0.35);
    box(4.1, 3.0, 0.08, mat.wood, -5, 0.3, 4.58, 3, 0.4);
    box(11.3, 0.3, 10.9, mat.dark, -2, 6.9, 0.75, 3, 0.55);
    box(4, 1.0, 0.05, mat.glass, 5, 3.6, 4.75, 3, 0.65);
    box(0.05, 1.0, 9.2, mat.glass, 7.15, 3.6, 0, 3, 0.7);
    box(13.5, 0.05, 8.6, mat.floor, 0, 0.3, 0, 3, 0.8);

    // Stage 4 — landscape, pool, interior furnishing
    box(9.4, 0.12, 5.4, mat.deck, 3.4, 0, 8.6, 4, 0, "xyz");
    box(6.6, 0.16, 3.4, mat.coping, 3.8, 0, 8.6, 4, 0.1, "xyz");
    box(6.2, 0.05, 3.0, mat.water, 3.8, 0.14, 8.6, 4, 0.15, "xyz");
    for (let i = 0; i < 6; i++) box(1.1, 0.06, 0.7, mat.coping, -2.4, 0, 6 + i * 1.2, 4, 0.1 + i * 0.03, "xyz");
    [[-11, 6, 1.2], [-12, -3, 1.4], [10.5, -5, 1.3], [12, 3, 1.0], [-9, 11, 0.9]].forEach(([x, z, s], i) => {
      const trunk = new THREE.CylinderGeometry(0.14 * s, 0.18 * s, 1.8 * s, 8); trunk.translate(0, 0.9 * s, 0);
      add(trunk, mat.trunk, x, 0, z, 4, 0.2 + i * 0.06, "xyz");
      const crown = new THREE.SphereGeometry(1.3 * s, 16, 12); crown.translate(0, 2.6 * s, 0);
      add(crown, mat.leaf, x, 0, z, 4, 0.25 + i * 0.06, "xyz");
    });
    for (let i = 0; i < 7; i++) box(0.9, 0.6, 0.9, mat.shrub, -6.5 + i * 0.95, 0, 5.4, 4, 0.3 + i * 0.03, "xyz");
    [[-3.2, 6.2], [-3.2, 10.2], [8.6, 6.2], [8.6, 11]].forEach(([x, z], i) => box(0.12, 0.7, 0.12, mat.lamp, x, 0, z, 4, 0.5 + i * 0.03, "xyz"));
    // interior
    box(4.2, 0.02, 3.0, mat.rug, 0.4, 0.33, -1.9, 4, 0.2, "xyz");
    box(4.0, 0.45, 1.0, mat.sofa, 0.4, 0.35, -3.6, 4, 0.25, "xyz");
    box(4.0, 0.55, 0.25, mat.sofa, 0.4, 0.8, -4.05, 4, 0.28, "xyz");
    box(1.0, 0.45, 2.0, mat.sofa, -1.1, 0.35, -2.1, 4, 0.3, "xyz");
    box(1.4, 0.32, 0.8, mat.wood, 0.7, 0.35, -2.0, 4, 0.33, "xyz");
    box(2.6, 0.95, 1.0, mat.island, 4.6, 0.35, -1.6, 4, 0.36, "xyz");
    box(2.75, 0.06, 1.1, mat.dark, 4.6, 1.3, -1.6, 4, 0.4, "xyz");
    [3.8, 4.6, 5.4].forEach((x, i) => box(0.35, 0.7, 0.35, mat.wood, x, 0.35, -0.7, 4, 0.42 + i * 0.02, "xyz"));
    box(2.2, 1.3, 0.05, mat.art, 0.4, 1.5, -4.25, 4, 0.45, "xyz");
    for (let i = 0; i < 10; i++) box(1.3, 0.3, 0.45, mat.wood, -5.9, 0.35 + i * 0.3, 3.4 - i * 0.48, 4, 0.5 + i * 0.02);
    [[0.4, -2.0], [4.6, -1.6]].forEach(([x, z], i) => {
      box(0.02, 0.6, 0.02, mat.dark, x, 2.7, z, 4, 0.6 + i * 0.05, "xyz");
      const s = new THREE.SphereGeometry(0.22, 16, 12); s.translate(0, 2.55, 0);
      add(s, mat.lamp, x, 0, z, 4, 0.62 + i * 0.05, "xyz");
    });
    box(0.5, 0.5, 0.5, mat.dark, 6.2, 0.35, -3.8, 4, 0.66, "xyz");
    const plant = new THREE.SphereGeometry(0.55, 12, 10); plant.translate(0, 1.2, 0);
    add(plant, mat.leaf, 6.2, 0, -3.8, 4, 0.7, "xyz");

    /* ---------- Camera path ---------- */
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    const camPos = V(0, 0, 0), camLook = V(0, 0, 0);
    function cameraAt(p) {
      if (p <= 0.72) {
        const t = ease(p / 0.72);
        const a = lerp(0.95, -0.38, t);
        const R = lerp(mobile ? 36 : 30, mobile ? 27 : 22, t);
        camPos.set(Math.sin(a) * R, lerp(16, 5.2, t), Math.cos(a) * R);
        camLook.set(0, lerp(1.2, 2.4, t), 0.5);
        return;
      }
      const a = -0.38, R = mobile ? 27 : 22;
      const p0 = V(Math.sin(a) * R, 5.2, Math.cos(a) * R), l0 = V(0, 2.4, 0.5);
      const p1 = V(2, 1.75, mobile ? 15 : 13), l1 = V(2, 1.6, 0);
      const p2 = V(1.9, 1.6, 1.4), l2 = V(-0.6, 1.25, -4.2);
      if (p <= 0.86) {
        const t = ease((p - 0.72) / 0.14);
        camPos.lerpVectors(p0, p1, t); camLook.lerpVectors(l0, l1, t);
      } else {
        const t = ease((p - 0.86) / 0.14);
        camPos.lerpVectors(p1, p2, t); camLook.lerpVectors(l1, l2, t);
      }
    }

    function apply(p) {
      parts.forEach((pt) => {
        const [a, b] = STAGES[pt.stage];
        const local = clamp(((p - a) / (b - a) - pt.delay * 0.6) / 0.4, 0, 1);
        const e = ease(local);
        pt.m.visible = e > 0.001;
        if (pt.mode === "xyz") pt.m.scale.set(Math.max(e, 0.001), Math.max(e, 0.001), Math.max(e, 0.001));
        else pt.m.scale.set(1, Math.max(e, 0.001), 1);
      });
      const g = clamp((p - STAGES[4][0]) / (STAGES[4][1] - STAGES[4][0]), 0, 1);
      ground.material.color.copy(mat.dirtC).lerp(mat.lawn, g);
      warm.intensity = lerp(0, 1.1, clamp((p - 0.6) / 0.25, 0, 1));
      cameraAt(p);
      camera.position.copy(camPos);
      camera.lookAt(camLook);
      updateOverlay(p);
    }

    function resize() {
      const w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = w / h < 0.8 ? 55 : 42;
      camera.updateProjectionMatrix();
      dirty = true;
    }

    let current = 0, target = 0, visible = false, dirty = true;
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) loop(); }, { rootMargin: "100px" }).observe(section);
    if (window.ResizeObserver) new ResizeObserver(resize).observe(host);
    window.addEventListener("resize", resize);
    resize();

    let running = false;
    function loop() {
      if (running) return;
      running = true;
      const step = () => {
        target = progress();
        const diff = target - current;
        current = Math.abs(diff) < 0.0005 ? target : current + diff * 0.12;
        if (dirty || Math.abs(diff) > 0.0001 || lastLang !== document.documentElement.lang) {
          apply(current);
          renderer.render(scene, camera);
          dirty = false;
        }
        if (visible) requestAnimationFrame(step); else running = false;
      };
      requestAnimationFrame(step);
    }
    current = target = progress();
    apply(current);
    renderer.render(scene, camera);
    section.classList.add("villa-ready");
  } catch (err) {
    console.warn("[villa3d] falling back:", err);
    if (renderer && renderer.domElement && renderer.domElement.parentNode) renderer.domElement.remove();
    fallback();
  }
})();
