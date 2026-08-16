/**
 * 精灵表几何归一化。
 *
 * 生成模型给不出像素级一致的构图：同一张表里，四格的内容底缘与水平中心总会差
 * 一两个百分点。按 112px 渲染，1% 就是 1.1px——切换表情时角色会上下跳、左右挪。
 *
 * 这里只做**整格平移**：把每格的内容搬到共同的底缘线与水平中心。
 * 不缩放、不重采样、不碰 alpha，所以零画质损失，白描边也不会被插值糊掉。
 *
 *   目标底缘 = 四格中最低的那个（往下搬到它，不会越出格外）
 *   目标中心 = 格宽的 0.5
 *
 * 轴芯那张当初也是这么处理的（四格底缘极差归到 0.000）。
 *
 * 用法：node scripts/align-sprite.mjs "<输入>" "<输出>"
 */
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

const [input, output] = process.argv.slice(2)
if (input === undefined || output === undefined) {
  console.error('用法：node scripts/align-sprite.mjs "<输入.png>" "<输出.png>"')
  process.exit(2)
}

const PY = `
import sys
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGBA")
W, H = im.size
cw, ch = W // 2, H // 2

def bbox(cell):
    return cell.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()

cells, boxes = [], []
for r in range(2):
    for c in range(2):
        cell = im.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch))
        cells.append(cell); boxes.append(bbox(cell))

# 目标底缘取四格里最低的那条：其余格往下搬即可，谁都不会被搬出格外。
target_bottom = max(b[3] for b in boxes)
report_before, report_after = [], []
out = Image.new("RGBA", (W, H), (0, 0, 0, 0))

for i, (cell, b) in enumerate(zip(cells, boxes)):
    l, t, r, bo = b
    dy = target_bottom - bo
    dx = round(cw / 2 - (l + r) / 2)
    # 平移后仍要留在格内；正常情况下余量充足，这里只是兜底。
    dx = max(-l, min(dx, cw - r))
    dy = max(-t, min(dy, ch - bo))
    moved = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    moved.paste(cell, (dx, dy))
    nb = bbox(moved)
    report_before.append((bo / ch, (l + r) / 2 / cw))
    report_after.append((nb[3] / ch, (nb[0] + nb[2]) / 2 / cw))
    out.paste(moved, ((i % 2) * cw, (i // 2) * ch))

out.save(dst)

def spread(vals):
    return max(vals) - min(vals)

bb = [x[0] for x in report_before]; ab = [x[0] for x in report_after]
bc = [abs(x[1] - 0.5) for x in report_before]; ac = [abs(x[1] - 0.5) for x in report_after]
print(f"底缘极差  {spread(bb):.4f} → {spread(ab):.4f}")
print(f"中心偏移  {max(bc):.4f} → {max(ac):.4f}")
print(f"底缘落点  {ab[0]:.4f}")
`

const out = execFileSync('python3', ['-c', PY, resolve(input), resolve(output)], { encoding: 'utf8' })
console.log(`${input}\n  → ${output}`)
console.log(out.trim().split('\n').map(l => `  ${l}`).join('\n'))
