<?php
// Tech Shutter Hub - PHP Page
?>
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Selected Works &amp; 3D Gallery | TECH SHUTTER HUB</title>
  <meta name="description" content="Immersive 3D WebGL Cylinder Gallery showcasing Tech Shutter Hub's selected visual works: Weddings, Pre-Wedding Escapes, 9:16 Video Reels, Luxury Products, F&B, and Cultural Portfolios." />
  
  <link rel="icon" href="/favicon.png" type="image/png" />
  <link rel="stylesheet" href="/css/theme.css" />
  <link rel="stylesheet" href="/css/style.css" />
  <link rel="stylesheet" href="/css/editorial.css?v=2" />
  
  <style>
    /* 3D Immersive Full-Screen Page Overrides */
    html, body.work-3d-page {
      margin: 0;
      padding: 0;
      width: 100vw;
      height: 100vh;
      overflow: hidden !important;
      position: fixed;
      inset: 0;
      background: var(--bg-canvas, #05070a);
    }

    #app {
      position: fixed !important;
      inset: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 1 !important;
      pointer-events: auto !important;
    }

    /* Floating Header on 3D Canvas */
    .work-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 50;
      background: rgba(5, 7, 10, 0.7);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    /* Floating Category Chips */
    .work-cats-wrap {
      position: fixed;
      top: 86px;
      left: 0;
      right: 0;
      z-index: 40;
      display: flex;
      justify-content: center;
      pointer-events: none;
      padding: 0 16px;
    }

    .work-cats:empty {
      display: none;
    }

    .work-cats {
      pointer-events: auto;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: center;
      max-width: min(94vw, 1100px);
      padding: 8px 18px;
      background: rgba(14, 19, 27, 0.75);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-radius: 40px;
      border: 1px solid rgba(229, 192, 88, 0.25);
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
    }

    .work-cats .cat {
      font-family: var(--font-body, 'Montserrat', sans-serif);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--text-muted, #A3AFBF);
      background: transparent;
      border: 1px solid transparent;
      padding: 6px 14px;
      border-radius: 20px;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;
    }

    .work-cats .cat:hover {
      color: #ffffff;
      background: rgba(229, 192, 88, 0.15);
      border-color: rgba(229, 192, 88, 0.3);
    }

    .work-cats .cat.on {
      color: #05070a;
      background: linear-gradient(135deg, #FDE068, #E5C058);
      border-color: #FDE068;
      font-weight: 700;
      box-shadow: 0 2px 10px rgba(229, 192, 88, 0.4);
    }

    /* Floating Bottom Dock */
    .work-dock {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 40;
      display: flex;
      align-items: center;
      gap: 16px;
      background: rgba(10, 14, 20, 0.8);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 8px 20px;
      border-radius: 30px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
      font-size: 12px;
      color: var(--text-muted, #A3AFBF);
    }

    .work-dock-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #ffffff;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }

    .work-dock-btn:hover {
      background: rgba(229, 192, 88, 0.2);
      border-color: var(--brand-gold, #E5C058);
      color: var(--brand-gold, #E5C058);
    }

    /* 2D Grid Modal Overlay */
    .grid-modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 100;
      background: rgba(5, 7, 10, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      overflow-y: auto;
      padding: 100px 24px 60px;
      display: none;
    }

    .grid-modal-overlay.open {
      display: block;
    }

    .grid-modal-close {
      position: fixed;
      top: 24px;
      right: 32px;
      z-index: 110;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      font-size: 24px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .grid-modal-close:hover {
      background: rgba(229, 192, 88, 0.3);
      color: var(--brand-gold);
    }
  </style>
</head>
<body class="work-3d-page">

  <!-- ========================================================
       1. FIXED HEADER & NAVIGATION
       ======================================================== -->
  <header class="tsh-header work-header" role="banner">
    <div class="container">
      <div class="tsh-nav-inner">
        <a href="/" class="tsh-brand" title="Tech Shutter Hub Home">
          <img class="tsh-brand-img" src="/assets/logos/techshutter-logo.png" alt="Logo" onerror="this.src='/assets/logos/logo-dark-transparent.png'" />
          <div class="tsh-brand-text">
            <span class="tsh-brand-name">Tech Shutter Hub</span>
            <span class="tsh-brand-tag">Cinematic Visual Studio</span>
          </div>
        </a>

        <nav class="tsh-nav-desktop">
          <ul class="tsh-nav-menu">
            <li><a href="/wedding" class="tsh-nav-link">Wedding</a></li>
            <li class="tsh-dropdown-wrapper">
              <a href="/services" class="tsh-nav-link">Services <span class="dropdown-caret">&#9662;</span></a>
              <div class="tsh-dropdown-menu" role="menu">
                <a href="/services#wedding-service" class="dropdown-item">
                  <span class="dropdown-item-title">Weddings &amp; Rituals</span>
                  <span class="dropdown-item-desc">Full-spectrum ceremony documentation</span>
                </a>
                <a href="/services#prewedding-service" class="dropdown-item">
                  <span class="dropdown-item-title">Pre-Wedding Shoots</span>
                  <span class="dropdown-item-desc">Stylised romantic couple escapes</span>
                </a>
                <a href="/services#reels-service" class="dropdown-item">
                  <span class="dropdown-item-title">Cinematic Reels</span>
                  <span class="dropdown-item-desc">Fast-paced 9:16 vertical video</span>
                </a>
                <a href="/services#product-service" class="dropdown-item">
                  <span class="dropdown-item-title">Product &amp; E-Commerce</span>
                  <span class="dropdown-item-desc">Jewellery &amp; goods catalog imagery</span>
                </a>
                <a href="/services#fb-service" class="dropdown-item">
                  <span class="dropdown-item-title">F&amp;B &amp; Ambiance</span>
                  <span class="dropdown-item-desc">Culinary styling &amp; hospitality</span>
                </a>
                <a href="/services#corp-service" class="dropdown-item">
                  <span class="dropdown-item-title">Corporate &amp; Teams</span>
                  <span class="dropdown-item-desc">Executive portraits &amp; events</span>
                </a>
                <a href="/services#maternity-service" class="dropdown-item">
                  <span class="dropdown-item-title">Maternity &amp; Annaprashan</span>
                  <span class="dropdown-item-desc">Parenthood glow &amp; rice ceremony</span>
                </a>
                <a href="/services#festive-service" class="dropdown-item">
                  <span class="dropdown-item-title">Festive &amp; Cultural</span>
                  <span class="dropdown-item-desc">Durga Puja editorial portfolios</span>
                </a>
              </div>
            </li>
            <li><a href="/career" class="tsh-nav-link">Career</a></li>
            <li><a href="/work" class="tsh-nav-link active">Work</a></li>
          </ul>
        </nav>

        <div class="tsh-nav-actions">
          <button class="nav-btn btn-icon-only" id="soundToggleBtn" title="Sound Effects" aria-label="Toggle Sound">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          </button>

          <button class="nav-btn theme-toggle-btn" title="Toggle Theme" aria-label="Toggle Theme">
            <svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
            </svg>
          </button>

          <a href="/contact" class="btn-start-project">
            <span>Start a Project</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
          </a>
        </div>
      
          <!-- Mobile Hamburger Toggle -->
          <button class="mobile-nav-toggle" id="mobileNavToggle" aria-label="Open Mobile Menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
    </div>
  </header>

  <!-- Mobile Navigation Backdrop & Drawer -->
  <div class="mobile-drawer-backdrop" id="mobileDrawerBackdrop"></div>
  <div class="mobile-drawer" id="mobileDrawer">
    <div class="mobile-drawer-header">
      <a href="/" class="mobile-drawer-brand">
        <img src="/assets/logos/techshutter-logo.png" alt="Tech Shutter Hub Logo" onerror="this.src='/assets/logos/logo-dark-transparent.png'" />
        <span class="mobile-drawer-title">Tech Shutter Hub</span>
      </a>
      <button class="mobile-drawer-close" id="drawerClose" aria-label="Close Menu">&times;</button>
    </div>
    <ul class="mobile-drawer-nav">
      <li>
        <a href="/wedding" class="mobile-drawer-link">
          <span>Wedding</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </a>
      </li>
      <li>
        <a href="/services" class="mobile-drawer-link">
          <span>Services</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </a>
      </li>
      <li>
        <a href="/career" class="mobile-drawer-link">
          <span>Career</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </a>
      </li>
      <li>
        <a href="/work" class="mobile-drawer-link active">
          <span>Work</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </a>
      </li>
      <li>
        <a href="/gallery" class="mobile-drawer-link">
          <span>Gallery</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </a>
      </li>
    </ul>
    <div class="mobile-drawer-footer">
      <a href="/contact" class="mobile-drawer-cta">Start a Project</a>
    </div>
  </div>

  <!-- ========================================================
       2. REAL-TIME 3D CATEGORY FILTER CHIPS
       ======================================================== -->
  <div class="work-cats-wrap">
    <div class="work-cats" id="cats"></div>
  </div>

  <!-- ========================================================
       3. FULL-SCREEN 3D WEBGL CYLINDER CANVAS
       ======================================================== -->
  <div id="app"></div>
  <div class="tip" id="tip" role="tooltip" aria-hidden="true"></div>

  <!-- ========================================================
       4. BOTTOM FLOATING CONTROLS & DOCK
       ======================================================== -->
  <div class="work-dock">
    <span>&#8644; Drag to spin &middot; Pinch / scroll to zoom &middot; Click frame to inspect</span>
    <button class="work-dock-btn" id="openGridBtn" type="button">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
      <span>Grid View</span>
    </button>
  </div>

  <!-- ========================================================
       5. 2D GRID MODAL OVERLAY (When Grid View is clicked)
       ======================================================== -->
  <div class="grid-modal-overlay" id="gridModal">
    <button class="grid-modal-close" id="closeGridBtn" aria-label="Close Grid View">&times;</button>
    <div class="container">
      <div style="text-align: center; max-width: 720px; margin: 0 auto 36px;">
        <span class="section-label">Curated Catalog</span>
        <h2 class="section-title">Selected Works</h2>
        <p class="section-subtitle" id="gridSubtitle" style="margin: 0 auto;">Browse all high-resolution photographs &amp; video teasers.</p>
      </div>

      <div class="wedding-photos-grid" id="gridCardsContainer"></div>
    </div>
  </div>

  <!-- ========================================================
       6. CINEMATIC MEDIA LIGHTBOX MODAL
       ======================================================== -->
  <div class="vbox" id="vbox" role="dialog" aria-modal="true" aria-hidden="true">
    <button class="vbox-close" id="vboxClose" aria-label="Close Lightbox">&times;</button>
    <div class="vbox-stage">
      <div class="vbox-frame">
        <div class="vbox-embed" id="vboxEmbed"></div>
        <img class="vbox-img" id="vboxImg" alt="Project Media" hidden />
        <button class="vbox-nav prev" id="vboxPrev" aria-label="Previous Photo" hidden>&#8249;</button>
        <button class="vbox-nav next" id="vboxNext" aria-label="Next Photo" hidden>&#8250;</button>
        <div class="vbox-count" id="vboxCount" hidden></div>
      </div>
      <div class="vbox-bar">
        <div>
          <h2 class="vbox-title" id="vboxTitle"></h2>
          <span class="vbox-cat" id="vboxCat"></span>
        </div>
        <a href="/contact" class="vbox-cta" id="vboxCta">Inquire This Project Style &rarr;</a>
      </div>
    </div>
  </div>

  <!-- Scripts -->
  <script src="/js/theme.js"></script>
  <script src="/js/audio.js"></script>
  <script src="/js/lightbox.js"></script>
  <script type="module" src="/js/app3d.js"></script>

  <script>
    // Grid modal overlay toggle
    document.addEventListener('DOMContentLoaded', () => {
      const openBtn = document.getElementById('openGridBtn');
      const closeBtn = document.getElementById('closeGridBtn');
      const modal = document.getElementById('gridModal');
      const container = document.getElementById('gridCardsContainer');
      let gridLoaded = false;

      async function loadGrid() {
        if (gridLoaded) return;
        let items = [];
        try {
          const res = await fetch('/api/projects');
          if (res.ok) {
            const json = await res.json();
            items = Array.isArray(json) ? json : (json && Array.isArray(json.data) ? json.data : []);
          }
        } catch (e) {}

        if (!items.length) {
          try {
            const res = await fetch('/projects.json');
            if (res.ok) {
              const json = await res.json();
              items = Array.isArray(json) ? json : (json && Array.isArray(json.data) ? json.data : []);
            }
          } catch (e) {}
        }

        if (items.length) {
          container.innerHTML = '';
          const sub = document.getElementById('gridSubtitle');
          if (sub) sub.textContent = `Browse all ${items.length} high-resolution photographs & video teasers.`;

          items.forEach(p => {
            const card = document.createElement('div');
            card.className = `wedding-photo-card ${p.orientation || 'landscape'}`;
            const imgSrc = p.image || (p.photos && p.photos[0]) || p.thumbImage || '/assets/logos/logo-dark-bg.jpg';
            card.innerHTML = `
              <img class="wedding-photo-img" src="${imgSrc}" alt="${p.title}" loading="lazy" />
              <div class="wedding-photo-overlay">
                <span class="wedding-photo-ritual">${p.category || 'Portfolio'} ${p.weddingRitual ? '• ' + p.weddingRitual : ''}</span>
                <h3 class="wedding-photo-title">${p.title}</h3>
                <span class="wedding-photo-meta">${p.client || 'Tech Shutter Hub'} &middot; ${p.year || '2026'}</span>
              </div>
            `;
            card.addEventListener('click', () => {
              if (window.tshLightbox) window.tshLightbox.open(p, items);
            });
            container.appendChild(card);
          });
          gridLoaded = true;
        } else {
          container.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:40px;grid-column:1/-1;">No projects found.</div>';
        }
      }

      openBtn?.addEventListener('click', () => {
        modal?.classList.add('open');
        loadGrid();
      });

      closeBtn?.addEventListener('click', () => {
        modal?.classList.remove('open');
      });

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.classList.contains('open')) {
          modal.classList.remove('open');
        }
      });
    });
  </script>
</body>
</html>
