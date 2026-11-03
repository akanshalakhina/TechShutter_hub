/* ========================================================
   TECH SHUTTER HUB - Editorial Home Controller
   Handles navigation, services dropdown, mobile drawer,
   and interactive FAQ accordion.
   ======================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initDropdown();
  initFAQ();
});

// 1. Header scroll state & mobile drawer
function initHeader() {
  const header = document.querySelector('.tsh-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }, { passive: true });

  const toggle = document.getElementById('mobileNavToggle');
  const drawer = document.getElementById('mobileDrawer');
  const drawerClose = document.getElementById('drawerClose');

  toggle?.addEventListener('click', () => {
    drawer?.classList.add('open');
  });

  drawerClose?.addEventListener('click', () => {
    drawer?.classList.remove('open');
  });

  drawer?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => drawer?.classList.remove('open'));
  });
}

// 2. Services Dropdown interactions
function initDropdown() {
  const wrapper = document.querySelector('.tsh-dropdown-wrapper');
  const trigger = document.querySelector('.tsh-dropdown-trigger');

  trigger?.addEventListener('click', (e) => {
    e.preventDefault();
    wrapper?.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!wrapper?.contains(e.target)) {
      wrapper?.classList.remove('open');
    }
  });
}

// 3. Interactive FAQ Accordion
function initFAQ() {
  const items = document.querySelectorAll('.rx-faq-item');
  items.forEach(item => {
    const btn = item.querySelector('.rx-faq-question');
    btn?.addEventListener('click', () => {
      const wasActive = item.classList.contains('active');
      items.forEach(other => other.classList.remove('active'));
      if (!wasActive) {
        item.classList.add('active');
      }
    });
  });
}
