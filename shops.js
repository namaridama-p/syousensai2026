/* =========================================================
   data/shops.json を読み込んで、模擬店・出展のカードを表示する
   - shops.html … すべての出展（種類で絞り込みできる）
   - index.html … 部活動の出展から、ランダムに数件だけ
   書き方は data/TEMPLATE.md を見てください。
   ========================================================= */
(() => {
  const listEl = document.getElementById('shop-list');
  const filtersEl = document.getElementById('shop-filters');
  const countEl = document.getElementById('shop-count');
  const clubEl = document.getElementById('club-list');
  const CLUB_PICK_COUNT = 3; // トップページに表示する部活動の数
  if (!listEl && !clubEl) return;

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null && text !== '') e.textContent = text;
    return e;
  };

  function renderShop(s) {
    const card = el('article', 'card shop');
    card.dataset.category = s.category || '';
    card.dataset.club = s.club ? '1' : '';
    if (s.image) {
      const img = el('img', 'shop-img');
      img.src = s.image;
      img.alt = s.name || '';
      img.loading = 'lazy';
      img.decoding = 'async';
      card.append(img);
    }
    const body = el('div', 'shop-body');
    const tags = el('p', 'shop-tags');
    if (s.category) tags.append(el('span', 'tag', s.category));
    if (s.club) tags.append(el('span', 'tag green', '部活動'));
    if (tags.childElementCount) body.append(tags);
    body.append(el('h3', '', s.name));
    const meta = [s.organization, s.place].filter(Boolean).join(' ／ ');
    if (meta) body.append(el('p', 'meta', meta));
    if (s.summary) body.append(el('p', 'summary', s.summary));
    if (Array.isArray(s.menu) && s.menu.length) {
      const ul = el('ul', 'menu');
      s.menu.forEach(m => {
        const li = el('li', m.soldOut ? 'sold-out' : '');
        const name = el('span', 'item-name', m.name + (m.note ? `（${m.note}）` : ''));
        if (m.soldOut) name.append(el('em', 'sold-badge', '売り切れ'));
        li.append(name, el('b', '', m.price != null && m.price !== '' ? `${Number(m.price).toLocaleString('ja-JP')}円` : ''));
        ul.append(li);
      });
      body.append(ul);
    }
    if (s.allergens) body.append(el('p', 'allergen', `アレルギー：${s.allergens}`));
    if (s.comment) body.append(el('p', 'comment', s.comment));
    card.append(body);
    return card;
  }

  const showCount = () => {
    if (!countEl || !listEl) return;
    const n = listEl.querySelectorAll('.shop:not([hidden])').length;
    countEl.textContent = `${n}件の出展を表示しています。`;
  };

  function setupFilters(shops) {
    if (!filtersEl || !listEl) return;
    const cats = [...new Set(shops.map(s => s.category).filter(Boolean))];
    const options = ['すべて', ...cats, ...(shops.some(s => s.club) ? ['部活動'] : [])];
    if (options.length < 3) return; // 絞り込む意味がないときは出さない
    filtersEl.setAttribute('role', 'group');
    filtersEl.setAttribute('aria-label', '出展の種類で絞り込む');
    options.forEach((opt, i) => {
      const b = el('button', 'filter', opt);
      b.type = 'button';
      b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
      b.addEventListener('click', () => {
        filtersEl.querySelectorAll('.filter').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        listEl.querySelectorAll('.shop').forEach(card => {
          const match = opt === 'すべて'
            || (opt === '部活動' ? card.dataset.club === '1' : card.dataset.category === opt);
          card.hidden = !match;
        });
        showCount();
      });
      filtersEl.append(b);
    });
  }

  const message = text => el('p', 'cards-empty empty-box', text);

  fetch('data/shops.json')
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(shops => {
      if (listEl) {
        listEl.replaceChildren(...(shops.length ? shops.map(renderShop) : [message('出展情報は準備中です。')]));
        setupFilters(shops);
        if (shops.length) showCount();
      }
      if (clubEl) {
        const clubs = shops.filter(s => s.club);
        // ランダムに CLUB_PICK_COUNT 件だけ表示（Fisher-Yates シャッフル）
        for (let i = clubs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [clubs[i], clubs[j]] = [clubs[j], clubs[i]];
        }
        clubEl.replaceChildren(...(clubs.length
          ? clubs.slice(0, CLUB_PICK_COUNT).map(renderShop)
          : [message('部活動の出展情報は準備中です。')]));
      }
    })
    .catch(() => {
      const text = '出展情報を読み込めませんでした。（data/shops.json の書き方を確認してください）';
      if (listEl) listEl.replaceChildren(message(text));
      if (clubEl) clubEl.replaceChildren(message(text));
    });
})();
