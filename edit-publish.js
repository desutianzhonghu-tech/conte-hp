/* ========================================
   conte.jpeg — 公開ヘルパー
   編集モードから直接サーバーに保存＋Git公開
   ======================================== */

window._contePublish = async function (filename, html) {
  const SERVER = 'http://127.0.0.1:9999';

  // Check server availability
  try {
    const res = await fetch(SERVER + '/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, html })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || '保存に失敗しました');
    }

    if (data.git && data.git.status === 'published') {
      alert('公開完了！\n\nhttps://desutianzhonghu-tech.github.io/conte-hp/\n\n反映まで1〜2分かかります。');
    } else if (data.git && data.git.status === 'no_changes') {
      alert('保存しましたが、変更はありませんでした。');
    } else if (data.git && data.git.status === 'push_failed') {
      alert('保存しましたが、公開に失敗しました:\n' + (data.git.error || ''));
    } else {
      alert('保存しました。');
    }

    return true;

  } catch (e) {
    if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError') || e.message.includes('Load failed')) {
      // Server not running — fall back to download
      if (confirm('デプロイサーバーが起動していません。\nHTMLをダウンロードしますか？')) {
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        alert(filename + ' をダウンロードしました。\n「公開」アプリで反映してください。');
      }
    } else {
      alert('エラー: ' + e.message);
    }
    return false;
  }
};
