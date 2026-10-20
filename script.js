document.documentElement.classList.add('js');

(() => {
  // スマホ用メニュー
  const btn = document.querySelector('.menu-btn');
  const nav = document.querySelector('.nav');
  if (btn && nav) {
    const main = document.querySelector('main');
    const footer = document.querySelector('.site-footer');
    const setMenu = open => {
      nav.classList.toggle('open', open);
      if (document.body) document.body.classList.toggle('menu-open', open);
      // 開いている間は背後のページにフォーカスが移らないようにする
      if (main) main.inert = open;
      if (footer) footer.inert = open;
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    };
    setMenu(nav.classList.contains('open'));
    btn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
    nav.addEventListener('click', event => {
      const link = event.target && event.target.closest && event.target.closest('a');
      if (link && nav.contains(link)) setMenu(false);
    });
    // PC幅に広げたら閉じる(スクロールロックが残らないように)
    const wide = window.matchMedia && window.matchMedia('(min-width: 861px)');
    if (wide && wide.addEventListener) {
      wide.addEventListener('change', e => { if (e.matches) setMenu(false); });
    }
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('open')) {
        setMenu(false);
        btn.focus();
      }
    });
  }

  // カウントダウン
  const cd = document.getElementById('countdown');
  const target = cd ? Date.parse(cd.dataset.date) : NaN;
  if (cd && Number.isFinite(target)) {
    const parts = ['d', 'h', 'm', 's'].map(unit => document.getElementById('cd-' + unit));
    let timer = null;
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      const s = Math.floor(diff / 1000);
      const values = [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60];
      parts.forEach((part, i) => {
        if (part) part.textContent = i === 0 ? String(values[i]) : String(values[i]).padStart(2, '0');
      });
      // 読み上げ用のラベルは分が変わったときだけ更新する
      const label = `開催まで あと${values[0]}日${values[1]}時間${values[2]}分`;
      if (cd.getAttribute('aria-label') !== label) cd.setAttribute('aria-label', label);
      if (s === 0) {
        cd.classList.add('is-live');
        clearInterval(timer);
      }
      return s === 0;
    };
    if (!tick()) timer = setInterval(tick, 1000);
  }

  // ヘッダーのスクロール状態
  const header = document.querySelector('.site-header');
  if (header) {
    let pending = false;
    const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
    updateHeader();
    window.addEventListener('scroll', () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        updateHeader();
        pending = false;
      });
    }, { passive: true });
  }

  // スクロールで表示
  const reveals = document.querySelectorAll('[data-reveal]');
  reveals.forEach(element => {
    if (element.hasAttribute('data-reveal-delay')) {
      element.style.transitionDelay = Number(element.getAttribute('data-reveal-delay')) + 'ms';
    }
  });
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof window.IntersectionObserver !== 'function' || reducedMotion) {
    reveals.forEach(element => element.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(element => observer.observe(element));
  }
})();
