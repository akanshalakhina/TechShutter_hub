/* ========================================================
   TECH SHUTTER HUB - Cinematic Media Lightbox
   Proportional Studio Frame, Seamless Gallery Navigation
   ======================================================== */

(function () {
  const vbox = document.getElementById('vbox');
  if (!vbox) return;

  const vboxEmbed = document.getElementById('vboxEmbed');
  const vboxImg = document.getElementById('vboxImg');
  const vboxFrame = document.querySelector('.vbox-frame');
  const vboxPrev = document.getElementById('vboxPrev');
  const vboxNext = document.getElementById('vboxNext');
  const vboxCount = document.getElementById('vboxCount');
  const vboxTitle = document.getElementById('vboxTitle');
  const vboxCat = document.getElementById('vboxCat');
  const vboxCta = document.getElementById('vboxCta');
  const vboxClose = document.getElementById('vboxClose');

  let currentAlbum = [];
  let currentAlbumIndex = 0;
  let activeProject = null;
  let currentProjectList = [];
  let currentProjectIndex = -1;

  // Auto-load master project list if needed
  async function ensureProjectList() {
    if (currentProjectList && currentProjectList.length) return currentProjectList;
    if (window.TSH_PROJECTS && Array.isArray(window.TSH_PROJECTS) && window.TSH_PROJECTS.length) {
      currentProjectList = window.TSH_PROJECTS;
      return currentProjectList;
    }
    if (window.allWeddingPhotos && Array.isArray(window.allWeddingPhotos) && window.allWeddingPhotos.length) {
      currentProjectList = window.allWeddingPhotos;
      return currentProjectList;
    }
    if (window.allProjects && Array.isArray(window.allProjects) && window.allProjects.length) {
      currentProjectList = window.allProjects;
      return currentProjectList;
    }
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json) ? json : (json && Array.isArray(json.data) ? json.data : []);
        if (list.length) {
          currentProjectList = list;
          currentProjectList = currentProjectList.filter(p => p.id !== 'prod-01' && !JSON.stringify(p).includes('brand-feature'));
          window.TSH_PROJECTS = currentProjectList;
          return currentProjectList;
        }
      }
    } catch (e) {}

    try {
      const res = await fetch('/projects.json');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
          currentProjectList = data;
          currentProjectList = currentProjectList.filter(p => p.id !== 'prod-01' && !JSON.stringify(p).includes('brand-feature'));
          window.TSH_PROJECTS = currentProjectList;
          return currentProjectList;
        }
      }
    } catch (e) {}

    return currentProjectList;
  }

  function getProjectList() {
    if (currentProjectList && currentProjectList.length) return currentProjectList;
    if (window.TSH_PROJECTS && Array.isArray(window.TSH_PROJECTS) && window.TSH_PROJECTS.length) return window.TSH_PROJECTS;
    if (window.allWeddingPhotos && Array.isArray(window.allWeddingPhotos) && window.allWeddingPhotos.length) return window.allWeddingPhotos;
    if (window.allProjects && Array.isArray(window.allProjects) && window.allProjects.length) return window.allProjects;
    return [];
  }

  function streamSrc(v) {
    let s = String(v || '').trim();
    const m = s.match(/src=["']([^"']+)["']/i);
    if (m) s = m[1];
    const g = s.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
    if (g) return 'https://drive.google.com/file/d/' + g[1] + '/preview';
    return s;
  }

  function updateNavUI() {
    const list = getProjectList();
    const canNav = (currentAlbum.length > 1) || (list.length > 1);

    if (vboxPrev) vboxPrev.style.display = canNav ? 'flex' : 'none';
    if (vboxNext) vboxNext.style.display = canNav ? 'flex' : 'none';

    if (vboxCount) {
      if (currentAlbum.length > 1 && list.length > 1 && currentProjectIndex >= 0) {
        vboxCount.textContent = `Photo ${currentAlbumIndex + 1} of ${currentAlbum.length} • Project ${currentProjectIndex + 1} of ${list.length}`;
        vboxCount.style.display = 'block';
      } else if (currentAlbum.length > 1) {
        vboxCount.textContent = `${currentAlbumIndex + 1} / ${currentAlbum.length}`;
        vboxCount.style.display = 'block';
      } else if (list.length > 1 && currentProjectIndex >= 0) {
        vboxCount.textContent = `${currentProjectIndex + 1} / ${list.length}`;
        vboxCount.style.display = 'block';
      } else {
        vboxCount.style.display = 'none';
      }
    }
  }

  function showAlbumPhoto(idx) {
    if (!currentAlbum.length) return;
    currentAlbumIndex = (idx + currentAlbum.length) % currentAlbum.length;
    if (vboxImg) {
      vboxImg.src = currentAlbum[currentAlbumIndex];
    }
    updateNavUI();
    if (window.soundEngine && typeof window.soundEngine.apertureTick === 'function') {
      window.soundEngine.apertureTick();
    }
  }

  function showNext() {
    // If multiple photos in album and not at the last photo, step forward inside album
    if (currentAlbum.length > 1 && currentAlbumIndex < currentAlbum.length - 1) {
      showAlbumPhoto(currentAlbumIndex + 1);
      return;
    }
    // Else move to next project in gallery list
    const list = getProjectList();
    if (list.length > 1) {
      const nextIdx = (currentProjectIndex + 1) % list.length;
      open(list[nextIdx], list, 0);
    } else if (currentAlbum.length > 1) {
      showAlbumPhoto(0);
    }
  }

  function showPrev() {
    // If multiple photos in album and not at first photo, step backward inside album
    if (currentAlbum.length > 1 && currentAlbumIndex > 0) {
      showAlbumPhoto(currentAlbumIndex - 1);
      return;
    }
    // Else move to previous project in gallery list
    const list = getProjectList();
    if (list.length > 1) {
      const prevIdx = (currentProjectIndex - 1 + list.length) % list.length;
      const prevProj = list[prevIdx];
      const prevAlbum = Array.isArray(prevProj.photos) && prevProj.photos.length ? prevProj.photos : [prevProj.image || ''];
      open(prevProj, list, Math.max(0, prevAlbum.length - 1));
    } else if (currentAlbum.length > 1) {
      showAlbumPhoto(currentAlbum.length - 1);
    }
  }

  function open(project, customList, photoIndex) {
    if (!project) return;
    activeProject = project;

    if (Array.isArray(customList) && customList.length) {
      currentProjectList = customList;
    } else {
      ensureProjectList();
    }

    const list = getProjectList();
    currentProjectIndex = list.findIndex(p => (p.id && p.id === project.id) || p.title === project.title);

    // Reset frame state
    if (vboxEmbed) vboxEmbed.innerHTML = '';
    if (vboxImg) {
      vboxImg.style.display = 'none';
      vboxImg.removeAttribute('src');
    }
    currentAlbum = [];
    currentAlbumIndex = photoIndex || 0;

    const isPortrait = String(project.orientation || '').toLowerCase() === 'portrait' || String(project.orientation || '').toLowerCase() === 'vertical';

    if (vboxFrame) {
      vboxFrame.classList.toggle('vertical', isPortrait);
      vboxFrame.classList.toggle('portrait', isPortrait);
      vboxFrame.classList.toggle('has-video', !!project.video);
    }

    if (project.video) {
      const src = streamSrc(project.video);
      if (src.endsWith('.mp4') || src.endsWith('.webm')) {
        vboxEmbed.innerHTML = `
          <video src="${src}" controls autoplay playsinline loop style="width:100%;height:100%;background:#000;"></video>
        `;
      } else {
        vboxEmbed.innerHTML = `
          <iframe src="${src}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        `;
      }
    } else {
      currentAlbum = Array.isArray(project.photos) && project.photos.length ? project.photos : [project.image || ''];
      currentAlbum = currentAlbum.filter(Boolean);
      if (vboxImg) {
        vboxImg.style.display = 'block';
      }
      showAlbumPhoto(currentAlbumIndex);
    }

    if (vboxTitle) vboxTitle.textContent = project.title || '';
    if (vboxCat) {
      const ritualTag = project.weddingRitual ? ` • ${project.weddingRitual}` : '';
      vboxCat.textContent = `${project.category || 'PROJECT'}${ritualTag}`.toUpperCase();
    }

    if (vboxCta) {
      vboxCta.onclick = (e) => {
        close();
        if (window.tshModal && typeof window.tshModal.openInquiry === 'function') {
          e.preventDefault();
          window.tshModal.openInquiry(project.category, project.title);
        } else {
          window.location.href = `/contact?service=${encodeURIComponent(project.category || '')}`;
        }
      };
    }

    updateNavUI();

    vbox.classList.add('show');
    vbox.classList.add('active');
    vbox.setAttribute('aria-hidden', 'false');

    if (window.soundEngine && typeof window.soundEngine.shutterClick === 'function') {
      window.soundEngine.shutterClick();
    }
  }

  function close() {
    vbox.classList.remove('show');
    vbox.classList.remove('active');
    vbox.setAttribute('aria-hidden', 'true');
    if (vboxEmbed) vboxEmbed.innerHTML = '';
    if (vboxImg) vboxImg.removeAttribute('src');
    currentAlbum = [];
  }

  // Event Listeners
  if (vboxClose) vboxClose.addEventListener('click', close);
  if (vboxPrev) vboxPrev.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
  if (vboxNext) vboxNext.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });

  // Click on the photo itself: right side -> next, left side -> previous
  if (vboxImg) {
    vboxImg.addEventListener('click', (e) => {
      e.stopPropagation();
      const rect = vboxImg.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (clickX > rect.width * 0.45) {
        showNext();
      } else {
        showPrev();
      }
    });
  }

  // Close when clicking outside of the frame
  vbox.addEventListener('click', (e) => {
    if (e.target === vbox || e.target.classList.contains('vbox-stage')) {
      close();
    }
  });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (!vbox.classList.contains('show') && !vbox.classList.contains('active')) return;
    if (e.key === 'Escape') {
      close();
    } else if (e.key === 'ArrowLeft') {
      showPrev();
    } else if (e.key === 'ArrowRight') {
      showNext();
    }
  });

  // Touch swipe support for mobile
  let touchStartX = 0;
  let touchStartY = 0;
  vbox.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  vbox.addEventListener('touchend', (e) => {
    if (e.changedTouches.length === 1) {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) showNext();
        else showPrev();
      }
    }
  }, { passive: true });

  // Pre-fetch projects in background so gallery list is ready
  ensureProjectList();

  window.tshLightbox = {
    open,
    close,
    showNext,
    showPrev
  };
})();
