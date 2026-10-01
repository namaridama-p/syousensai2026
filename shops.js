// data/shops.json を読み込んで模擬店カードを描画する
const listEl = document.getElementById('shop-list');
const filtersEl = document.getElementById('filters');

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

function renderShop(s) {
  const card = el('article', 'card shop');
  card.dataset.category = s.category || '';
  if (s.image) {
    const img = el('img', 'shop-img');
    img.src = s.image;
    img.alt = s.name;
    img.loading = 'lazy';
    card.append(img);
  }
  if (s.category) card.append(el('span', 'tag', s.category));
  card.append(el('h3', '', s.name));
  const meta = [s.organization, s.place].filter(Boolean).join(' / ');
  if (meta) card.append(el('p', 'meta', meta));
  if (s.summary) card.append(el('p', '', s.summary));
  if (s.menu && s.menu.length) {
    const ul = el('ul', 'menu');
    s.menu.forEach(m => {
      const li = el('li', m.soldOut ? 'sold-out' : '');
      const name = el('span', 'item-name', m.name + (m.note ? `（${m.note}）` : ''));
      if (m.soldOut) name.append(el('em', 'sold-badge', '売り切れ'));
      li.append(name);
      li.append(el('b', '', m.price != null ? `${m.price}円` : ''));
      ul.append(li);
    });
    card.append(ul);
  }
  if (s.allergens) card.append(el('p', 'note', `アレルギー: ${s.allergens}`));
  if (s.comment) card.append(el('p', 'comment', s.comment));
  return card;
}

function setupFilters(shops) {
  if (!filtersEl) return;
  const cats = [...new Set(shops.map(s => s.category).filter(Boolean))];
  if (cats.length < 2) return;
  ['すべて', ...cats].forEach((c, i) => {
    const b = el('button', 'filter' + (i === 0 ? ' active' : ''), c);
    b.addEventListener('click', () => {
      filtersEl.querySelectorAll('.filter').forEach(x => x.classList.toggle('active', x === b));
      listEl.querySelectorAll('.shop').forEach(card => {
        card.hidden = i !== 0 && card.dataset.category !== c;
      });
    });
    filtersEl.append(b);
  });
}

const clubEl = document.getElementById('club-list');
const CLUB_PICK_COUNT = 3; // トップページに表示する部活動の数

fetch('data/shops.json')
  .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(shops => {
    if (listEl) {
      listEl.replaceChildren(...shops.map(renderShop));
      setupFilters(shops);
    }
    if (clubEl) {
      const clubs = shops.filter(s => s.club);
      // ランダムに CLUB_PICK_COUNT 件だけ表示(Fisher-Yates シャッフル)
      for (let i = clubs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [clubs[i], clubs[j]] = [clubs[j], clubs[i]];
      }
      clubEl.replaceChildren(...(clubs.length
        ? clubs.slice(0, CLUB_PICK_COUNT).map(renderShop)
        : [el('p', '', '部活動の出展情報は準備中です。')]));
    }
  })
  .catch(() => {
    const msg = el('p', '', '出展情報を読み込めませんでした。（data/shops.json の書き方を確認してください）');
    if (listEl) listEl.replaceChildren(msg);
    if (clubEl) clubEl.replaceChildren(msg.cloneNode(true));
  });
