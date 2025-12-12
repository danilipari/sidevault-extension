import fs from 'fs';
import path from 'path';
import { deflateSync } from 'zlib';

// CRC32 implementation
function crc32(data) {
  let crc = 0xFFFFFFFF;
  const table = makeCRCTable();
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeCRCTable() {
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  return table;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crcBuf]);
}

function createIconPNG(size) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData.writeUInt8(8, 8);   // bit depth
  ihdrData.writeUInt8(2, 9);   // color type RGB
  ihdrData.writeUInt8(0, 10);  // compression
  ihdrData.writeUInt8(0, 11);  // filter
  ihdrData.writeUInt8(0, 12);  // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Colors
  const blue = [59, 130, 246];   // #3b82f6
  const white = [255, 255, 255];
  const gray = [148, 163, 184];  // #94a3b8

  const rawData = [];
  const margin = Math.floor(size * 0.12);
  const docLeft = margin + Math.floor(size * 0.08);
  const docRight = size - margin - Math.floor(size * 0.08);
  const docTop = margin;
  const docBottom = size - margin;
  const foldSize = Math.floor(size * 0.18);
  const cornerRadius = Math.floor(size * 0.06);

  for (let y = 0; y < size; y++) {
    rawData.push(0); // filter byte
    for (let x = 0; x < size; x++) {
      // Document bounds
      const inDocX = x >= docLeft && x < docRight;
      const inDocY = y >= docTop && y < docBottom;

      // Folded corner (top-right)
      const inFoldCorner = x >= docRight - foldSize && y < docTop + foldSize;
      const foldDiagonal = (x - (docRight - foldSize)) + (y - docTop);
      const inFold = inFoldCorner && foldDiagonal < foldSize;

      // Rounded corners
      const inTopLeft = x < docLeft + cornerRadius && y < docTop + cornerRadius;
      const inBottomLeft = x < docLeft + cornerRadius && y >= docBottom - cornerRadius;
      const inBottomRight = x >= docRight - cornerRadius && y >= docBottom - cornerRadius;

      let inRoundedCorner = false;
      if (inTopLeft) {
        const dx = x - (docLeft + cornerRadius);
        const dy = y - (docTop + cornerRadius);
        inRoundedCorner = dx * dx + dy * dy > cornerRadius * cornerRadius;
      }
      if (inBottomLeft) {
        const dx = x - (docLeft + cornerRadius);
        const dy = y - (docBottom - cornerRadius);
        inRoundedCorner = dx * dx + dy * dy > cornerRadius * cornerRadius;
      }
      if (inBottomRight) {
        const dx = x - (docRight - cornerRadius);
        const dy = y - (docBottom - cornerRadius);
        inRoundedCorner = dx * dx + dy * dy > cornerRadius * cornerRadius;
      }

      // Check if inside document
      const inDoc = inDocX && inDocY && !inFold && !inRoundedCorner;

      // Lines inside document
      const lineHeight = Math.max(1, Math.floor(size * 0.05));
      const lineLeft = docLeft + Math.floor(size * 0.12);
      const lineRight = docRight - Math.floor(size * 0.12);
      const line1Y = Math.floor(size * 0.42);
      const line2Y = Math.floor(size * 0.54);
      const line3Y = Math.floor(size * 0.66);

      const onLine1 = y >= line1Y && y < line1Y + lineHeight && x >= lineLeft && x < lineRight;
      const onLine2 = y >= line2Y && y < line2Y + lineHeight && x >= lineLeft && x < lineRight;
      const onLine3 = y >= line3Y && y < line3Y + lineHeight && x >= lineLeft && x < lineRight - Math.floor(size * 0.15);

      // Fold triangle (shadow area)
      const inFoldTriangle = inFoldCorner && foldDiagonal >= foldSize * 0.7 && foldDiagonal < foldSize;

      let color;
      if (inDoc) {
        if (onLine1 || onLine2 || onLine3) {
          color = gray;
        } else {
          color = white;
        }
      } else if (inFoldTriangle) {
        color = [200, 210, 220]; // light gray for fold
      } else {
        color = blue;
      }

      rawData.push(color[0], color[1], color[2]);
    }
  }

  const compressed = deflateSync(Buffer.from(rawData), { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate icons
const iconDir = path.join(process.cwd(), 'public', 'icons');

// Ensure directory exists
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// Generate all sizes (matching manifest.json naming)
[16, 48, 128].forEach(size => {
  const png = createIconPNG(size);
  const filename = `icon${size}.png`;
  fs.writeFileSync(path.join(iconDir, filename), png);
  console.log(`Created ${filename} (${png.length} bytes)`);
});

console.log('\nDone! Icons generated successfully.');
