/* Gallery — Script */

// Fade-in
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Lightbox
(function () {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox.querySelector('.lightbox-img');
  let currentIndex = 0;

  function getItems() {
    return document.querySelectorAll('.gallery-item img');
  }

  function bindItems() {
    getItems().forEach((img, i) => {
      if (img._lbBound) return;
      img._lbBound = true;
      img.addEventListener('click', () => {
        currentIndex = i;
        lightboxImg.src = img.src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });
  }

  bindItems();

  // Expose for edit mode to rebind after add
  window._galleryRebindLightbox = bindItems;

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showPrev() {
    const items = getItems();
    if (items.length === 0) return;
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    lightboxImg.src = items[currentIndex].src;
  }

  function showNext() {
    const items = getItems();
    if (items.length === 0) return;
    currentIndex = (currentIndex + 1) % items.length;
    lightboxImg.src = items[currentIndex].src;
  }

  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', showPrev);
  lightbox.querySelector('.lightbox-next').addEventListener('click', showNext);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

  // Swipe support
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
  lightbox.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      if (dx > 0) showPrev(); else showNext();
    }
  });
})();
