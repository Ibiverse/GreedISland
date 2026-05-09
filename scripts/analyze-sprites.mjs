import { createCanvas, loadImage } from 'canvas';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, '../public/sprites');

function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2);
}

async function analyzeSheet(filename) {
  const img = await loadImage(join(DIR, filename));
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, img.width, img.height);
  const px = data.data;

  function getPixel(x, y) {
    const i = (y * img.width + x) * 4;
    return [px[i], px[i+1], px[i+2], px[i+3]];
  }

  // Sample background color from top-left corner (5x5 average)
  let bgR = 0, bgG = 0, bgB = 0, n = 0;
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      const [r,g,b,a] = getPixel(x, y);
      if (a > 200) { bgR += r; bgG += g; bgB += b; n++; }
    }
  }
  bgR = Math.round(bgR/n); bgG = Math.round(bgG/n); bgB = Math.round(bgB/n);
  const bgHex = `#${bgR.toString(16).padStart(2,'0')}${bgG.toString(16).padStart(2,'0')}${bgB.toString(16).padStart(2,'0')}`;

  // Find first non-background pixel row (top of first sprite)
  let firstSpriteRow = 0;
  for (let y = 0; y < img.height; y++) {
    let hasContent = false;
    for (let x = 0; x < img.width; x += 3) {
      const [r,g,b,a] = getPixel(x, y);
      if (a > 200 && colorDistance(r,g,b, bgR,bgG,bgB) > 25) {
        hasContent = true; break;
      }
    }
    if (hasContent) { firstSpriteRow = y; break; }
  }

  // Scan column-by-column to find background columns (vertical separators between frames)
  // A "separator column" is one where almost all pixels match background
  const colIsBg = [];
  for (let x = 0; x < img.width; x++) {
    let bgCount = 0, total = 0;
    for (let y = firstSpriteRow; y < Math.min(firstSpriteRow + 150, img.height); y++) {
      const [r,g,b,a] = getPixel(x, y);
      if (a > 200) {
        total++;
        if (colorDistance(r,g,b, bgR,bgG,bgB) < 30) bgCount++;
      }
    }
    colIsBg.push(total === 0 || bgCount / total > 0.85);
  }

  // Find runs of bg columns (separators) and content columns (sprites)
  // Count how many content-column runs there are → that's the number of columns
  let inContent = false;
  let contentStart = 0;
  const frames = [];
  for (let x = 0; x < img.width; x++) {
    if (!colIsBg[x] && !inContent) {
      inContent = true;
      contentStart = x;
    } else if (colIsBg[x] && inContent) {
      inContent = false;
      frames.push({ start: contentStart, end: x - 1, width: x - contentStart });
    }
  }
  if (inContent) frames.push({ start: contentStart, end: img.width - 1, width: img.width - contentStart });

  // Find consistent frame width: cluster the widths
  const widths = frames.map(f => f.width);
  widths.sort((a, b) => a - b);
  // Median
  const medianW = widths[Math.floor(widths.length / 2)];
  // Most frames should be within ±20% of median
  const goodWidths = widths.filter(w => Math.abs(w - medianW) / medianW < 0.25);
  const avgW = Math.round(goodWidths.reduce((s,w) => s+w, 0) / goodWidths.length);

  // Round to nearest 4
  const frameW = Math.round(avgW / 4) * 4;
  const numCols = Math.round(img.width / frameW);

  // Now scan rows similarly
  const rowIsBg = [];
  for (let y = 0; y < img.height; y++) {
    let bgCount = 0, total = 0;
    for (let x = 0; x < img.width; x += 2) {
      const [r,g,b,a] = getPixel(x, y);
      if (a > 200) {
        total++;
        if (colorDistance(r,g,b, bgR,bgG,bgB) < 30) bgCount++;
      }
    }
    rowIsBg.push(total === 0 || bgCount / total > 0.9);
  }

  let inContentRow = false;
  let rowStart = 0;
  const rowRanges = [];
  for (let y = 0; y < img.height; y++) {
    if (!rowIsBg[y] && !inContentRow) { inContentRow = true; rowStart = y; }
    else if (rowIsBg[y] && inContentRow) { inContentRow = false; rowRanges.push(y - rowStart); }
  }
  const medianH = rowRanges.sort((a,b)=>a-b)[Math.floor(rowRanges.length/2)] || 80;
  const frameH = Math.round(medianH / 4) * 4 + 8; // add a little padding
  const numRows = Math.round(img.height / frameH);

  console.log(`\n${filename} (${img.width}x${img.height}):`);
  console.log(`  Background: ${bgHex}`);
  console.log(`  First sprite row: y=${firstSpriteRow}`);
  console.log(`  Detected content columns: ${frames.length}`);
  console.log(`  Estimated frameWidth:  ${frameW} px  (${numCols} cols)`);
  console.log(`  Estimated frameHeight: ${frameH} px  (${numRows} rows)`);
  console.log(`  → frameWidth: ${frameW}, frameHeight: ${frameH}`);

  return { frameW, frameH, numCols, numRows, bgHex, firstSpriteRow };
}

await analyzeSheet('gon.png');
await analyzeSheet('defect.png');
await analyzeSheet('kuroro.png');
