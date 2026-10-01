// スマホ用メニュー
const btn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');
btn.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  btn.setAttribute('aria-expanded', open);
});
nav.addEventListener('click', () => {
  nav.classList.remove('open');
  btn.setAttribute('aria-expanded', false);
});

// カウントダウン(開催日は index.html の data-date で設定。日付確定後に hidden を外す)
const cd = document.getElementById('countdown');
if (cd) {
const target = new Date(cd.dataset.date).getTime();
function tick() {
  const diff = Math.max(0, target - Date.now());
  const s = Math.floor(diff / 1000);
  document.getElementById('cd-d').textContent = Math.floor(s / 86400);
  document.getElementById('cd-h').textContent = Math.floor(s % 86400 / 3600);
  document.getElementById('cd-m').textContent = Math.floor(s % 3600 / 60);
  document.getElementById('cd-s').textContent = s % 60;
}
tick();
setInterval(tick, 1000);
}
