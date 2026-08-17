/**
 * stuff/Stuff for Use/*.png → src/generated/assets.ts（data URI）
 *
 * CSP 不放外链，插件 bundle 里的图必须内联。原图 14.4 MB，直接 base64 约 19 MB，
 * 大到没法用，所以两步压：
 *   ① 按实际渲染尺寸 ×2（视网膜）降采样 —— 20px 的小鲸鱼没理由带 724px 原图；
 *   ② 转 WebP，逐件在「无损」与「q95」之间取较小者。
 *
 * 为什么不是 PNG 调色板量化（第一版做法，已否决）：这十件全是 die-cut 图，
 * 白描边靠 alpha 边缘表达。FASTOCTREE 量化在 alpha 上的峰值偏差实测 58/255（23%），
 * 描边会发毛；WebP 的 alpha 是零偏差。同尺寸下可见 PSNR 43.8dB 对 33.9dB，
 * 代价只有 28% 体积——在 8 MB 预算下不值得为这点体积牺牲描边。
 *
 * 门槛：可见 PSNR（按 alpha 合成后测，透明区不计）≥ 40dB 且 alpha 峰值偏差 = 0。
 * 不达标就停，不静默放行。
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdirSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'src/generated/assets.ts')
const BUDGET_MB = 8
const MIN_PSNR = 40

/**
 * 每件素材的配方。`w` = 渲染宽 × 2（视网膜上限），渲染宽取自
 * design/baseline-4q.json geometry 与各 Story 的定稿尺寸。
 */
const PLAN = [
  // key                文件名                                         目标宽   渲染宽依据
  ['portraitFlowers', 'New Chat - Flowers.png', 1086], // 540 立绘
  ['portraitLibrary', 'New Chat - Library.png', 1086], // 540 立绘
  ['logoFlowers', 'App Logo - Flowers.png', 420], // 品牌区 46px 高
  ['logoLibrary', 'App Logo - Library.png', 420], //
  ['whaleLay', 'Kanban in Lay - Deepseek Whale Musume.png', 424], // 184 趴姿
  ['whaleStand', 'Kanban - Deepseek Whale Musume.png', 384], // 160 引导站姿
  // 对齐版：生成模型给不出像素级一致的构图，四格底缘与中心由
  // scripts/align-sprite.mjs 纯平移归一（底缘极差 0.0000、中心偏移 0.0008）。
  ['joiFlowers', 'In a Chat - Flowers 3-aligned.png', 512], // 112 精灵 2×2
  ['joiLibrary', 'In a Chat - Library 2-aligned.png', 512], //
  ['zhouxin', 'In a Chat - Zhouxin-traced.png', 512], //
  // 第四项 = 源图烤死白边的宽度（px）。给了就走「剥边 → 缩放 → 按输出尺寸重画 1px 边」，
  // 见下方 PY 的 strip_rim / draw_rim。只有缩放比极大的小图才需要，理由：
  //   源图白边 11px（占 724 的 1.5%），缩到 20 CSS px 后仅剩 0.61 设备像素——
  //   亚像素的边沿每条边落在像素网格的位置不同，抗锯齿把它抹成深浅不一的灰边，
  //   于是「白边不匀」并且整体发糊。这不是分辨率不够，是烤死的边扛不住这个比例。
  // 目标宽 120 = 3 格 × 40，正好是 20 CSS px 在 DPR2 下的设备像素，浏览器不再二次缩放
  //（此前是 360，浏览器还要做一次 3:1 廉价缩小，实测明显更糊）。
  ['subWhales', 'Sub Agent Whales.png', 120, 11], // 20 精灵 1×3
]

const PY = `
import sys, json, io, base64, math
from PIL import Image, ImageChops, ImageFilter

plan = json.loads(sys.argv[1]); src_dir = sys.argv[2]

def strip_rim(im, r):
    """剥掉烤死的白边：alpha 向内侵蚀 r 次，剩下的就是图形本体。
    精灵表的格与格之间有透明间隙，所以整表一起做不会串味（gen 前已验）。"""
    a = im.split()[3]
    for _ in range(r): a = a.filter(ImageFilter.MinFilter(3))
    o = im.copy(); o.putalpha(a); return o

def draw_rim(im, r):
    """按当前尺寸重画 r 像素白边：膨胀 alpha 得外环，填白，再把图形叠回去。
    边宽是整像素，因此每条边一样厚——这正是烤死的边做不到的。"""
    a = im.split()[3]
    for _ in range(r): a = a.filter(ImageFilter.MaxFilter(3))
    out = Image.new("RGBA", im.size, (255, 255, 255, 255)); out.putalpha(a)
    out.alpha_composite(im); return out

def flatten(im, bg=(128,128,128)):
    """按 alpha 合成到中性底：只有可见部分参与保真度比较。"""
    b = Image.new("RGB", im.size, bg); b.paste(im, (0,0), im); return b

def score(a, q):
    d = ImageChops.difference(flatten(a), flatten(q)); h = d.histogram()
    rm = []
    for ch in range(3):
        band = h[ch*256:(ch+1)*256]; n = max(1, sum(band))
        rm.append(math.sqrt(sum(i*i*c for i, c in enumerate(band)) / n))
    peak = max(rm)
    psnr = 999.0 if peak < 1e-9 else 20*math.log10(255/peak)
    da = ImageChops.difference(a.getchannel("A"), q.getchannel("A"))
    amax = max(i for i, c in enumerate(da.histogram()) if c)
    return psnr, amax

out, report = {}, []
for entry in plan:
    key, name, width = entry[0], entry[1], entry[2]
    rim = entry[3] if len(entry) > 3 else 0
    a = Image.open(src_dir + "/" + name).convert("RGBA")
    w0, h0 = a.size
    if rim:
        a = strip_rim(a, rim)
    if w0 > width:
        a = a.resize((width, round(h0 * width / w0)), Image.LANCZOS)
    if rim:
        a = draw_rim(a, 1)
    best = None
    for tag, kw in (("lossless", dict(lossless=True, method=6)),
                    ("q95", dict(quality=95, method=6))):
        buf = io.BytesIO(); a.save(buf, format="WEBP", **kw); data = buf.getvalue()
        q = Image.open(io.BytesIO(data)).convert("RGBA")
        psnr, amax = score(a, q)
        if psnr < ${MIN_PSNR} or amax != 0:
            continue
        if best is None or len(data) < len(best[1]):
            best = (tag, data, psnr, amax)
    if best is None:
        raise SystemExit("FIDELITY_FLOOR:" + key)
    tag, data, psnr, amax = best
    out[key] = "data:image/webp;base64," + base64.b64encode(data).decode()
    report.append([key, name, w0, h0, a.size[0], a.size[1], len(data), tag, round(psnr, 1), amax])

print(json.dumps({"assets": out, "report": report}))
`

const raw = execFileSync('python3', ['-c', PY, JSON.stringify(PLAN), resolve(ROOT, 'stuff/Stuff for Use')], {
  maxBuffer: 256 * 1024 * 1024,
  encoding: 'utf8',
})
const { assets, report } = JSON.parse(raw)

let originalTotal = 0
let inlineTotal = 0
console.log('素材            原始尺寸       目标尺寸     原始KB  压后KB   省   编码      可见PSNR α差')
for (const [key, name, w0, h0, w1, h1, bytes, tag, psnr, amax] of report) {
  const before = statSync(resolve(ROOT, 'stuff/Stuff for Use', name)).size
  originalTotal += before
  inlineTotal += assets[key].length
  console.log(
    `${key.padEnd(16)}${`${w0}×${h0}`.padEnd(15)}${`${w1}×${h1}`.padEnd(13)}`
    + `${String(Math.round(before / 1024)).padStart(6)}${String(Math.round(bytes / 1024)).padStart(8)}`
    + `${String(Math.round((1 - bytes / before) * 100)).padStart(5)}%  ${tag.padEnd(9)}`
    + `${String(psnr).padStart(7)}dB${String(amax).padStart(4)}`,
  )
}

const mb = inlineTotal / 1048576
console.log(
  `\n原图合计 ${(originalTotal / 1048576).toFixed(1)} MB`
  + ` → 内联 data URI 合计 ${mb.toFixed(2)} MB（预算 ${BUDGET_MB} MB，门槛 PSNR≥${MIN_PSNR}dB 且 α 零偏差）`,
)
if (mb > BUDGET_MB) throw new Error(`内联体积 ${mb.toFixed(2)} MB 超预算 ${BUDGET_MB} MB —— 停下来议档位，不要静默放行`)

mkdirSync(dirname(OUT), { recursive: true })
const entries = Object.entries(assets).map(([k, v]) => `  ${k}: ${JSON.stringify(v)},`).join('\n')
writeFileSync(OUT, `/* 由 scripts/gen-assets.mjs 从 stuff/Stuff for Use/ 生成，请勿手改。 */

/** 内联素材：WebP data URI，无外链（CSP 不放行）。 */
export const ASSETS = {
${entries}
} as const

/** 素材键。 */
export type AssetKey = keyof typeof ASSETS
`, 'utf8')
console.log(`assets → ${OUT}`)
