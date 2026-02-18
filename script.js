/* ========================================
   conte.jpeg Brand HP — Script
   ======================================== */

// Theme descriptions for modal
const themeData = {
  coral: {
    ja: '珊瑚',
    en: 'Coral',
    description: '海底に息づく珊瑚のように、無数の小さな穴が有機的に広がる。自然が生んだ繊細な構造を、指先に宿す。'
  },
  bone: {
    ja: '骨',
    en: 'Bone',
    description: '生命の根幹を支える骨の力強さ。大胆な穴と隆起が、プリミティブな存在感を放つ。'
  },
  ivy: {
    ja: '蔦',
    en: 'Ivy',
    description: '壁を這い、光を求めて伸びる蔦。細長く連なる穴が、しなやかな生命力を表現する。'
  },
  plant: {
    ja: '植物',
    en: 'Plant',
    description: '静かに、しかし確実に成長する植物のフォルム。流れるような穴が、生命の律動を刻む。'
  },
  lava: {
    ja: '溶岩',
    en: 'Lava',
    description: '地球の内側から湧き上がる溶岩の混沌。不規則に刻まれた穴が、原始のエネルギーを纏う。'
  },
  ocean: {
    ja: '海',
    en: 'Ocean',
    description: '波の満ち引きが生むリズム。穏やかな波紋のように広がる穴が、海の記憶を閉じ込める。'
  },
  'deep-sea': {
    ja: '深海',
    en: 'Deep Sea',
    description: '光の届かない深海の神秘。密に並ぶ丸い穴が、未知なる深淵の静寂を映す。'
  },
  geometric: {
    ja: '幾何学',
    en: 'Geometric',
    description: '自然界に潜む数学的秩序。規則正しく配列された穴が、カオスの中の美しい法則を可視化する。'
  },
  delicate: {
    ja: '繊細',
    en: 'Delicate',
    description: '微細な穴が密集する、レースのような繊細さ。触れれば消えてしまいそうな、儚い美しさ。'
  },
  heavy: {
    ja: '重厚',
    en: 'Heavy',
    description: '大地の重みを纏う、圧倒的な存在感。少数の大きな穴と荒々しい表面が、時の重みを語る。'
  },
  ancient: {
    ja: '古代',
    en: 'Ancient',
    description: '何千年もの時を経た遺物のように。風化した表面が、悠久の時の流れを物語る。'
  },
  forest: {
    ja: '森',
    en: 'Forest',
    description: '森の中で枝が絡み合い、苔が広がる。有機的な隆起が、森林の生命の連鎖を表現する。'
  }
};

// --- Scroll Animations ---
function initScrollAnimations() {
  // Fade-in, slide-left, slide-right, scale-up — reversible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.fade-in, .slide-left, .slide-right, .scale-up').forEach(el => {
    observer.observe(el);
  });


  // Parallax on scroll
  const parallaxEls = document.querySelectorAll('.parallax-img');
  if (parallaxEls.length > 0) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      parallaxEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const offset = (center - window.innerHeight / 2) * 0.04;
        el.style.transform = `translateY(${offset}px)`;
      });
    }, { passive: true });
  }

  // --- Mobile: Collection auto-fade on scroll — reversible ---
  if (window.matchMedia('(max-width: 599px)').matches) {
    const autoFadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const item = entry.target;
        if (entry.isIntersecting) {
          if (!item.classList.contains('auto-revealed')) {
            item._autoTimer = setTimeout(() => {
              item.classList.add('auto-revealed');
              const img1 = item.querySelector('.collection-img-1');
              const img2 = item.querySelector('.collection-img-2');
              if (img1) img1.style.opacity = '0';
              if (img2) img2.style.opacity = '1';

              const nameJa = item.querySelector('.theme-name-ja')?.textContent || '';
              const nameEn = item.querySelector('.theme-name-en')?.textContent || '';
              const buyHref = item.querySelector('.collection-buy')?.href || 'https://conte.base.ec';
              const overlay = document.createElement('div');
              overlay.className = 'collection-auto-overlay';
              overlay.innerHTML =
                '<span class="auto-name">' + nameJa + ' / ' + nameEn + '</span>' +
                '<a class="auto-buy" href="' + buyHref + '" target="_blank" rel="noopener">購入はこちら →</a>';
              item.appendChild(overlay);
            }, 800);
          }
        } else {
          // Reverse: reset to original state
          clearTimeout(item._autoTimer);
          if (item.classList.contains('auto-revealed')) {
            item.classList.remove('auto-revealed');
            const img1 = item.querySelector('.collection-img-1');
            const img2 = item.querySelector('.collection-img-2');
            if (img1) img1.style.opacity = '';
            if (img2) img2.style.opacity = '';
            const overlay = item.querySelector('.collection-auto-overlay');
            if (overlay) overlay.remove();
          }
        }
      });
    }, {
      threshold: 0.6
    });

    document.querySelectorAll('.collection-item').forEach(item => {
      autoFadeObserver.observe(item);
    });
  }

  // --- Story paragraphs: staggered fade-in — reversible ---
  const storyParagraphs = document.querySelectorAll('.story-prose p');
  if (storyParagraphs.length > 0) {
    const storyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('story-visible');
        } else {
          entry.target.classList.remove('story-visible');
        }
      });
    }, { threshold: 0.3, rootMargin: '0px 0px -30px 0px' });

    storyParagraphs.forEach((p, i) => {
      p.classList.add('story-animate');
      p.style.transitionDelay = (i * 0.15) + 's';
      storyObserver.observe(p);
    });
  }

  // --- Process steps: staggered reveal — reversible ---
  const processSteps = document.querySelectorAll('.process-step');
  if (processSteps.length > 0) {
    const processObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('process-visible');
        } else {
          entry.target.classList.remove('process-visible');
        }
      });
    }, { threshold: 0.3, rootMargin: '0px 0px -40px 0px' });

    processSteps.forEach((step, i) => {
      step.classList.add('process-animate');
      step.style.transitionDelay = (i * 0.25) + 's';
      processObserver.observe(step);
    });
  }
}

// --- Collection Modal ---
function initModal() {
  const modal = document.getElementById('modal');
  const modalImg = modal.querySelector('.modal-image img');
  const modalJa = modal.querySelector('.modal-theme-ja');
  const modalEn = modal.querySelector('.modal-theme-en');
  const modalDesc = modal.querySelector('.modal-description');
  const modalClose = modal.querySelector('.modal-close');
  const modalBackdrop = modal.querySelector('.modal-backdrop');

  const isMobile = window.matchMedia('(max-width: 599px)').matches;
  const allItems = document.querySelectorAll('.collection-item');

  // Get theme data from themeData or fall back to DOM content
  function getItemData(item) {
    const theme = item.dataset.theme;
    if (themeData[theme]) return themeData[theme];
    const ja = item.querySelector('.theme-name-ja')?.textContent || '';
    const en = item.querySelector('.theme-name-en')?.textContent || '';
    const buyLink = item.querySelector('.collection-buy')?.href || 'https://conte.base.ec';
    return { ja, en, description: ja + ' / ' + en, buyLink };
  }

  function resetAllItems() {
    allItems.forEach(el => {
      el.classList.remove('tapped');
      el.querySelector('.collection-img-1').style.opacity = '';
      el.querySelector('.collection-img-2').style.opacity = '';
      const ov = el.querySelector('.collection-tap-overlay');
      if (ov) ov.remove();
    });
  }

  allItems.forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.tap-buy') || e.target.closest('.auto-buy')) return;

      if (isMobile) {
        // Already auto-revealed: skip tap overlay logic
        if (item.classList.contains('auto-revealed')) return;

        const wasTapped = item.classList.contains('tapped');

        // Reset all
        resetAllItems();

        if (!wasTapped) {
          const data = getItemData(item);

          // 1st tap: swap image + show name, short desc, buy
          item.classList.add('tapped');
          item.querySelector('.collection-img-1').style.opacity = '0';
          item.querySelector('.collection-img-2').style.opacity = '1';

          const buyHref = data.buyLink || item.querySelector('.collection-buy')?.href || 'https://conte.base.ec';
          const overlay = document.createElement('div');
          overlay.className = 'collection-tap-overlay';
          overlay.innerHTML =
            '<span class="tap-name">' + data.ja + ' / ' + data.en + '</span>' +
            '<a class="tap-buy" href="' + buyHref + '" target="_blank" rel="noopener">購入はこちら →</a>';
          item.appendChild(overlay);
          return;
        }
        // 2nd tap: fall through to open modal
      }

      const data = getItemData(item);

      modalImg.src = item.querySelector('.collection-img-1').src;
      modalImg.alt = `${data.ja} / ${data.en}`;
      modalJa.textContent = data.ja;
      modalEn.textContent = data.en;
      modalDesc.textContent = data.description;

      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  // Mobile: tap outside to reset
  if (isMobile) {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.collection-item')) {
        resetAllItems();
      }
    });
  }

  // Close modal
  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

// --- Sidebar Navigation ---
function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebar-toggle');
  const overlay = document.getElementById('sidebar-overlay');
  const links = sidebar.querySelectorAll('.sidebar-links a');

  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('active');
    toggle.classList.add('active');
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    toggle.classList.remove('active');
  }

  toggle.addEventListener('click', () => {
    if (sidebar.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  overlay.addEventListener('click', closeSidebar);

  // Close on link click
  links.forEach(a => {
    a.addEventListener('click', closeSidebar);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
      closeSidebar();
    }
  });

  // Highlight active section on scroll
  const sections = document.querySelectorAll('section[id], footer[id]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => observer.observe(s));
}

// --- Smooth scroll for anchor links ---
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// --- Sticky Buy Bar (show after scrolling past hero) ---
function initStickyBuy() {
  const bar = document.getElementById('sticky-buy');
  const collection = document.getElementById('collection');
  if (!bar || !collection) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        bar.classList.add('visible');
      } else {
        // Hide only when scrolled back above collection
        if (entry.boundingClientRect.top > 0) {
          bar.classList.remove('visible');
        }
      }
    });
  }, { threshold: 0.1 });

  observer.observe(collection);
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initScrollAnimations();
  initModal();
  initSmoothScroll();
  initStickyBuy();
});
