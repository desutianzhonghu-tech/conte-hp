/* ========================================
   conte.jpeg — Gallery Edit Mode
   ======================================== */
(function () {
  if (sessionStorage.getItem('conte-edit') !== '1') return;

  document.body.classList.add('edit-mode');

  // --- Make data-editable elements editable ---
  document.querySelectorAll('[data-editable]').forEach(el => {
    el.contentEditable = 'true';
    el.spellcheck = false;
  });

  // --- Style injection ---
  const style = document.createElement('style');
  style.textContent = `
    .gallery-edit-toolbar {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 300;
      display: flex; align-items: center; gap: 0.8rem;
      padding: 0.7rem 1.2rem;
      background: #3d2f28; color: #faf9f7;
      font-family: 'Noto Serif JP', serif; font-size: 0.8rem;
    }
    .gallery-edit-toolbar span {
      font-weight: 300; letter-spacing: 0.08em; opacity: 0.6; margin-right: auto;
    }
    .gallery-edit-toolbar button {
      padding: 0.45em 1.2em; font-family: inherit; font-size: 0.75rem;
      letter-spacing: 0.06em; border: 1px solid rgba(250,249,247,0.3);
      background: transparent; color: #faf9f7; cursor: pointer;
      transition: background 0.2s;
    }
    .gallery-edit-toolbar button:hover { background: rgba(250,249,247,0.08); }
    .gallery-edit-toolbar .ge-save {
      background: #faf9f7; color: #3d2f28; border-color: #faf9f7;
    }
    .gallery-edit-toolbar .ge-save:hover { background: #e8e6e2; }

    .gallery-item.edit-mode-item { position: relative; }
    .gallery-item .ge-delete-btn {
      position: absolute; top: 6px; right: 6px; z-index: 10;
      width: 28px; height: 28px; border-radius: 50%;
      background: rgba(139,58,58,0.9); color: #fff;
      border: none; cursor: pointer; font-size: 1rem; line-height: 1;
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.2s;
    }
    .gallery-item:hover .ge-delete-btn { opacity: 1; }
    .gallery-item .ge-replace-btn {
      position: absolute; bottom: 6px; right: 6px; z-index: 10;
      padding: 0.3em 0.6em;
      background: rgba(61,47,40,0.85); color: #faf9f7;
      border: none; cursor: pointer; font-size: 0.65rem;
      font-family: 'Noto Serif JP', serif;
      opacity: 0; transition: opacity 0.2s;
    }
    .gallery-item:hover .ge-replace-btn { opacity: 1; }

    .ge-add-area {
      break-inside: avoid; margin-bottom: 0.8rem;
      border: 2px dashed rgba(61,47,40,0.3);
      display: flex; align-items: center; justify-content: center;
      min-height: 150px; cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
      background: rgba(61,47,40,0.03);
    }
    .ge-add-area:hover {
      border-color: rgba(61,47,40,0.6);
      background: rgba(61,47,40,0.06);
    }
    .ge-add-area span {
      font-family: 'Noto Serif JP', serif; font-size: 0.8rem;
      color: #6b5d54;
    }
  `;
  document.head.appendChild(style);

  const masonry = document.querySelector('.gallery-masonry');

  // --- Toolbar ---
  const toolbar = document.createElement('div');
  toolbar.className = 'gallery-edit-toolbar';
  toolbar.innerHTML = `
    <span>Gallery 編集モード</span>
    <button class="ge-exit" type="button">終了</button>
    <button class="ge-save" type="button">公開</button>
  `;
  document.body.appendChild(toolbar);

  toolbar.querySelector('.ge-exit').addEventListener('click', () => {
    if (confirm('編集モードを終了しますか？')) {
      sessionStorage.removeItem('conte-edit');
      window.location.reload();
    }
  });

  toolbar.querySelector('.ge-save').addEventListener('click', saveGallery);

  // --- Add edit buttons to existing items ---
  document.querySelectorAll('.gallery-item').forEach(item => attachEditButtons(item));

  // --- Add photo area ---
  const addArea = document.createElement('div');
  addArea.className = 'ge-add-area';
  addArea.innerHTML = '<span>＋ 写真を追加</span>';
  masonry.appendChild(addArea);

  const addInput = document.createElement('input');
  addInput.type = 'file';
  addInput.accept = 'image/*';
  addInput.multiple = true;
  addInput.style.display = 'none';
  addArea.appendChild(addInput);

  addArea.addEventListener('click', () => addInput.click());
  addInput.addEventListener('change', () => {
    const files = Array.from(addInput.files);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newItem = document.createElement('div');
        newItem.className = 'gallery-item fade-in visible';
        newItem.innerHTML = `<img src="${ev.target.result}" alt="conte.jpeg" loading="lazy">`;
        masonry.insertBefore(newItem, addArea);
        attachEditButtons(newItem);
        if (window._galleryRebindLightbox) window._galleryRebindLightbox();
      };
      reader.readAsDataURL(file);
    });

    addInput.value = '';
  });

  // --- Attach edit buttons to a gallery item ---
  function attachEditButtons(item) {
    item.classList.add('edit-mode-item');
    item.style.position = 'relative';

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'ge-delete-btn';
    delBtn.type = 'button';
    delBtn.textContent = '×';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('この写真を削除しますか？')) {
        item.remove();
      }
    });
    item.appendChild(delBtn);

    // Replace button
    const repBtn = document.createElement('button');
    repBtn.className = 'ge-replace-btn';
    repBtn.type = 'button';
    repBtn.textContent = '写真を変更';
    const repInput = document.createElement('input');
    repInput.type = 'file';
    repInput.accept = 'image/*';
    repInput.style.display = 'none';
    item.appendChild(repInput);

    repBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      repInput.click();
    });
    repInput.addEventListener('change', () => {
      const file = repInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        item.querySelector('img').src = ev.target.result;
      };
      reader.readAsDataURL(file);
      repInput.value = '';
    });
    item.appendChild(repBtn);
  }

  // --- Save gallery HTML ---
  function saveGallery() {
    const clone = document.documentElement.cloneNode(true);

    // Remove edit UI
    clone.querySelector('.gallery-edit-toolbar')?.remove();
    clone.querySelectorAll('.ge-delete-btn, .ge-replace-btn, .ge-add-area, input[type="file"]').forEach(el => el.remove());
    clone.querySelectorAll('style').forEach(s => {
      if (s.textContent.includes('gallery-edit-toolbar')) s.remove();
    });
    clone.querySelector('body').classList.remove('edit-mode');
    clone.querySelectorAll('[contenteditable]').forEach(el => {
      el.removeAttribute('contenteditable');
      el.removeAttribute('spellcheck');
    });

    // Clean up edit-mode-item class and inline styles
    clone.querySelectorAll('.edit-mode-item').forEach(el => {
      el.classList.remove('edit-mode-item');
      el.style.position = '';
      if (!el.getAttribute('style')) el.removeAttribute('style');
    });

    const html = '<!DOCTYPE html>\n' + clone.outerHTML;
    window._contePublish('gallery.html', html);
  }

})();
