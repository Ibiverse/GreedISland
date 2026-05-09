import { createCanvas, loadImage } from 'canvas';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, '../public/sprites');

for (const name of ['gon.png', 'defect.png', 'kuroro.png']) {
  const img = await loadImage(join(DIR, name));
  console.log(`${name}: ${img.width} x ${img.height}`);
}
