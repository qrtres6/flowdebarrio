// Renders the app icons from brand/source-icon.jpg into public/.
// Recolors the grayscale logo to a gold duotone, recenters it on a
// black tile, and exports every size the PWA / Play Store needs.
// Run with: node brand/render-icons.mjs   (needs `npm i -D sharp`)
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const SRC = fileURLToPath(new URL('./source-icon.jpg', import.meta.url));

// Gold duotone ramp: maps luminance (0..1) to an RGB colour.
const stops = [
  [0.0, [8, 6, 3]],
  [0.42, [140, 98, 38]],
  [0.74, [212, 168, 87]],
  [1.0, [250, 234, 180]],
];
function ramp(t) {
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [a, ca] = stops[i - 1];
      const [b, cb] = stops[i];
      const k = (t - a) / (b - a);
      return [
        ca[0] + (cb[0] - ca[0]) * k,
        ca[1] + (cb[1] - ca[1]) * k,
        ca[2] + (cb[2] - ca[2]) * k,
      ];
    }
  }
  return stops[stops.length - 1][1];
}

// 1. Load source and recolour to gold.
const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const gold = Buffer.alloc(W * H * 3);
for (let p = 0; p < W * H; p++) {
  const r = data[p * 3], g = data[p * 3 + 1], b = data[p * 3 + 2];
  let t = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  t = Math.pow(t, 0.92);
  const c = ramp(t);
  gold[p * 3] = c[0];
  gold[p * 3 + 1] = c[1];
  gold[p * 3 + 2] = c[2];
}

// 2. Detect the logo bounding box: flood-fill the black background
//    from the borders so interior dark areas are kept.
const lum = (i) => 0.299 * data[i * 3] + 0.587 * data[i * 3 + 1] + 0.114 * data[i * 3 + 2];
const TH = 60;
const bg = new Uint8Array(W * H);
const stack = [];
for (let x = 0; x < W; x++) stack.push(x, x + (H - 1) * W);
for (let y = 0; y < H; y++) stack.push(y * W, W - 1 + y * W);
while (stack.length) {
  const p = stack.pop();
  if (bg[p] || lum(p) >= TH) continue;
  bg[p] = 1;
  const x = p % W, y = (p - x) / W;
  if (x > 0) stack.push(p - 1);
  if (x < W - 1) stack.push(p + 1);
  if (y > 0) stack.push(p - W);
  if (y < H - 1) stack.push(p + W);
}
let minX = W, minY = H, maxX = 0, maxY = 0;
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++)
    if (!bg[y * W + x]) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
const bw = maxX - minX + 1, bh = maxY - minY + 1;

const goldPng = await sharp(gold, { raw: { width: W, height: H, channels: 3 } }).png().toBuffer();
const content = await sharp(goldPng)
  .extract({ left: minX, top: minY, width: bw, height: bh })
  .toBuffer();

// 3. Compose a black tile with the logo centered, then export each size.
async function tile(size, frac) {
  const inner = Math.round(size * frac);
  const scale = Math.min(inner / bw, inner / bh);
  const rw = Math.round(bw * scale), rh = Math.round(bh * scale);
  const resized = await sharp(content).resize(rw, rh).toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 3, background: '#000000' },
  })
    .composite([{ input: resized, left: Math.round((size - rw) / 2), top: Math.round((size - rh) / 2) }])
    .png();
}

const targets = [
  { file: 'public/icon-192.png', size: 192, frac: 0.84 },
  { file: 'public/icon-512.png', size: 512, frac: 0.84 },
  { file: 'public/icon-maskable-512.png', size: 512, frac: 0.66 },
  { file: 'public/apple-touch-icon.png', size: 180, frac: 0.84 },
  { file: 'public/favicon.png', size: 64, frac: 0.86 },
  { file: 'brand/playstore-icon-512.png', size: 512, frac: 0.84 },
];

for (const t of targets) {
  await (await tile(t.size, t.frac)).toFile(t.file);
  console.log('wrote', t.file, t.size + 'px');
}
