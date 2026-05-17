// Renders the app icons from brand/icon.svg into public/.
// Run with: node brand/render-icons.mjs   (needs `npm i -D sharp`)
import sharp from 'sharp';
import { readFileSync } from 'fs';

const svg = readFileSync(new URL('./icon.svg', import.meta.url));

const targets = [
  { file: 'public/icon-192.png', size: 192 },
  { file: 'public/icon-512.png', size: 512 },
  { file: 'public/icon-maskable-512.png', size: 512 },
  { file: 'public/apple-touch-icon.png', size: 180 },
  { file: 'public/favicon.png', size: 64 },
];

for (const t of targets) {
  await sharp(svg, { density: 384 })
    .resize(t.size, t.size)
    .png()
    .toFile(t.file);
  console.log('wrote', t.file, t.size + 'px');
}
