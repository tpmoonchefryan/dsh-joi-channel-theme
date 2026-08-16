<p align="center">
  <img src="./docs/app-logo-flowers.png" width="380" alt="Joi two-suit theme · duo logo">
</p>

<h1 align="center">Joi Two-Suit Theme</h1>

<p align="center">
  <strong>Turn DeepSeek Harness into her room.</strong><br>
  An unofficial, non-commercial DeepSeek Harness theme plugin based on VirtuaReal VTuber Joi.
</p>

<p align="center">
  <strong>English</strong> ·
  <a href="./README.md">简体中文</a> ·
  <a href="./README.ja.md">日本語</a> ·
  <a href="./README.ko.md">한국어</a> ·
  <a href="./README.fr.md">Français</a>
</p>

<p align="center">
  <img alt="DeepSeek Harness" src="https://img.shields.io/badge/DeepSeek-Harness-4D6BFE?style=flat-square&logoColor=white">
  <img alt="Claude Fable 5" src="https://img.shields.io/badge/Claude-Fable%205-D97757?style=flat-square&logoColor=white">
  <a href="https://space.bilibili.com/61639371"><img alt="Joi on Bilibili" src="https://img.shields.io/badge/Bilibili-Joi-00A1D6?style=flat-square&logo=bilibili&logoColor=white"></a>
</p>

<p align="center">
  <img alt="dsh web plugin" src="https://img.shields.io/badge/dsh%20plugin-web-8B5CF6?style=flat-square">
  <img alt="Two suits" src="https://img.shields.io/badge/suits-Flowers%20%C2%B7%20Library-EE7F2D?style=flat-square">
  <a href="./LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/code-MIT-3DA639?style=flat-square"></a>
  <a href="./LICENSE-ASSETS.md"><img alt="CC BY-NC-SA 4.0" src="https://img.shields.io/badge/assets-CC%20BY--NC--SA%204.0-EF9421?style=flat-square"></a>
</p>

<p align="center">
  <a href="#overview">Overview</a> ·
  <a href="#gallery">Gallery</a> ·
  <a href="#states">State Show</a> ·
  <a href="#installation">Install</a> ·
  <a href="#wardrobe">Wardrobe & Native</a> ·
  <a href="#design">Design & Tech</a> ·
  <a href="#license">License</a>
</p>

---

<a id="overview"></a>

## Overview

Joi is a VTuber active on the Chinese video platform Bilibili, part of the virtual
artist group VirtuaReal.

She loves pixel art, cyberpunk, and the film *Blade Runner*; dislikes exercise;
her special skill is "eating a whole orange in one bite with the peel on," and she
considers the orange the most perfect fruit — which is how 🍊 became her de facto
emoji (unofficial).

This theme turns her **two official outfit sets into two complete rooms**: the warm,
stage-lit **Joi·Flowers**, and the cool, study-like **Joi·Library**. It is not one
skin with a hue slider — grounds, panels, bubbles, syntax highlighting, textures and
character acting are two self-contained systems that **never mix**. And the word
*wardrobe* itself is where the film's Joi narrative lands on this interface.

| Suits | Appearance | Semantic slots | Characters | Inlined assets |
| :---: | :---: | :---: | :---: | :---: |
| `2` | `light · dark · system` | `7 + leaf` | `Joi · Zhouxin · Whale Musume` | `10 files · 2.4 MB · zero external` |

> [!IMPORTANT]
> **Unofficial fan work.** This project is not affiliated with, authorized,
> sponsored or endorsed by Joi, VirtuaReal, Bilibili, DeepSeek or any related
> rights holder. Character names, designs, settings and brand rights belong to
> their respective owners.

<a id="gallery"></a>

## Gallery

The new-session page: she stands at the door of the room, her gaze resting on the
headline; the whale girl naps on top of the title, claws sinking exactly four
pixels into the glyphs — the only depth cue that reads as "lying on it."

| | Joi·Flowers | Joi·Library |
| ---: | :---: | :---: |
| **Light** | <img src="./docs/new-chat-flowers.png" width="410" alt="Joi·Flowers new-session page, light"> | <img src="./docs/new-chat-library.png" width="410" alt="Joi·Library new-session page, light"> |
| **Dark** | <img src="./docs/new-chat-flowers-dark.png" width="410" alt="Joi·Flowers new-session page, dark"> | <img src="./docs/new-chat-library-dark.png" width="410" alt="Joi·Library new-session page, dark"> |

Light and dark always follow the app's own appearance setting; a suit changes hue,
never brightness. All four quadrants (two suits × light/dark) are verified value by
value against one frozen baseline.

### The duo portrait

The whale glyph in the sidebar's top-left corner is replaced by a **duo
portrait** — the whale girl and Joi squeezed into one die-cut sticker: the
engine and her, neither one optional. The portrait changes with the suit,
its white outline is baked into the art so it holds up on light grounds,
and both images are aligned on the same canvas so faces never shift when
you change outfits.

<p align="center">
  <img src="./docs/app-logo-flowers.png" width="360" alt="Flowers duo logo">
  &nbsp;&nbsp;
  <img src="./docs/app-logo-library.png" width="360" alt="Library duo logo">
</p>

<a id="states"></a>

## State Show

On the conversation page, two little companions sit on top of the composer:
**Zhouxin** (the fan mascot) on the left, chibi **Joi** on the right. They change
faces with the current turn — same vocabulary, same settle moment, never out of sync:

| | Joi·Flowers | Joi·Library |
| ---: | :---: | :---: |
| **Idle** `info` | <img src="./docs/idle-flowers.png" width="380" alt="Flowers idle"> | <img src="./docs/idle-library.png" width="380" alt="Library idle"> |
| **Running** `running` | <img src="./docs/working-flowers.png" width="380" alt="Flowers running"> | <img src="./docs/working-library.png" width="380" alt="Library running"> |
| **Success** `success` | <img src="./docs/success-flowers.png" width="380" alt="Flowers success"> | <img src="./docs/success-library.png" width="380" alt="Library success"> |
| **Failure** `error` | <img src="./docs/failed-flowers.png" width="380" alt="Flowers failure"> | <img src="./docs/failed-library.png" width="380" alt="Library failure"> |

When a turn succeeds, both beam together; when it fails, both lower their eyes with
a single tear — sad for five seconds, then back to their posts. Failure is never
performed as wailing: that is not who they are.

In long conversations, any line of text that overlaps a character automatically
gains a ground-colored outline — readability always outranks cuteness.

<a id="installation"></a>

## Install

Requires DeepSeek Harness (web, `0.1.0-rc.5+`). One command:

```bash
dsh plugin --profile web add dsh-joi-channel-theme
```

Restart `dsh web`, refresh the browser, and she is there. Uninstalling is one too:

```bash
dsh plugin --profile web remove dsh-joi-channel-theme
```

> [!NOTE]
> **That is the only time you touch a terminal.** Everything afterwards lives in
> the UI: the wardrobe under Settings → General, the master switch under
> Settings → Plugins → plugin configuration. DeepSeek Harness currently ships no
> graphical plugin installer, so this one step is unavoidable.

> [!TIP]
> Plugin-set changes take effect on restart. After removal the UI returns to
> stock item by item — tokens, favicon, wordmark, syntax colors, zero residue —
> verified on a live instance.

<details>
<summary><strong>Other installation paths</strong></summary>

From a local checkout (for development):

```bash
dsh plugin --profile web add /path/to/dsh-joi-channel-theme
```

Installing straight from GitHub is **not recommended**: pnpm ≥10 blocks the
`prepare` build script, so the first `add` always fails and you must copy the
printed package key into your profile's `pnpm-workspace.yaml` under `allowBuilds`
and re-run. The npm package ships prebuilt and needs no build permission.

</details>

<a id="wardrobe"></a>

## Wardrobe & Native

**Wardrobe** lives in Settings → General → 换装: two suit cards; pick one and the
room follows. The lower half keeps the native light / dark / system cubes —
brightness always belongs to the app.

The **master switch** lives in Settings → Plugins → plugin configuration: turn it
off and the UI returns to stock DeepSeek while the plugin stays installed; turn it
back on and your previous suit returns. Installing the plugin never forces the skin.

<details>
<summary><strong>What hides in this room (design easter eggs)</strong></summary>

- **A ripening orange** — context usage is not a progress ring but an orange
  ripening from deep green to red-orange. Overripe *is* the warning; the leaf stays
  green and the stem stays brown, because identity does not change with state.
- **Constant whale blue** — model, usage and subagent colors are identical across
  both suits. People change clothes; tools do not.
- **The gold quota** — her iris color `#FFCE65` may flood user bubbles in Flowers,
  but in Library it only appears at brooch scale. Restraint is design too.
- **Texture as fabric** — Flowers' petal dots come from her dress print; Library's
  grid paper from drafting lines.
- **Wordmark surgery** — the sidebar's deepseek wordmark is carefully re-set into
  two lines, the HARNESS badge aligned precisely to the "e" of "ek" — without
  changing a byte of the native SVG, fully reversible.
- **🍊 everywhere** — the favicon and first-level list markers are that most
  perfect fruit.
- **Subagent whales** — concurrent subtasks line up as tiny whales: eyes closed in
  queue, spouting while running, squinting when done.

</details>

<a id="design"></a>

## Design & Tech

This theme had a **frozen design baseline before it had code**: every color value,
anchor and sprite-cell ratio lives in a single `baseline-4q.json`; code generates
its constants from that baseline at build time — hand-copying is forbidden. The regression script
asserts all four quadrants against the same baseline (283 checks must pass).

| Item | Value |
| --- | --- |
| Plugin ID | `dsh-joi-channel-theme` |
| Form | dsh bundle + web client plugin (official install path, no client fork) |
| Token overlay | per suit: 19-step neutral ramp + 44 semantic aliases + 9 syntax tokens, light & dark |
| Character assets | Joi 2×2 ×2 suits · Zhouxin 2×2 · Whale Musume lying/standing · mini whales 1×3 |
| Inlined assets | 10 WebP data URIs, 2.4 MB total, zero external requests (CSP-friendly) |
| Compatibility | DeepSeek Harness web `0.1.0-rc.5+` |
| Deep dive | [Development doc](./docs/DEVELOPMENT.md) |

<details>
<summary><strong>Repository layout</strong></summary>

```text
dsh-joi-channel-theme/
├── README.md                 # zh main (en/ja/ko/fr alongside)
├── LICENSE                   # code: MIT
├── LICENSE-ASSETS.md         # assets: CC BY-NC-SA 4.0
├── THIRD_PARTY_NOTICES.md
├── cordis.patch.yml          # dsh bundle layer
├── src/                      # host half + browser half
├── scripts/                  # baseline/asset generation · sprite alignment · 4-quadrant regression
├── stuff/                    # source assets (including unused takes)
└── docs/                     # screenshots & development doc
```

</details>

<a id="license"></a>

## License & Rights

This repository uses split licensing:

- Code, project-authored configuration and documentation text are under the
  [MIT License](./LICENSE);
- Project-authored original visual contributions in `stuff/` and `docs/` are under
  [CC BY-NC-SA 4.0](./LICENSE-ASSETS.md) — attribution, non-commercial, share-alike.

> [!WARNING]
> Both licenses cover only original contributions the maintainer or contributors
> are legally entitled to license. They grant no rights in Joi's name, character
> design or settings, nor in the names, trademarks, materials or references of
> VirtuaReal, Bilibili, DeepSeek or any other third party.

The full rights boundary is documented in
[`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md).

---

<p align="center">
  <sub>Unofficial fan project · Code MIT · Original assets CC BY-NC-SA 4.0 · 🍊</sub>
</p>
