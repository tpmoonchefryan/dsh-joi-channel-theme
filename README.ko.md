<p align="center">
  <img src="./docs/app-logo-flowers.png" width="380" alt="Joi 두 벌 의상 테마 · 듀오 로고">
</p>

<h1 align="center">Joi 두 벌 의상 테마</h1>

<p align="center">
  <strong>DeepSeek Harness를 그녀의 방으로.</strong><br>
  VirtuaReal 소속 버추얼 유튜버 Joi를 모티프로 한 비공식 · 비상업 DeepSeek Harness 테마 플러그인.
</p>

<p align="center">
  <a href="./README.en.md">English</a> ·
  <a href="./README.md">简体中文</a> ·
  <a href="./README.ja.md">日本語</a> ·
  <strong>한국어</strong> ·
  <a href="./README.fr.md">Français</a>
</p>

<p align="center">
  <img alt="DeepSeek Harness" src="https://img.shields.io/badge/DeepSeek-Harness-4D6BFE?style=flat-square&logoColor=white">
  <img alt="Claude Fable 5" src="https://img.shields.io/badge/Claude-Fable%205-D97757?style=flat-square&logoColor=white">
  <a href="https://space.bilibili.com/61639371"><img alt="Joi의 Bilibili 페이지" src="https://img.shields.io/badge/Bilibili-Joi-00A1D6?style=flat-square&logo=bilibili&logoColor=white"></a>
</p>

<p align="center">
  <img alt="dsh web plugin" src="https://img.shields.io/badge/dsh%20plugin-web-8B5CF6?style=flat-square">
  <img alt="두 벌 의상" src="https://img.shields.io/badge/suits-Flowers%20%C2%B7%20Library-EE7F2D?style=flat-square">
  <a href="./LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/code-MIT-3DA639?style=flat-square"></a>
  <a href="./LICENSE-ASSETS.md"><img alt="CC BY-NC-SA 4.0" src="https://img.shields.io/badge/assets-CC%20BY--NC--SA%204.0-EF9421?style=flat-square"></a>
</p>

<p align="center">
  <a href="#overview">소개</a> ·
  <a href="#gallery">미리보기</a> ·
  <a href="#states">상태 연기</a> ·
  <a href="#installation">설치</a> ·
  <a href="#wardrobe">의상 교체와 네이티브</a> ·
  <a href="#design">디자인과 기술</a> ·
  <a href="#license">라이선스</a>
</p>

---

<a id="overview"></a>

## 소개

Joi는 중국 동영상 플랫폼 빌리빌리에서 활동하는 버추얼 유튜버로, 버추얼 아티스트
그룹 VirtuaReal 소속입니다.

픽셀 아트와 사이버펑크, 영화 《블레이드 러너》를 좋아하고, 운동은 싫어합니다.
특기는 "귤을 껍질째 한입에 먹기"이며 귤이야말로 가장 완벽한 과일이라 믿습니다 —
🍊가 그녀의 사실상 대표 이모지(비공식)가 된 이유입니다.

이 테마는 그녀의 **공식 의상 두 벌을 두 개의 완성된 방**으로 만들었습니다.
따뜻한 무대 조명의 **Joi·Flowers**, 차분한 서재 느낌의 **Joi·Library**.
색조 슬라이더 하나 돌린 스킨이 아닙니다 — 바탕색, 패널, 말풍선, 구문 강조,
질감, 캐릭터 연기까지 두 체계가 각각 독립적이며 **절대 섞이지 않습니다**.
그리고 "의상 교체"라는 말 자체가, 영화 속 Joi의 서사가 이 인터페이스에
내려앉는 유일한 지점입니다.

| 의상 | 명암 | 의미 색상 슬롯 | 캐릭터 | 내장 애셋 |
| :---: | :---: | :---: | :---: | :---: |
| `2벌` | `라이트 · 다크 · 시스템` | `7 + 잎` | `Joi · 축심 · 고래 소녀` | `10개 · 2.4 MB · 외부 요청 0` |

> [!IMPORTANT]
> **비공식 팬 작품입니다.** 본 프로젝트는 Joi, VirtuaReal, 빌리빌리, DeepSeek 및
> 관련 권리자와 소속·허가·제휴·후원·보증 관계가 없습니다. 캐릭터 이름·디자인·설정
> 및 관련 브랜드 권리는 각 권리자에게 귀속됩니다.

<a id="gallery"></a>

## 미리보기

새 세션 페이지. 그녀는 방 입구에 서서 헤드라인에 시선을 두고, 고래 소녀는 제목 위에
엎드려 낮잠을 잡니다 — 발톱이 글자에 정확히 4픽셀 파고드는데, 이것이 "위에 엎드려
있다"고 읽히는 유일한 깊이 단서입니다.

| | Joi·Flowers | Joi·Library |
| ---: | :---: | :---: |
| **라이트** | <img src="./docs/new-chat-flowers.png" width="410" alt="Joi·Flowers 새 세션 페이지 · 라이트"> | <img src="./docs/new-chat-library.png" width="410" alt="Joi·Library 새 세션 페이지 · 라이트"> |
| **다크** | <img src="./docs/new-chat-flowers-dark.png" width="410" alt="Joi·Flowers 새 세션 페이지 · 다크"> | <img src="./docs/new-chat-library-dark.png" width="410" alt="Joi·Library 새 세션 페이지 · 다크"> |

명암은 언제나 앱 자체의 외관 설정을 따릅니다. 의상이 바꾸는 것은 색조이지 밝기가
아닙니다. 네 개의 사분면(두 의상 × 명암)은 모두 하나의 동결된 베이스라인에 대해
값 단위로 검증되었습니다.

### 듀오 기념사진

사이드바 왼쪽 위의 고래 아이콘은 **듀오 기념사진**으로 바뀝니다 — 고래 소녀와
Joi가 한 장의 다이컷 스티커에 나란히: 엔진과 그녀, 어느 쪽도 빠질 수 없으니까요.
사진은 의상과 함께 갈아입고, 흰 테두리는 이미지에 구워져 있어 밝은 바탕에서도
또렷합니다. 두 장은 같은 캔버스 기준으로 정렬되어 의상을 바꿔도 얼굴 위치가
흔들리지 않습니다.

<p align="center">
  <img src="./docs/app-logo-flowers.png" width="360" alt="Flowers 듀오 로고">
  &nbsp;&nbsp;
  <img src="./docs/app-logo-library.png" width="360" alt="Library 듀오 로고">
</p>

<a id="states"></a>

## 상태 연기

대화 페이지에서는 입력창 위에 두 꼬마 친구가 앉아 있습니다. 왼쪽은 **축심**(팬 메이드
마스코트), 오른쪽은 치비 **Joi**. 둘은 이번 턴의 진행에 맞춰 표정을 바꿉니다 —
같은 어휘, 같은 확정 순간, 절대 따로 놀지 않습니다:

| | Joi·Flowers | Joi·Library |
| ---: | :---: | :---: |
| **대기** `info` | <img src="./docs/idle-flowers.png" width="380" alt="Flowers 대기"> | <img src="./docs/idle-library.png" width="380" alt="Library 대기"> |
| **실행 중** `running` | <img src="./docs/working-flowers.png" width="380" alt="Flowers 실행 중"> | <img src="./docs/working-library.png" width="380" alt="Library 실행 중"> |
| **성공** `success` | <img src="./docs/success-flowers.png" width="380" alt="Flowers 성공"> | <img src="./docs/success-library.png" width="380" alt="Library 성공"> |
| **실패** `error` | <img src="./docs/failed-flowers.png" width="380" alt="Flowers 실패"> | <img src="./docs/failed-library.png" width="380" alt="Library 실패"> |

성공하면 둘이 함께 눈을 가늘게 뜨고 기뻐하고, 실패하면 함께 눈을 내리깔고 눈물
한 방울 — 5초만 슬퍼한 뒤 다시 자리로 돌아갑니다. 실패를 통곡으로 연기하는 일은
없습니다. 그건 그녀들의 성격이 아니니까요.

긴 대화에서 글자가 캐릭터 위에 겹치면, 겹친 줄에만 자동으로 바탕색 테두리가
생깁니다 — 가독성은 언제나 귀여움보다 우선입니다.

<a id="installation"></a>

## 설치

### 전제 두 가지

| 전제 | 이유 | 확인 |
| --- | --- | --- |
| **Node.js** `^22.19` 또는 `>=24` | DeepSeek Harness의 실행 기반 | `node -v` |
| **pnpm** | `dsh plugin`은 사실상 pnpm 포워더. 없으면 `pnpm not found on PATH` | `pnpm -v` |

pnpm이 없다면 먼저 설치하세요(둘 중 하나):

```bash
npm install -g pnpm
```

```bash
corepack enable pnpm
```

### 경우 A: 평소 `npx`로 harness를 실행한다면

`npx @deepseek-ai/dsh web`으로 띄우고 있다면 `dsh`는 **PATH에 없습니다** —
`dsh plugin ...`만 치면 `command not found`가 납니다. 같은 `npx`를 붙이세요:

```bash
npx @deepseek-ai/dsh plugin --profile web add dsh-joi-channel-theme
```

그다음 평소처럼 실행:

```bash
npx @deepseek-ai/dsh web
```

> [!IMPORTANT]
> **프로필 이름은 반드시 `web`이어야 합니다.** 템플릿이 딸린 이름은 `web`과
> `headless` 둘뿐입니다. 다른 이름을 쓰면 웹 UI가 없는 빈 프로필이 만들어져
> 화면이 뜨지 않습니다.

### 경우 B: 매번 길게 치기 싫다면

harness를 전역 설치하면 `dsh`를 바로 쓸 수 있습니다:

```bash
npm install -g @deepseek-ai/dsh
```

```bash
dsh plugin --profile web add dsh-joi-channel-theme && dsh web
```

### 그다음

터미널에 찍힌 주소(기본 `http://127.0.0.1:3080`)를 브라우저로 열고 한 번
새로고침하면 그녀가 있습니다.

**harness가 이미 실행 중이라면** 플러그인은 핫로드되지 않습니다 — 플러그인 구성
변경은 재시작 시 반영됩니다. `Ctrl+C`로 멈추고 설치한 뒤 다시 실행하세요.

### 제거

```bash
npx @deepseek-ai/dsh plugin --profile web remove dsh-joi-channel-theme
```

> [!NOTE]
> **터미널을 만지는 건 이 한 번뿐입니다.** 이후의 모든 조작은 화면 안에서:
> 의상 교체도, DeepSeek 순정 외관으로 돌아가는 것도 모두 설정 → 일반의 같은 줄에서.
> DeepSeek Harness에는 현재 그래픽 방식의 플러그인 설치 창구가 없어서
> 이 한 단계만은 피할 수 없습니다.

> [!TIP]
> 제거 후 UI는 토큰, 파비콘, 워드마크, 구문 색상까지 항목 단위로 원상복구됩니다 —
> 잔여물 0, 실기에서 하나하나 확인했습니다.

<details>
<summary><strong>문제가 생기면</strong></summary>

**`dsh: command not found`** — harness가 전역 설치되어 있지 않습니다.
`npx @deepseek-ai/dsh plugin ...`(경우 A)을 쓰거나 먼저
`npm install -g @deepseek-ai/dsh`(경우 B)를 하세요.

**`dsh: pnpm not found on PATH`** — `dsh plugin`은 프로필의 의존성을 관리하는 데
pnpm이 필요합니다. `npm install -g pnpm` 또는 `corepack enable pnpm`을 실행하세요.

**설치했는데 그대로예요** — 플러그인 구성 변경은 재시작 시 반영됩니다. harness를
멈췄다 다시 실행하고, 브라우저를 강력 새로고침(`Cmd/Ctrl+Shift+R`)하세요.

**로컬 체크아웃에서(개발용)**

```bash
dsh plugin --profile web add /path/to/dsh-joi-channel-theme
```

GitHub에서 바로 설치하는 것은 **권장하지 않습니다**: pnpm ≥10이 `prepare` 빌드
스크립트를 막기 때문에 첫 설치는 반드시 실패하며, 출력된 패키지 키를 프로필의
`pnpm-workspace.yaml` `allowBuilds`에 적어 넣고 다시 실행해야 합니다.
npm 패키지는 빌드된 상태로 배포되므로 빌드 권한이 전혀 필요 없습니다.

</details>

<a id="wardrobe"></a>

## 의상 교체와 네이티브

**의상 교체**는 설정 → 일반 → 换装에 있습니다. 의상 카드를 고르면 방 전체가
따라 바뀝니다. 아래쪽은 네이티브의 라이트 / 다크 / 시스템 세 칸 그대로 —
명암은 언제나 앱의 몫입니다.

**「DeepSeek 순정」은 세 번째 카드**로 두 의상 옆에 나란히 있습니다. 고르면 플러그인을
설치한 채로 순정 외관으로 돌아가고, 의상을 다시 고르면 곧바로 복귀합니다.
설치가 곧 테마 강제는 아닙니다.

이것을 플러그인 on/off 스위치로 만들지 않은 이유는 애초에 그것이 아니기 때문입니다 —
골라도 플러그인은 꺼지지 않고, bundle은 설치된 채 로드되며, 플러그인 목록의 상태도
그대로입니다. 바뀌는 것은 언제나 외관뿐입니다.

<details>
<summary><strong>이 방에 숨겨진 것들 (디자인 이스터에그)</strong></summary>

- **익어가는 귤** — 컨텍스트 사용량은 진행 링이 아니라 짙은 초록에서 주홍으로
  익어가는 귤 한 알. 과숙 자체가 경고입니다. 잎은 늘 초록, 꼭지는 늘 갈색 —
  정체성은 상태에 따라 변하지 않으니까.
- **불변의 고래 파랑** — 모델·사용량·서브에이전트 색은 두 의상에서 완전히 동일.
  사람은 옷을 갈아입어도, 도구는 갈아입지 않습니다.
- **금색 할당량** — 그녀의 눈동자 색 `#FFCE65`는 Flowers에선 사용자 말풍선을
  가득 채울 수 있지만, Library에선 브로치 크기로만 등장합니다. 절제도 디자인입니다.
- **질감은 곧 옷감** — Flowers의 꽃잎 도트는 드레스 무늬에서, Library의 모눈종이는
  제도선에서 왔습니다.
- **워드마크 수술** — 사이드바의 deepseek 로고를 조심스럽게 두 줄로 재조판하고,
  HARNESS 배지를 "ek"의 e에 정확히 맞췄습니다 — 네이티브 SVG는 1바이트도
  바꾸지 않았고, 언제든 되돌릴 수 있습니다.
- **🍊는 어디에나** — 파비콘도 1단계 목록 마커도, 그 가장 완벽한 과일.
- **서브에이전트 꼬마 고래** — 동시 실행되는 서브태스크는 꼬마 고래의 줄로:
  대기 중엔 눈 감고, 실행 중엔 물 뿜고, 완료되면 눈을 가늘게.

</details>

<a id="design"></a>

## 디자인과 기술

이 테마에는 코드보다 먼저 **동결된 디자인 베이스라인**이 있었습니다. 모든 색상값,
앵커, 스프라이트 격자 비율이 하나의 `baseline-4q.json`에 있고, 코드는 빌드
시점에 거기서 상수를 생성합니다 — 손으로 베끼는 것은 금지. 회귀 스크립트는 같은 베이스라인으로 네 사분면을 검증합니다(283개 항목
전부 통과해야 합격).

| 항목 | 값 |
| --- | --- |
| 플러그인 ID | `dsh-joi-channel-theme` |
| 형태 | dsh bundle + web 클라이언트 플러그인 (공식 설치 경로, 클라이언트 개조 없음) |
| 토큰 오버레이 | 의상당 19단계 중성 램프 + 44개 의미 별칭 + 9개 구문 토큰, 명암 이중값 |
| 캐릭터 애셋 | Joi 2×2 ×2벌 · 축심 2×2 · 고래 소녀 엎드림/서있음 · 꼬마 고래 1×3 |
| 내장 애셋 | WebP data URI 10개, 총 2.4 MB, 외부 요청 0 (CSP 친화) |
| 호환성 | DeepSeek Harness web `0.1.0-rc.5+` |
| 더 읽기 | [개발 문서](./docs/DEVELOPMENT.md) |

<details>
<summary><strong>저장소 구조</strong></summary>

```text
dsh-joi-channel-theme/
├── README.md                 # 중국어(메인). en/ja/ko/fr 동일 계층
├── LICENSE                   # 코드: MIT
├── LICENSE-ASSETS.md         # 애셋: CC BY-NC-SA 4.0
├── THIRD_PARTY_NOTICES.md
├── cordis.patch.yml          # dsh bundle 레이어
├── src/                      # 호스트 절반 + 브라우저 절반
├── scripts/                  # 베이스라인/애셋 생성 · 스프라이트 정렬 · 4사분면 회귀
├── stuff/                    # 원본 애셋 (미채택 테이크 포함)
└── docs/                     # 스크린샷과 개발 문서
```

</details>

<a id="license"></a>

## 라이선스와 권리 고지

본 저장소는 분류 라이선스를 사용합니다:

- 코드, 프로젝트 고유 설정, 문서 텍스트는 [MIT License](./LICENSE);
- `stuff/`와 `docs/` 중 작성자가 적법하게 허가할 수 있는 고유 비주얼 기여는
  [CC BY-NC-SA 4.0](./LICENSE-ASSETS.md) — 저작자표시·비영리·동일조건변경허락.

> [!WARNING]
> 두 라이선스는 메인테이너 또는 기여자가 적법하게 허가할 수 있는 고유 부분만을
> 대상으로 합니다. Joi의 이름·캐릭터 디자인·설정, 그리고 VirtuaReal, 빌리빌리,
> DeepSeek 및 기타 제3자의 이름·상표·소재·참고자료에 대한 어떠한 권리도
> 부여하지 않습니다.

권리 경계의 전체 내용은 [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md)를
참고하세요.

---

<p align="center">
  <sub>Unofficial fan project · Code MIT · Original assets CC BY-NC-SA 4.0 · 🍊</sub>
</p>
