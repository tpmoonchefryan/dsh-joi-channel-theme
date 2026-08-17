<p align="center">
  <img src="./docs/app-logo-flowers.png" width="380" alt="Joi 二衣装テーマ · ふたりロゴ">
</p>

<h1 align="center">Joi 二衣装テーマ</h1>

<p align="center">
  <strong>DeepSeek Harness を、彼女の部屋に。</strong><br>
  VirtuaReal 所属 VTuber・Joi をモチーフにした非公式・非商用の DeepSeek Harness テーマプラグイン。
</p>

<p align="center">
  <a href="./README.en.md">English</a> ·
  <a href="./README.md">简体中文</a> ·
  <strong>日本語</strong> ·
  <a href="./README.ko.md">한국어</a> ·
  <a href="./README.fr.md">Français</a>
</p>

<p align="center">
  <img alt="DeepSeek Harness" src="https://img.shields.io/badge/DeepSeek-Harness-4D6BFE?style=flat-square&logoColor=white">
  <img alt="Claude Fable 5" src="https://img.shields.io/badge/Claude-Fable%205-D97757?style=flat-square&logoColor=white">
  <a href="https://space.bilibili.com/61639371"><img alt="Joi の Bilibili ページ" src="https://img.shields.io/badge/Bilibili-Joi-00A1D6?style=flat-square&logo=bilibili&logoColor=white"></a>
</p>

<p align="center">
  <img alt="dsh web plugin" src="https://img.shields.io/badge/dsh%20plugin-web-8B5CF6?style=flat-square">
  <img alt="二衣装" src="https://img.shields.io/badge/suits-Flowers%20%C2%B7%20Library-EE7F2D?style=flat-square">
  <a href="./LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/code-MIT-3DA639?style=flat-square"></a>
  <a href="./LICENSE-ASSETS.md"><img alt="CC BY-NC-SA 4.0" src="https://img.shields.io/badge/assets-CC%20BY--NC--SA%204.0-EF9421?style=flat-square"></a>
</p>

<p align="center">
  <a href="#overview">概要</a> ·
  <a href="#gallery">プレビュー</a> ·
  <a href="#states">ステートの演技</a> ·
  <a href="#installation">インストール</a> ·
  <a href="#wardrobe">衣装替えとネイティブ</a> ·
  <a href="#design">デザインと技術</a> ·
  <a href="#license">ライセンス</a>
</p>

---

<a id="overview"></a>

## 概要

Joi は中国の動画プラットフォーム・ビリビリで活動する VTuber で、バーチャルアーティスト
グループ VirtuaReal に所属しています。

ドット絵とサイバーパンク、映画『ブレードランナー』が好き。運動は苦手。特技は
「みかんを皮ごと一口で食べる」ことで、みかんこそ最も完璧な果物だと信じている——
🍊 が彼女の事実上の絵文字（非公式）になった由来です。

このテーマは、彼女の**公式衣装二着を、二つの完成された部屋**に仕立てました。
暖色でステージのような **Joi·Flowers** と、寒色で書斎のような **Joi·Library**。
色相を回しただけの一枚皮ではありません——下地、パネル、吹き出し、シンタックス
ハイライト、テクスチャ、キャラクターの演技まで、二式は独立した体系で、
**決して混ざりません**。そして「衣装替え」という言葉こそ、映画の Joi の物語が
このインターフェースに降り立つ唯一の場所です。

| 衣装 | 明暗 | 意味色スロット | キャラクター | 内蔵アセット |
| :---: | :---: | :---: | :---: | :---: |
| `2 式` | `ライト · ダーク · システム` | `7 + 葉` | `Joi · Zhouxin · クジラ娘` | `10 点 · 2.4 MB · 外部リンクゼロ` |

> [!IMPORTANT]
> **非公式のファン作品です。** 本プロジェクトは Joi、VirtuaReal、ビリビリ、DeepSeek
> および関連権利者との間に、所属・許諾・提携・後援・保証のいかなる関係もありません。
> キャラクターの名称・デザイン・設定および関連ブランドの権利は各権利者に帰属します。

<a id="gallery"></a>

## プレビュー

新規セッションページ。彼女は部屋の入口に立ち、視線は見出しへ。クジラ娘はタイトルの
上でうたた寝し、爪先がちょうど 4 ピクセルだけ文字に食い込みます——「上に乗っている」
と読める唯一の奥行きの手がかりです。

| | Joi·Flowers | Joi·Library |
| ---: | :---: | :---: |
| **ライト** | <img src="./docs/new-chat-flowers.png" width="410" alt="Joi·Flowers 新規セッションページ · ライト"> | <img src="./docs/new-chat-library.png" width="410" alt="Joi·Library 新規セッションページ · ライト"> |
| **ダーク** | <img src="./docs/new-chat-flowers-dark.png" width="410" alt="Joi·Flowers 新規セッションページ · ダーク"> | <img src="./docs/new-chat-library-dark.png" width="410" alt="Joi·Library 新規セッションページ · ダーク"> |

明暗は常にアプリ自身の外観設定に従います。衣装が変えるのは色相であって、
明るさではありません。四つの象限（二衣装 × 明暗）はすべて、同一の凍結
ベースラインに対して値単位で検証済みです。

### ふたりの記念写真

サイドバー左上のクジラアイコンは、**ふたりの記念写真**に置き換わります——
クジラ娘と Joi がひとつのダイカットステッカーに肩を寄せ合う構図。エンジンと
彼女、どちらも欠けてはいけません。写真は衣装と一緒に着替え、白い縁取りは
画像に焼き込み済みなのでライトな下地でも映えます。二枚は同一キャンバスで
整列してあり、衣装替えで顔の位置がずれることはありません。

<p align="center">
  <img src="./docs/app-logo-flowers.png" width="360" alt="Flowers ふたりロゴ">
  &nbsp;&nbsp;
  <img src="./docs/app-logo-library.png" width="360" alt="Library ふたりロゴ">
</p>

<a id="states"></a>

## ステートの演技

会話ページでは、入力欄の上に二人の小さな相棒が座っています。左が**Zhouxin**
（ファンメイドのマスコット）、右がちび **Joi**。二人はそのターンの進行に合わせて
表情を変えます——同じ語彙、同じ瞬間に確定し、決してバラバラにはなりません：

| | Joi·Flowers | Joi·Library |
| ---: | :---: | :---: |
| **待機** `info` | <img src="./docs/idle-flowers.png" width="380" alt="Flowers 待機"> | <img src="./docs/idle-library.png" width="380" alt="Library 待機"> |
| **実行中** `running` | <img src="./docs/working-flowers.png" width="380" alt="Flowers 実行中"> | <img src="./docs/working-library.png" width="380" alt="Library 実行中"> |
| **成功** `success` | <img src="./docs/success-flowers.png" width="380" alt="Flowers 成功"> | <img src="./docs/success-library.png" width="380" alt="Library 成功"> |
| **失敗** `error` | <img src="./docs/failed-flowers.png" width="380" alt="Flowers 失敗"> | <img src="./docs/failed-library.png" width="380" alt="Library 失敗"> |

うまくいけば二人揃って目を細めて喜び、失敗すれば揃って目を伏せ、涙を一粒——
五秒だけ悲しんで、また持ち場に戻ります。失敗を号泣で演じることはありません。
それは彼女たちの性格ではないからです。

長い会話で文字がキャラクターに重なると、重なった行にだけ自動で下地色の縁取りが
つきます——可読性はいつでも可愛さに優先します。

<a id="installation"></a>

## インストール

### 前提はふたつ

| 前提 | 理由 | 確認 |
| --- | --- | --- |
| **Node.js** `^22.19` または `>=24` | DeepSeek Harness の実行基盤 | `node -v` |
| **pnpm** | `dsh plugin` は実体が pnpm のフォワーダー。無いと `pnpm not found on PATH` | `pnpm -v` |

pnpm が無ければ先に入れてください（どちらでも可）：

```bash
npm install -g pnpm
```

```bash
corepack enable pnpm
```

### ケース A：普段 `npx` で harness を動かしている

`npx @deepseek-ai/dsh web` で起動している場合、`dsh` は **PATH に居ません**——
`dsh plugin ...` とだけ打つと `command not found` になります。同じ `npx` を付けます：

```bash
npx @deepseek-ai/dsh plugin --profile web add dsh-joi-channel-theme
```

そのあとは普段どおり起動：

```bash
npx @deepseek-ai/dsh web
```

> [!IMPORTANT]
> **プロファイル名は `web` でなければいけません。** テンプレートを同梱しているのは
> `web` と `headless` の二つだけ。他の名前では Web UI の無い空のプロファイルになり、
> 画面が立ち上がりません。

### ケース B：毎回打つのが面倒なら

harness をグローバルに入れれば `dsh` がそのまま使えます：

```bash
npm install -g @deepseek-ai/dsh
```

```bash
dsh plugin --profile web add dsh-joi-channel-theme && dsh web
```

### そのあと

ターミナルに表示されたアドレス（既定は `http://127.0.0.1:3080`）をブラウザで開き、
一度リロードすれば、彼女がそこにいます。

**harness が起動中の場合**、プラグインはホットロードされません——プラグイン構成の
変更は再起動時に反映されます。`Ctrl+C` で止め、インストールしてから起動し直してください。

### アンインストール

```bash
npx @deepseek-ai/dsh plugin --profile web remove dsh-joi-channel-theme
```

> [!NOTE]
> **ターミナルを触るのはこの一度きりです。** 以降の操作はすべて画面の中に：
> 衣装替えも、DeepSeek 純正の見た目に戻すことも、同じ 設定 → 一般 の一列で。
> DeepSeek Harness には現在プラグインのグラフィカルなインストーラーが無いため、
> この一手だけは避けられません。

> [!TIP]
> 削除後の UI はトークン、ファビコン、ワードマーク、シンタックス色まで項目単位で
> 元に戻ります——残留ゼロ、実機で逐一確認済みです。

<details>
<summary><strong>うまくいかないとき</strong></summary>

**`dsh: command not found`** — harness をグローバルに入れていません。
`npx @deepseek-ai/dsh plugin ...`（ケース A）か、先に
`npm install -g @deepseek-ai/dsh`（ケース B）を。

**`dsh: pnpm not found on PATH`** — `dsh plugin` はプロファイルの依存を管理するのに
pnpm を使います。`npm install -g pnpm` または `corepack enable pnpm` を実行してください。

**入れたのに変わらない** — プラグイン構成の変更は再起動時に反映されます。
harness を止めて起動し直し、ブラウザをハードリロード（`Cmd/Ctrl+Shift+R`）してください。

**ローカルのチェックアウトから（開発用）**

```bash
dsh plugin --profile web add /path/to/dsh-joi-channel-theme
```

GitHub からの直接インストールは**推奨しません**：pnpm ≥10 が `prepare` ビルド
スクリプトを止めるため初回は必ず失敗し、表示されたパッケージキーを profile の
`pnpm-workspace.yaml` の `allowBuilds` に書き足して再実行する必要があります。
npm パッケージはビルド済みなので、ビルド許可は一切不要です。

</details>

<a id="wardrobe"></a>

## 衣装替えとネイティブ

**衣装替え**は 設定 → 一般 → 換装 にあります。衣装カードを選べば部屋ごと替わります。
下段はネイティブのライト / ダーク / システムの三択のまま——明暗は常にアプリの領分です。

**「DeepSeek 純正」は三枚目のカード**として、二つの衣装の隣に並びます。選べば
プラグインを入れたまま純正の見た目に戻り、衣装を選び直せばすぐ帰ってきます。
インストールがテーマの強制になることはありません。

これをプラグインの ON/OFF スイッチにしていないのは、元よりそうではないからです——
選んでもプラグインは停止せず、bundle は入ったまま読み込まれ、プラグイン一覧の状態も
変わりません。切り替えているのは常に見た目だけです。

<details>
<summary><strong>この部屋に隠れているもの（デザインの小ネタ）</strong></summary>

- **熟れていくみかん** — コンテキスト使用量はプログレスリングではなく、
  深緑から橙紅へ熟れていく一粒のみかん。熟れすぎ自体が警告。葉は常に緑、
  ヘタは常に茶——アイデンティティは状態で変わらないから。
- **クジラ青は不変** — モデル・使用量・サブエージェントの色は二衣装で完全に同一。
  人は服を替えても、道具は替えない。
- **金色の割当** — 彼女の瞳の色 `#FFCE65` は Flowers ではユーザー吹き出しを
  満たせますが、Library ではブローチの寸法でしか現れません。抑制もまたデザイン。
- **テクスチャは衣料** — Flowers の花びらドットはドレスの柄から、Library の
  方眼紙は製図線から。
- **ワードマークの手術** — サイドバーの deepseek ロゴを丁寧に二行組みへ。
  HARNESS バッジは「ek」の e にぴたりと揃えます——ネイティブ SVG は
  1 バイトも変えず、いつでも元に戻せます。
- **🍊 はどこにでも** — ファビコンも第一階層のリストマーカーも、あの最も完璧な果物。
- **サブエージェントの小クジラ** — 並行するサブタスクは小さなクジラの列に。
  待機中は目を閉じ、実行中は潮を吹き、完了すると目を細めます。

</details>

<a id="design"></a>

## デザインと技術

このテーマには、コードより先に**凍結されたデザインベースライン**がありました。
すべての色値・アンカー・スプライト格子比率は一つの `baseline-4q.json` にあり、
コードはビルド時にそこから定数を生成します——手写しは禁止。回帰スクリプトは同じ
ベースラインで四象限を検証します（283 項目全緑が合格条件）。

| 項目 | 値 |
| --- | --- |
| プラグイン ID | `dsh-joi-channel-theme` |
| 形態 | dsh bundle + web クライアントプラグイン（公式インストール経路、クライアント改造なし） |
| トークンオーバーレイ | 衣装ごとに 19 段の中間色ランプ + 44 の意味エイリアス + 9 のシンタックストークン、明暗二値 |
| キャラクターアセット | Joi 2×2 ×2 式 · Zhouxin 2×2 · クジラ娘（伏せ/立ち） · 小クジラ 1×3 |
| 内蔵アセット | WebP data URI 10 点、計 2.4 MB、外部リクエストゼロ（CSP フレンドリー） |
| 互換性 | DeepSeek Harness web `0.1.0-rc.5+` |
| さらに読む | [開発ドキュメント](./docs/DEVELOPMENT.md) |

<details>
<summary><strong>リポジトリ構成</strong></summary>

```text
dsh-joi-channel-theme/
├── README.md                 # 中国語（メイン）。en/ja/ko/fr は同階層
├── LICENSE                   # コード：MIT
├── LICENSE-ASSETS.md         # アセット：CC BY-NC-SA 4.0
├── THIRD_PARTY_NOTICES.md
├── cordis.patch.yml          # dsh bundle レイヤー
├── src/                      # ホスト側 + ブラウザ側
├── scripts/                  # ベースライン/アセット生成 · スプライト整列 · 四象限回帰
├── stuff/                    # 元アセット（未採用テイクを含む）
└── docs/                     # スクリーンショットと開発ドキュメント
```

</details>

<a id="license"></a>

## ライセンスと権利表示

本リポジトリは分類ライセンスを採用しています：

- コード、プロジェクト独自の設定、ドキュメント本文は [MIT License](./LICENSE)；
- `stuff/` と `docs/` のうち、作者が適法に許諾できる独自のビジュアル貢献は
  [CC BY-NC-SA 4.0](./LICENSE-ASSETS.md)（表示・非営利・継承）。

> [!WARNING]
> 両ライセンスは、メンテナーまたはコントリビューターが適法に許諾できる
> 独自部分のみを対象とします。Joi の名称・キャラクターデザイン・設定、
> ならびに VirtuaReal、ビリビリ、DeepSeek その他第三者の名称・商標・素材・
> 参考資料に関するいかなる権利も付与しません。

権利範囲の全容は [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md) を参照してください。

---

<p align="center">
  <sub>Unofficial fan project · Code MIT · Original assets CC BY-NC-SA 4.0 · 🍊</sub>
</p>
