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

// --- Scroll fade-in with IntersectionObserver ---
function initFadeIn() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
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

  document.querySelectorAll('.collection-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.collection-buy')) return;

      // Mobile: first tap shows buy button, second tap opens modal
      if (isMobile && !item.classList.contains('tapped')) {
        // Remove tapped from all other items
        document.querySelectorAll('.collection-item.tapped').forEach(el => {
          if (el !== item) el.classList.remove('tapped');
        });
        item.classList.toggle('tapped');
        return;
      }

      const theme = item.dataset.theme;
      const data = themeData[theme];
      if (!data) return;

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

  // Mobile: remove tapped state when tapping outside collection
  if (isMobile) {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.collection-item')) {
        document.querySelectorAll('.collection-item.tapped').forEach(el => {
          el.classList.remove('tapped');
        });
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

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initFadeIn();
  initModal();
  initSmoothScroll();
});
