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

  // Initial application on DOM load
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(currentTheme, false);

    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleTheme();
      });
    });
  });

  window.tshTheme = {
    get: () => currentTheme,
    set: applyTheme,
    toggle: toggleTheme
  };
})();
