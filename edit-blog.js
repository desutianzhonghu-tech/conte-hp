/* ========================================
   conte.jpeg — Blog Post Edit Mode
   ======================================== */
(function () {
  if (sessionStorage.getItem('conte-edit') !== '1') return;

  document.body.classList.add('edit-mode');

  const style = document.createElement('style');
  style.textContent = `
    .be-toolbar {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 300;
      display: flex; align-items: center; gap: 0.8rem;
      padding: 0.7rem 1.2rem;
      background: #3d2f28; color: #faf9f7;
      font-family: 'Noto Serif JP', serif; font-size: 0.8rem;
    }
    .be-toolbar span { font-weight: 300; letter-spacing: 0.08em; opacity: 0.6; margin-right: auto; }
    .be-toolbar button {
      padding: 0.45em 1.2em; font-family: inherit; font-size: 0.75rem;
      letter-spacing: 0.06em; border: 1px solid rgba(250,249,247,0.3);
      background: transparent; color: #faf9f7; cursor: pointer; transition: background 0.2s;
    }
    .be-toolbar button:hover { background: rgba(250,249,247,0.08); }
    .be-toolbar .be-save {
      background: #faf9f7; color: #3d2f28; border-color: #faf9f7;
    }
    .be-toolbar .be-save:hover { background: #e8e6e2; }

    /* Editable highlights */
    body.edit-mode .blog-title,
    body.edit-mode .blog-date,
    body.edit-mode .blog-body {
      outline: 2px dashed rgba(107,93,84,0.3);
      outline-offset: 4px;
      cursor: text;
    }
    body.edit-mode .blog-title:focus,
    body.edit-mode .blog-date:focus,
    body.edit-mode .blog-body:focus {
      outline-color: #3d2f28;
      outline-style: solid;
    }

    /* Cover photo edit */
    .be-cover-wrap { position: relative; }
    .be-cover-btn {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      font-family: 'Noto Serif JP', serif; font-size: 0.75rem;
      padding: 0.6em 1.5em; background: rgba(61,47,40,0.85); color: #faf9f7;
      border: 1px solid rgba(250,249,247,0.2); cursor: pointer;
      opacity: 0; transition: opacity 0.3s; border-radius: 20px;
    }
    .be-cover-wrap:hover .be-cover-btn { opacity: 1; }

    /* Add image button in body */
    .be-add-img {
      display: block; width: 100%; margin: 1rem 0; padding: 1.5rem;
      border: 2px dashed rgba(61,47,40,0.2); background: rgba(61,47,40,0.02);
      text-align: center; cursor: pointer; transition: border-color 0.2s;
      font-family: 'Noto Serif JP', serif; font-size: 0.75rem; color: #6b5d54;
    }
    .be-add-img:hover { border-color: rgba(61,47,40,0.4); }

    /* Body image edit */
    body.edit-mode .blog-body img { position: relative; cursor: pointer; }
    .be-img-overlay {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      background: rgba(0,0,0,0.3); opacity: 0; transition: opacity 0.2s;
    }
    .be-img-wrap:hover .be-img-overlay { opacity: 1; }
    .be-img-wrap { position: relative; display: block; margin: 2rem 0; }
    .be-img-action {
      font-family: 'Noto Serif JP', serif; font-size: 0.65rem;
      padding: 0.4em 0.8em; border: none; cursor: pointer;
      border-radius: 3px; transition: opacity 0.15s;
    }
    .be-img-replace { background: rgba(61,47,40,0.85); color: #faf9f7; }
    .be-img-delete { background: rgba(139,58,58,0.9); color: #fff; }

    /* Formatting toolbar */
    .be-format-bar {
      position: sticky; top: 0; z-index: 50;
      display: none; background: #fff; border-bottom: 1px solid #d5cfc9;
      padding: 0.4rem 1rem; gap: 2px;
    }
    body.edit-mode .be-format-bar { display: flex; }
    .be-fmt-btn {
      padding: 0.35em 0.65em; font-size: 0.72rem;
      background: transparent; border: none; color: #6b5d54;
      cursor: pointer; border-radius: 3px; transition: background 0.15s;
      font-family: 'Noto Serif JP', serif;
    }
    .be-fmt-btn:hover { background: rgba(61,47,40,0.06); color: #3d2f28; }
  `;
  document.head.appendChild(style);

  const article = document.querySelector('.blog-article');
  const titleEl = article.querySelector('.blog-title');
  const dateEl = article.querySelector('.blog-date');
  const bodyEl = article.querySelector('.blog-body');
  const coverDiv = article.querySelector('.blog-cover');

  // --- Make title & date editable ---
  titleEl.contentEditable = 'true';
  titleEl.spellcheck = false;
  dateEl.contentEditable = 'true';
  dateEl.spellcheck = false;

  // --- Make body editable ---
  bodyEl.contentEditable = 'true';
  bodyEl.spellcheck = false;

  // --- Formatting toolbar for body ---
  const formatBar = document.createElement('div');
  formatBar.className = 'be-format-bar';
  formatBar.innerHTML = `
    <button class="be-fmt-btn" type="button" data-cmd="bold"><b>太字</b></button>
    <button class="be-fmt-btn" type="button" data-cmd="italic"><i>斜体</i></button>
    <button class="be-fmt-btn" type="button" data-cmd="formatBlock" data-val="blockquote">引用</button>
    <button class="be-fmt-btn" type="button" data-cmd="formatBlock" data-val="p">段落</button>
    <button class="be-fmt-btn" type="button" data-cmd="insertImage">＋ 画像</button>
  `;
  bodyEl.parentElement.insertBefore(formatBar, bodyEl);

  formatBar.querySelectorAll('.be-fmt-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const cmd = btn.dataset.cmd;
      const val = btn.dataset.val || null;
      if (cmd === 'insertImage') {
        insertImageFromFile();
      } else {
        document.execCommand(cmd, false, val);
      }
      bodyEl.focus();
    });
  });

  function insertImageFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        document.execCommand('insertHTML', false, `<img src="${ev.target.result}" alt="" style="width:100%;margin:1rem 0">`);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  // --- Cover photo edit ---
  if (coverDiv) {
    const img = coverDiv.querySelector('img');
    coverDiv.classList.add('be-cover-wrap');

    const coverBtn = document.createElement('button');
    coverBtn.className = 'be-cover-btn';
    coverBtn.type = 'button';
    coverBtn.textContent = '写真を変更';
    coverDiv.appendChild(coverBtn);

    const coverInput = document.createElement('input');
    coverInput.type = 'file';
    coverInput.accept = 'image/*';
    coverInput.style.display = 'none';
    coverDiv.appendChild(coverInput);

    coverBtn.addEventListener('click', () => coverInput.click());
    coverInput.addEventListener('change', () => {
      const file = coverInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => { img.src = ev.target.result; };
      reader.readAsDataURL(file);
    });
  }

  // --- Toolbar ---
  const toolbar = document.createElement('div');
  toolbar.className = 'be-toolbar';
  toolbar.innerHTML = `
    <span>記事 編集モード</span>
    <button class="be-exit" type="button">終了</button>
    <button class="be-save" type="button">公開</button>
  `;
  document.body.appendChild(toolbar);

  toolbar.querySelector('.be-exit').addEventListener('click', () => {
    if (confirm('編集モードを終了しますか？')) {
      sessionStorage.removeItem('conte-edit');
      window.location.reload();
    }
  });

  toolbar.querySelector('.be-save').addEventListener('click', saveBlog);

  // --- Save ---
  function saveBlog() {
    const clone = document.documentElement.cloneNode(true);

    // Remove edit UI
    clone.querySelector('.be-toolbar')?.remove();
    clone.querySelector('.be-format-bar')?.remove();
    clone.querySelectorAll('.be-cover-btn, .be-cover-wrap input[type="file"]').forEach(el => el.remove());
    clone.querySelectorAll('style').forEach(s => {
      if (s.textContent.includes('be-toolbar')) s.remove();
    });

    // Remove contenteditable
    clone.querySelectorAll('[contenteditable]').forEach(el => {
      el.removeAttribute('contenteditable');
      el.removeAttribute('spellcheck');
    });

    // Remove edit-mode class
    clone.querySelector('body').classList.remove('edit-mode');

    // Clean be-cover-wrap class
    const cw = clone.querySelector('.be-cover-wrap');
    if (cw) cw.classList.remove('be-cover-wrap');

    const html = '<!DOCTYPE html>\n' + clone.outerHTML;
    const path = window.location.pathname;
    const filename = 'blog/' + (path.substring(path.lastIndexOf('/') + 1) || 'post.html');
    window._contePublish(filename, html);
  }

})();
