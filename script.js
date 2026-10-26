/* =========================================================
   第56回 商船祭 公式サイト — script.js（全ページ共通）
   ========================================================= */
document.documentElement.classList.add('js');

/* ===== 開催日時 =====
   ここを書き換えると、カウントダウン・ヘッダーの表示・企画の「開催中」表示がまとめて変わります。 */
window.SHOSENSAI = {
  days: [
    { day: 1, date: '2026-11-07', label: '11/7（土）', open: '09:00', close: '17:00' },
    { day: 2, date: '2026-11-08', label: '11/8（日）', open: '09:00', close: '16:00' },
  ],
};

(() => {
  const FEST = window.SHOSENSAI;
  const DAY_MS = 86400000;
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  FEST.reducedMotion = reducedMotion;

  // 「2026-11-07」と「09:00」から日本時間の時刻を作る
  FEST.toTime = (date, hm) => Date.parse(`${date}T${hm.length === 4 ? '0' + hm : hm}:00+09:00`);
  FEST.days.forEach(d => { d.start = FEST.toTime(d.date, d.open); d.end = FEST.toTime(d.date, d.close); });
  const first = FEST.days[0];
  const last = FEST.days[FEST.days.length - 1];

  // いまの状態: before（開催前）/ open（公開中）/ between（日と日の間）/ after（終了）
  FEST.state = (now = Date.now()) => {
    if (now < first.start) return { phase: 'before' };
    const open = FEST.days.find(d => now >= d.start && now < d.end);
    if (open) return { phase: 'open', day: open };
    const next = FEST.days.find(d => now < d.start);
    if (next) return { phase: 'between', day: next };
    return { phase: 'after' };
  };
  // 日本時間の日付（例: "2026-10-26"）
  const jstDate = t => new Date(t + 9 * 3600000).toISOString().slice(0, 10);
  // 今日が何日目か（開催日でなければ 0）
  FEST.todayNo = (now = Date.now()) => {
    const d = FEST.days.find(x => x.date === jstDate(now));
    return d ? d.day : 0;
  };
  const hm = t => t.replace(/^0/, '');

  /* ---------- スマホ用メニュー ---------- */
  const btn = document.querySelector('.menu-btn');
  const nav = document.querySelector('.nav');
  if (btn && nav) {
    const blockers = [document.querySelector('main'), document.querySelector('.site-footer'), document.querySelector('.tabbar')];
    const setMenu = open => {
      nav.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
      // 開いている間は、背後のページにフォーカスが移らないようにする
      blockers.forEach(el => { if (el) el.inert = open; });
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    };
    btn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
    nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); btn.focus(); }
    });
    // PC 幅に広げたら閉じる（スクロールの固定が残らないように）
    const wide = window.matchMedia('(min-width: 961px)');
    if (wide.addEventListener) wide.addEventListener('change', e => { if (e.matches) setMenu(false); });
  }

  /* ---------- ヘッダーの開催状況とカウントダウン ---------- */
  const statusEls = document.querySelectorAll('[data-festival-status]');
  const cd = document.getElementById('countdown');
  const cdParts = cd ? ['d', 'h', 'm', 's'].map(u => cd.querySelector(`[data-cd="${u}"]`)) : [];
  const cdMessage = cd ? cd.querySelector('.countdown-message') : null;
  let timer = null;
  const tick = () => {
    const now = Date.now();
    const st = FEST.state(now);
    let status = '';
    let message = '';
    if (st.phase === 'before') {
      // カレンダーの日付で数える（10/26 から見た 11/7 は「あと12日」）
      const days = Math.round((Date.parse(first.date) - Date.parse(jstDate(now))) / DAY_MS);
      status = days <= 0 ? `本日 ${hm(first.open)} 開場` : `開催まで あと${days}日`;
    } else if (st.phase === 'open') {
      status = `開催中（〜${hm(st.day.close)}）`;
      message = `ただいま開催中です！ 本日は ${hm(st.day.close)} まで。`;
    } else if (st.phase === 'between') {
      status = `${st.day.label} ${hm(st.day.open)} 開場`;
      message = `本日の公開は終了しました。${st.day.label}は ${hm(st.day.open)} からです。`;
    } else {
      status = '';
      message = '第56回 商船祭は終了しました。ご来場ありがとうございました。';
    }
    statusEls.forEach(el => { if (el.textContent !== status) el.textContent = status; });

    if (cd) {
      cd.classList.toggle('is-message', Boolean(message));
      if (cdMessage && cdMessage.textContent !== message) cdMessage.textContent = message;
      if (st.phase === 'before') {
        const s = Math.floor((first.start - now) / 1000);
        const v = [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60];
        cdParts.forEach((el, i) => { if (el) el.textContent = i === 0 ? String(v[0]) : String(v[i]).padStart(2, '0'); });
        // 読み上げ用のラベルは、分が変わったときだけ更新する
        const label = `開催まで あと${v[0]}日${v[1]}時間${v[2]}分`;
        if (cd.getAttribute('aria-label') !== label) cd.setAttribute('aria-label', label);
      } else {
        cd.setAttribute('aria-label', message);
      }
    }
    if (st.phase === 'after' && timer) { clearInterval(timer); timer = null; }
  };
  if (statusEls.length || cd) {
    tick();
    timer = setInterval(tick, 1000);
  }

  /* ---------- スクロールで表示 ---------- */
  const reveals = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || reducedMotion) {
    reveals.forEach(el => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(el => io.observe(el));
  }

  /* ---------- 国際信号旗（data-flags="K E T S U ..." を旗の列にする） ---------- */
  const SVGNS = 'http://www.w3.org/2000/svg';
  document.querySelectorAll('[data-flags]').forEach(el => {
    const flags = el.dataset.flags.trim().split(/\s+/).map((code, i) => {
      const svg = document.createElementNS(SVGNS, 'svg');
      svg.setAttribute('viewBox', '0 0 60 50');
      svg.setAttribute('class', 'flag');
      svg.setAttribute('focusable', 'false');
      svg.style.setProperty('--i', i);
      const use = document.createElementNS(SVGNS, 'use');
      use.setAttribute('href', `images/flags.svg#flag-${code}`);
      svg.append(use);
      return svg;
    });
    el.replaceChildren(...flags);
  });

  /* ---------- パズル（トップと各ページ見出しの背景） ----------
     ポスターと同じように、白いピースの欠けたところから海が見えます。
     トップでは、ピースが集まったあとに緑のピースがはまります。 */
  // ピースの辺の出っ張りの形（辺の長さを 1 としたときの制御点）
  const KNOB = [
    [0.37, 0],
    [0.41, 0, 0.43, 0.04, 0.40, 0.09],
    [0.35, 0.17, 0.39, 0.25, 0.50, 0.25],
    [0.61, 0.25, 0.65, 0.17, 0.60, 0.09],
    [0.57, 0.04, 0.59, 0, 0.63, 0],
  ];
  // 毎回同じ並びになるように、決まった数から乱数を作る
  const seeded = seed => () => {
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  // p0 から p1 までの辺。out は外向き、tab は 1（出っ張り）/ -1（へこみ）/ 0（まっすぐ）
  const makeEdge = (p0, p1, out, tab, shift, scale) => {
    if (!tab) return [{ p: p1 }];
    const dx = p1[0] - p0[0];
    const dy = p1[1] - p0[1];
    const len = Math.hypot(dx, dy);
    const at = (u, v) => {
      const uu = 0.5 + shift + (u - 0.5) * scale;
      const vv = v * scale * tab * len;
      return [p0[0] + dx * uu + out[0] * vv, p0[1] + dy * uu + out[1] * vv];
    };
    const segs = [{ p: at(KNOB[0][0], KNOB[0][1]) }];
    for (let i = 1; i < KNOB.length; i++) {
      const k = KNOB[i];
      segs.push({ c1: at(k[0], k[1]), c2: at(k[2], k[3]), p: at(k[4], k[5]) });
    }
    segs.push({ p: p1 });
    return segs;
  };
  const reverseEdge = (start, segs) => {
    const pts = [start, ...segs.map(s => s.p)];
    const out = [];
    for (let i = segs.length - 1; i >= 0; i--) {
      const s = segs[i];
      out.push(s.c1 ? { c1: s.c2, c2: s.c1, p: pts[i] } : { p: pts[i] });
    }
    return out;
  };
  const r1 = n => Math.round(n * 10) / 10;
  const toPath = (start, segs) => `M${r1(start[0])} ${r1(start[1])}` + segs.map(s => (s.c1
    ? `C${r1(s.c1[0])} ${r1(s.c1[1])} ${r1(s.c2[0])} ${r1(s.c2[1])} ${r1(s.p[0])} ${r1(s.p[1])}`
    : `L${r1(s.p[0])} ${r1(s.p[1])}`)).join('') + 'Z';

  const buildPuzzle = (svg, animate) => {
    const host = svg.parentElement;
    const W = host.clientWidth;
    const H = host.clientHeight;
    if (!W || !H) return;
    const isHero = svg.dataset.puzzle === 'hero';
    const cols = isHero ? (W >= 1200 ? 10 : W >= 760 ? 8 : 5) : (W >= 1200 ? 14 : W >= 760 ? 10 : 6);
    const s = W / cols;
    const rows = Math.ceil(H / s) + 1;
    const oy = (H - rows * s) / 2;
    const rand = seeded(Number(svg.dataset.seed || 56));

    // 辺の出っ張りの向きと、形の少しのゆらぎ
    const hEdges = [];
    const vEdges = [];
    for (let r = 0; r <= rows; r++) {
      hEdges[r] = [];
      for (let c = 0; c < cols; c++) {
        const y = oy + r * s;
        const tab = r === 0 || r === rows ? 0 : (rand() < 0.5 ? 1 : -1);
        hEdges[r][c] = makeEdge([c * s, y], [(c + 1) * s, y], [0, -1], tab, (rand() - 0.5) * 0.08, 0.9 + rand() * 0.18);
      }
    }
    for (let r = 0; r < rows; r++) {
      vEdges[r] = [];
      for (let c = 0; c <= cols; c++) {
        const x = c * s;
        const tab = c === 0 || c === cols ? 0 : (rand() < 0.5 ? 1 : -1);
        vEdges[r][c] = makeEdge([x, oy + r * s], [x, oy + (r + 1) * s], [1, 0], tab, (rand() - 0.5) * 0.08, 0.9 + rand() * 0.18);
      }
    }

    // 文字の後ろなど、ピースを残しておく場所
    const box = host.getBoundingClientRect();
    const pad = s * 0.28;
    const keeps = [...host.querySelectorAll('[data-puzzle-keep]')].map(el => {
      const r = el.getBoundingClientRect();
      return { l: r.left - box.left - pad, t: r.top - box.top - pad, r: r.right - box.left + pad, b: r.bottom - box.top + pad };
    });
    const isKept = (x0, y0) => keeps.some(k => x0 < k.r && x0 + s > k.l && y0 < k.b && y0 + s > k.t);

    // 欠けたピース（海が見える穴）を決める
    const holes = new Set();
    const density = isHero ? 0.3 : 0.34;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x0 = c * s;
        const y0 = oy + r * s;
        if (isKept(x0, y0)) continue;
        // 外側ほど穴を多めにして、周りから海がのぞくようにする
        const dx = Math.abs((x0 + s / 2) / W - 0.5);
        const dy = Math.abs((y0 + s / 2) / H - 0.5);
        if (rand() < density + Math.max(dx, dy) * 0.3) holes.add(r * cols + c);
      }
    }

    // 緑のピースがはまる場所（トップのみ）
    let greenCell = -1;
    if (isHero) {
      const tx = W * (W >= 760 ? 0.5 : 0.58);
      const ty = H * (W >= 760 ? 0.3 : 0.24);
      let best = Infinity;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x0 = c * s;
          const y0 = oy + r * s;
          if (y0 < 0 || y0 + s > H || isKept(x0, y0)) continue;
          const d = Math.hypot(x0 + s / 2 - tx, y0 + s / 2 - ty);
          if (d < best) { best = d; greenCell = r * cols + c; }
        }
      }
      if (greenCell >= 0) holes.add(greenCell);
    }

    const piecePath = (r, c) => {
      const x0 = c * s;
      const y0 = oy + r * s;
      const top = hEdges[r][c];
      const right = vEdges[r][c + 1];
      const bottom = reverseEdge([c * s, oy + (r + 1) * s], hEdges[r + 1][c]);
      const left = reverseEdge([x0, y0], vEdges[r][c]);
      return toPath([x0, y0], [...top, ...right, ...bottom, ...left]);
    };

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.classList.remove('is-built');
    const shades = ['#fdfcf8', '#f7f4ee', '#f1ede4', '#e8e3d7'];
    const pieces = [];
    const frag = document.createDocumentFragment();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (holes.has(r * cols + c)) continue;
        const p = document.createElementNS(SVGNS, 'path');
        p.setAttribute('d', piecePath(r, c));
        p.setAttribute('fill', shades[Math.floor(rand() * rand() * shades.length)]);
        frag.append(p);
        pieces.push({ el: p, r, c });
      }
    }
    let green = null;
    let ring = null;
    if (greenCell >= 0) {
      const r = Math.floor(greenCell / cols);
      const c = greenCell % cols;
      green = document.createElementNS(SVGNS, 'path');
      green.setAttribute('d', piecePath(r, c));
      green.setAttribute('class', 'pz-green');
      ring = document.createElementNS(SVGNS, 'circle');
      ring.setAttribute('cx', r1(c * s + s / 2));
      ring.setAttribute('cy', r1(oy + r * s + s / 2));
      ring.setAttribute('r', r1(s * 0.62));
      ring.setAttribute('class', 'pz-ring');
      frag.append(green, ring);
    }
    svg.replaceChildren(frag);

    if (!animate || reducedMotion || !svg.animate) {
      svg.classList.add('is-built');
      return;
    }
    // ピースが集まる → 最後に緑のピースがはまる
    const step = isHero ? 42 : 26;
    let lastDelay = 0;
    pieces.forEach(({ el, r, c }) => {
      const delay = (r + c) * step + rand() * 140;
      lastDelay = Math.max(lastDelay, delay);
      el.animate(
        [{ opacity: 0, transform: `translate(0px, ${-s * 0.18}px)` }, { opacity: 1, transform: 'translate(0px, 0px)' }],
        { duration: 520, delay, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }
      );
    });
    const done = lastDelay + 520;
    if (!green) {
      setTimeout(() => svg.classList.add('is-built'), done);
      return;
    }
    green.animate(
      [
        { opacity: 0, transform: `translate(${-W * 0.3}px, ${H * 0.45}px) rotate(-32deg) scale(1.15)` },
        { opacity: 1, transform: `translate(${-s * 0.5}px, ${s * 0.35}px) rotate(-8deg) scale(1.08)`, offset: 0.72 },
        { opacity: 1, transform: 'translate(0px, 0px) rotate(0deg) scale(1)' },
      ],
      { duration: 1150, delay: done, easing: 'cubic-bezier(.3,.85,.3,1)', fill: 'backwards' }
    ).finished.then(() => {
      svg.classList.add('is-built');
      if (ring) ring.animate([{ opacity: 0.9, transform: 'scale(.6)' }, { opacity: 0, transform: 'scale(1.6)' }], { duration: 700, easing: 'ease-out' });
    }).catch(() => svg.classList.add('is-built'));
  };

  const puzzles = document.querySelectorAll('svg.puzzle');
  if (puzzles.length) {
    // 文字の大きさが決まってから組み立てる（Web フォントの読み込み待ち。最大 1.2 秒）
    const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    const waitFonts = Promise.race([fontsReady, new Promise(resolve => setTimeout(resolve, 1200))]);
    waitFonts.then(() => {
      puzzles.forEach(svg => {
        buildPuzzle(svg, true);
        let lastW = svg.parentElement.clientWidth;
        let lastH = svg.parentElement.clientHeight;
        let pending = null;
        if ('ResizeObserver' in window) {
          new ResizeObserver(() => {
            const w = svg.parentElement.clientWidth;
            const h = svg.parentElement.clientHeight;
            // スマホのアドレスバーの出し入れ程度では作り直さない
            if (Math.abs(w - lastW) < 24 && Math.abs(h - lastH) < 120) return;
            lastW = w; lastH = h;
            clearTimeout(pending);
            pending = setTimeout(() => buildPuzzle(svg, false), 180);
          }).observe(svg.parentElement);
        }
      });
    });
  }
})();
