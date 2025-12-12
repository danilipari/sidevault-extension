const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];
const iconDir = path.join(__dirname, 'public', 'icons');

// Create a simple SVG icon
function createSvgIcon(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="#3b82f6">
  <rect x="3" y="3" width="18" height="18" rx="2" fill="#3b82f6"/>
  <path d="M7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z" fill="white"/>
</svg>`;
}

// Ensure directory exists
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// Create SVG icons (Chrome supports SVG icons)
sizes.forEach(size => {
  const svg = createSvgIcon(size);
  // Save as PNG placeholder (we'll use a simple approach)
  fs.writeFileSync(path.join(iconDir, `icon-${size}.svg`), svg);
});

console.log('Icons created successfully');
