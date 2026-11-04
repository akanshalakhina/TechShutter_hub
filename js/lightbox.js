/* ========================================================
   TECH SHUTTER HUB - Cinematic Media Lightbox
   High-definition Video player and Multi-photo Carousel
   ======================================================== */

(function () {
  const vbox = document.getElementById('vbox');
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

  function streamSrc(v) {
    let s = String(v || '').trim();
    const m = s.match(/src=["']([^"']+)["']/i);
    if (m) s = m[1];
    const g = s.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
    if (g) return 'https://drive.google.com/file/d/' + g[1] + '/preview';
    return s;
  }

  function showAlbumPhoto(idx) {
    if (!currentAlbum.length) return;
    currentAlbumIndex = (idx + currentAlbum.length) % currentAlbum.length;
    vboxImg.src = currentAlbum[currentAlbumIndex];

    const hasMultiple = currentAlbum.length > 1;
    vboxPrev.hidden = vboxNext.hidden = vboxCount.hidden = !hasMultiple;
    if (hasMultiple) {
      vboxCount.textContent = `${currentAlbumIndex + 1} / ${currentAlbum.length}`;
    }
    if (window.soundEngine) window.soundEngine.apertureTick();
  }

  function open(project) {
    if (!project) return;
    activeProject = project;

    // Reset frame state
    vboxEmbed.innerHTML = '';
    vboxImg.hidden = true;
    vboxImg.removeAttribute('src');
    vboxPrev.hidden = vboxNext.hidden = vboxCount.hidden = true;
    currentAlbum = [];
    currentAlbumIndex = 0;

    if (vboxFrame) {
      vboxFrame.classList.toggle('vertical', String(project.orientation || '').toLowerCase() === 'vertical');
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
      vboxImg.hidden = false;
      showAlbumPhoto(0);
    }

    if (vboxTitle) vboxTitle.textContent = project.title || '';
    if (vboxCat) vboxCat.textContent = (project.category || 'PROJECT').toUpperCase();

    if (vboxCta) {
      vboxCta.onclick = (e) => {
        close();
        if (window.tshModal) {
          e.preventDefault();
          window.tshModal.openInquiry(project.category, project.title);
        } else {
          window.location.href = `/contact?service=${encodeURIComponent(project.category || '')}`;
        }
      };
    }

    vbox.classList.add('show');
    vbox.setAttribute('aria-hidden', 'false');

    if (window.soundEngine) window.soundEngine.shutterClick();
  }

  function close() {
    vbox.classList.remove('show');
    vbox.setAttribute('aria-hidden', 'true');
    vboxEmbed.innerHTML = '';
    vboxImg.removeAttribute('src');
    currentAlbum = [];
  }

  // Event Listeners
  if (vboxClose) vboxClose.addEventListener('click', close);
  if (vboxPrev) vboxPrev.addEventListener('click', (e) => { e.stopPropagation(); showAlbumPhoto(currentAlbumIndex - 1); });
  if (vboxNext) vboxNext.addEventListener('click', (e) => { e.stopPropagation(); showAlbumPhoto(currentAlbumIndex + 1); });

  vbox.addEventListener('click', (e) => {
    if (e.target === vbox) close();
  });

  window.addEventListener('keydown', (e) => {
    if (!vbox.classList.contains('show')) return;
    if (e.key === 'Escape') close();
    else if (currentAlbum.length > 1 && e.key === 'ArrowLeft') showAlbumPhoto(currentAlbumIndex - 1);
    else if (currentAlbum.length > 1 && e.key === 'ArrowRight') showAlbumPhoto(currentAlbumIndex + 1);
  });

  window.tshLightbox = {
    open,
    close
  };
})();
