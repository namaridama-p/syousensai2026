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
      const li = el('li');
      li.append(el('span', '', m.name + (m.note ? `（${m.note}）` : '')));
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

fetch('data/shops.json')
  .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(shops => {
    listEl.replaceChildren(...shops.map(renderShop));
    setupFilters(shops);
  })
  .catch(() => {
    listEl.replaceChildren(el('p', '', '模擬店情報を読み込めませんでした。（data/shops.json の書き方を確認してください）'));
  });
