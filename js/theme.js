/* ========================================================
   TECH SHUTTER HUB - Theme Controller & Logo Switcher
   Handles Dark / Light themes and swaps logo based on theme
   ======================================================== */

(function () {
  const THEME_KEY = 'tsh_theme';
  const LOGO_DARK = '/assets/logos/logo-dark-transparent.png';
  const LOGO_LIGHT = '/assets/logos/logo-light-transparent.png';

  // Fallbacks if transparent PNG isn't loaded
  const LOGO_DARK_JPG = '/assets/logos/logo-dark-bg.jpg';
  const LOGO_LIGHT_JPG = '/assets/logos/logo-light-bg.jpg';

  let currentTheme = localStorage.getItem(THEME_KEY) || 'dark';

  function applyTheme(theme, animate = false) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    if (document.body) document.body.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    // Update logos across document
    const logoImgs = document.querySelectorAll('.brand-logo-img');
    const targetLogo = theme === 'light' ? LOGO_LIGHT : LOGO_DARK;
    const fallbackLogo = theme === 'light' ? LOGO_LIGHT_JPG : LOGO_DARK_JPG;

    logoImgs.forEach(img => {
      img.src = targetLogo;
      img.onerror = () => {
        img.onerror = null;
        img.src = fallbackLogo;
      };
    });

    // Update theme toggle buttons
    const toggles = document.querySelectorAll('.theme-toggle-btn');
    toggles.forEach(btn => {
      const icon = btn.querySelector('.theme-icon');
      const text = btn.querySelector('.theme-text');
      if (theme === 'light') {
        if (icon) icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>'; // Moon for light mode
        if (text) text.textContent = 'Dark';
        btn.setAttribute('aria-label', 'Switch to Dark Theme');
        btn.setAttribute('title', 'Switch to Dark Theme');
      } else {
        if (icon) icon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>'; // Sun for dark mode
        if (text) text.textContent = 'Light';
        btn.setAttribute('aria-label', 'Switch to Light Theme');
        btn.setAttribute('title', 'Switch to Light Theme');
      }
    });

    // Dispatch event for 3D Three.js scene update
    window.dispatchEvent(new CustomEvent('tsh:theme-changed', {
      detail: { theme }
    }));

    if (window.soundEngine && animate) {
      window.soundEngine.apertureTick();
    }
  }

  function toggleTheme() {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme, true);
  }

  // ========================================================
  // Universal Mobile Navigation Drawer & Hamburger Controller
  // ========================================================
  function initMobileNav() {
    // Never inject public site mobile drawer on the admin studio management portal
    if (window.location.pathname.includes('admin') || (document.body && document.body.classList.contains('admin-page'))) {
      return;
    }

    // 1. Ensure Hamburger Toggle Button exists in Header
    let toggleBtn = document.getElementById('mobileNavToggle');
    const navActions = document.querySelector('.tsh-nav-actions') || document.querySelector('.tsh-nav-right');

    if (!toggleBtn && navActions) {
      toggleBtn = document.createElement('button');
      toggleBtn.className = 'mobile-nav-toggle';
      toggleBtn.id = 'mobileNavToggle';
      toggleBtn.setAttribute('aria-label', 'Open Navigation Menu');
      toggleBtn.innerHTML = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      `;
      navActions.appendChild(toggleBtn);
    }

    // 2. Ensure Backdrop Overlay exists
    let backdrop = document.getElementById('mobileDrawerBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'mobile-drawer-backdrop';
      backdrop.id = 'mobileDrawerBackdrop';
      document.body.appendChild(backdrop);
    }

    // 3. Ensure Mobile Drawer exists
    let drawer = document.getElementById('mobileDrawer');
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';

    if (!drawer) {
      drawer = document.createElement('div');
      drawer.className = 'mobile-drawer';
      drawer.id = 'mobileDrawer';

      const navLinks = [
        { label: 'Wedding', href: '/wedding' },
        { label: 'Services', href: '/services' },
        { label: 'Career', href: '/career' },
        { label: 'Work', href: '/work' },
        { label: 'Gallery', href: '/gallery' }
      ];

      const navItemsHtml = navLinks.map(link => {
        const isActive = currentPath === link.href || (link.href !== '/' && currentPath.startsWith(link.href));
        return `
          <li>
            <a href="${link.href}" class="mobile-drawer-link ${isActive ? 'active' : ''}">
              <span>${link.label}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </a>
          </li>
        `;
      }).join('');

      drawer.innerHTML = `
        <div class="mobile-drawer-header">
          <a href="/" class="mobile-drawer-brand">
            <img src="/assets/logos/techshutter-logo.png" alt="Tech Shutter Hub Logo" onerror="this.src='/assets/logos/logo-dark-transparent.png'" />
            <span class="mobile-drawer-title">Tech Shutter Hub</span>
          </a>
          <button class="mobile-drawer-close" id="drawerClose" aria-label="Close Menu">&times;</button>
        </div>
        <ul class="mobile-drawer-nav">
          ${navItemsHtml}
        </ul>
        <div class="mobile-drawer-footer">
          <a href="/contact" class="mobile-drawer-cta">Start a Project</a>
        </div>
      `;
      document.body.appendChild(drawer);
    } else {
      // If drawer existed in HTML, remove restrictive inline right styling so CSS class works
      drawer.classList.add('mobile-drawer');
      drawer.style.right = '';
    }

    // 4. Toggle & Close Handlers
    function openDrawer() {
      if (drawer) drawer.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
    }

    function closeDrawer() {
      if (drawer) drawer.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
      document.body.style.overflow = '';
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (drawer && drawer.classList.contains('open')) {
          closeDrawer();
        } else {
          openDrawer();
        }
      });
    }

    const closeBtn = document.getElementById('drawerClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeDrawer();
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', closeDrawer);
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
        closeDrawer();
      }
    });

    if (drawer) {
      drawer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          closeDrawer();
        });
      });
    }
  }

  // Initial application on DOM load
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(currentTheme, false);

    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleTheme();
      });
    });

    // Initialize Universal Mobile Navigation
    initMobileNav();
  });

  window.tshTheme = {
    get: () => currentTheme,
    set: applyTheme,
    toggle: toggleTheme
  };
})();
