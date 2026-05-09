/**
 * Removes solid-color backgrounds from sprite sheets.
 * Pass explicit bgR/bgG/bgB when corner sampling fails (e.g. defect's black bg).
 */
import { createCanvas, loadImage } from 'canvas';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, '../public/sprites');

function colorDist(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2);
}

async function removeBg(filename, bgR, bgG, bgB, tolerance = 50) {
  const img = await loadImage(join(DIR, filename));
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, img.width, img.height);
  const px = imageData.data;

  console.log(`${filename} (${img.width}x${img.height}): removing bg rgb(${bgR},${bgG},${bgB}) tol=${tolerance}`);

  let removed = 0;
  for (let i = 0; i < px.length; i += 4) {
    if (px[i+3] < 10) continue; // already transparent
    const dist = colorDist(px[i], px[i+1], px[i+2], bgR, bgG, bgB);
    if (dist < tolerance) {
      px[i+3] = 0;
      removed++;
    } else if (dist < tolerance + 25) {
      // feather edges
      const t = (dist - tolerance) / 25;
      px[i+3] = Math.round(px[i+3] * t);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  writeFileSync(join(DIR, filename), canvas.toBuffer('image/png'));
  const total = img.width * img.height;
  console.log(`  → removed ${removed}/${total} px (${(removed/total*100).toFixed(1)}%)`);
}

// Gon: blue-purple #8080ff
await removeBg('gon.png', 128, 128, 255, 55);

// Kuroro: teal #006666
await removeBg('kuroro.png', 0, 102, 102, 55);

// Defect: pure black background — force explicit
await removeBg('defect.png', 0, 0, 0, 45);

// New Killua sheet if present
import { existsSync } from 'fs';
if (existsSync(join(DIR, 'killua.png'))) {
  // Dark purple/violet background of the aseprite preview: ~#3a2450
  await removeBg('killua.png', 58, 36, 80, 55);
  console.log('killua.png processed.');
}

console.log('\n✅ All backgrounds removed.');
