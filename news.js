/* =========================================================
   data/news.json を読み込んで「お知らせ」を表示する
   <ul data-news="3"> のように書くと、新しい順に 3 件だけ表示します（数字なしは全件）。
   書き方は data/TEMPLATE.md を見てください。
   ========================================================= */
(() => {
  const lists = document.querySelectorAll('[data-news]');
  if (!lists.length) return;

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null && text !== '') e.textContent = text;
    return e;
  };
  const emptyItem = text => el('li', 'empty', text);

  const renderItem = item => {
    const li = el('li', 'news-item');
    const time = el('time', '', (item.date || '').replace(/-/g, '.'));
    if (item.date) time.dateTime = item.date;
    const body = el('div');
    const title = el('p', 'news-title');
    if (item.url) {
      const a = el('a', '', item.title);
      a.href = item.url;
      if (/^https?:/.test(item.url)) { a.target = '_blank'; a.rel = 'noopener'; }
      title.append(a);
    } else {
      title.textContent = item.title || '';
    }
    body.append(title);
    if (item.text) body.append(el('p', 'news-text', item.text));
    li.append(time, body);
    return li;
  };

  fetch('data/news.json')
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(items => {
      items.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
      lists.forEach(list => {
        const limit = Number(list.dataset.news) || items.length;
        const shown = items.slice(0, limit);
        list.replaceChildren(...(shown.length ? shown.map(renderItem) : [emptyItem('お知らせはまだありません。')]));
      });
    })
    .catch(() => {
      lists.forEach(list => list.replaceChildren(emptyItem('お知らせを読み込めませんでした。（data/news.json の書き方を確認してください）')));
    });
})();
