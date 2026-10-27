# syousensai2026

弓削商船高等専門学校の学園祭「第56回 商船祭」（テーマ「結実」、2026年11月7日・8日）の公式サイトです。
GitHub Pages で公開しています：https://namaridama-p.github.io/syousensai2026/

## ページ構成

| ファイル | ページ | 主な内容 |
|---|---|---|
| `index.html` | トップ | 開催日時・カウントダウン、お知らせ、見どころ、弓削丸体験航海、部活動の出展、ポスター、アクセスの要点 |
| `about.html` | 商船祭とは | テーマ「結実」と実行委員長のメッセージ、テーマのつながり、学校の紹介 |
| `program.html` | 企画 | 企画の種類、タイムテーブル（`data/events.json`）、弓削丸体験航海 |
| `shops.html` | 模擬店 | 模擬店・出展の一覧（`data/shops.json`） |
| `access.html` | アクセス | 会場、日曜日の注意、車・船・電車とバスでの来かた、時刻表へのリンク |
| `info.html` | 来場案内 | 開催概要、ご来場の前に、よくある質問、お知らせ一覧、お問い合わせ |

## 中身を更新するとき

- 模擬店・企画・お知らせは `data/` の JSON を編集します。書き方は [`data/TEMPLATE.md`](data/TEMPLATE.md) を見てください。
- 開催日時は `script.js` の最初の `window.SHOSENSAI` にまとめてあります。
- ヘッダー・フッター・スマホ用の下部メニューは各ページに同じものを書いています。リンクを増やすときは 6 ページすべてを直してください。

## 手元で確認する

JSON を読み込むため、ファイルを直接開くのではなく、簡単なサーバーを立てて確認します。

```sh
python -m http.server 8765
```

ブラウザで http://localhost:8765/ を開きます。

## デザインについて

- 公式ポスターの「ジグソーパズル × 瀬戸内の海 × 力強い黒文字 × 緑のピース」をモチーフにしています。ページ上部では、白いピースの欠けたところから海が見え、トップでは最後に緑のピースがはまります（`script.js` のパズルの処理）。
- フッターの旗は国際信号旗で、左から「KETSUJITSU（結実）」と読めます。トップの「UW2」は「ようこそ」を表す信号旗です。旗の図柄は `images/flags.svg` にあります。
- 文字は Google Fonts の Reggae One（大見出し）、Kaisei Tokumin（見出し）、Zen Kaku Gothic New（本文）、Bebas Neue（数字・英字）を使っています。
- 色は `style.css` の最初（`:root`）にまとめてあります。
- 動きを減らす設定の端末では、アニメーションを止めます。ページ切り替えの演出（View Transitions）や先読み（Speculation Rules）は、対応しているブラウザだけで動きます。

## 画像について

- `images/hero/` の海の画像は、生成 AI（Grok Imagine）で作成したイメージです。実際の風景ではありません。
- `images/poster.jpg` は公式ポスターです（学校の商船祭ページで公開されているもの）。
- `images/emblem.webp` は校章です（`favicon.png` から背景を透明にして作成）。
- `images/ogp.jpg` は SNS で共有したときに表示される画像です。

## 制作

Web制作：namaridama_p / t_okugawa
