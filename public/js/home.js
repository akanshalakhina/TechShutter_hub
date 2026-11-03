/* ========================================================
   TECH SHUTTER HUB - Editorial Home Controller
   Handles navigation, wedding ritual filtering, video reels,
   services dropdown, work grid, and contact booking form.
   ======================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initDropdown();
  initWeddingSection();
  initVideoReels();
  initServicesBooking();
  initWorkSection();
  initContactForm();
  initCareerModal();
});

let allProjects = [];

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

// 3. Wedding Section: Ritual Tabs & Dynamic Photo Loading
async function initWeddingSection() {
  const container = document.getElementById('weddingPhotosGrid');
  const tabs = document.querySelectorAll('.ritual-tab-btn');
  if (!container) return;

  try {
    const res = await fetch('/api/projects');
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      allProjects = json.data;
    }
  } catch (err) {
    console.error('Error fetching projects:', err);
  }

  // Filter wedding-specific projects
  function renderRitual(ritual) {
    container.innerHTML = '';
    let filtered = allProjects.filter(p => {
      const isWedding = (p.category || '').toLowerCase().includes('wedding') || p.weddingRitual;
      if (!isWedding) return false;
      if (ritual === 'All') return true;
      return (p.weddingRitual || '').toLowerCase() === ritual.toLowerCase();
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No photographs found for this ritual yet. Use the Admin Portal to upload!</div>`;
      return;
    }

    filtered.slice(0, 18).forEach(project => {
      const card = document.createElement('div');
      card.className = `wedding-photo-card ${project.orientation || 'landscape'}`;
      card.innerHTML = `
        <img class="wedding-photo-img" src="${project.image || (project.photos && project.photos[0]) || '/assets/logos/logo-dark-bg.jpg'}" alt="${project.title}" loading="lazy" />
        <div class="wedding-photo-overlay">
          <span class="wedding-photo-ritual">${project.weddingRitual || project.category}</span>
          <h3 class="wedding-photo-title">${project.title}</h3>
          <span class="wedding-photo-meta">${project.client || 'Tech Shutter Hub'} &middot; ${project.year || '2026'}</span>
        </div>
      `;
      card.addEventListener('click', () => openProjectLightbox(project));
      container.appendChild(card);
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const ritual = tab.getAttribute('data-ritual') || 'All';
      renderRitual(ritual);
    });
  });

  renderRitual('All');
}

// 4. Video Reels Showcase (Vertical 9:16 Video playback)
function initVideoReels() {
  const cards = document.querySelectorAll('.reel-card');
  cards.forEach(card => {
    const video = card.querySelector('video');
    const playBtn = card.querySelector('.reel-play-btn');
    const muteBtn = card.querySelector('.reel-mute-btn');

    if (!video) return;

    // Hover or button click playback
    playBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (video.paused) {
        video.play();
        playBtn.innerHTML = '&#10074;&#10074;';
      } else {
        video.pause();
        playBtn.innerHTML = '&#9654;';
      }
    });

    muteBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      video.muted = !video.muted;
      muteBtn.innerHTML = video.muted ? '&#128263;' : '&#128266;';
    });

    card.addEventListener('mouseenter', () => {
      video.play().catch(() => {});
      if (playBtn) playBtn.innerHTML = '&#10074;&#10074;';
    });

    card.addEventListener('mouseleave', () => {
      video.pause();
      if (playBtn) playBtn.innerHTML = '&#9654;';
    });
  });
}

// 5. Services: "Book This Service" pre-fills contact form
function initServicesBooking() {
  document.querySelectorAll('.service-book-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const serviceName = btn.getAttribute('data-service') || '';
      const select = document.getElementById('contactService');
      if (select && serviceName) {
        for (let i = 0; i < select.options.length; i++) {
          if (select.options[i].text.toLowerCase().includes(serviceName.toLowerCase()) ||
              select.options[i].value.toLowerCase().includes(serviceName.toLowerCase())) {
            select.selectedIndex = i;
            break;
          }
        }
      }
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// 6. Work Section: Filterable Grid & 3D Switch
function initWorkSection() {
  const gridContainer = document.getElementById('workGridCards');
  const filterBtns = document.querySelectorAll('.work-filter-btn');
  const viewGridBtn = document.getElementById('viewGridBtn');
  const view3dBtn = document.getElementById('view3dBtn');
  const gridWrap = document.getElementById('workGridWrap');
  const wrap3d = document.getElementById('work3dWrap');

  function renderWork(category) {
    if (!gridContainer) return;
    gridContainer.innerHTML = '';
    const filtered = (category === 'All')
      ? allProjects
      : allProjects.filter(p => (p.category || '').toLowerCase() === category.toLowerCase());

    filtered.slice(0, 24).forEach(project => {
      const card = document.createElement('div');
      card.className = `wedding-photo-card ${project.orientation || 'landscape'}`;
      card.innerHTML = `
        <img class="wedding-photo-img" src="${project.image || (project.photos && project.photos[0]) || '/assets/logos/logo-dark-bg.jpg'}" alt="${project.title}" loading="lazy" />
        <div class="wedding-photo-overlay">
          <span class="wedding-photo-ritual">${project.category}</span>
          <h3 class="wedding-photo-title">${project.title}</h3>
          <span class="wedding-photo-meta">${project.client || 'Tech Shutter Hub'} &middot; ${project.year || '2026'}</span>
        </div>
      `;
      card.addEventListener('click', () => openProjectLightbox(project));
      gridContainer.appendChild(card);
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderWork(btn.getAttribute('data-category') || 'All');
    });
  });

  // Switch between Grid & 3D WebGL Cylinder
  viewGridBtn?.addEventListener('click', () => {
    viewGridBtn.classList.add('active');
    view3dBtn?.classList.remove('active');
    gridWrap.style.display = 'block';
    wrap3d?.classList.remove('active');
  });

  view3dBtn?.addEventListener('click', () => {
    view3dBtn.classList.add('active');
    viewGridBtn?.classList.remove('active');
    gridWrap.style.display = 'none';
    wrap3d?.classList.add('active');
  });

  setTimeout(() => renderWork('All'), 300);
}

// 7. Lightbox integration
function openProjectLightbox(project) {
  const vbox = document.getElementById('vbox');
  const vboxTitle = document.getElementById('vboxTitle');
  const vboxCat = document.getElementById('vboxCat');
  const vboxImg = document.getElementById('vboxImg');
  const vboxEmbed = document.getElementById('vboxEmbed');
  const vboxClose = document.getElementById('vboxClose');

  if (!vbox) return;

  if (vboxTitle) vboxTitle.textContent = project.title || 'Tech Shutter Hub';
  if (vboxCat) vboxCat.textContent = `${project.category} ${project.weddingRitual ? '• ' + project.weddingRitual : ''}`;

  if (project.video) {
    if (vboxImg) vboxImg.hidden = true;
    if (vboxEmbed) {
      vboxEmbed.innerHTML = `<video src="${project.video}" controls autoplay playsinline style="width:100%;height:100%;max-height:80vh;border-radius:12px;"></video>`;
      vboxEmbed.hidden = false;
    }
  } else {
    if (vboxEmbed) {
      vboxEmbed.innerHTML = '';
      vboxEmbed.hidden = true;
    }
    if (vboxImg) {
      vboxImg.src = project.image || (project.photos && project.photos[0]) || '';
      vboxImg.hidden = false;
    }
  }

  vbox.classList.add('active');
  vbox.setAttribute('aria-hidden', 'false');

  const closeHandler = () => {
    vbox.classList.remove('active');
    vbox.setAttribute('aria-hidden', 'true');
    if (vboxEmbed) vboxEmbed.innerHTML = '';
    vboxClose?.removeEventListener('click', closeHandler);
  };
  vboxClose?.addEventListener('click', closeHandler);
}

// 8. Contact / Start a Project Form Submission
function initContactForm() {
  const form = document.getElementById('contactInquiryForm');
  const statusDiv = document.getElementById('contactFormStatus');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (statusDiv) {
      statusDiv.innerHTML = '<span style="color: var(--brand-gold);">Submitting inquiry...</span>';
    }

    const payload = {
      name: document.getElementById('contactName')?.value,
      email: document.getElementById('contactEmail')?.value,
      phone: document.getElementById('contactPhone')?.value,
      projectType: document.getElementById('contactService')?.value,
      date: document.getElementById('contactDate')?.value,
      budget: document.getElementById('contactBudget')?.value,
      message: document.getElementById('contactMessage')?.value
    };

    try {
      const res = await fetch('/api/inquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        if (statusDiv) {
          statusDiv.innerHTML = `<span style="color: #4ade80; font-weight: 600;">&#10003; ${data.message}</span>`;
        }
        form.reset();
      } else {
        if (statusDiv) {
          statusDiv.innerHTML = `<span style="color: #ef4444;">${data.message || 'Submission failed.'}</span>`;
        }
      }
    } catch (err) {
      if (statusDiv) {
        statusDiv.innerHTML = `<span style="color: #ef4444;">Error sending inquiry: ${err.message}</span>`;
      }
    }
  });
}

// 9. Career Modal & Application Submission
function initCareerModal() {
  const modal = document.getElementById('careerModal');
  const closeBtn = document.getElementById('careerModalClose');
  const form = document.getElementById('careerAppForm');
  const roleInput = document.getElementById('careerRoleInput');
  const statusDiv = document.getElementById('careerFormStatus');

  document.querySelectorAll('.career-apply-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.getAttribute('data-role') || 'Creative Professional';
      if (roleInput) roleInput.value = role;
      document.getElementById('careerModalTitle').textContent = `Apply for: ${role}`;
      modal?.classList.add('active');
    });
  });

  closeBtn?.addEventListener('click', () => {
    modal?.classList.remove('active');
  });

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (statusDiv) statusDiv.innerHTML = '<span style="color: var(--brand-gold);">Submitting application...</span>';

    const payload = {
      name: document.getElementById('careerName')?.value,
      email: document.getElementById('careerEmail')?.value,
      phone: document.getElementById('careerPhone')?.value,
      role: roleInput?.value,
      portfolioUrl: document.getElementById('careerPortfolio')?.value,
      experience: document.getElementById('careerExp')?.value,
      message: document.getElementById('careerMessage')?.value
    };

    try {
      const res = await fetch('/api/careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        if (statusDiv) statusDiv.innerHTML = `<span style="color: #4ade80; font-weight:600;">&#10003; ${data.message}</span>`;
        form.reset();
        setTimeout(() => modal?.classList.remove('active'), 2000);
      } else {
        if (statusDiv) statusDiv.innerHTML = `<span style="color: #ef4444;">${data.message}</span>`;
      }
    } catch (err) {
      if (statusDiv) statusDiv.innerHTML = `<span style="color: #ef4444;">Error: ${err.message}</span>`;
    }
  });
}

