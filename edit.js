/* ========================================
   conte.jpeg — Edit Mode (Enhanced)
   ======================================== */

(function () {
  if (sessionStorage.getItem('conte-edit') !== '1') return;

  // 編集モードはPC専用
  if (window.matchMedia('(max-width: 599px)').matches) {
    sessionStorage.removeItem('conte-edit');
    return;
  }

  document.body.classList.add('edit-mode');

  // --- テーマデータ（DOMから動的に取得） ---

  // --- スタイル注入 ---
  const style = document.createElement('style');
  style.textContent = `
    /* Edit Panel */
    .edit-panel {
      position: fixed;
      top: 0;
      right: 0;
      z-index: 500;
      width: 360px;
      height: 100vh;
      background: #faf9f7;
      border-left: 1px solid rgba(61,47,40,0.1);
      transform: translateX(100%);
      transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
      overflow-y: auto;
      box-shadow: -4px 0 24px rgba(0,0,0,0.08);
    }
    .edit-panel.open { transform: translateX(0); }
    @media (max-width: 480px) { .edit-panel { width: 100vw; } }

    .edit-panel-header {
      position: sticky; top: 0; z-index: 10;
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 1.2rem;
      background: #3d2f28; color: #faf9f7;
    }
    .edit-panel-header h2 {
      font-family: 'Cormorant Garamond', serif;
      font-weight: 300; font-size: 1.1rem; letter-spacing: 0.05em;
    }
    .edit-panel-close {
      background: none; border: none; color: #faf9f7;
      font-size: 1.4rem; cursor: pointer; padding: 4px 8px; line-height: 1;
    }

    /* Sections */
    .ep-section {
      border-bottom: 1px solid rgba(61,47,40,0.08);
    }
    .ep-section-head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.9rem 1.2rem; cursor: pointer; user-select: none;
      font-size: 0.8rem; font-weight: 500; letter-spacing: 0.1em;
      color: #3d2f28; transition: background 0.2s;
    }
    .ep-section-head:hover { background: rgba(61,47,40,0.03); }
    .ep-section-head::after {
      content: '+'; font-size: 1rem; font-weight: 300;
      transition: transform 0.3s;
    }
    .ep-section.open .ep-section-head::after {
      content: '−';
    }
    .ep-section-body {
      display: none; padding: 0 1.2rem 1.2rem;
    }
    .ep-section.open .ep-section-body { display: block; }

    /* Form controls */
    .ep-label {
      display: block; font-size: 0.7rem; font-weight: 400;
      color: #6b5d54; letter-spacing: 0.05em;
      margin: 0.8rem 0 0.3rem; text-transform: uppercase;
    }
    .ep-label:first-child { margin-top: 0; }
    .ep-input, .ep-textarea, .ep-select {
      width: 100%; padding: 0.6em 0.7em;
      font-family: 'Noto Serif JP', serif; font-size: 0.8rem;
      color: #3d2f28; background: #fff;
      border: 1px solid #d5cfc9; outline: none;
      transition: border-color 0.2s;
    }
    .ep-input:focus, .ep-textarea:focus { border-color: #6b5d54; }
    .ep-textarea { resize: vertical; min-height: 60px; }

    /* Image selector */
    .ep-img-row {
      display: flex; gap: 0.5rem; align-items: center;
      margin-top: 0.4rem;
    }
    .ep-img-preview {
      width: 60px; height: 60px; object-fit: cover;
      border: 1px solid #d5cfc9; flex-shrink: 0;
    }
    .ep-img-btn {
      font-family: 'Noto Serif JP', serif;
      font-size: 0.7rem; padding: 0.4em 0.8em;
      background: #3d2f28; color: #faf9f7;
      border: none; cursor: pointer; white-space: nowrap;
      transition: opacity 0.2s;
    }
    .ep-img-btn:hover { opacity: 0.8; }

    /* Collection grid in panel */
    .ep-collection-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 0.6rem;
    }
    .ep-collection-card {
      background: #fff; border: 1px solid #d5cfc9;
      padding: 0.6rem; text-align: center; cursor: pointer;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .ep-collection-card:hover {
      border-color: #6b5d54;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .ep-collection-card img {
      width: 100%; aspect-ratio: 1; object-fit: cover;
      margin-bottom: 0.3rem;
    }
    .ep-collection-card span {
      font-size: 0.7rem; color: #6b5d54;
    }

    /* Collection detail */
    .ep-collection-detail { background: #fff; padding: 0.8rem; border: 1px solid #d5cfc9; margin-top: 0.5rem; }
    .ep-collection-detail h4 {
      font-size: 0.8rem; font-weight: 500; margin-bottom: 0.5rem;
    }
    .ep-back-btn {
      font-size: 0.7rem; color: #6b5d54; background: none;
      border: none; cursor: pointer; padding: 0; margin-bottom: 0.6rem;
      text-decoration: underline;
    }
    .ep-img-pair { display: flex; gap: 0.5rem; margin-top: 0.4rem; }
    .ep-img-pair-item { flex: 1; text-align: center; }
    .ep-img-pair-item img {
      width: 100%; aspect-ratio: 1; object-fit: cover;
      border: 1px solid #d5cfc9; margin-bottom: 0.3rem;
    }
    .ep-img-pair-item .ep-img-btn { width: 100%; }
    .ep-img-pair-label {
      font-size: 0.65rem; color: #6b5d54; display: block; margin-bottom: 0.2rem;
    }

    /* Color picker */
    .ep-color-row {
      display: flex; align-items: center; gap: 0.5rem; margin-top: 0.3rem;
    }
    .ep-color-input {
      width: 36px; height: 28px; border: 1px solid #d5cfc9;
      padding: 0; cursor: pointer; background: none;
    }
    .ep-color-hex {
      font-size: 0.75rem; color: #6b5d54; font-family: monospace;
    }

    /* Font picker */
    .ep-font-item {
      padding: 0.5em 0.7em; cursor: pointer;
      border-bottom: 1px solid rgba(61,47,40,0.05);
      font-size: 1rem; transition: background 0.15s;
      display: flex; justify-content: space-between; align-items: center;
    }
    .ep-font-item:hover { background: rgba(61,47,40,0.05); }
    .ep-font-item-name {
      font-size: 0.7rem; color: #6b5d54; font-family: 'Noto Serif JP', serif;
      flex-shrink: 0; margin-left: 0.5rem;
    }
    .ep-font-item-preview { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .ep-font-loading {
      padding: 1rem; text-align: center; font-size: 0.75rem; color: #6b5d54;
    }

    /* Crop Modal */
    .crop-overlay {
      position: fixed; inset: 0; z-index: 9000;
      display: flex; flex-direction: column;
      background: #000;
    }
    .crop-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.6rem 1rem; background: #111; flex-shrink: 0;
    }
    .crop-header-title {
      font-family: 'Noto Serif JP', serif; font-size: 0.8rem;
      color: #faf9f7; letter-spacing: 0.08em;
    }
    .crop-header-btns { display: flex; gap: 0.5rem; align-items: center; }
    .crop-btn {
      font-family: 'Noto Serif JP', serif; font-size: 0.72rem;
      padding: 0.4em 1em; border: 1px solid rgba(250,249,247,0.25);
      background: transparent; color: #faf9f7; cursor: pointer;
      letter-spacing: 0.06em; transition: all 0.15s;
    }
    .crop-btn:hover { background: rgba(250,249,247,0.1); }
    .crop-btn--skip { border: none; color: rgba(250,249,247,0.5); font-size: 0.68rem; }
    .crop-btn--skip:hover { color: #faf9f7; background: none; }
    .crop-btn--apply {
      background: #faf9f7; color: #111; border-color: #faf9f7; font-weight: 500;
    }
    .crop-btn--apply:hover { background: #e0deda; }

    .crop-area {
      flex: 1; position: relative; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
    }
    .crop-canvas-wrap {
      position: relative; overflow: hidden;
      cursor: grab; touch-action: none; user-select: none;
      background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1);
    }
    .crop-canvas-wrap.dragging { cursor: grabbing; }
    .crop-canvas-wrap img {
      display: block; position: absolute;
      max-width: none; max-height: none;
      pointer-events: none;
    }
    .crop-grid {
      position: absolute; inset: 0; z-index: 2; pointer-events: none;
      border: 1.5px solid rgba(255,255,255,0.5);
    }
    .crop-grid-line {
      position: absolute; background: rgba(255,255,255,0.18);
    }
    .crop-grid-line.h { left: 0; right: 0; height: 1px; }
    .crop-grid-line.v { top: 0; bottom: 0; width: 1px; }
    .crop-grid-line.h1 { top: 33.33%; }
    .crop-grid-line.h2 { top: 66.66%; }
    .crop-grid-line.v1 { left: 33.33%; }
    .crop-grid-line.v2 { left: 66.66%; }
    .crop-shadow { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
    .crop-shadow-t, .crop-shadow-b, .crop-shadow-l, .crop-shadow-r {
      position: absolute; background: rgba(0,0,0,0.6);
    }

    .crop-bottom { flex-shrink: 0; background: #111; }
    .crop-controls {
      display: flex; align-items: center; gap: 0.6rem;
      padding: 0.6rem 1rem; flex-wrap: wrap;
    }
    .crop-ratios { display: flex; gap: 0.3rem; flex-wrap: wrap; }
    .crop-ratio-btn {
      font-family: 'Noto Serif JP', serif; font-size: 0.68rem;
      padding: 0.35em 0.65em; background: transparent;
      border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.45);
      cursor: pointer; transition: all 0.15s; border-radius: 3px;
    }
    .crop-ratio-btn.active {
      border-color: #fff; color: #fff; background: rgba(255,255,255,0.12);
    }
    .crop-ratio-btn:hover { border-color: rgba(255,255,255,0.4); color: rgba(255,255,255,0.7); }
    .crop-zoom-group {
      display: flex; align-items: center; gap: 0.5rem; margin-left: auto;
    }
    .crop-zoom-icon { font-size: 0.75rem; color: rgba(255,255,255,0.35); }
    .crop-zoom {
      width: 110px; accent-color: #fff;
      -webkit-appearance: none; appearance: none; background: transparent; height: 20px;
    }
    .crop-zoom::-webkit-slider-runnable-track {
      height: 2px; background: rgba(255,255,255,0.2); border-radius: 1px;
    }
    .crop-zoom::-webkit-slider-thumb {
      -webkit-appearance: none; width: 14px; height: 14px;
      background: #fff; border-radius: 50%; margin-top: -6px; cursor: pointer;
    }
    .crop-zoom-pct {
      font-size: 0.65rem; color: rgba(255,255,255,0.5);
      font-family: monospace; min-width: 2.5em;
    }
    .crop-info {
      display: flex; align-items: center; gap: 0.6rem;
      padding: 0 1rem 0.5rem;
      font-size: 0.6rem; color: rgba(255,255,255,0.35); font-family: monospace;
    }
    .crop-info .compressed { color: #7ebc89; }

    /* Toolbar (bottom) */
    .edit-toolbar {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 300;
      display: flex; align-items: center; gap: 0.6rem;
      padding: 0.7rem 1.2rem;
      background: #3d2f28; color: #faf9f7;
      font-family: 'Noto Serif JP', serif; font-size: 0.8rem;
      overflow-x: auto; -webkit-overflow-scrolling: touch;
      white-space: nowrap;
    }
    .edit-toolbar-label {
      font-weight: 300; letter-spacing: 0.08em; opacity: 0.6; margin-right: auto;
    }
    .edit-toolbar button {
      padding: 0.45em 1.2em; font-family: inherit; font-size: 0.75rem;
      letter-spacing: 0.06em; border: 1px solid rgba(250,249,247,0.3);
      background: transparent; color: #faf9f7; cursor: pointer;
      transition: background 0.2s;
    }
    .edit-toolbar button:hover { background: rgba(250,249,247,0.08); }
    .edit-toolbar .edit-save-btn {
      background: #faf9f7; color: #3d2f28; border-color: #faf9f7;
    }
    .edit-toolbar .edit-save-btn:hover { background: #e8e6e2; }
    .edit-toolbar .edit-panel-toggle {
      background: rgba(250,249,247,0.15);
    }

    /* Editable highlights */
    body.edit-mode [data-editable] {
      outline: 2px dashed rgba(107,93,84,0.35);
      outline-offset: 4px; cursor: text;
    }
    body.edit-mode [data-editable]:focus {
      outline-color: #3d2f28; outline-style: solid;
    }

    /* Inline image hover buttons */
    .edit-img-btn {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%,-50%); z-index: 10;
      padding: 0.5em 1em;
      font-family: 'Noto Serif JP', serif; font-size: 0.7rem;
      background: rgba(61,47,40,0.85); color: #faf9f7;
      border: 1px solid rgba(250,249,247,0.2);
      cursor: pointer; opacity: 0; transition: opacity 0.3s;
      white-space: nowrap;
    }
    body.edit-mode .edit-img-wrapper:hover .edit-img-btn { opacity: 1; }
    .edit-img-wrapper { position: relative; }
  `;
  document.head.appendChild(style);

  // --- ツールバー ---
  const toolbar = document.createElement('div');
  toolbar.className = 'edit-toolbar';
  toolbar.innerHTML = `
    <span class="edit-toolbar-label">編集モード</span>
    <button class="edit-divider-toggle" type="button" title="境界線スタイル切替">波線</button>
    <button class="edit-transition-toggle" type="button" title="セクション切替効果">切替効果</button>
    <button class="edit-brown-toggle" type="button" title="ブラウン色味比較">茶色</button>
    <button class="edit-price-sync" type="button" title="BASEから価格を自動取得">価格同期</button>
    <button class="edit-panel-toggle" type="button">設定パネル</button>
    <button class="edit-exit-btn" type="button">終了</button>
    <button class="edit-save-btn" type="button">公開</button>
  `;
  document.body.appendChild(toolbar);

  // --- 編集パネル ---
  const panel = document.createElement('div');
  panel.className = 'edit-panel';
  panel.innerHTML = buildPanelHTML();
  document.body.appendChild(panel);

  // パネル開閉
  toolbar.querySelector('.edit-panel-toggle').addEventListener('click', () => {
    panel.classList.toggle('open');
  });
  panel.querySelector('.edit-panel-close').addEventListener('click', () => {
    panel.classList.remove('open');
  });

  // --- テキスト直接編集 ---
  document.querySelectorAll('[data-editable]').forEach(el => {
    el.contentEditable = 'true';
    el.spellcheck = false;
  });

  // --- 画像インライン置換ボタン ---
  document.querySelectorAll(
    '.hero-image img, .concept-image img, .process-image img, .instagram-item img'
  ).forEach(img => attachImgReplace(img));

  // --- パネル内のイベント設定 ---
  initPanelSections();
  initLogoPanel();
  initHeroPanel();
  initConceptPanel();
  initCollectionPanel();
  initProcessPanel();
  initInstagramPanel();
  initLinksPanel();
  initColorsPanel();

  // --- 境界線スタイル切替 ---
  const dividerStyles = ['', 'divider-gentle', 'divider-layered', 'divider-diagonal', 'divider-organic', 'divider-arc', 'divider-mountain', 'divider-fade'];
  const dividerLabels = ['楕円（デフォルト）', 'ゆる波', 'レイヤード波', '斜め切り', '有機カーブ', 'ソフトアーク', 'マウンテン', 'フェード'];
  let dividerIdx = dividerStyles.indexOf(
    [...document.body.classList].find(c => c.startsWith('divider-')) || ''
  );
  if (dividerIdx < 0) dividerIdx = 0;
  const divBtn = toolbar.querySelector('.edit-divider-toggle');
  divBtn.textContent = dividerLabels[dividerIdx];

  divBtn.addEventListener('click', () => {
    document.body.classList.remove(...dividerStyles.filter(Boolean));
    dividerIdx = (dividerIdx + 1) % dividerStyles.length;
    if (dividerStyles[dividerIdx]) document.body.classList.add(dividerStyles[dividerIdx]);
    divBtn.textContent = dividerLabels[dividerIdx];
  });

  // --- セクション切替効果トグル ---
  const transStyles = ['', 'transition-overlap', 'transition-zoom', 'transition-parallax', 'transition-curtain', 'transition-cinematic', 'transition-slideup'];
  const transLabels = ['効果なし', 'オーバーラップ', 'ズームフェード', 'パララックス', 'カーテン', 'シネマティック', 'スライドアップ'];
  let transIdx = transStyles.indexOf(
    [...document.body.classList].find(c => c.startsWith('transition-')) || ''
  );
  if (transIdx < 0) transIdx = 0;
  const transBtn = toolbar.querySelector('.edit-transition-toggle');
  transBtn.textContent = transLabels[transIdx];

  transBtn.addEventListener('click', () => {
    document.body.classList.remove(...transStyles.filter(Boolean));
    // cleanup zoom classes
    document.querySelectorAll('body > section').forEach(s => {
      s.classList.remove('zoom-in', 'zoom-out');
      s.style.position = '';
      s.style.zIndex = '';
      s.style.overflow = '';
    });
    document.body.style.overflowX = '';
    transIdx = (transIdx + 1) % transStyles.length;
    if (transStyles[transIdx]) document.body.classList.add(transStyles[transIdx]);
    transBtn.textContent = transLabels[transIdx];
    // re-init effects
    if (typeof initZoomFade === 'function') initZoomFade();
    if (typeof initParallax === 'function') initParallax();
    if (typeof initCurtain === 'function') initCurtain();
    if (typeof initCinematic === 'function') initCinematic();
    if (typeof initSlideUp === 'function') initSlideUp();
  });

  // --- ブラウン色味比較 ---
  const brownVariants = [
    { label: '現在', value: '#3d2f28' },
    { label: '少し落ち着き', value: '#362a24' },
    { label: 'さらに深め', value: '#2f2520' },
    { label: 'グレー寄り', value: '#38322e' },
    { label: '赤み抑え', value: '#352d28' },
  ];
  let brownIdx = 0;
  const brownBtn = toolbar.querySelector('.edit-brown-toggle');
  brownBtn.textContent = '茶色: ' + brownVariants[0].label;

  brownBtn.addEventListener('click', () => {
    brownIdx = (brownIdx + 1) % brownVariants.length;
    const v = brownVariants[brownIdx];
    document.documentElement.style.setProperty('--dark-brown', v.value);
    brownBtn.textContent = '茶色: ' + v.label;
    // Update color panel if open
    const colorInput = panel.querySelector('#ep-color-dark');
    const colorHex = panel.querySelector('#ep-color-dark-hex');
    if (colorInput) { colorInput.value = v.value; }
    if (colorHex) { colorHex.textContent = v.value; }
  });

  // --- 価格同期 ---
  toolbar.querySelector('.edit-price-sync').addEventListener('click', async () => {
    const btn = toolbar.querySelector('.edit-price-sync');
    const originalText = btn.textContent;
    btn.textContent = '取得中...';
    btn.disabled = true;

    try {
      // Collect all BASE URLs from collection items
      const urls = {};
      document.querySelectorAll('.collection-item').forEach(item => {
        const theme = item.dataset.theme;
        const buyLink = item.querySelector('.collection-buy');
        if (buyLink && buyLink.href && buyLink.href.includes('base.ec')) {
          urls[theme] = buyLink.href;
        }
      });

      const res = await fetch('http://127.0.0.1:9999/fetch-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls })
      });

      if (!res.ok) throw new Error('サーバーエラー');
      const data = await res.json();
      const prices = data.prices || {};

      let updated = 0;
      for (const [theme, amount] of Object.entries(prices)) {
        if (typeof amount === 'number') {
          const formatted = '¥' + amount.toLocaleString();
          const item = document.querySelector(`.collection-item[data-theme="${theme}"]`);
          if (!item) continue;

          // Update all price displays
          const priceEl = item.querySelector('.collection-price');
          if (priceEl) priceEl.textContent = formatted;
          const bottomPrice = item.querySelector('.bottom-price');
          if (bottomPrice) bottomPrice.textContent = formatted;
          const autoPrice = item.querySelector('.auto-price');
          if (autoPrice) autoPrice.textContent = formatted;
          updated++;
        }
      }

      btn.textContent = updated + '件 更新';
      setTimeout(() => { btn.textContent = originalText; }, 2000);

    } catch (e) {
      if (e.message.includes('Failed to fetch') || e.message.includes('Load failed')) {
        alert('デプロイサーバー（port 9999）が起動していません。\n先に deploy-server.py を起動してください。');
      } else {
        alert('価格取得エラー: ' + e.message);
      }
      btn.textContent = originalText;
    } finally {
      btn.disabled = false;
    }
  });

  // --- 保存 ---
  toolbar.querySelector('.edit-save-btn').addEventListener('click', saveHTML);

  // --- 終了 ---
  toolbar.querySelector('.edit-exit-btn').addEventListener('click', () => {
    if (confirm('編集モードを終了しますか？\n保存していない変更は失われます。')) {
      sessionStorage.removeItem('conte-edit');
      window.location.reload();
    }
  });

  // ===========================================
  // Helper Functions
  // ===========================================

  function buildPanelHTML() {
    return `
      <div class="edit-panel-header">
        <h2>conte.jpeg Editor</h2>
        <button class="edit-panel-close">&times;</button>
      </div>

      <div class="ep-section" data-ep="logo">
        <div class="ep-section-head">ロゴ</div>
        <div class="ep-section-body">
          <label class="ep-label">「conte」テキスト</label>
          <input class="ep-input" id="ep-logo-main" value="">
          <label class="ep-label">「.jpeg」テキスト</label>
          <input class="ep-input" id="ep-logo-sub" value="">
          <label class="ep-label">ロゴ文字サイズ（Hero）</label>
          <div style="display:flex;gap:0.5rem;margin-top:0.3rem">
            <div style="flex:1">
              <span style="font-size:0.65rem;color:#6b5d54">メイン</span>
              <input type="range" id="ep-logo-main-size" min="1.5" max="6" step="0.1" style="width:100%">
            </div>
            <div style="flex:1">
              <span style="font-size:0.65rem;color:#6b5d54">サブ</span>
              <input type="range" id="ep-logo-sub-size" min="1" max="4" step="0.1" style="width:100%">
            </div>
          </div>
          <label class="ep-label">ロゴ letter-spacing</label>
          <input type="range" id="ep-logo-spacing" min="-0.05" max="0.3" step="0.01" style="width:100%">
          <label class="ep-label">フォント</label>
          <div id="ep-font-picker">
            <input class="ep-input" id="ep-font-search" placeholder="フォント名で検索..." autocomplete="off">
            <div id="ep-font-preview" style="margin:0.4rem 0;padding:0.5rem;background:#fff;border:1px solid #d5cfc9;font-size:1.4rem;text-align:center;min-height:2.5rem">conte.jpeg</div>
            <div id="ep-font-list" style="max-height:200px;overflow-y:auto;border:1px solid #d5cfc9;background:#fff;display:none"></div>
            <div style="margin-top:0.3rem;font-size:0.65rem;color:#6b5d54" id="ep-font-count"></div>
          </div>
          <label class="ep-label">フォント太さ</label>
          <select class="ep-input" id="ep-logo-weight">
            <option value="100">Thin (100)</option>
            <option value="200">ExtraLight (200)</option>
            <option value="300">Light (300)</option>
            <option value="400" selected>Regular (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">SemiBold (600)</option>
            <option value="700">Bold (700)</option>
          </select>
        </div>
      </div>

      <div class="ep-section" data-ep="hero">
        <div class="ep-section-head">Hero</div>
        <div class="ep-section-body">
          <label class="ep-label">キャッチコピー</label>
          <input class="ep-input" id="ep-hero-tagline" value="">
          <label class="ep-label">背景写真</label>
          <div class="ep-img-row">
            <img class="ep-img-preview" id="ep-hero-img-preview" src="">
            <button class="ep-img-btn" id="ep-hero-img-btn">変更</button>
          </div>
        </div>
      </div>

      <div class="ep-section" data-ep="concept">
        <div class="ep-section-head">Concept</div>
        <div class="ep-section-body" id="ep-concept-body"></div>
      </div>

      <div class="ep-section" data-ep="collection">
        <div class="ep-section-head">Collection</div>
        <div class="ep-section-body" id="ep-collection-body"></div>
      </div>

      <div class="ep-section" data-ep="process">
        <div class="ep-section-head">Process</div>
        <div class="ep-section-body" id="ep-process-body"></div>
      </div>

      <div class="ep-section" data-ep="instagram">
        <div class="ep-section-head">Instagram</div>
        <div class="ep-section-body" id="ep-instagram-body"></div>
      </div>

      <div class="ep-section" data-ep="links">
        <div class="ep-section-head">リンク設定</div>
        <div class="ep-section-body">
          <label class="ep-label">BASE ストア URL</label>
          <input class="ep-input" id="ep-base-url" value="">
          <label class="ep-label">Instagram URL</label>
          <input class="ep-input" id="ep-insta-url" value="">
        </div>
      </div>

      <div class="ep-section" data-ep="colors">
        <div class="ep-section-head">カラー設定</div>
        <div class="ep-section-body">
          <label class="ep-label">メインカラー（ダークブラウン）</label>
          <div class="ep-color-row">
            <input type="color" class="ep-color-input" id="ep-color-dark" value="#3d2f28">
            <span class="ep-color-hex" id="ep-color-dark-hex">#3d2f28</span>
          </div>
          <label class="ep-label">サブカラー（トープ）</label>
          <div class="ep-color-row">
            <input type="color" class="ep-color-input" id="ep-color-taupe" value="#6b5d54">
            <span class="ep-color-hex" id="ep-color-taupe-hex">#6b5d54</span>
          </div>
          <label class="ep-label">背景色（クリーム）</label>
          <div class="ep-color-row">
            <input type="color" class="ep-color-input" id="ep-color-cream" value="#faf9f7">
            <span class="ep-color-hex" id="ep-color-cream-hex">#faf9f7</span>
          </div>
        </div>
      </div>

      <div style="height:80px"></div>
    `;
  }

  // --- アコーディオン ---
  function initPanelSections() {
    panel.querySelectorAll('.ep-section-head').forEach(head => {
      head.addEventListener('click', () => {
        head.parentElement.classList.toggle('open');
      });
    });
  }

  // --- Logo ---
  function initLogoPanel() {
    const allMain = document.querySelectorAll('.logo-main');
    const allSub = document.querySelectorAll('.logo-sub');
    const heroMain = document.querySelector('.hero-logo .logo-main');
    const heroSub = document.querySelector('.hero-logo .logo-sub');

    const inputMain = panel.querySelector('#ep-logo-main');
    const inputSub = panel.querySelector('#ep-logo-sub');
    const sizeMain = panel.querySelector('#ep-logo-main-size');
    const sizeSub = panel.querySelector('#ep-logo-sub-size');
    const spacing = panel.querySelector('#ep-logo-spacing');
    const fontSearch = panel.querySelector('#ep-font-search');
    const fontList = panel.querySelector('#ep-font-list');
    const fontPreview = panel.querySelector('#ep-font-preview');
    const fontCount = panel.querySelector('#ep-font-count');
    const weightSelect = panel.querySelector('#ep-logo-weight');

    // Init values
    inputMain.value = heroMain.textContent;
    inputSub.value = heroSub.textContent;
    sizeMain.value = parseFloat(getComputedStyle(heroMain).fontSize) / 16;
    sizeSub.value = parseFloat(getComputedStyle(heroSub).fontSize) / 16;
    spacing.value = parseFloat(getComputedStyle(heroMain).letterSpacing) / 16 || 0.04;

    // Text: panel → page
    inputMain.addEventListener('input', () => {
      allMain.forEach(el => { el.textContent = inputMain.value; });
      fontPreview.textContent = inputMain.value + inputSub.value;
    });
    inputSub.addEventListener('input', () => {
      allSub.forEach(el => { el.textContent = inputSub.value; });
      fontPreview.textContent = inputMain.value + inputSub.value;
    });

    // Text: page → panel
    if (heroMain) heroMain.addEventListener('input', () => {
      inputMain.value = heroMain.textContent;
      fontPreview.textContent = heroMain.textContent + (heroSub ? heroSub.textContent : '');
    });
    if (heroSub) heroSub.addEventListener('input', () => {
      inputSub.value = heroSub.textContent;
      fontPreview.textContent = (heroMain ? heroMain.textContent : '') + heroSub.textContent;
    });

    // Size (hero only)
    sizeMain.addEventListener('input', () => {
      heroMain.style.fontSize = sizeMain.value + 'rem';
    });
    sizeSub.addEventListener('input', () => {
      heroSub.style.fontSize = sizeSub.value + 'rem';
    });

    // Spacing
    spacing.addEventListener('input', () => {
      allMain.forEach(el => { el.style.letterSpacing = spacing.value + 'em'; });
      allSub.forEach(el => { el.style.letterSpacing = spacing.value + 'em'; });
    });

    // Font weight
    weightSelect.addEventListener('change', () => {
      allMain.forEach(el => { el.style.fontWeight = weightSelect.value; });
      allSub.forEach(el => { el.style.fontWeight = weightSelect.value; });
      fontPreview.style.fontWeight = weightSelect.value;
    });

    // --- Google Fonts Picker ---
    let allFonts = [];
    const loadedFonts = new Set();

    // Fetch font list from Google Fonts API
    fetch('https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity')
      .then(r => r.json())
      .then(data => {
        allFonts = data.items || [];
        fontCount.textContent = allFonts.length + ' フォント利用可能';
      })
      .catch(() => {
        // API key might not work, fallback to a curated list
        allFonts = [
          'EB Garamond','Cormorant Garamond','Playfair Display','Lora','Crimson Text',
          'Libre Baskerville','Cinzel','Forum','Italiana','Josefin Sans','Montserrat',
          'Raleway','Lato','Open Sans','Roboto','Poppins','Inter','DM Sans',
          'Source Serif 4','Merriweather','PT Serif','Noto Serif','Bitter',
          'Spectral','Vollkorn','Alegreya','Old Standard TT','Cardo',
          'Cormorant','Cormorant Infant','Gilda Display','Poiret One',
          'Julius Sans One','Tenor Sans','Didact Gothic','Jost',
          'Work Sans','Nunito','Karla','Rubik','Archivo','Outfit',
          'Bodoni Moda','Marcellus','Trirong','Sorts Mill Goudy',
          'Rozha One','Yeseva One','Antic Didone','Oranienbaum'
        ].map(f => ({ family: f }));
        fontCount.textContent = allFonts.length + ' フォント利用可能（オフラインリスト）';
      });

    function loadGoogleFont(family) {
      if (loadedFonts.has(family)) return;
      loadedFonts.add(family);
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@100;200;300;400;500;600;700&display=swap`;
      document.head.appendChild(link);
    }

    function applyFont(family) {
      loadGoogleFont(family);
      const val = `'${family}', serif`;
      document.documentElement.style.setProperty('--font-logo', val);
      fontPreview.style.fontFamily = val;
      fontSearch.value = family;
      fontList.style.display = 'none';
    }

    function renderFontList(query) {
      const q = query.toLowerCase().trim();
      const filtered = q
        ? allFonts.filter(f => f.family.toLowerCase().includes(q))
        : allFonts.slice(0, 50);

      if (filtered.length === 0) {
        fontList.innerHTML = '<div class="ep-font-loading">見つかりませんでした</div>';
        fontList.style.display = 'block';
        return;
      }

      const shown = filtered.slice(0, 60);
      fontList.innerHTML = shown.map(f => `
        <div class="ep-font-item" data-font="${f.family}">
          <span class="ep-font-item-preview" style="font-family:'${f.family}',serif">conte.jpeg</span>
          <span class="ep-font-item-name">${f.family}</span>
        </div>
      `).join('') + (filtered.length > 60 ? `<div class="ep-font-loading">他 ${filtered.length - 60} 件...</div>` : '');

      fontList.style.display = 'block';

      // Lazy-load fonts for visible items
      shown.forEach(f => loadGoogleFont(f.family));

      fontList.querySelectorAll('.ep-font-item').forEach(item => {
        item.addEventListener('click', () => applyFont(item.dataset.font));
      });
    }

    fontSearch.addEventListener('focus', () => renderFontList(fontSearch.value));
    fontSearch.addEventListener('input', () => renderFontList(fontSearch.value));

    // Close list when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#ep-font-picker')) {
        fontList.style.display = 'none';
      }
    });
  }

  // --- Hero ---
  function initHeroPanel() {
    const tagline = document.querySelector('.hero-tagline');
    const heroImg = document.querySelector('.hero-image img');
    const heroVideo = document.querySelector('.hero-image video');
    const input = panel.querySelector('#ep-hero-tagline');
    const preview = panel.querySelector('#ep-hero-img-preview');

    input.value = tagline.textContent;

    // panel → page
    input.addEventListener('input', () => { tagline.textContent = input.value; });

    // page → panel
    tagline.addEventListener('input', () => { input.value = tagline.textContent; });

    if (heroImg) {
      preview.src = heroImg.src;
      makeImgPicker(panel.querySelector('#ep-hero-img-btn'), (src) => {
        heroImg.src = src;
        preview.src = src;
      });
    } else {
      preview.style.display = 'none';
      panel.querySelector('#ep-hero-img-btn').style.display = 'none';
    }
  }

  // --- Concept ---
  function initConceptPanel() {
    const body = panel.querySelector('#ep-concept-body');
    const blocks = document.querySelectorAll('.concept-block');
    let html = '';
    blocks.forEach((block, i) => {
      const img = block.querySelector('img');
      const text = block.querySelector('[data-editable]') || block.querySelector('.concept-text p');
      html += `
        <label class="ep-label">テキスト ${i+1}</label>
        <textarea class="ep-textarea" data-concept-text="${i}">${text ? text.innerHTML.replace(/<br\s*\/?>/g, '\n') : ''}</textarea>
        <label class="ep-label">写真 ${i+1}</label>
        <div class="ep-img-row">
          <img class="ep-img-preview" data-concept-preview="${i}" src="${img.src}">
          <button class="ep-img-btn" data-concept-img="${i}">変更</button>
        </div>
      `;
    });
    body.innerHTML = html;

    // Text sync: panel → page
    body.querySelectorAll('[data-concept-text]').forEach(ta => {
      const idx = ta.dataset.conceptText;
      ta.addEventListener('input', () => {
        const p = blocks[idx].querySelector('.concept-text p');
        if (p) p.innerHTML = ta.value.replace(/\n/g, '<br>');
      });
    });

    // Text sync: page → panel
    blocks.forEach((block, i) => {
      const editable = block.querySelector('[data-editable]') || block.querySelector('.concept-text p');
      if (editable) {
        editable.addEventListener('input', () => {
          const ta = body.querySelector(`[data-concept-text="${i}"]`);
          if (ta) ta.value = editable.innerHTML.replace(/<br\s*\/?>/g, '\n');
        });
      }
    });

    // Image sync
    body.querySelectorAll('[data-concept-img]').forEach(btn => {
      const idx = btn.dataset.conceptImg;
      makeImgPicker(btn, (src) => {
        blocks[idx].querySelector('img').src = src;
        body.querySelector(`[data-concept-preview="${idx}"]`).src = src;
      });
    });
  }

  // --- Collection ---
  function initCollectionPanel() {
    const body = panel.querySelector('#ep-collection-body');

    // Dynamically track current themes from DOM
    function getCurrentThemeKeys() {
      return Array.from(document.querySelectorAll('.collection-item')).map(el => el.dataset.theme);
    }

    function getLabel(item) {
      const ja = item.querySelector('.theme-name-ja');
      const en = item.querySelector('.theme-name-en');
      return (ja ? ja.textContent : '') + ' / ' + (en ? en.textContent : '');
    }

    showCollectionGrid();

    function showCollectionGrid() {
      const keys = getCurrentThemeKeys();
      let html = '<div class="ep-collection-grid">';
      keys.forEach(key => {
        const item = document.querySelector(`.collection-item[data-theme="${key}"]`);
        const img = item.querySelector('.collection-img-1');
        html += `
          <div class="ep-collection-card" data-ep-theme="${key}">
            <img src="${img.src}">
            <span>${getLabel(item)}</span>
          </div>
        `;
      });
      html += '</div>';
      html += `
        <div style="margin-top:0.8rem;display:flex;gap:0.5rem">
          <button class="ep-img-btn" id="ep-coll-add" style="flex:1;padding:0.6em">＋ アイテム追加</button>
        </div>
      `;
      body.innerHTML = html;

      body.querySelectorAll('.ep-collection-card').forEach(card => {
        card.addEventListener('click', () => showCollectionDetail(card.dataset.epTheme));
      });

      body.querySelector('#ep-coll-add').addEventListener('click', addCollectionItem);
    }

    function addCollectionItem() {
      // Generate unique theme key
      let newIdx = getCurrentThemeKeys().length + 1;
      let newKey = 'custom-' + newIdx;
      while (document.querySelector(`.collection-item[data-theme="${newKey}"]`)) {
        newIdx++;
        newKey = 'custom-' + newIdx;
      }

      // Create new collection item in DOM
      const grid = document.querySelector('.collection-grid');
      const newItem = document.createElement('div');
      newItem.className = 'collection-item';
      newItem.dataset.theme = newKey;
      newItem.innerHTML = `
        <img class="collection-img-1" src="images/collection/coral.webp" alt="新規アイテム" loading="lazy">
        <img class="collection-img-2" src="images/collection/coral-2.webp" alt="新規アイテム" loading="lazy">
        <div class="collection-item-overlay">
          <span class="theme-name-ja">新規</span>
          <span class="theme-name-en">New Item</span>
          <span class="collection-price">¥6,600</span>
          <a href="https://conte.base.ec" class="collection-buy" target="_blank" rel="noopener">購入はこちら &rarr;</a>
        </div>
      `;
      grid.insertBefore(newItem, grid.firstChild);

      // Add to themeData (script.js)
      if (window.themeData) {
        window.themeData[newKey] = {
          ja: '新規',
          en: 'New Item',
          description: '説明を入力してください。'
        };
      }

      // Re-register click for modal (from script.js initModal)
      registerCollectionItemClick(newItem);

      // Go to detail view
      showCollectionDetail(newKey);
    }

    // Register click handler on new collection items (mirrors script.js logic)
    function registerCollectionItemClick(item) {
      const modal = document.getElementById('modal');
      const modalImg = modal.querySelector('.modal-image img');
      const modalJa = modal.querySelector('.modal-theme-ja');
      const modalEn = modal.querySelector('.modal-theme-en');
      const modalDesc = modal.querySelector('.modal-description');

      item.addEventListener('click', (e) => {
        if (e.target.closest('.tap-buy')) return;
        const theme = item.dataset.theme;
        const data = window.themeData ? window.themeData[theme] : null;
        if (!data) return;

        modalImg.src = item.querySelector('.collection-img-1').src;
        modalImg.alt = data.ja + ' / ' + data.en;
        modalJa.textContent = data.ja;
        modalEn.textContent = data.en;
        modalDesc.textContent = data.description;

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      });
    }

    function showCollectionDetail(key) {
      const item = document.querySelector(`.collection-item[data-theme="${key}"]`);
      if (!item) { showCollectionGrid(); return; }
      const img1 = item.querySelector('.collection-img-1');
      const img2 = item.querySelector('.collection-img-2');
      const nameJa = item.querySelector('.theme-name-ja');
      const nameEn = item.querySelector('.theme-name-en');
      const buyLink = item.querySelector('.collection-buy');
      const priceEl = item.querySelector('.collection-price');
      const isSoldOut = item.dataset.soldOut === 'true';
      const isComingSoon = item.dataset.comingSoon === 'true';
      const releaseDate = item.dataset.releaseDate || '';

      // themeData from script.js
      const td = window.themeData ? window.themeData[key] : null;

      // Determine current status
      let currentStatus = 'sale';
      if (isSoldOut) currentStatus = 'soldout';
      else if (isComingSoon) currentStatus = 'coming';

      body.innerHTML = `
        <button class="ep-back-btn">&larr; 一覧に戻る</button>
        <div class="ep-collection-detail">
          <h4>${getLabel(item)}</h4>

          <label class="ep-label">テーマ名（日本語）</label>
          <input class="ep-input" id="ep-coll-ja" value="${nameJa ? nameJa.textContent : ''}">

          <label class="ep-label">テーマ名（英語）</label>
          <input class="ep-input" id="ep-coll-en" value="${nameEn ? nameEn.textContent : ''}">

          <label class="ep-label">価格</label>
          <input class="ep-input" id="ep-coll-price" value="${priceEl ? priceEl.textContent : ''}" placeholder="¥6,600">

          <label class="ep-label">説明文（モーダル用）</label>
          <textarea class="ep-textarea" id="ep-coll-desc" rows="3">${td ? td.description : ''}</textarea>

          <label class="ep-label">購入リンク URL</label>
          <input class="ep-input" id="ep-coll-url" value="${buyLink ? buyLink.href : ''}">

          <label class="ep-label">販売ステータス</label>
          <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-top:0.3rem">
            <button type="button" class="ep-status-btn${currentStatus === 'sale' ? ' active' : ''}" data-status="sale" style="padding:0.45em 1em;font-size:0.72rem;font-family:inherit;border:1px solid #d5cfc9;background:${currentStatus === 'sale' ? '#3d2f28' : '#fff'};color:${currentStatus === 'sale' ? '#faf9f7' : '#6b5d54'};cursor:pointer;transition:all 0.15s">販売中</button>
            <button type="button" class="ep-status-btn${currentStatus === 'soldout' ? ' active' : ''}" data-status="soldout" style="padding:0.45em 1em;font-size:0.72rem;font-family:inherit;border:1px solid #d5cfc9;background:${currentStatus === 'soldout' ? '#3d2f28' : '#fff'};color:${currentStatus === 'soldout' ? '#faf9f7' : '#6b5d54'};cursor:pointer;transition:all 0.15s">Sold Out</button>
            <button type="button" class="ep-status-btn${currentStatus === 'coming' ? ' active' : ''}" data-status="coming" style="padding:0.45em 1em;font-size:0.72rem;font-family:inherit;border:1px solid #d5cfc9;background:${currentStatus === 'coming' ? '#3d2f28' : '#fff'};color:${currentStatus === 'coming' ? '#faf9f7' : '#6b5d54'};cursor:pointer;transition:all 0.15s">Coming Soon</button>
          </div>
          <div id="ep-coll-release-row" style="margin-top:0.5rem;display:${isComingSoon ? 'block' : 'none'}">
            <label class="ep-label">販売開始日（任意）</label>
            <input class="ep-input" id="ep-coll-release" value="${releaseDate}" placeholder="例: 3.15 sat">
          </div>

          <label class="ep-label">写真</label>
          <div class="ep-img-pair">
            <div class="ep-img-pair-item">
              <span class="ep-img-pair-label">メイン</span>
              <img id="ep-coll-img1-preview" src="${img1.src}">
              <button class="ep-img-btn" id="ep-coll-img1-btn">変更</button>
            </div>
            <div class="ep-img-pair-item">
              <span class="ep-img-pair-label">ホバー時</span>
              <img id="ep-coll-img2-preview" src="${img2.src}">
              <button class="ep-img-btn" id="ep-coll-img2-btn">変更</button>
            </div>
          </div>

          <button class="ep-img-btn" id="ep-coll-delete" style="width:100%;margin-top:1rem;background:#8b3a3a;padding:0.6em">このアイテムを削除</button>
        </div>
      `;

      // Back
      body.querySelector('.ep-back-btn').addEventListener('click', showCollectionGrid);

      // Name sync
      body.querySelector('#ep-coll-ja').addEventListener('input', (e) => {
        if (nameJa) nameJa.textContent = e.target.value;
        if (td) td.ja = e.target.value;
        // Update alt
        img1.alt = e.target.value + ' / ' + (nameEn ? nameEn.textContent : '');
        img2.alt = img1.alt;
      });
      body.querySelector('#ep-coll-en').addEventListener('input', (e) => {
        if (nameEn) nameEn.textContent = e.target.value;
        if (td) td.en = e.target.value;
        img1.alt = (nameJa ? nameJa.textContent : '') + ' / ' + e.target.value;
        img2.alt = img1.alt;
      });

      // Description sync
      body.querySelector('#ep-coll-desc').addEventListener('input', (e) => {
        if (td) td.description = e.target.value;
      });

      // Price sync
      body.querySelector('#ep-coll-price').addEventListener('input', (e) => {
        if (priceEl) priceEl.textContent = e.target.value;
        // Update bottom bar and auto-overlay too
        const bottomPrice = item.querySelector('.bottom-price');
        if (bottomPrice) bottomPrice.textContent = e.target.value;
        const autoPrice = item.querySelector('.auto-price');
        if (autoPrice) autoPrice.textContent = e.target.value;
      });

      // Status toggle (sale / soldout / coming)
      body.querySelectorAll('.ep-status-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          // Update button styles
          body.querySelectorAll('.ep-status-btn').forEach(b => {
            b.style.background = '#fff';
            b.style.color = '#6b5d54';
            b.classList.remove('active');
          });
          btn.style.background = '#3d2f28';
          btn.style.color = '#faf9f7';
          btn.classList.add('active');

          const status = btn.dataset.status;

          // Clear all status attributes
          delete item.dataset.soldOut;
          delete item.dataset.comingSoon;
          delete item.dataset.releaseDate;

          // Remove existing badges
          item.querySelectorAll('.collection-status-badge').forEach(el => el.remove());

          if (status === 'soldout') {
            item.dataset.soldOut = 'true';
            const badge = document.createElement('div');
            badge.className = 'collection-status-badge sold-out';
            badge.innerHTML = '<span class="badge-line"></span> sold out <span class="badge-line"></span>';
            item.appendChild(badge);
          } else if (status === 'coming') {
            item.dataset.comingSoon = 'true';
            const releaseVal = body.querySelector('#ep-coll-release').value;
            if (releaseVal) item.dataset.releaseDate = releaseVal;
            const badge = document.createElement('div');
            badge.className = 'collection-status-badge coming-soon';
            let badgeHtml = '<span class="badge-line"></span> coming soon <span class="badge-line"></span>';
            if (releaseVal) badgeHtml += '<span class="badge-date">' + releaseVal + '</span>';
            badge.innerHTML = badgeHtml;
            item.appendChild(badge);
          }

          // Show/hide release date input
          body.querySelector('#ep-coll-release-row').style.display = status === 'coming' ? 'block' : 'none';

          // Update overlays (mobile auto-overlay / PC bottom bar)
          updateItemOverlay(item);
        });
      });

      // Release date input
      const releaseInput = body.querySelector('#ep-coll-release');
      if (releaseInput) {
        releaseInput.addEventListener('input', () => {
          if (item.dataset.comingSoon === 'true') {
            if (releaseInput.value) {
              item.dataset.releaseDate = releaseInput.value;
            } else {
              delete item.dataset.releaseDate;
            }
            updateItemOverlay(item);
          }
        });
      }

      // URL sync
      body.querySelector('#ep-coll-url').addEventListener('input', (e) => {
        if (buyLink) buyLink.href = e.target.value;
      });

      // Image pickers
      makeImgPicker(body.querySelector('#ep-coll-img1-btn'), (src) => {
        img1.src = src;
        body.querySelector('#ep-coll-img1-preview').src = src;
      });
      makeImgPicker(body.querySelector('#ep-coll-img2-btn'), (src) => {
        img2.src = src;
        body.querySelector('#ep-coll-img2-preview').src = src;
      });

      // Delete
      body.querySelector('#ep-coll-delete').addEventListener('click', () => {
        const label = getLabel(item);
        if (!confirm(`「${label}」を削除しますか？`)) return;
        item.remove();
        if (window.themeData) delete window.themeData[key];
        showCollectionGrid();
      });
    }

    // Update mobile/PC overlay after status change
    function updateItemOverlay(item) {
      const isSoldOut = item.dataset.soldOut === 'true';
      const isComingSoon = item.dataset.comingSoon === 'true';
      const releaseDate = item.dataset.releaseDate || '';
      const nameJa = item.querySelector('.theme-name-ja')?.textContent || '';
      const price = item.querySelector('.collection-price')?.textContent || '';
      const buyLink = item.querySelector('.collection-buy')?.href || 'https://conte.base.ec';

      let statusHtml = '';
      if (isSoldOut) {
        statusHtml = '<span class="collection-sold-out">sold out</span>';
      } else if (isComingSoon) {
        statusHtml = '<span class="collection-coming-soon">coming soon' + (releaseDate ? '<span class="release-date">' + releaseDate + '</span>' : '') + '</span>';
      }

      // Update auto-overlay (mobile)
      const autoOverlay = item.querySelector('.collection-auto-overlay');
      if (autoOverlay) {
        let html = '<span class="auto-name">' + nameJa + '</span>';
        html += '<span class="auto-price">' + price + '</span>';
        if (isSoldOut) {
          html += statusHtml;
        } else if (isComingSoon) {
          html += '<a class="auto-buy" href="' + buyLink + '" target="_blank" rel="noopener">ストアでみる →</a>';
        } else {
          html += '<a class="auto-buy" href="' + buyLink + '" target="_blank" rel="noopener">購入 →</a>';
        }
        autoOverlay.innerHTML = html;
      }

      // Update bottom bar (PC)
      const bottomBars = item.querySelectorAll('.collection-item-bottom');
      bottomBars.forEach(bottom => {
        let html = '<span class="bottom-name">' + nameJa + '</span>';
        html += '<span class="bottom-price">' + price + '</span>';
        if (isSoldOut) {
          html += statusHtml;
        } else if (isComingSoon) {
          html += '<a class="bottom-buy" href="' + buyLink + '" target="_blank" rel="noopener">ストアでみる →</a>';
        } else {
          html += '<a class="bottom-buy" href="' + buyLink + '" target="_blank" rel="noopener">購入 →</a>';
        }
        bottom.innerHTML = html;
      });
    }
  }

  // --- Process ---
  function initProcessPanel() {
    const body = panel.querySelector('#ep-process-body');
    const steps = document.querySelectorAll('.process-step');
    let html = '';
    steps.forEach((step, i) => {
      const h3 = step.querySelector('h3');
      const p = step.querySelector('p');
      const img = step.querySelector('img');
      html += `
        <label class="ep-label">ステップ ${i+1} タイトル</label>
        <input class="ep-input" data-proc-title="${i}" value="${h3.textContent}">
        <label class="ep-label">説明</label>
        <textarea class="ep-textarea" data-proc-desc="${i}">${p.innerHTML.replace(/<br\s*\/?>/g, '\n')}</textarea>
        <label class="ep-label">写真</label>
        <div class="ep-img-row">
          <img class="ep-img-preview" data-proc-preview="${i}" src="${img.src}">
          <button class="ep-img-btn" data-proc-img="${i}">変更</button>
        </div>
      `;
    });
    body.innerHTML = html;

    // panel → page
    body.querySelectorAll('[data-proc-title]').forEach(input => {
      const idx = input.dataset.procTitle;
      input.addEventListener('input', () => {
        steps[idx].querySelector('h3').textContent = input.value;
      });
    });
    body.querySelectorAll('[data-proc-desc]').forEach(ta => {
      const idx = ta.dataset.procDesc;
      ta.addEventListener('input', () => {
        steps[idx].querySelector('p').innerHTML = ta.value.replace(/\n/g, '<br>');
      });
    });

    // page → panel
    steps.forEach((step, i) => {
      const h3 = step.querySelector('h3');
      const p = step.querySelector('p');
      if (h3) h3.addEventListener('input', () => {
        const inp = body.querySelector(`[data-proc-title="${i}"]`);
        if (inp) inp.value = h3.textContent;
      });
      if (p) p.addEventListener('input', () => {
        const ta = body.querySelector(`[data-proc-desc="${i}"]`);
        if (ta) ta.value = p.innerHTML.replace(/<br\s*\/?>/g, '\n');
      });
    });
    body.querySelectorAll('[data-proc-img]').forEach(btn => {
      const idx = btn.dataset.procImg;
      makeImgPicker(btn, (src) => {
        steps[idx].querySelector('img').src = src;
        body.querySelector(`[data-proc-preview="${idx}"]`).src = src;
      });
    });
  }

  // --- Instagram ---
  function initInstagramPanel() {
    const body = panel.querySelector('#ep-instagram-body');
    const items = document.querySelectorAll('.instagram-item img');
    let html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.4rem">';
    items.forEach((img, i) => {
      html += `
        <div style="text-align:center">
          <img class="ep-img-preview" data-insta-preview="${i}" src="${img.src}" style="width:100%;height:auto;aspect-ratio:1;">
          <button class="ep-img-btn" data-insta-img="${i}" style="width:100%;margin-top:0.3rem">変更</button>
        </div>
      `;
    });
    html += '</div>';
    body.innerHTML = html;

    body.querySelectorAll('[data-insta-img]').forEach(btn => {
      const idx = btn.dataset.instaImg;
      makeImgPicker(btn, (src) => {
        items[idx].src = src;
        body.querySelector(`[data-insta-preview="${idx}"]`).src = src;
      });
    });
  }

  // --- Links ---
  function initLinksPanel() {
    const baseInput = panel.querySelector('#ep-base-url');
    const instaInput = panel.querySelector('#ep-insta-url');

    // 現在のURL取得
    const baseLink = document.querySelector('#shop .btn--primary');
    const instaLink = document.querySelector('#instagram .btn--outline');
    baseInput.value = baseLink ? baseLink.href : 'https://conte.base.ec';
    instaInput.value = instaLink ? instaLink.href : 'https://www.instagram.com/conte.jpeg/';

    baseInput.addEventListener('input', () => {
      document.querySelectorAll('a[href*="conte.base"]').forEach(a => { a.href = baseInput.value; });
      document.querySelectorAll('.collection-buy').forEach(a => { a.href = baseInput.value; });
    });
    instaInput.addEventListener('input', () => {
      document.querySelectorAll('a[href*="instagram.com"]').forEach(a => { a.href = instaInput.value; });
    });
  }

  // --- Colors ---
  function initColorsPanel() {
    const root = document.documentElement;
    setupColorPicker('ep-color-dark', '--dark-brown');
    setupColorPicker('ep-color-taupe', '--taupe');
    setupColorPicker('ep-color-cream', '--cream');

    function setupColorPicker(id, cssVar) {
      const input = panel.querySelector(`#${id}`);
      const hex = panel.querySelector(`#${id}-hex`);
      input.value = getComputedStyle(root).getPropertyValue(cssVar).trim();
      hex.textContent = input.value;
      input.addEventListener('input', () => {
        root.style.setProperty(cssVar, input.value);
        hex.textContent = input.value;
      });
    }
  }

  // --- Image picker helper ---
  function makeImgPicker(btn, onSelect) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    btn.parentElement.appendChild(fileInput);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      fileInput.click();
    });

    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        showCropModal(ev.target.result, (croppedSrc) => {
          onSelect(croppedSrc);
        });
      };
      reader.readAsDataURL(file);
      fileInput.value = '';
    });
  }

  // --- Crop Modal ---
  // Max dimension for auto-resize (px)
  const MAX_IMG_DIMENSION = 1600;
  const JPEG_QUALITY = 0.85;

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function dataURLtoBytes(dataURL) {
    const base64 = dataURL.split(',')[1];
    return Math.round(base64.length * 3 / 4);
  }

  function showCropModal(imageSrc, onCrop) {
    const overlay = document.createElement('div');
    overlay.className = 'crop-overlay';
    const originalBytes = dataURLtoBytes(imageSrc);

    let imgW = 0, imgH = 0;
    let frameW = 0, frameH = 0;
    // Image displayed: position (left, top) and displayed size (dispW, dispH)
    let dispW = 0, dispH = 0, imgLeft = 0, imgTop = 0;
    let baseDispW = 0, baseDispH = 0; // at zoom=100%
    let zoomLevel = 100; // 100 = image covers frame exactly
    let dragging = false, lastX = 0, lastY = 0;
    let ratioMode = 'original';

    const ratios = [
      { label: '元の比率', value: 'original' },
      { label: '1:1', value: '1:1' },
      { label: '4:3', value: '4:3' },
      { label: '3:4', value: '3:4' },
      { label: '16:9', value: '16:9' },
      { label: '9:16', value: '9:16' },
    ];

    overlay.innerHTML = `
      <div class="crop-header">
        <span class="crop-header-title">トリミング</span>
        <div class="crop-header-btns">
          <button class="crop-btn crop-btn--skip" type="button">そのまま使う</button>
          <button class="crop-btn" type="button" data-action="cancel">キャンセル</button>
          <button class="crop-btn crop-btn--apply" type="button">適用</button>
        </div>
      </div>
      <div class="crop-area">
        <div class="crop-canvas-wrap">
          <div class="crop-grid">
            <div class="crop-grid-line h h1"></div>
            <div class="crop-grid-line h h2"></div>
            <div class="crop-grid-line v v1"></div>
            <div class="crop-grid-line v v2"></div>
          </div>
        </div>
      </div>
      <div class="crop-bottom">
        <div class="crop-controls">
          <div class="crop-ratios">
            ${ratios.map(r => `<button class="crop-ratio-btn${r.value === ratioMode ? ' active' : ''}" data-ratio="${r.value}" type="button">${r.label}</button>`).join('')}
          </div>
          <div class="crop-zoom-group">
            <span class="crop-zoom-icon" style="color:rgba(255,255,255,0.4)">−</span>
            <input type="range" class="crop-zoom" min="100" max="300" value="100" step="1">
            <span class="crop-zoom-icon" style="color:rgba(255,255,255,0.4)">+</span>
            <span class="crop-zoom-pct">100%</span>
          </div>
        </div>
        <div class="crop-info">
          <span>元: ${formatFileSize(originalBytes)}</span>
          <span>→</span>
          <span class="compressed" id="crop-out-info">—</span>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const cropArea = overlay.querySelector('.crop-area');
    const wrap = overlay.querySelector('.crop-canvas-wrap');
    const zoomSlider = overlay.querySelector('.crop-zoom');
    const zoomPct = overlay.querySelector('.crop-zoom-pct');
    const outInfo = overlay.querySelector('#crop-out-info');

    // Load image, wait for DOM paint before layout
    const img = new Image();
    img.onload = () => {
      imgW = img.naturalWidth;
      imgH = img.naturalHeight;
      wrap.insertBefore(img, wrap.firstChild); // behind grid
      requestAnimationFrame(() => requestAnimationFrame(() => setupFrame()));
    };
    img.src = imageSrc;

    /* ==== Setup frame & fit image ==== */
    function setupFrame() {
      const ar = cropArea.getBoundingClientRect();
      if (ar.width === 0 || ar.height === 0) return; // not painted yet
      const pad = 20;
      const aw = ar.width - pad * 2;
      const ah = ar.height - pad * 2;

      let aspect = imgW / imgH;
      if (ratioMode !== 'original') {
        const [rw, rh] = ratioMode.split(':').map(Number);
        aspect = rw / rh;
      }

      if (aw / ah > aspect) { frameH = ah; frameW = frameH * aspect; }
      else { frameW = aw; frameH = frameW / aspect; }

      wrap.style.width = Math.round(frameW) + 'px';
      wrap.style.height = Math.round(frameH) + 'px';

      // At 100%, image covers frame (like CSS cover)
      const coverScale = Math.max(frameW / imgW, frameH / imgH);
      baseDispW = imgW * coverScale;
      baseDispH = imgH * coverScale;

      zoomLevel = 100;
      applyZoom();
      centerImage();
      render();

      zoomSlider.value = 100;
      zoomPct.textContent = '100%';
    }

    function applyZoom() {
      dispW = baseDispW * (zoomLevel / 100);
      dispH = baseDispH * (zoomLevel / 100);
    }

    function centerImage() {
      imgLeft = (frameW - dispW) / 2;
      imgTop = (frameH - dispH) / 2;
    }

    /* ==== Render: direct width/height/left/top ==== */
    function render() {
      img.style.width = dispW + 'px';
      img.style.height = dispH + 'px';
      img.style.left = imgLeft + 'px';
      img.style.top = imgTop + 'px';
      updateInfo();
    }

    /* ==== Clamp: image must cover frame ==== */
    function clamp() {
      // Left edge must be <= 0
      if (imgLeft > 0) imgLeft = 0;
      // Right edge must be >= frameW
      if (imgLeft + dispW < frameW) imgLeft = frameW - dispW;
      // Top edge must be <= 0
      if (imgTop > 0) imgTop = 0;
      // Bottom edge must be >= frameH
      if (imgTop + dispH < frameH) imgTop = frameH - dispH;
    }

    /* ==== Zoom ==== */
    function setZoom(newLevel) {
      newLevel = Math.max(100, Math.min(300, Math.round(newLevel)));
      // Zoom centered on frame center
      const cx = frameW / 2;
      const cy = frameH / 2;
      // Current image point under frame center
      const imgPx = (cx - imgLeft) / dispW;
      const imgPy = (cy - imgTop) / dispH;

      zoomLevel = newLevel;
      applyZoom();

      // Keep same image point under frame center
      imgLeft = cx - imgPx * dispW;
      imgTop = cy - imgPy * dispH;

      clamp();
      render();

      zoomSlider.value = zoomLevel;
      zoomPct.textContent = zoomLevel + '%';
    }

    /* ==== Crop rect in original image pixels ==== */
    function getCropRect() {
      // Frame (0,0) to (frameW, frameH) visible area
      // Image pixel at frame (fx, fy) = (fx - imgLeft) / dispW * imgW
      const x = (-imgLeft / dispW) * imgW;
      const y = (-imgTop / dispH) * imgH;
      const w = (frameW / dispW) * imgW;
      const h = (frameH / dispH) * imgH;
      return {
        x: Math.round(Math.max(0, x)),
        y: Math.round(Math.max(0, y)),
        w: Math.round(Math.min(w, imgW)),
        h: Math.round(Math.min(h, imgH)),
      };
    }

    function getOutputSize(w, h) {
      if (w <= MAX_IMG_DIMENSION && h <= MAX_IMG_DIMENSION) return { w, h };
      const r = Math.min(MAX_IMG_DIMENSION / w, MAX_IMG_DIMENSION / h);
      return { w: Math.round(w * r), h: Math.round(h * r) };
    }

    function updateInfo() {
      const c = getCropRect();
      const o = getOutputSize(c.w, c.h);
      const pct = Math.round((c.w * c.h) / (imgW * imgH) * 100);
      outInfo.textContent = `${o.w}×${o.h}px（元の${pct}%）`;
    }

    function exportCrop() {
      const c = getCropRect();
      const o = getOutputSize(c.w, c.h);
      const cv = document.createElement('canvas');
      cv.width = o.w; cv.height = o.h;
      cv.getContext('2d').drawImage(img, c.x, c.y, c.w, c.h, 0, 0, o.w, o.h);
      return cv.toDataURL('image/jpeg', JPEG_QUALITY);
    }

    /* ==== Drag ==== */
    wrap.addEventListener('pointerdown', (e) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      wrap.classList.add('dragging');
      wrap.setPointerCapture(e.pointerId);
    });
    wrap.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      imgLeft += dx;
      imgTop += dy;
      clamp();
      render();
    });
    wrap.addEventListener('pointerup', () => { dragging = false; wrap.classList.remove('dragging'); });
    wrap.addEventListener('pointercancel', () => { dragging = false; wrap.classList.remove('dragging'); });

    /* ==== Wheel zoom ==== */
    wrap.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -5 : 5;
      setZoom(zoomLevel + delta);
    }, { passive: false });

    /* ==== Pinch zoom ==== */
    let pinchDist = 0;
    wrap.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchDist = Math.sqrt(dx * dx + dy * dy);
      }
    }, { passive: true });
    wrap.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (pinchDist > 0) {
          const factor = d / pinchDist;
          setZoom(zoomLevel * factor);
        }
        pinchDist = d;
      }
    }, { passive: false });
    wrap.addEventListener('touchend', () => { pinchDist = 0; });

    /* ==== Slider ==== */
    zoomSlider.addEventListener('input', () => setZoom(parseInt(zoomSlider.value)));

    /* ==== Ratio buttons ==== */
    overlay.querySelectorAll('.crop-ratio-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        overlay.querySelectorAll('.crop-ratio-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        ratioMode = btn.dataset.ratio;
        setupFrame();
      });
    });

    /* ==== Resize ==== */
    const onResize = () => setupFrame();
    window.addEventListener('resize', onResize);

    function cleanup() {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('keydown', onKey);
      overlay.remove();
    }

    /* ==== Buttons ==== */
    overlay.querySelector('.crop-btn--skip').addEventListener('click', () => {
      const o = getOutputSize(imgW, imgH);
      const cv = document.createElement('canvas');
      cv.width = o.w; cv.height = o.h;
      cv.getContext('2d').drawImage(img, 0, 0, o.w, o.h);
      cleanup();
      onCrop(cv.toDataURL('image/jpeg', JPEG_QUALITY));
    });

    overlay.querySelector('[data-action="cancel"]').addEventListener('click', cleanup);

    overlay.querySelector('.crop-btn--apply').addEventListener('click', () => {
      const result = exportCrop();
      cleanup();
      onCrop(result);
    });

    const onKey = (e) => { if (e.key === 'Escape') cleanup(); };
    document.addEventListener('keydown', onKey);
  }

  // --- Inline image replace buttons (non-collection) ---
  function attachImgReplace(img) {
    const wrapper = document.createElement('div');
    wrapper.className = 'edit-img-wrapper';
    img.parentElement.style.position = 'relative';

    const btn = document.createElement('button');
    btn.className = 'edit-img-btn';
    btn.type = 'button';
    btn.textContent = '写真を変更';

    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);
    wrapper.appendChild(btn);

    makeImgPicker(btn, (src) => { img.src = src; });
  }

  // --- Save HTML ---
  async function saveHTML() {
    try {
      const clone = document.documentElement.cloneNode(true);

      // 編集UI除去
      clone.querySelector('.edit-toolbar')?.remove();
      clone.querySelector('.edit-panel')?.remove();

      // crop overlay除去
      clone.querySelectorAll('.crop-overlay')?.forEach(el => el.remove());

      clone.querySelectorAll('[contenteditable]').forEach(el => {
        el.removeAttribute('contenteditable');
        el.removeAttribute('spellcheck');
      });

      clone.querySelectorAll('.edit-img-wrapper').forEach(wrapper => {
        const img = wrapper.querySelector('img');
        if (img) {
          wrapper.querySelectorAll('.edit-img-btn, input[type="file"]').forEach(el => el.remove());
          wrapper.parentNode.insertBefore(img, wrapper);
        }
        wrapper.remove();
      });

      clone.querySelector('body')?.classList.remove('edit-mode');
      clone.querySelectorAll('[data-edited-file]').forEach(el => el.removeAttribute('data-edited-file'));

      // Remove dynamically added modal-price elements (recreated by script.js on load)
      clone.querySelectorAll('.modal-price').forEach(el => el.remove());

      // style tag injected by edit.js
      clone.querySelectorAll('style').forEach(s => {
        if (s.textContent.includes('edit-panel')) s.remove();
      });

      const html = '<!DOCTYPE html>\n' + clone.outerHTML;
      await window._contePublish('index.html', html);
    } catch (e) {
      alert('公開処理でエラーが発生しました:\n' + e.message);
      console.error('saveHTML error:', e);
    }
  }

})();
