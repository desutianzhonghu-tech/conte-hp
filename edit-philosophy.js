/* ========================================
   conte.jpeg — Philosophy Edit Mode
   ======================================== */
(function () {
  if (sessionStorage.getItem('conte-edit') !== '1') return;

  document.body.classList.add('edit-mode');

  // Show all cards including draft/archive
  document.querySelectorAll('.phil-card').forEach(el => {
    el.style.display = '';
  });

  // --- Style injection ---
  const style = document.createElement('style');
  style.textContent = `
    .pe-toolbar {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 300;
      display: flex; align-items: center; gap: 0.8rem;
      padding: 0.7rem 1.2rem;
      background: #3d2f28; color: #faf9f7;
      font-family: 'Noto Serif JP', serif; font-size: 0.8rem;
    }
    .pe-toolbar span { font-weight: 300; letter-spacing: 0.08em; opacity: 0.6; margin-right: auto; }
    .pe-toolbar button {
      padding: 0.45em 1.2em; font-family: inherit; font-size: 0.75rem;
      letter-spacing: 0.06em; border: 1px solid rgba(250,249,247,0.3);
      background: transparent; color: #faf9f7; cursor: pointer; transition: background 0.2s;
    }
    .pe-toolbar button:hover { background: rgba(250,249,247,0.08); }
    .pe-toolbar .pe-save {
      background: #faf9f7; color: #3d2f28; border-color: #faf9f7;
    }
    .pe-toolbar .pe-save:hover { background: #e8e6e2; }

    /* Card edit overlay */
    .phil-card { position: relative; }

    .pe-card-controls {
      position: absolute; top: 0; left: 0; right: 0;
      display: flex; gap: 4px; padding: 8px;
      z-index: 10; flex-wrap: wrap;
      opacity: 0; transition: opacity 0.2s;
    }
    .phil-card:hover .pe-card-controls { opacity: 1; }

    .pe-ctrl-btn {
      font-family: 'Noto Serif JP', serif; font-size: 0.6rem;
      padding: 0.35em 0.7em; border: none; cursor: pointer;
      border-radius: 3px; transition: all 0.15s;
      white-space: nowrap;
    }
    .pe-ctrl-edit { background: rgba(61,47,40,0.85); color: #faf9f7; }
    .pe-ctrl-up, .pe-ctrl-down { background: rgba(61,47,40,0.7); color: #faf9f7; }
    .pe-ctrl-status { background: rgba(107,93,84,0.85); color: #faf9f7; }
    .pe-ctrl-delete { background: rgba(139,58,58,0.9); color: #fff; }
    .pe-ctrl-open { background: rgba(30,100,60,0.85); color: #fff; }
    .pe-ctrl-btn:hover { opacity: 0.8; }

    /* Status badges */
    .pe-status-badge {
      position: absolute; top: 8px; right: 8px; z-index: 10;
      font-family: 'Noto Serif JP', serif; font-size: 0.6rem;
      padding: 0.3em 0.7em; border-radius: 3px;
      letter-spacing: 0.05em;
    }
    .pe-badge-draft { background: #d4a843; color: #fff; }
    .pe-badge-archive { background: #6b5d54; color: #fff; }

    /* Dimmed cards */
    .phil-card[data-status="draft"],
    .phil-card[data-status="archive"] {
      opacity: 0.5;
    }
    body.edit-mode .phil-card[data-status="draft"]:hover,
    body.edit-mode .phil-card[data-status="archive"]:hover {
      opacity: 0.8;
    }

    /* Add card button */
    .pe-add-card {
      border: 2px dashed rgba(61,47,40,0.25);
      display: flex; align-items: center; justify-content: center;
      min-height: 200px; cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
      background: rgba(61,47,40,0.02);
    }
    .pe-add-card:hover {
      border-color: rgba(61,47,40,0.5);
      background: rgba(61,47,40,0.05);
    }
    .pe-add-card span {
      font-family: 'Shippori Mincho', serif; font-size: 0.85rem;
      color: #6b5d54; letter-spacing: 0.1em;
    }

    /* Edit modal */
    .pe-modal-overlay {
      position: fixed; inset: 0; z-index: 600;
      background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      padding: 1rem;
    }
    .pe-modal {
      background: #faf9f7; width: 100%; max-width: 520px;
      max-height: 90vh; overflow-y: auto;
      padding: 2rem 1.5rem; position: relative;
    }
    .pe-modal h3 {
      font-family: 'Shippori Mincho', serif; font-weight: 400;
      font-size: 1rem; letter-spacing: 0.1em; margin-bottom: 1.5rem;
      color: #3d2f28;
    }
    .pe-modal-close {
      position: absolute; top: 1rem; right: 1rem;
      background: none; border: none; font-size: 1.3rem;
      color: #6b5d54; cursor: pointer;
    }
    .pe-field { margin-bottom: 1.2rem; }
    .pe-field label {
      display: block; font-size: 0.65rem; font-weight: 400;
      color: #6b5d54; letter-spacing: 0.08em; text-transform: uppercase;
      margin-bottom: 0.4rem;
    }
    .pe-field input, .pe-field textarea {
      width: 100%; padding: 0.6em 0.7em;
      font-family: 'Noto Serif JP', serif; font-size: 0.85rem;
      color: #3d2f28; background: #fff; border: 1px solid #d5cfc9;
      outline: none; transition: border-color 0.2s;
    }
    .pe-field input:focus, .pe-field textarea:focus { border-color: #6b5d54; }
    .pe-field textarea { resize: vertical; min-height: 80px; }

    .pe-field-cover {
      width: 100%; aspect-ratio: 16/9; background: #eee;
      border: 2px dashed #d5cfc9; overflow: hidden;
      cursor: pointer; position: relative;
      display: flex; align-items: center; justify-content: center;
    }
    .pe-field-cover img {
      width: 100%; height: 100%; object-fit: cover;
    }
    .pe-field-cover-text {
      font-size: 0.75rem; color: #6b5d54;
    }
    .pe-field-cover:hover { border-color: #6b5d54; }

    .pe-modal-actions {
      display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1.5rem;
    }
    .pe-modal-btn {
      font-family: 'Noto Serif JP', serif; font-size: 0.75rem;
      padding: 0.6em 1.5em; cursor: pointer; letter-spacing: 0.06em;
      border: 1px solid #3d2f28; transition: all 0.2s;
      border-radius: 20px;
    }
    .pe-modal-cancel { background: transparent; color: #3d2f28; }
    .pe-modal-cancel:hover { background: rgba(61,47,40,0.05); }
    .pe-modal-apply { background: #3d2f28; color: #faf9f7; border-color: #3d2f28; }
    .pe-modal-apply:hover { background: #6b5d54; }

    /* Status selector */
    .pe-status-select {
      font-family: 'Noto Serif JP', serif; font-size: 0.8rem;
      padding: 0.5em 0.7em; border: 1px solid #d5cfc9;
      background: #fff; color: #3d2f28; outline: none;
    }
  `;
  document.head.appendChild(style);

  // --- Make data-editable elements editable ---
  document.querySelectorAll('[data-editable]').forEach(el => {
    el.contentEditable = 'true';
    el.spellcheck = false;
  });

  const postsSection = document.querySelector('.phil-posts');

  // --- Toolbar ---
  const toolbar = document.createElement('div');
  toolbar.className = 'pe-toolbar';
  toolbar.innerHTML = `
    <span>徒筆 編集モード</span>
    <button class="pe-exit" type="button">終了</button>
    <button class="pe-save" type="button">公開</button>
  `;
  document.body.appendChild(toolbar);

  toolbar.querySelector('.pe-exit').addEventListener('click', () => {
    if (confirm('編集モードを終了しますか？')) {
      sessionStorage.removeItem('conte-edit');
      window.location.reload();
    }
  });
  toolbar.querySelector('.pe-save').addEventListener('click', savePhilosophy);

  // --- Add controls to existing cards ---
  document.querySelectorAll('.phil-card').forEach(card => attachControls(card));

  // --- Add card button ---
  const addBtn = document.createElement('div');
  addBtn.className = 'pe-add-card';
  addBtn.innerHTML = '<span>＋ 記事を追加</span>';
  addBtn.addEventListener('click', () => openEditModal(null));
  postsSection.appendChild(addBtn);

  // ========================================
  // Attach edit controls to a card
  // ========================================
  function attachControls(card) {
    // Prevent navigation in edit mode on the entire card
    card.addEventListener('click', (e) => {
      e.preventDefault();
    });

    // Status badge
    updateBadge(card);

    // Control buttons
    const controls = document.createElement('div');
    controls.className = 'pe-card-controls';
    controls.innerHTML = `
      <button class="pe-ctrl-btn pe-ctrl-open" type="button">開く</button>
      <button class="pe-ctrl-btn pe-ctrl-edit" type="button">編集</button>
      <button class="pe-ctrl-btn pe-ctrl-up" type="button">↑</button>
      <button class="pe-ctrl-btn pe-ctrl-down" type="button">↓</button>
      <button class="pe-ctrl-btn pe-ctrl-status" type="button">状態</button>
      <button class="pe-ctrl-btn pe-ctrl-delete" type="button">削除</button>
    `;
    card.appendChild(controls);

    // Open blog post (navigate, keeping edit mode via sessionStorage)
    controls.querySelector('.pe-ctrl-open').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const href = card.getAttribute('href');
      if (href) {
        window.location.href = href;
      }
    });

    // Edit
    controls.querySelector('.pe-ctrl-edit').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openEditModal(card);
    });

    // Move up
    controls.querySelector('.pe-ctrl-up').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const prev = card.previousElementSibling;
      if (prev && prev.classList.contains('phil-card')) {
        postsSection.insertBefore(card, prev);
      }
    });

    // Move down
    controls.querySelector('.pe-ctrl-down').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const next = card.nextElementSibling;
      if (next && next.classList.contains('phil-card')) {
        postsSection.insertBefore(next, card);
      }
    });

    // Status
    controls.querySelector('.pe-ctrl-status').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openStatusModal(card);
    });

    // Delete
    controls.querySelector('.pe-ctrl-delete').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const title = card.querySelector('.phil-card-title')?.textContent || '';
      if (confirm(`「${title}」を削除しますか？`)) {
        card.remove();
      }
    });
  }

  // ========================================
  // Status badge
  // ========================================
  function updateBadge(card) {
    card.querySelectorAll('.pe-status-badge').forEach(b => b.remove());
    const status = card.dataset.status || 'public';
    if (status === 'draft') {
      const badge = document.createElement('span');
      badge.className = 'pe-status-badge pe-badge-draft';
      badge.textContent = '下書き';
      card.appendChild(badge);
    } else if (status === 'archive') {
      const badge = document.createElement('span');
      badge.className = 'pe-status-badge pe-badge-archive';
      badge.textContent = 'アーカイブ';
      card.appendChild(badge);
    }
  }

  // ========================================
  // Status modal
  // ========================================
  function openStatusModal(card) {
    const current = card.dataset.status || 'public';
    const overlay = document.createElement('div');
    overlay.className = 'pe-modal-overlay';
    overlay.innerHTML = `
      <div class="pe-modal">
        <button class="pe-modal-close" type="button">&times;</button>
        <h3>記事の状態を変更</h3>
        <div class="pe-field">
          <label>状態</label>
          <select class="pe-status-select" id="pe-status-val">
            <option value="public" ${current === 'public' ? 'selected' : ''}>公開</option>
            <option value="draft" ${current === 'draft' ? 'selected' : ''}>下書き（非公開）</option>
            <option value="archive" ${current === 'archive' ? 'selected' : ''}>アーカイブ（非公開）</option>
          </select>
        </div>
        <div class="pe-modal-actions">
          <button class="pe-modal-btn pe-modal-cancel" type="button">キャンセル</button>
          <button class="pe-modal-btn pe-modal-apply" type="button">適用</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.pe-modal-close').addEventListener('click', () => overlay.remove());
    overlay.querySelector('.pe-modal-cancel').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector('.pe-modal-apply').addEventListener('click', () => {
      card.dataset.status = overlay.querySelector('#pe-status-val').value;
      updateBadge(card);
      overlay.remove();
    });
  }

  // ========================================
  // Edit / Add modal
  // ========================================
  function openEditModal(card) {
    const isNew = !card;
    const title = card ? (card.querySelector('.phil-card-title')?.textContent || '') : '';
    const date = card ? (card.querySelector('.phil-card-date')?.textContent || '') : getTodayStr();
    const excerpt = card ? (card.querySelector('.phil-card-excerpt')?.textContent || '') : '';
    const imgSrc = card ? (card.querySelector('.phil-card-image img')?.src || '') : '';
    const href = card ? (card.getAttribute('href') || '') : '';

    let newImgSrc = '';

    const overlay = document.createElement('div');
    overlay.className = 'pe-modal-overlay';
    overlay.innerHTML = `
      <div class="pe-modal">
        <button class="pe-modal-close" type="button">&times;</button>
        <h3>${isNew ? '新しい記事を追加' : '記事を編集'}</h3>

        <div class="pe-field">
          <label>リンク先（blog/xxx.html）</label>
          <input type="text" id="pe-edit-href" value="${href}" placeholder="blog/003.html">
        </div>

        <div class="pe-field">
          <label>日付</label>
          <input type="text" id="pe-edit-date" value="${date}" placeholder="2026.02.18">
        </div>

        <div class="pe-field">
          <label>タイトル</label>
          <input type="text" id="pe-edit-title" value="${escapeHtml(title)}" placeholder="記事のタイトル">
        </div>

        <div class="pe-field">
          <label>カバー写真</label>
          <div class="pe-field-cover" id="pe-edit-cover">
            ${imgSrc ? `<img src="${imgSrc}" alt="">` : '<span class="pe-field-cover-text">クリックして選択</span>'}
          </div>
          <input type="file" id="pe-edit-cover-input" accept="image/*" style="display:none">
        </div>

        <div class="pe-field">
          <label>抜粋</label>
          <textarea id="pe-edit-excerpt" rows="3" placeholder="一覧に表示される短い説明文">${escapeHtml(excerpt)}</textarea>
        </div>

        ${isNew ? `
        <div class="pe-field">
          <label>状態</label>
          <select class="pe-status-select" id="pe-edit-status">
            <option value="public">公開</option>
            <option value="draft" selected>下書き</option>
            <option value="archive">アーカイブ</option>
          </select>
        </div>
        ` : ''}

        <div class="pe-modal-actions">
          <button class="pe-modal-btn pe-modal-cancel" type="button">キャンセル</button>
          <button class="pe-modal-btn pe-modal-apply" type="button">${isNew ? '追加' : '更新'}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Cover photo
    const coverEl = overlay.querySelector('#pe-edit-cover');
    const coverInput = overlay.querySelector('#pe-edit-cover-input');
    coverEl.addEventListener('click', () => coverInput.click());
    coverInput.addEventListener('change', () => {
      const file = coverInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        newImgSrc = e.target.result;
        coverEl.innerHTML = `<img src="${newImgSrc}" alt="">`;
      };
      reader.readAsDataURL(file);
    });

    // Close
    overlay.querySelector('.pe-modal-close').addEventListener('click', () => overlay.remove());
    overlay.querySelector('.pe-modal-cancel').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    // Apply
    overlay.querySelector('.pe-modal-apply').addEventListener('click', () => {
      const newTitle = overlay.querySelector('#pe-edit-title').value || '無題';
      const newDate = overlay.querySelector('#pe-edit-date').value;
      const newExcerpt = overlay.querySelector('#pe-edit-excerpt').value;
      const newHref = overlay.querySelector('#pe-edit-href').value;
      const finalImg = newImgSrc || imgSrc || 'images/concept/concept-1.jpg';

      if (isNew) {
        const status = overlay.querySelector('#pe-edit-status').value;
        const newCard = document.createElement('a');
        newCard.href = newHref;
        newCard.className = 'phil-card fade-in visible';
        newCard.dataset.status = status;
        newCard.innerHTML = `
          <div class="phil-card-image">
            <img src="${finalImg}" alt="${escapeHtml(newTitle)}" loading="lazy">
          </div>
          <div class="phil-card-body">
            <time class="phil-card-date">${escapeHtml(newDate)}</time>
            <h2 class="phil-card-title">${escapeHtml(newTitle)}</h2>
            <p class="phil-card-excerpt">${escapeHtml(newExcerpt)}</p>
          </div>
        `;
        postsSection.insertBefore(newCard, addBtn);
        attachControls(newCard);
      } else {
        card.setAttribute('href', newHref);
        card.querySelector('.phil-card-title').textContent = newTitle;
        card.querySelector('.phil-card-date').textContent = newDate;
        card.querySelector('.phil-card-excerpt').textContent = newExcerpt;
        const img = card.querySelector('.phil-card-image img');
        if (newImgSrc) img.src = newImgSrc;
        img.alt = newTitle;
      }

      overlay.remove();
    });
  }

  // ========================================
  // Save HTML
  // ========================================
  function savePhilosophy() {
    const clone = document.documentElement.cloneNode(true);

    // Remove edit UI
    clone.querySelector('.pe-toolbar')?.remove();
    clone.querySelectorAll('.pe-card-controls, .pe-status-badge, .pe-add-card').forEach(el => el.remove());
    clone.querySelectorAll('style').forEach(s => {
      if (s.textContent.includes('pe-toolbar')) s.remove();
    });
    clone.querySelectorAll('[contenteditable]').forEach(el => {
      el.removeAttribute('contenteditable');
      el.removeAttribute('spellcheck');
    });
    clone.querySelector('body').classList.remove('edit-mode');

    const html = '<!DOCTYPE html>\n' + clone.outerHTML;
    window._contePublish('philosophy.html', html);
  }

  // ========================================
  // Helpers
  // ========================================
  function getTodayStr() {
    const d = new Date();
    return d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0');
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

})();
