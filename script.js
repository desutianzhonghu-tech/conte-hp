/* ========================================
   conte.jpeg Brand HP — Script
   ======================================== */

const themeData = {};

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

  // --- Mobile: Collection tap hint animation ---
  if (window.matchMedia('(max-width: 599px)').matches) {
    const hintObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('tap-hint-visible');
          hintObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.collection-item').forEach(item => {
      hintObserver.observe(item);
    });
  }

  // --- Story & Process: single observer, batched updates ---
  const animTargets = [];

  document.querySelectorAll('.story-prose p').forEach((p, i) => {
    p.classList.add('story-animate');
    p.style.transitionDelay = (i * 0.15) + 's';
    animTargets.push({ el: p, cls: 'story-visible' });
  });

  document.querySelectorAll('.process-step').forEach((step, i) => {
    step.classList.add('process-animate');
    step.style.transitionDelay = (i * 0.25) + 's';
    animTargets.push({ el: step, cls: 'process-visible' });
  });

  if (animTargets.length > 0) {
    let rafPending = false;
    let pendingChanges = [];

    const combinedObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const target = animTargets.find(t => t.el === entry.target);
        if (target) {
          pendingChanges.push({ el: target.el, cls: target.cls, add: entry.isIntersecting });
        }
      });

      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
          pendingChanges.forEach(({ el, cls, add }) => {
            if (add) {
              el.classList.add(cls);
            } else {
              el.classList.remove(cls);
            }
          });
          pendingChanges = [];
          rafPending = false;
        });
      }
    }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

    animTargets.forEach(t => combinedObserver.observe(t.el));
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

  // Hide tap hints and prompt after first tap
  let firstTapDone = false;
  function hideHints() {
    if (firstTapDone) return;
    firstTapDone = true;
    allItems.forEach(el => el.classList.remove('tap-hint-visible'));
    const prompt = document.querySelector('.collection-tap-prompt');
    if (prompt) {
      prompt.style.transition = 'opacity 0.5s ease';
      prompt.style.opacity = '0';
    }
  }

  allItems.forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.tap-buy') || e.target.closest('.auto-buy') || e.target.closest('.bottom-buy')) return;

      if (isMobile) {
        const wasTapped = item.classList.contains('tapped');

        // Reset all
        resetAllItems();

        if (!wasTapped) {
          hideHints();
          const data = getItemData(item);

          // 1st tap: swap image + show name, short desc, buy
          item.classList.add('tapped');
          item.querySelector('.collection-img-1').style.opacity = '0';
          item.querySelector('.collection-img-2').style.opacity = '1';

          const buyHref = data.buyLink || item.querySelector('.collection-buy')?.href || 'https://conte.base.ec';
          const priceText = item.querySelector('.collection-price')?.textContent || '';
          const isSoldOut = item.dataset.soldOut === 'true';
          const overlay = document.createElement('div');
          overlay.className = 'collection-tap-overlay';
          let tapHtml = '<span class="tap-name">' + data.ja + ' / ' + data.en + '</span>';
          if (priceText) tapHtml += '<span class="tap-price">' + priceText + '</span>';
          if (isSoldOut) {
            tapHtml += '<span class="collection-sold-out">sold out</span>';
          } else {
            tapHtml += '<a class="tap-buy" href="' + buyHref + '" target="_blank" rel="noopener">購入はこちら →</a>';
          }
          overlay.innerHTML = tapHtml;
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

// --- Section Transition: Zoom Fade ---
function initZoomFade() {
  if (!document.body.classList.contains('transition-zoom')) return;
  const sections = document.querySelectorAll('body > section');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('zoom-out');
        entry.target.classList.add('zoom-in');
      } else {
        entry.target.classList.remove('zoom-in');
        entry.target.classList.add('zoom-out');
      }
    });
  }, { threshold: 0.15 });
  sections.forEach(s => observer.observe(s));
}

// --- Section Transition: Parallax ---
let parallaxCleanup = null;
function initParallax() {
  if (parallaxCleanup) { parallaxCleanup(); parallaxCleanup = null; }
  if (!document.body.classList.contains('transition-parallax')) return;

  const heroImage = document.querySelector('#hero .hero-image');
  const processImages = document.querySelectorAll('.process-image');
  const conceptImages = document.querySelectorAll('.concept-image');
  const titles = document.querySelectorAll('section .section-title');

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      // Hero: background moves slower
      if (heroImage) {
        const y = scrollY * 0.35;
        heroImage.style.transform = `translateY(${y}px)`;
      }

      // Process images: subtle float
      processImages.forEach(img => {
        const rect = img.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const offset = (center - vh / 2) * 0.08;
        img.style.transform = `translateY(${offset}px)`;
      });

      // Concept images: subtle float
      conceptImages.forEach(img => {
        const rect = img.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const offset = (center - vh / 2) * 0.06;
        img.style.transform = `translateY(${offset}px)`;
      });

      // Section titles: slight parallax
      titles.forEach(t => {
        const rect = t.getBoundingClientRect();
        const offset = (rect.top - vh / 2) * -0.05;
        t.style.transform = `translateY(${offset}px)`;
      });

      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  parallaxCleanup = () => {
    window.removeEventListener('scroll', onScroll);
    if (heroImage) heroImage.style.transform = '';
    processImages.forEach(img => { img.style.transform = ''; });
    conceptImages.forEach(img => { img.style.transform = ''; });
    titles.forEach(t => { t.style.transform = ''; });
  };
}

// --- Section Transition: Curtain Reveal ---
let curtainCleanup = null;
function initCurtain() {
  if (curtainCleanup) { curtainCleanup(); curtainCleanup = null; }
  if (!document.body.classList.contains('transition-curtain')) return;

  const sections = document.querySelectorAll('body > section');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('curtain-dim');
      } else {
        // Only dim sections above viewport (already scrolled past)
        const rect = entry.boundingClientRect;
        if (rect.bottom < window.innerHeight * 0.5) {
          entry.target.classList.add('curtain-dim');
        } else {
          entry.target.classList.remove('curtain-dim');
        }
      }
    });
  }, { threshold: [0, 0.3, 0.6, 1] });
  sections.forEach(s => observer.observe(s));

  curtainCleanup = () => {
    observer.disconnect();
    sections.forEach(s => s.classList.remove('curtain-dim'));
  };
}

// --- Section Transition: Cinematic ---
let cinematicCleanup = null;
function initCinematic() {
  if (cinematicCleanup) { cinematicCleanup(); cinematicCleanup = null; }
  if (!document.body.classList.contains('transition-cinematic')) return;

  const sections = document.querySelectorAll('body > section');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.15) {
        entry.target.classList.remove('cine-away');
        entry.target.classList.add('cine-active');
      } else {
        entry.target.classList.remove('cine-active');
        entry.target.classList.add('cine-away');
      }
    });
  }, { threshold: [0, 0.15, 0.5] });
  sections.forEach(s => observer.observe(s));

  cinematicCleanup = () => {
    observer.disconnect();
    sections.forEach(s => { s.classList.remove('cine-away', 'cine-active'); });
  };
}

// --- Section Transition: Slide Up ---
let slideupCleanup = null;
function initSlideUp() {
  if (slideupCleanup) { slideupCleanup(); slideupCleanup = null; }
  if (!document.body.classList.contains('transition-slideup')) return;

  const sections = document.querySelectorAll('body > section');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
        entry.target.classList.remove('slideup-next');
        entry.target.classList.add('slideup-active');
      } else {
        const rect = entry.boundingClientRect;
        if (rect.top > 0) {
          entry.target.classList.add('slideup-next');
          entry.target.classList.remove('slideup-active');
        }
      }
    });
  }, { threshold: [0, 0.1, 0.4] });
  sections.forEach(s => observer.observe(s));

  slideupCleanup = () => {
    observer.disconnect();
    sections.forEach(s => { s.classList.remove('slideup-next', 'slideup-active'); });
  };
}

// --- Collection Order (localStorage) ---
function applyCollectionOrder() {
  const saved = localStorage.getItem('conte-collection-order');
  if (!saved) return;
  try {
    const order = JSON.parse(saved);
    const grid = document.querySelector('.collection-grid');
    if (!grid) return;
    const items = Array.from(grid.querySelectorAll('.collection-item'));
    const map = {};
    items.forEach(item => { map[item.dataset.theme] = item; });
    order.forEach(theme => {
      if (map[theme]) grid.appendChild(map[theme]);
    });
  } catch (e) { /* ignore */ }
}

// --- Edit Mode (Collection Reorder) ---
function initEditMode() {
  if (sessionStorage.getItem('conte-edit') !== '1') return;

  document.body.classList.add('edit-mode');

  // Banner
  const banner = document.createElement('div');
  banner.className = 'edit-mode-banner';
  banner.innerHTML = '編集モード — コレクションをドラッグで並び替え' +
    '<button id="editResetOrder">順番リセット</button>' +
    '<button id="editExit">編集を終了</button>';
  document.body.prepend(banner);

  document.getElementById('editExit').addEventListener('click', () => {
    sessionStorage.removeItem('conte-edit');
    document.body.classList.remove('edit-mode');
    banner.remove();
    handles.forEach(h => h.remove());
  });

  document.getElementById('editResetOrder').addEventListener('click', () => {
    localStorage.removeItem('conte-collection-order');
    location.reload();
  });

  // Drag handles (numbering)
  const grid = document.querySelector('.collection-grid');
  if (!grid) return;
  const items = () => Array.from(grid.querySelectorAll('.collection-item'));
  const handles = [];

  function addHandles() {
    handles.forEach(h => h.remove());
    handles.length = 0;
    items().forEach((item, i) => {
      item.setAttribute('draggable', 'true');
      const handle = document.createElement('div');
      handle.className = 'collection-drag-handle';
      handle.textContent = (i + 1);
      item.appendChild(handle);
      handles.push(handle);
    });
  }
  addHandles();

  function saveOrder() {
    const order = items().map(item => item.dataset.theme);
    localStorage.setItem('conte-collection-order', JSON.stringify(order));
  }

  // Drag & Drop (PC)
  let dragSrc = null;

  grid.addEventListener('dragstart', (e) => {
    const item = e.target.closest('.collection-item');
    if (!item) return;
    dragSrc = item;
    item.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });

  grid.addEventListener('dragend', (e) => {
    const item = e.target.closest('.collection-item');
    if (item) item.classList.remove('dragging');
    items().forEach(el => el.classList.remove('drag-over'));
  });

  grid.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const item = e.target.closest('.collection-item');
    if (item && item !== dragSrc) {
      items().forEach(el => el.classList.remove('drag-over'));
      item.classList.add('drag-over');
    }
  });

  grid.addEventListener('dragleave', (e) => {
    const item = e.target.closest('.collection-item');
    if (item) item.classList.remove('drag-over');
  });

  grid.addEventListener('drop', (e) => {
    e.preventDefault();
    const target = e.target.closest('.collection-item');
    if (!target || target === dragSrc || !dragSrc) return;
    target.classList.remove('drag-over');

    const all = items();
    const fromIdx = all.indexOf(dragSrc);
    const toIdx = all.indexOf(target);

    if (fromIdx < toIdx) {
      grid.insertBefore(dragSrc, target.nextSibling);
    } else {
      grid.insertBefore(dragSrc, target);
    }

    addHandles();
    saveOrder();
  });

  // Touch Drag (スマホ)
  let touchSrc = null;
  let touchClone = null;
  let touchOffsetX = 0;
  let touchOffsetY = 0;
  let touchMoved = false;

  grid.addEventListener('touchstart', (e) => {
    const item = e.target.closest('.collection-item');
    if (!item) return;
    touchSrc = item;
    touchMoved = false;
    const touch = e.touches[0];
    const rect = item.getBoundingClientRect();
    touchOffsetX = touch.clientX - rect.left;
    touchOffsetY = touch.clientY - rect.top;
  }, { passive: true });

  grid.addEventListener('touchmove', (e) => {
    if (!touchSrc) return;
    e.preventDefault();
    const touch = e.touches[0];

    if (!touchMoved) {
      touchMoved = true;
      touchSrc.classList.add('dragging');
      // floating clone
      touchClone = touchSrc.cloneNode(true);
      touchClone.style.cssText = 'position:fixed;z-index:10000;pointer-events:none;opacity:0.8;' +
        'width:' + touchSrc.offsetWidth + 'px;height:' + touchSrc.offsetHeight + 'px;';
      document.body.appendChild(touchClone);
    }

    touchClone.style.left = (touch.clientX - touchOffsetX) + 'px';
    touchClone.style.top = (touch.clientY - touchOffsetY) + 'px';

    // highlight drop target
    items().forEach(el => el.classList.remove('drag-over'));
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetItem = target ? target.closest('.collection-item') : null;
    if (targetItem && targetItem !== touchSrc) {
      targetItem.classList.add('drag-over');
    }
  }, { passive: false });

  grid.addEventListener('touchend', (e) => {
    if (!touchSrc) return;

    if (touchClone) {
      touchClone.remove();
      touchClone = null;
    }
    touchSrc.classList.remove('dragging');
    items().forEach(el => el.classList.remove('drag-over'));

    if (touchMoved) {
      const touch = e.changedTouches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      const targetItem = target ? target.closest('.collection-item') : null;

      if (targetItem && targetItem !== touchSrc) {
        const all = items();
        const fromIdx = all.indexOf(touchSrc);
        const toIdx = all.indexOf(targetItem);

        if (fromIdx < toIdx) {
          grid.insertBefore(touchSrc, targetItem.nextSibling);
        } else {
          grid.insertBefore(touchSrc, targetItem);
        }

        addHandles();
        saveOrder();
      }
    }

    touchSrc = null;
    touchMoved = false;
  });
}

// --- Collection: Apply saved data + Always-visible bottom info (PC) + Auto-overlay (Mobile) ---
function initCollectionInfo() {
  const isMobile = window.matchMedia('(max-width: 599px)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  const items = document.querySelectorAll('.collection-item');

  items.forEach(item => {
    const nameJa = item.querySelector('.theme-name-ja')?.textContent || '';
    const priceEl = item.querySelector('.collection-price');
    const price = priceEl ? priceEl.textContent : '';
    const buyLink = item.querySelector('.collection-buy')?.href || 'https://conte.base.ec';
    const isSoldOut = item.dataset.soldOut === 'true';

    if (isMobile || isTouch) {
      // Mobile: create auto-overlay (always visible at bottom)
      const autoOverlay = document.createElement('div');
      autoOverlay.className = 'collection-auto-overlay';
      let html = '<span class="auto-name">' + nameJa + '</span>';
      html += '<span class="auto-price">' + price + '</span>';
      if (isSoldOut) {
        html += '<span class="collection-sold-out">sold out</span>';
      } else {
        html += '<a class="auto-buy" href="' + buyLink + '" target="_blank" rel="noopener">購入 →</a>';
      }
      autoOverlay.innerHTML = html;
      item.appendChild(autoOverlay);
    } else {
      // PC: create bottom info bar (always visible)
      const bottom = document.createElement('div');
      bottom.className = 'collection-item-bottom';
      let html = '<span class="bottom-name">' + nameJa + '</span>';
      html += '<span class="bottom-price">' + price + '</span>';
      if (isSoldOut) {
        html += '<span class="collection-sold-out">sold out</span>';
      } else {
        html += '<a class="bottom-buy" href="' + buyLink + '" target="_blank" rel="noopener">購入 →</a>';
      }
      bottom.innerHTML = html;
      item.appendChild(bottom);

      // Prevent image swap when hovering over bottom bar
      bottom.addEventListener('mouseenter', () => {
        item.classList.add('bottom-hover');
      });
      bottom.addEventListener('mouseleave', () => {
        item.classList.remove('bottom-hover');
      });
    }
  });
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  applyCollectionOrder();
  initCollectionInfo();
  initSidebar();
  initScrollAnimations();
  initModal();
  initSmoothScroll();
  initStickyBuy();
  initZoomFade();
  initParallax();
  initCurtain();
  initCinematic();
  initSlideUp();
  initEditMode();
});
