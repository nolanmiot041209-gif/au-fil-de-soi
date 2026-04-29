const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.join(__dirname, '..', 'public', 'assets');
fs.mkdirSync(OUT, { recursive: true });

function clamp(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function crc32(buffer) {
  let crc = -1;
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function png(width, height, painter) {
  const rows = [];
  for (let y = 0; y < height; y += 1) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0;
    for (let x = 0; x < width; x += 1) {
      const [r, g, b, a = 255] = painter(x / width, y / height, x, y);
      const offset = 1 + x * 4;
      row[offset] = clamp(r);
      row[offset + 1] = clamp(g);
      row[offset + 2] = clamp(b);
      row[offset + 3] = clamp(a);
    }
    rows.push(row);
  }
  const raw = Buffer.concat(rows);
  const header = Buffer.from('\x89PNG\r\n\x1a\n', 'binary');
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([header, chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

function softCircle(x, y, cx, cy, radius) {
  const distance = Math.hypot(x - cx, y - cy);
  return Math.max(0, 1 - distance / radius);
}

function steam(x, y, offset) {
  const wave = Math.sin((y * 18 + offset) + Math.sin(y * 11) * 0.8) * 0.025;
  return Math.max(0, 1 - Math.abs(x - 0.52 - wave) / 0.018) * Math.max(0, 1 - y / 0.7);
}

function heroPainter(x, y) {
  const warm = [224, 206, 177];
  const cream = [248, 242, 230];
  const sage = [121, 150, 121];
  const cedar = [95, 70, 55];
  const light = [255, 250, 239];
  let r = mix(cream[0], warm[0], y * 0.82);
  let g = mix(cream[1], warm[1], y * 0.82);
  let b = mix(cream[2], warm[2], y * 0.82);

  const roomShadow = softCircle(x, y, 0.18, 0.92, 0.9);
  r = mix(r, cedar[0], roomShadow * 0.24);
  g = mix(g, cedar[1], roomShadow * 0.22);
  b = mix(b, cedar[2], roomShadow * 0.2);

  const basin = Math.max(0, 1 - Math.abs(Math.hypot((x - 0.59) / 0.26, (y - 0.66) / 0.15) - 1) / 0.2);
  r = mix(r, 238, basin * 0.85);
  g = mix(g, 230, basin * 0.85);
  b = mix(b, 214, basin * 0.85);

  const basinInside = softCircle(x, y, 0.59, 0.66, 0.22);
  r = mix(r, 198, basinInside * 0.35);
  g = mix(g, 212, basinInside * 0.35);
  b = mix(b, 204, basinInside * 0.35);

  const face = softCircle(x, y, 0.45, 0.58, 0.13);
  r = mix(r, 207, face * 0.8);
  g = mix(g, 163, face * 0.64);
  b = mix(b, 137, face * 0.55);

  const hair = softCircle(x, y, 0.49, 0.58, 0.12);
  r = mix(r, 54, hair * 0.58);
  g = mix(g, 45, hair * 0.58);
  b = mix(b, 40, hair * 0.58);

  const leaf1 = Math.max(0, 1 - Math.hypot((x - 0.78) / 0.08, (y - 0.33) / 0.22));
  const leaf2 = Math.max(0, 1 - Math.hypot((x - 0.84) / 0.07, (y - 0.43) / 0.2));
  const leaves = Math.max(leaf1, leaf2);
  r = mix(r, sage[0], leaves * 0.75);
  g = mix(g, sage[1], leaves * 0.8);
  b = mix(b, sage[2], leaves * 0.75);

  const vapor = Math.max(steam(x, y, 0), steam(x - 0.08, y, 1.7), steam(x + 0.09, y, 3.2));
  r = mix(r, light[0], vapor * 0.48);
  g = mix(g, light[1], vapor * 0.48);
  b = mix(b, light[2], vapor * 0.48);

  const grain = (Math.sin(x * 900 + y * 300) + Math.sin(x * 230 + y * 760)) * 2.5;
  return [r + grain, g + grain, b + grain, 255];
}

function ritualPainter(x, y) {
  const bg = [238, 242, 232];
  let r = mix(bg[0], 206, y);
  let g = mix(bg[1], 216, y);
  let b = mix(bg[2], 202, y);
  const towel = softCircle(x, y, 0.5, 0.66, 0.34);
  r = mix(r, 255, towel * 0.6);
  g = mix(g, 250, towel * 0.58);
  b = mix(b, 238, towel * 0.58);
  const bowl = softCircle(x, y, 0.52, 0.46, 0.22);
  r = mix(r, 122, bowl * 0.48);
  g = mix(g, 148, bowl * 0.48);
  b = mix(b, 132, bowl * 0.48);
  const drop = softCircle(x, y, 0.55, 0.35, 0.08);
  r = mix(r, 245, drop * 0.72);
  g = mix(g, 249, drop * 0.72);
  b = mix(b, 242, drop * 0.72);
  return [r, g, b, 255];
}

function roomPainter(x, y) {
  let r = mix(250, 184, y);
  let g = mix(246, 170, y);
  let b = mix(237, 138, y);
  const panel = Math.abs(Math.sin(x * 26)) < 0.08 ? 0.16 : 0;
  r = mix(r, 104, panel);
  g = mix(g, 80, panel);
  b = mix(b, 66, panel);
  const bed = Math.max(0, 1 - Math.hypot((x - 0.5) / 0.48, (y - 0.73) / 0.16));
  r = mix(r, 245, bed * 0.85);
  g = mix(g, 238, bed * 0.82);
  b = mix(b, 223, bed * 0.82);
  const plant = Math.max(0, 1 - Math.hypot((x - 0.82) / 0.12, (y - 0.48) / 0.28));
  r = mix(r, 82, plant * 0.58);
  g = mix(g, 119, plant * 0.68);
  b = mix(b, 86, plant * 0.58);
  return [r, g, b, 255];
}

function carePainter(x, y) {
  let r = mix(252, 219, y);
  let g = mix(248, 205, y);
  let b = mix(238, 190, y);
  const stone = softCircle(x, y, 0.35, 0.52, 0.21);
  r = mix(r, 125, stone * 0.55);
  g = mix(g, 128, stone * 0.55);
  b = mix(b, 116, stone * 0.55);
  const bottle = Math.max(0, 1 - Math.hypot((x - 0.62) / 0.11, (y - 0.45) / 0.24));
  r = mix(r, 102, bottle * 0.64);
  g = mix(g, 130, bottle * 0.7);
  b = mix(b, 112, bottle * 0.64);
  const highlight = softCircle(x, y, 0.58, 0.31, 0.04);
  r = mix(r, 255, highlight * 0.72);
  g = mix(g, 255, highlight * 0.72);
  b = mix(b, 248, highlight * 0.72);
  return [r, g, b, 255];
}

const assets = [
  ['hero-spa.png', 1600, 1000, heroPainter],
  ['gallery-ritual.png', 900, 1100, ritualPainter],
  ['gallery-room.png', 900, 720, roomPainter],
  ['gallery-care.png', 900, 1000, carePainter]
];

for (const [name, width, height, painter] of assets) {
  fs.writeFileSync(path.join(OUT, name), png(width, height, painter));
  console.log(`generated ${name}`);
}
