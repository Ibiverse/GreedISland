/**
 * Analyzes killua.png, removes the purple/dark background,
 * and prints the frame dimensions for spriteConfig.ts.
 */
import { createCanvas, loadImage } from 'canvas';
import { writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, '../public/sprites');
const FILE = join(DIR, 'killua.png');

if (!existsSync(FILE)) {
  console.error('killua.png not found in public/sprites/ — drag it there first.');
  process.exit(1);
}

const img = await loadImage(FILE);
console.log(`killua.png: ${img.width} x ${img.height}`);

const canvas = createCanvas(img.width, img.height);
const ctx = canvas.getContext('2d');
ctx.drawImage(img, 0, 0);
const imageData = ctx.getImageData(0, 0, img.width, img.height);
const px = imageData.data;

// Sample background from corners
let bgR = 0, bgG = 0, bgB = 0, n = 0;
for (const [sx, sy] of [[0,0],[img.width-1,0],[0,img.height-1],[img.width-1,img.height-1],[Math.floor(img.width/2),0]]) {
  const i = (sy * img.width + sx) * 4;
  if (px[i+3] > 100) { bgR += px[i]; bgG += px[i+1]; bgB += px[i+2]; n++; }
}
if (n > 0) { bgR=Math.round(bgR/n); bgG=Math.round(bgG/n); bgB=Math.round(bgB/n); }
else { bgR=58; bgG=36; bgB=80; } // fallback: aseprite dark purple
console.log(`Detected bg: rgb(${bgR},${bgG},${bgB})`);

// Remove background
function colorDist(r1,g1,b1,r2,g2,b2){return Math.sqrt((r1-r2)**2+(g1-g2)**2+(b1-b2)**2);}
const tol = 55;
let removed = 0;
for (let i = 0; i < px.length; i += 4) {
  if (px[i+3] < 10) continue;
  const dist = colorDist(px[i],px[i+1],px[i+2],bgR,bgG,bgB);
  if (dist < tol) { px[i+3]=0; removed++; }
  else if (dist < tol+25) { px[i+3]=Math.round(px[i+3]*(dist-tol)/25); }
}
ctx.putImageData(imageData, 0, 0);
writeFileSync(FILE, canvas.toBuffer('image/png'));
console.log(`Removed ${removed} background pixels.`);

// Find clean column divisors
console.log('\nPossible column counts (width divisors):');
for (let cols = 1; cols <= 20; cols++) {
  if (img.width % cols === 0) {
    const fw = img.width / cols;
    console.log(`  ${cols} cols x ${fw}px each`);
  }
}
console.log('\nPossible row counts (height divisors):');
for (let rows = 1; rows <= 30; rows++) {
  if (img.height % rows === 0) {
    const fh = img.height / rows;
    console.log(`  ${rows} rows x ${fh}px each`);
  }
}
