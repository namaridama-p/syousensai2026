/* =========================================================
   data/events.json を読み込んで「企画・タイムテーブル」を表示する
   - 日にちと種類で絞り込みできます。
   - 開催中の時間帯の企画には「いま開催中」が付きます。
   書き方は data/TEMPLATE.md を見てください。
   ========================================================= */
(() => {
  const listEl = document.getElementById('event-list');
  if (!listEl) return;
  const dayEl = document.getElementById('day-filters');
  const catEl = document.getElementById('event-filters');
  const FEST = window.SHOSENSAI;

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null && text !== '') e.textContent = text;
    return e;
  };
  const hm = t => String(t).replace(/^0/, '');

  let events = [];
  let currentDay = 'all';
  let currentCat = 'すべて';

  // "day" は 1 / 2 / "both"（両日）/ ""（未定）
  const dayNos = ev => {
    if (ev.day === 'both' || ev.day === '両日') return FEST.days.map(d => d.day);
    const n = Number(ev.day);
    return FEST.days.some(d => d.day === n) ? [n] : [];
  };
  const isNow = (ev, d) => {
    if (!d || !ev.start || !ev.end) return false;
    const now = Date.now();
    return now >= FEST.toTime(d.date, ev.start) && now < FEST.toTime(d.date, ev.end);
  };
  const byTime = (a, b) => String(a.start || '99:99').padStart(5, '0').localeCompare(String(b.start || '99:99').padStart(5, '0'));

  const renderItem = (ev, d) => {
    const now = isNow(ev, d);
    const li = el('li', now ? 'tt-item is-now' : 'tt-item');
    const time = ev.start
      ? el('p', 'tt-time', ev.end ? `${hm(ev.start)}–${hm(ev.end)}` : `${hm(ev.start)}〜`)
      : el('p', 'tt-time tbd', '時間は決まり次第お知らせします');
    const body = el('div', 'tt-body');
    const meta = el('p', 'tt-meta');
    if (now) meta.append(el('span', 'now-badge', 'いま開催中'));
    if (ev.category) meta.append(el('span', 'tag', ev.category));
    if (ev.place) meta.append(el('span', '', ev.place));
    if (meta.childElementCount) body.append(meta);
    const title = el('h4', 'tt-title');
    if (ev.link) {
      const a = el('a', '', ev.title);
      a.href = ev.link;
      title.append(a);
    } else {
      title.textContent = ev.title || '';
    }
    body.append(title);
    if (ev.organization) body.append(el('p', '', ev.organization));
    if (ev.summary) body.append(el('p', '', ev.summary));
    if (ev.note) body.append(el('p', 'tt-note', ev.note));
    li.append(time, body);
    return li;
  };

  const renderList = (items, d) => {
    const ol = el('ol', 'tt-list');
    ol.append(...items.map(ev => renderItem(ev, d)));
    return ol;
  };

  function render() {
    const matchCat = ev => currentCat === 'すべて' || ev.category === currentCat;
    const blocks = [];
    FEST.days.forEach(d => {
      if (currentDay !== 'all' && currentDay !== d.day) return;
      const items = events.filter(ev => matchCat(ev) && dayNos(ev).includes(d.day)).sort(byTime);
      const section = el('section', 'tt-day');
      const h = el('h3', 'tt-day-title', d.label);
      h.append(el('small', '', `公開 ${hm(d.open)}〜${hm(d.close)}`));
      section.append(h, items.length ? renderList(items, d) : el('p', 'empty-box', 'この日の企画は、決まり次第掲載します。'));
      blocks.push(section);
    });
    // 日時がまだ決まっていない企画
    const undecided = events.filter(ev => matchCat(ev) && !dayNos(ev).length).sort(byTime);
    if (undecided.length) {
      const section = el('section', 'tt-day');
      section.append(el('h3', 'tt-day-title', '日時は決まり次第お知らせします'), renderList(undecided, null));
      blocks.push(section);
    }
    listEl.replaceChildren(...blocks);
  }

  const makeFilters = (box, label, options, current, onPick) => {
    if (!box) return;
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', label);
    box.replaceChildren(...options.map(opt => {
      const b = el('button', 'filter', opt.text);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(opt.value === current));
      b.addEventListener('click', () => {
        box.querySelectorAll('.filter').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        onPick(opt.value);
        render();
      });
      return b;
    }));
  };

  fetch('data/events.json')
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(data => {
      events = Array.isArray(data) ? data : [];
      // 開催日に開いたときは、その日の企画を最初に表示する
      const today = FEST.todayNo();
      if (today) currentDay = today;
      makeFilters(dayEl, '日にちで絞り込む',
        [{ text: 'すべての日', value: 'all' }, ...FEST.days.map(d => ({ text: d.label, value: d.day }))],
        currentDay, v => { currentDay = v; });
      const cats = [...new Set(events.map(ev => ev.category).filter(Boolean))];
      if (cats.length > 1) {
        makeFilters(catEl, '種類で絞り込む',
          ['すべて', ...cats].map(c => ({ text: c, value: c })),
          currentCat, v => { currentCat = v; });
      }
      render();
      // 開催日は 1 分ごとに「いま開催中」を更新する（一覧の中を操作している間は待つ）
      if (today) setInterval(() => { if (!listEl.contains(document.activeElement)) render(); }, 60000);
    })
    .catch(() => {
      listEl.replaceChildren(el('p', 'empty-box', '企画の情報を読み込めませんでした。（data/events.json の書き方を確認してください）'));
    });
})();
