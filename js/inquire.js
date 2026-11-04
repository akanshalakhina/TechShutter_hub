/* ========================================================
   TECH SHUTTER HUB - Inquire Modal & Search Palette
   ======================================================== */

(function () {
  // Inquiry Modal Elements
  const inquireModal = document.getElementById('inquireModal');
  const inquireForm = document.getElementById('inquireForm');
  const inquireClose = document.getElementById('inquireClose');
  const projectTypeSelect = document.getElementById('projectType');
  const formStatus = document.getElementById('formStatus');

  function openInquiry(category = '', title = '') {
    if (!inquireModal) return;
    if (projectTypeSelect && category) {
      // Set or select matching option
      let found = false;
      for (let i = 0; i < projectTypeSelect.options.length; i++) {
        if (projectTypeSelect.options[i].value.toLowerCase() === category.toLowerCase()) {
          projectTypeSelect.selectedIndex = i;
          found = true;
          break;
        }
      }
      if (!found) {
        const opt = new Option(category, category, true, true);
        projectTypeSelect.add(opt);
      }
    }
    if (formStatus) {
      formStatus.className = 'form-status';
      formStatus.textContent = '';
      formStatus.style.display = 'none';
    }
    inquireModal.classList.add('show');
    if (window.soundEngine) window.soundEngine.apertureTick();
  }

  function closeInquiry() {
    if (!inquireModal) return;
    inquireModal.classList.remove('show');
  }

  if (inquireClose) inquireClose.addEventListener('click', closeInquiry);
  if (inquireModal) {
    inquireModal.addEventListener('click', (e) => {
      if (e.target === inquireModal) closeInquiry();
    });
  }

  if (inquireForm) {
    inquireForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = inquireForm.querySelector('.submit-btn');
      const origText = submitBtn.textContent;
      submitBtn.textContent = 'Submitting Request...';
      submitBtn.disabled = true;

      const payload = {
        name: document.getElementById('clientName').value,
        email: document.getElementById('clientEmail').value,
        phone: document.getElementById('clientPhone').value,
        projectType: projectTypeSelect.value,
        date: document.getElementById('projectDate').value,
        budget: document.getElementById('projectBudget').value,
        message: document.getElementById('projectMessage').value
      };

      try {
        const res = await fetch('/api/inquire', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          formStatus.className = 'form-status success';
          formStatus.textContent = '✓ ' + data.message;
          formStatus.style.display = 'block';
          inquireForm.reset();
          if (window.soundEngine) window.soundEngine.shutterClick();
          setTimeout(() => {
            closeInquiry();
          }, 3000);
        } else {
          throw new Error(data.message || 'Error sending inquiry');
        }
      } catch (err) {
        formStatus.className = 'form-status error';
        formStatus.textContent = '✕ ' + err.message;
        formStatus.style.display = 'block';
      } finally {
        submitBtn.textContent = origText;
        submitBtn.disabled = false;
      }
    });
  }

  // Trigger buttons across page
  document.querySelectorAll('.open-inquire-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openInquiry();
    });
  });

  /* ========================================================
     Search & Command Palette (Triggered by / key)
     ======================================================== */
  const searchPalette = document.getElementById('searchPalette');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const searchBtn = document.getElementById('searchBtn');

  function openSearch() {
    if (!searchPalette) return;
    searchPalette.classList.add('show');
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
    }
    renderSearchResults('');
    if (window.soundEngine) window.soundEngine.apertureTick();
  }

  function closeSearch() {
    if (!searchPalette) return;
    searchPalette.classList.remove('show');
  }

  function renderSearchResults(query = '') {
    if (!searchResults) return;
    const list = window.TSH_PROJECTS || [];
    const q = query.toLowerCase().trim();
    const filtered = q
      ? list.filter(p =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (p.tags || []).some(t => t.toLowerCase().includes(q))
        )
      : list.slice(0, 10);

    searchResults.innerHTML = '';
    if (!filtered.length) {
      searchResults.innerHTML = '<div style="padding: 16px; color: var(--text-muted); text-align: center;">No projects found</div>';
      return;
    }

    filtered.forEach(p => {
      const item = document.createElement('div');
      item.className = 'search-item';
      item.innerHTML = `
        <span class="search-item-title">${p.title}</span>
        <span class="search-item-cat">${p.category}</span>
      `;
      item.addEventListener('click', () => {
        closeSearch();
        if (window.tshLightbox) window.tshLightbox.open(p);
      });
      searchResults.appendChild(item);
    });
  }

  if (searchBtn) searchBtn.addEventListener('click', openSearch);
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderSearchResults(e.target.value);
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      openSearch();
    } else if (e.key === 'Escape') {
      closeSearch();
      closeInquiry();
    }
  });

  // Sound Mute Toggle Button
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  if (soundToggleBtn) {
    const updateSoundBtn = () => {
      const isMuted = window.soundEngine && window.soundEngine.muted;
      soundToggleBtn.setAttribute('title', isMuted ? 'Unmute Audio FX' : 'Mute Audio FX');
      soundToggleBtn.setAttribute('aria-label', isMuted ? 'Unmute Audio FX' : 'Mute Audio FX');
      soundToggleBtn.style.opacity = isMuted ? '0.5' : '1';
    };
    updateSoundBtn();
    soundToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.soundEngine) {
        window.soundEngine.toggleMute();
        updateSoundBtn();
      }
    });
  }

  window.tshModal = {
    openInquiry,
    closeInquiry,
    openSearch,
    closeSearch
  };
})();
