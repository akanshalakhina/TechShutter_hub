/* ========================================================
   TECH SHUTTER HUB - 3D WebGL Cylinder Engine
   Precision-engineered to match reelxpozure.com 3D mechanics
   with Tech Shutter Hub Gold & Emerald Aesthetics
   ======================================================== */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// Global Project Data State
let portfolioData = [];

async function loadProjects() {
  try {
    const res = await fetch('/api/projects');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length) {
        localStorage.setItem('tsh_portfolio', JSON.stringify(json.data));
        return json.data;
      }
    }
  } catch (e) {}

  try {
    const res = await fetch('/projects.json');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length) return data;
    }
  } catch (e) {}

  try {
    const cached = JSON.parse(localStorage.getItem('tsh_portfolio'));
    if (Array.isArray(cached) && cached.length) return cached;
  } catch (e) {}

  // Built-in emergency fallback
  return [
    { title: "RED V-Raptor 8K Rig", category: "Cinematography", video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
    { title: "Leica M11-P Field Test", category: "Tech & Gear Reviews", image: "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=1200" },
    { title: "Inspire 3 Twilight Flight", category: "Drone & Aerial", video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
    { title: "Minimalist Watch Macro", category: "Product Shoots", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200" },
    { title: "Elysian Noir Portraits", category: "Studio & Portraits", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200" },
    { title: "Nordic Commercial Film", category: "Brand Commercials", video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" }
  ];
}

/* ========================================================
   Procedural SVG Mockup Generator (Brand Gold & Emerald)
   ======================================================== */
const GOLD_PALETTE = ['#E5C058', '#F5D061', '#D4AF37', '#B38E2E', '#C59B27', '#8CAE82'];

function darken(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * (1 - f));
  const g = Math.round(((n >> 8) & 255) * (1 - f));
  const b = Math.round((n & 255) * (1 - f));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function thumb(p, index) {
  const c = GOLD_PALETTE[index % GOLD_PALETTE.length];
  const cd = darken(c, 0.45);
  const id = index;
  const t = index % 4;
  let body = '';

  if (t === 0) {
    body =
      `<rect width="400" height="260" fill="#0d1117"/><rect width="400" height="34" fill="#161c26"/>` +
      `<rect x="18" y="12" width="60" height="10" rx="5" fill="${c}"/>` +
      `<rect x="288" y="14" width="24" height="6" rx="3" fill="#8cae82"/><rect x="322" y="14" width="24" height="6" rx="3" fill="#8cae82"/><rect x="356" y="14" width="24" height="6" rx="3" fill="#8cae82"/>` +
      `<rect x="0" y="34" width="400" height="160" fill="url(#g${id})"/>` +
      `<circle cx="200" cy="114" r="32" fill="none" stroke="#fff" stroke-width="2" opacity="0.8"/>` +
      `<circle cx="200" cy="114" r="12" fill="#fff" opacity="0.9"/>`;
  } else if (t === 1) {
    body =
      `<rect width="400" height="260" fill="url(#g${id})"/><rect width="400" height="260" fill="#000" opacity=".25"/>` +
      `<rect x="24" y="26" width="90" height="9" rx="4" fill="#fff" opacity=".8"/>` +
      `<rect x="24" y="110" width="220" height="24" rx="4" fill="#fff"/><rect x="24" y="144" width="140" height="18" rx="4" fill="#fff" opacity=".7"/>`;
  } else if (t === 2) {
    body =
      `<rect width="400" height="260" fill="#0a0e14"/><rect width="400" height="30" fill="#141a24"/>` +
      `<rect x="18" y="11" width="50" height="8" rx="4" fill="${c}"/>` +
      `<rect x="20" y="44" width="200" height="148" rx="8" fill="url(#g${id})"/>` +
      `<rect x="244" y="52" width="130" height="16" rx="4" fill="#fff"/>` +
      `<rect x="244" y="82" width="138" height="8" rx="4" fill="#8cae82"/><rect x="244" y="100" width="138" height="8" rx="4" fill="#8cae82"/>` +
      `<rect x="244" y="140" width="80" height="24" rx="12" fill="${c}"/>`;
  } else {
    body =
      `<rect width="400" height="260" fill="#090d12"/>` +
      `<circle cx="200" cy="115" r="55" fill="url(#g${id})" opacity="0.85"/>` +
      `<circle cx="200" cy="115" r="40" fill="none" stroke="#fff" stroke-width="2"/>` +
      `<polygon points="192,100 216,115 192,130" fill="#fff"/>`;
  }

  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const cap =
    `<rect x="0" y="194" width="400" height="66" fill="#05070a" opacity="0.85"/>` +
    `<rect x="0" y="193" width="400" height="1.5" fill="${c}" opacity="0.65"/>` +
    `<text x="24" y="226" fill="#fff" font-family="Montserrat, Arial, sans-serif" font-size="22" font-weight="700">${esc(p.title)}</text>` +
    `<text x="24" y="248" fill="${c}" font-family="Montserrat, Arial, sans-serif" font-size="11" font-weight="600" letter-spacing="1.8">${esc((p.category || '').toUpperCase())}</text>`;

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="780" viewBox="0 0 400 260">` +
    `<defs><linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="${cd}"/></linearGradient></defs>` +
    body + cap +
    `</svg>`;
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

function placeholderURI() {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="780" viewBox="0 0 400 260">` +
    `<rect width="400" height="260" fill="#080b10"/>` +
    `<rect x="8" y="8" width="384" height="244" rx="10" fill="none" stroke="#161f2c" stroke-width="2"/>` +
    `<circle cx="200" cy="130" r="24" fill="none" stroke="#222f42" stroke-width="2"/>` +
    `<circle cx="200" cy="130" r="4" fill="#e5c058" opacity="0.5"/></svg>`;
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

/* ========================================================
   Texture Loaders & Baked Play Badges
   ======================================================== */
function drawPlayBadge(ctx, cx, cy, r) {
  ctx.save();
  // Outer circle with camera gold rim
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(8, 11, 16, 0.65)';
  ctx.fill();
  ctx.lineWidth = Math.max(2.5, r * 0.08);
  ctx.strokeStyle = '#E5C058';
  ctx.stroke();

  // Play triangle
  const t = r * 0.52;
  ctx.beginPath();
  ctx.moveTo(cx - t * 0.55, cy - t);
  ctx.lineTo(cx - t * 0.55, cy + t);
  ctx.lineTo(cx + t * 0.95, cy);
  ctx.closePath();
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.restore();
}

function drawTitleOverlay(ctx, W, H, p) {
  ctx.save();
  ctx.fillStyle = 'rgba(5, 7, 10, 0.75)';
  ctx.fillRect(0, H - 64, W, 64);
  ctx.fillStyle = '#E5C058';
  ctx.fillRect(0, H - 65, W, 2);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 22px Montserrat, Arial, sans-serif';
  ctx.fillText(p.title || '', 24, H - 34);

  ctx.fillStyle = '#8CAE82';
  ctx.font = '600 12px Montserrat, Arial, sans-serif';
  ctx.fillText((p.category || '').toUpperCase(), 24, H - 14);
  ctx.restore();
}

function loadVideoTexture(uri, p, maxAniso) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const W = 800, H = 450;
      const cv = document.createElement('canvas');
      cv.width = W;
      cv.height = H;
      const ctx = cv.getContext('2d');
      const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
      const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
      ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
      drawPlayBadge(ctx, W / 2, H / 2, 48);
      drawTitleOverlay(ctx, W, H, p);

      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAniso;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(-1, 1);
      tex.offset.set(1, 0); // Un-mirror for cylinder interior
      tex.needsUpdate = true;
      resolve(tex);
    };
    img.onerror = () => resolve(null);
    img.src = uri;
  });
}

function loadTextureCover(uri, p, maxAniso) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const W = 800, H = 450;
      const cv = document.createElement('canvas');
      cv.width = W;
      cv.height = H;
      const ctx = cv.getContext('2d');
      const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
      const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
      ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
      drawTitleOverlay(ctx, W, H, p);

      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAniso;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(-1, 1);
      tex.offset.set(1, 0);
      tex.needsUpdate = true;
      resolve(tex);
    };
    img.onerror = () => resolve(null);
    img.src = uri;
  });
}

function loadDirectTexture(uri, maxAniso) {
  return new Promise((resolve) => {
    const img = new Image();
    if (!uri.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      const tex = new THREE.Texture(img);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAniso;
      tex.wrapS = THREE.RepeatWrapping;
      tex.repeat.x = -1;
      tex.offset.x = 1;
      tex.needsUpdate = true;
      resolve(tex);
    };
    img.onerror = () => resolve(null);
    img.src = uri;
  });
}

/* ========================================================
   3D Cylinder Setup & Scene Graph
   ======================================================== */
const isMobile = window.innerWidth < 768;
const R = 8; // Cylinder radius in world units
const ROWS = 6; // 6 vertically stacked rings
let AROUND = 6;
let ARC = 0;
let TILE_W = 0, TILE_H = 0, ROW_SP = 0;
let GY_MAX = 0;
let geo;

const app = document.getElementById('app');
const tipEl = document.getElementById('tip');

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const initialFogColor = (document.documentElement.getAttribute('data-theme') === 'light') ? 0xf8f8f5 : 0x05070a;
scene.fog = new THREE.Fog(initialFogColor, R * 1.25, R * 2.8);

const camera = new THREE.PerspectiveCamera(
  isMobile ? 70 : 58,
  window.innerWidth / window.innerHeight,
  0.01,
  100
);

let dolly = R * 0.58;
const DOLLY_IN = -R * 0.82;
const DOLLY_OUT = R * 0.98;
camera.position.z = dolly;
let groupY = 0;

const group = new THREE.Group();
scene.add(group);

// Hover Aura Materials (Shutter Gold & Emerald Glow)
const glowMat = new THREE.MeshBasicMaterial({
  color: 0xE5C058,
  side: THREE.BackSide,
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  fog: false
});

const outlineMat = new THREE.LineBasicMaterial({
  color: 0xFDE068,
  transparent: true,
  opacity: 0
});

let glow, outline;
const raycaster = new THREE.Raycaster();
const tiles = [];
const fillers = [];
const maxAniso = renderer.capabilities.getMaxAnisotropy();

// Matrix helpers for 3D tooltip calculations
const TMP = new THREE.Vector3();
const EA = new THREE.Vector3();
const EB = new THREE.Vector3();

function createInstantTileTexture(p, index) {
  const W = 800, H = 450;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#101622');
  grad.addColorStop(1, '#06090e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Gold luxury rim
  ctx.strokeStyle = '#E5C058';
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, W - 16, H - 16);

  // Bottom overlay
  ctx.fillStyle = 'rgba(5, 7, 10, 0.88)';
  ctx.fillRect(0, H - 76, W, 76);
  ctx.fillStyle = '#E5C058';
  ctx.fillRect(0, H - 77, W, 2);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px Montserrat, Arial, sans-serif';
  ctx.fillText(p.title || 'Tech Shutter Hub', 24, H - 42);

  ctx.fillStyle = '#8CAE82';
  ctx.font = '600 13px Montserrat, Arial, sans-serif';
  ctx.fillText((p.category || 'PORTFOLIO').toUpperCase(), 24, H - 18);

  if (p.video) {
    drawPlayBadge(ctx, W / 2, H / 2 - 20, 44);
  }

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.x = -1;
  tex.offset.x = 1;
  tex.needsUpdate = true;
  return tex;
}

/* ========================================================
   Build Cylinder Wall & Project Tiles
   ======================================================== */
async function buildGallery() {
  portfolioData = await loadProjects();
  window.TSH_PROJECTS = portfolioData;

  // Build category chips immediately so pills appear without delay
  buildCategoryChips();

  // Flatten items
  const items = [];
  portfolioData.forEach(p => {
    items.push({
      img: p.image || (p.photos && p.photos[0]) || '',
      video: p.video || '',
      title: p.title,
      category: p.category,
      project: p
    });
  });

  const CURATE = 54; // 9 columns x 6 rows = 54 curated slots
  const picked = [];
  const repeatCount = Math.ceil(CURATE / items.length);
  for (let r = 0; r < repeatCount; r++) {
    for (let i = 0; i < items.length && picked.length < CURATE; i++) {
      picked.push(items[i]);
    }
  }

  AROUND = Math.max(isMobile ? 5 : 6, Math.ceil(picked.length / ROWS));
  const totalSlots = ROWS * AROUND;
  ARC = ((Math.PI * 2) / AROUND) * 0.90; // Subtle gap between tiles
  TILE_W = R * ARC;
  TILE_H = (TILE_W * 9) / 16;
  ROW_SP = TILE_H * 1.12;
  GY_MAX = ((ROWS - 1) / 2) * ROW_SP;

  geo = new THREE.CylinderGeometry(R, R, TILE_H, 40, 1, true, -ARC / 2, ARC);

  glow = new THREE.Mesh(geo, glowMat);
  glow.visible = false;
  glow.scale.set(1.015, 1.03, 1.015);
  glow.renderOrder = 3;
  group.add(glow);

  outline = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), outlineMat);
  outline.visible = false;
  outline.renderOrder = 5;
  outline.scale.setScalar(1.004);
  group.add(outline);

  // Synchronously add all curated project tiles with instant textures
  picked.forEach((it, i) => {
    const col = Math.floor(i / ROWS);
    const ring = i % ROWS;
    const angle = col * ((Math.PI * 2) / AROUND) + Math.PI;
    const y = (ring - (ROWS - 1) / 2) * ROW_SP;

    const instantTex = createInstantTileTexture(it.project, i);
    const mat = new THREE.MeshBasicMaterial({
      map: instantTex,
      side: THREE.BackSide,
      color: 0x909090,
      fog: true
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.y = angle;
    mesh.position.y = y;
    mesh.userData = {
      p: it.project,
      item: it,
      baseY: y,
      ph: i * 1.7,
      angle0: angle,
      y0: y
    };

    group.add(mesh);
    tiles.push(mesh);

    // Asynchronously & non-blockingly load the real image texture
    if (it.img) {
      const img = new Image();
      if (!it.img.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        try {
          const W = 800, H = 450;
          const cv = document.createElement('canvas');
          cv.width = W;
          cv.height = H;
          const ctx = cv.getContext('2d');
          const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
          const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
          ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
          if (it.video) {
            drawPlayBadge(ctx, W / 2, H / 2 - 20, 44);
          }
          drawTitleOverlay(ctx, W, H, it.project);

          const realTex = new THREE.CanvasTexture(cv);
          realTex.colorSpace = THREE.SRGBColorSpace;
          realTex.anisotropy = maxAniso;
          realTex.wrapS = THREE.RepeatWrapping;
          realTex.repeat.x = -1;
          realTex.offset.x = 1;
          realTex.needsUpdate = true;

          mesh.material.map = realTex;
          mesh.material.needsUpdate = true;
        } catch (e) {
          // Instant luxury texture remains
        }
      };
      img.onerror = () => {};
      img.src = it.img;
    }
  });

  // Fillers to complete the cylinder
  for (let i = picked.length; i < totalSlots; i++) {
    const col = Math.floor(i / ROWS);
    const ring = i % ROWS;
    const instantTex = createInstantTileTexture({ title: 'Tech Shutter Hub', category: 'STUDIO' }, i);
    const mat = new THREE.MeshBasicMaterial({
      map: instantTex,
      side: THREE.BackSide,
      color: 0x707070,
      fog: true
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.y = col * ((Math.PI * 2) / AROUND) + Math.PI;
    mesh.position.y = (ring - (ROWS - 1) / 2) * ROW_SP;
    group.add(mesh);
    fillers.push(mesh);
  }
}

/* ========================================================
   Interactive Physics: Spin, Tilt, Pan, Zoom
   ======================================================== */
let spin = 0, spinVel = 0, tilt = 0;
let spinTarget = null;
let activeCat = 'All';
let dragging = false, lastX = 0, lastY = 0, dragMoved = false;
let px = -2, py = -2;
let pinching = false, lastPinch = 0;

const dom = renderer.domElement;
dom.style.cursor = 'grab';

let startPointerX = 0, startPointerY = 0;

function pointerDown(x, y) {
  dragging = true;
  dragMoved = false;
  startPointerX = x;
  startPointerY = y;
  lastX = x;
  lastY = y;
  spinVel = 0;
  spinTarget = null;
  dom.style.cursor = 'grabbing';
}

function pointerMove(x, y) {
  if (!dragging) return;
  const dist = Math.hypot(x - startPointerX, y - startPointerY);
  if (dist > 8) {
    dragMoved = true;
  }

  const dx = x - lastX;
  const dy = y - lastY;

  spin -= dx * 0.005;
  spinVel = -dx * 0.005;
  tilt = Math.max(-0.6, Math.min(0.6, tilt + dy * 0.004));

  if (Math.abs(spinVel) > 0.04 && window.soundEngine) {
    window.soundEngine.whoosh(Math.abs(spinVel) * 15);
  }

  lastX = x;
  lastY = y;
}

function pointerUp() {
  dragging = false;
  dom.style.cursor = 'grab';
  setTimeout(() => { dragMoved = false; }, 80);
}

dom.addEventListener('mousedown', (e) => pointerDown(e.clientX, e.clientY));
window.addEventListener('mousemove', (e) => {
  if (dragging) pointerMove(e.clientX, e.clientY);
});
window.addEventListener('mouseup', pointerUp);

dom.addEventListener('mousemove', (e) => {
  const rect = dom.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    px = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    py = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  } else {
    px = (e.clientX / window.innerWidth) * 2 - 1;
    py = -(e.clientY / window.innerHeight) * 2 + 1;
  }
});

dom.addEventListener('mouseleave', () => {
  px = -2;
  py = -2;
});

// Touch support
function touchDist(e) {
  const a = e.touches[0], b = e.touches[1];
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

dom.addEventListener('touchstart', (e) => {
  if (e.touches.length === 2) {
    pinching = true;
    lastPinch = touchDist(e);
    dragging = false;
  } else {
    pointerDown(e.touches[0].clientX, e.touches[0].clientY);
  }
}, { passive: true });

dom.addEventListener('touchmove', (e) => {
  if (e.touches.length === 2 && pinching) {
    e.preventDefault();
    const d = touchDist(e);
    dolly = Math.max(DOLLY_IN, Math.min(DOLLY_OUT, dolly - (d - lastPinch) * 0.045));
    lastPinch = d;
    camera.position.z = dolly;
  } else if (!pinching) {
    pointerMove(e.touches[0].clientX, e.touches[0].clientY);
  }
}, { passive: false });

dom.addEventListener('touchend', (e) => {
  if (e.touches.length === 0) {
    pinching = false;
    pointerUp();
  }
});

// Wheel interactions: pinch-to-zoom and horizontal spin without blocking webpage scroll
dom.addEventListener('wheel', (e) => {
  if (e.ctrlKey) {
    // Pinch to zoom
    e.preventDefault();
    dolly = Math.max(DOLLY_IN, Math.min(DOLLY_OUT, dolly + e.deltaY * 0.028));
    camera.position.z = dolly;
  } else if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
    // Horizontal spin
    e.preventDefault();
    const dx = e.deltaX !== 0 ? e.deltaX : e.deltaY;
    spin -= dx * 0.004;
    spinVel = -dx * 0.004;
  }
  // Vertical wheel scrolling is not prevented so the user can scroll the webpage smoothly!
}, { passive: false });

/* ========================================================
   Raycast Hover & 3D Tilted Label Calculation
   ======================================================== */
let hovered = null;

function updateHover() {
  if (!glow) return;
  let hit = null;

  if (px > -1.5) {
    raycaster.setFromCamera({ x: px, y: py }, camera);
    const visibleTiles = tiles.filter(t => t.visible);
    const hits = raycaster.intersectObjects(visibleTiles, false);
    if (hits.length) hit = hits[0].object;
  }

  if (hit !== hovered) {
    if (hovered) hovered.material.color.setHex(getBaseHex(hovered));
    hovered = hit;
    if (hovered) {
      hovered.material.color.setHex(0xFFFFFF); // Full brightness
      glow.rotation.y = outline.rotation.y = hovered.rotation.y;
      glow.position.y = outline.position.y = hovered.position.y;
      glow.visible = true;
      outline.visible = true;
    } else {
      glow.visible = outline.visible = false;
    }
  }

  if (hovered) {
    glow.position.y = outline.position.y = hovered.position.y;
    glowMat.opacity = 0.28;
    outlineMat.opacity = 0.85;

    // Anchor tooltip in top-third of tile and calculate 3D tilt
    const topY = TILE_H * 0.32;
    const eX = R * Math.sin(ARC / 2);
    const eZ = R * Math.cos(ARC / 2);

    TMP.set(0, topY, R);
    hovered.localToWorld(TMP).project(camera);

    if (TMP.z < 1) {
      const p = hovered.userData.p;
      if (tipEl) {
        tipEl.textContent = p.title;

        EA.set(-eX, topY, eZ);
        hovered.localToWorld(EA).project(camera);
        EB.set(eX, topY, eZ);
        hovered.localToWorld(EB).project(camera);

        const ax = (EA.x * 0.5 + 0.5) * window.innerWidth;
        const ay = (-EA.y * 0.5 + 0.5) * window.innerHeight;
        const bx = (EB.x * 0.5 + 0.5) * window.innerWidth;
        const by = (-EB.y * 0.5 + 0.5) * window.innerHeight;

        let ang = (Math.atan2(ay - by, ax - bx) * 180) / Math.PI;
        ang = Math.max(-24, Math.min(24, ang)); // Clamp

        const PAD = 14;
        const hw = tipEl.offsetWidth / 2 + PAD;
        const hh = tipEl.offsetHeight / 2 + PAD;

        const lx = Math.max(hw, Math.min(window.innerWidth - hw, (TMP.x * 0.5 + 0.5) * window.innerWidth));
        const ly = Math.max(hh, Math.min(window.innerHeight - hh, (-TMP.y * 0.5 + 0.5) * window.innerHeight));

        tipEl.style.left = lx + 'px';
        tipEl.style.top = ly + 'px';
        tipEl.style.transform = `translate(-50%, -50%) rotate(${ang.toFixed(1)}deg)`;
        tipEl.style.opacity = '1';
      }
    } else {
      if (tipEl) tipEl.style.opacity = '0';
    }
    dom.style.cursor = dragging ? 'grabbing' : 'pointer';
  } else {
    glow.visible = outline.visible = false;
    if (tipEl) tipEl.style.opacity = '0';
    if (!dragging) dom.style.cursor = 'grab';
  }
}

function getBaseHex(mesh) {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  if (activeCat === 'All') return isLight ? 0x9e9e9e : 0x8c8c8c;
  return mesh.userData.p.category === activeCat ? 0xffffff : (isLight ? 0xd0ceca : 0x1a212d);
}

/* ========================================================
   Category Filtering & Dynamic 3D Clustering Reflow
   ======================================================== */
function reflow() {
  if (glow) glow.visible = false;
  if (outline) outline.visible = false;
  hovered = null;

  if (activeCat === 'All') {
    // Restore home positions
    tiles.forEach(m => {
      m.rotation.y = m.userData.angle0;
      m.userData.baseY = m.userData.y0;
      m.visible = true;
    });
    fillers.forEach(f => { f.visible = true; });
    groupY = 0;
    dolly = R * 0.58;
    camera.position.z = dolly;
    return;
  }

  const matches = tiles.filter(m => m.userData.p.category === activeCat);
  tiles.forEach(m => { m.visible = matches.includes(m); });
  fillers.forEach(f => { f.visible = false; });

  // Center matching tiles in front of camera
  const n = matches.length;
  const cols = Math.min(3, n);
  const rows = Math.ceil(n / cols);
  const angStep = (Math.PI * 2) / AROUND;

  matches.forEach((m, i) => {
    const r = Math.floor(i / cols);
    const cInRow = i - r * cols;
    const colsThisRow = Math.min(cols, n - r * cols);
    m.rotation.y = Math.PI + (cInRow - (colsThisRow - 1) / 2) * angStep;
    m.userData.baseY = ((rows - 1) / 2 - r) * ROW_SP;
  });

  groupY = 0;
  spinTarget = 0;
  spinVel = 0;
  dolly = Math.min(DOLLY_OUT, R * 0.6 + Math.max(0, cols - 2) * R * 0.16);
  camera.position.z = dolly;
}

function buildCategoryChips() {
  const container = document.getElementById('cats');
  if (!container || container.children.length) return;

  const cats = ['All', ...new Set(portfolioData.map(p => p.category).filter(Boolean))];

  cats.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'cat' + (c === 'All' ? ' on' : '');
    btn.type = 'button';
    btn.textContent = c;
    btn.dataset.cat = c;

    btn.addEventListener('click', () => {
      activeCat = c;
      container.querySelectorAll('.cat').forEach(b => b.classList.toggle('on', b === btn));
      if (window.soundEngine) window.soundEngine.apertureTick();
      reflow();
      tiles.forEach(m => {
        if (m !== hovered) m.material.color.setHex(getBaseHex(m));
      });
    });

    container.appendChild(btn);
  });
}

/* ========================================================
   Tile Click & Lightbox Activation
   ======================================================== */
function pickAt(clientX, clientY) {
  if (!tiles.length) return null;
  const rect = dom.getBoundingClientRect();
  const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
  const ny = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera({ x: nx, y: ny }, camera);
  const visible = tiles.filter(t => t.visible);
  const hits = raycaster.intersectObjects(visible, false);
  return hits.length ? hits[0].object : null;
}

function activate(clientX, clientY) {
  const obj = pickAt(clientX, clientY);
  if (!obj) return;

  if (window.soundEngine) window.soundEngine.shutterClick();

  const p = obj.userData.p;
  if (window.tshLightbox && typeof window.tshLightbox.open === 'function') {
    window.tshLightbox.open(p, portfolioData);
  } else if (typeof window.openLightbox === 'function') {
    window.openLightbox(p);
  }
}

dom.addEventListener('click', (e) => {
  if (dragMoved) return;
  activate(e.clientX, e.clientY);
});

dom.addEventListener('touchend', (e) => {
  if (dragMoved || pinching) return;
  if (e.changedTouches.length === 1) {
    const t = e.changedTouches[0];
    activate(t.clientX, t.clientY);
  }
});

/* ========================================================
   Theme Change Listener (Update WebGL Fog & Lighting)
   ======================================================== */
window.addEventListener('tsh:theme-changed', (e) => {
  const isLight = e.detail.theme === 'light';
  const fogColor = isLight ? 0xf8f8f5 : 0x05070a;
  scene.fog.color.setHex(fogColor);

  glowMat.color.setHex(isLight ? 0xc59b27 : 0xe5c058);
  outlineMat.color.setHex(isLight ? 0xdbb035 : 0xfde068);

  tiles.forEach(m => {
    if (m !== hovered) m.material.color.setHex(getBaseHex(m));
  });
});

/* ========================================================
   Render Loop
   ======================================================== */
function tick() {
  if (!dragging) {
    spin += spinVel;
    spinVel *= 0.92;
    if (Math.abs(spinVel) < 0.0001) spinVel = 0;
  }

  if (spinTarget !== null && !dragging) {
    spin += (spinTarget - spin) * 0.14;
    if (Math.abs(spinTarget - spin) < 0.002) {
      spin = spinTarget;
      spinTarget = null;
    }
  }

  group.rotation.y = spin;
  group.position.y = groupY;
  camera.rotation.x = tilt;

  // Gentle float oscillation
  const t = performance.now() * 0.001;
  tiles.forEach(m => {
    m.position.y = m.userData.baseY + Math.sin(t * 0.7 + m.userData.ph) * 0.045;
  });

  updateHover();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

// Window resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Fade headline on first interaction or timer
(function () {
  const headline = document.querySelector('.headline');
  if (!headline) return;
  let faded = false;

  function fade() {
    if (faded) return;
    faded = true;
    headline.classList.add('faded');
  }

  const timer = setTimeout(fade, 4000);
  ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach(ev => {
    window.addEventListener(ev, () => {
      clearTimeout(timer);
      fade();
    }, { once: true, passive: true });
  });
})();

// Start rendering loop immediately so the WebGL cylinder & scene are visible from second 0
tick();

// Build gallery & populate category chips
buildGallery().catch(err => {
  console.error('[3D Gallery] Initialization error:', err);
});
