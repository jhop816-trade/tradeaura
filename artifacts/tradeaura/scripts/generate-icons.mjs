import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const outDir = resolve(root, "public/icons");
mkdirSync(outDir, { recursive: true });

const iconSvg = readFileSync(resolve(outDir, "icon.svg"), "utf8");

function renderPng(svgStr, size) {
  const resvg = new Resvg(svgStr, {
    fitTo: { mode: "width", value: size },
    font: { loadSystemFonts: false },
  });
  return resvg.render().asPng();
}

// Icon sizes
const iconSizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "icon-180.png", size: 180 },
  { name: "icon-167.png", size: 167 },
  { name: "icon-152.png", size: 152 },
];

for (const { name, size } of iconSizes) {
  const png = renderPng(iconSvg, size);
  writeFileSync(resolve(outDir, name), png);
  console.log(`Generated ${name} (${size}x${size})`);
}

// Splash screens — dark bg + centered logo + text
function splashSvg(w, h) {
  const logoSize = Math.round(Math.min(w, h) * 0.18);
  const cx = w / 2;
  const cy = h / 2;
  const logoHalf = logoSize / 2;
  const fontSize = Math.round(logoSize * 0.32);
  const textY = cy + logoHalf + Math.round(fontSize * 1.8);

  // Scale the chart polyline to fit within the logo area
  // Original viewBox 512x512, points: 80,370 185,275 265,315 355,195 440,130
  const scale = logoSize / 512;
  const points = [
    [80, 370], [185, 275], [265, 315], [355, 195], [440, 130],
  ]
    .map(([x, y]) => `${cx - logoHalf + x * scale},${cy - logoHalf + y * scale}`)
    .join(" ");
  const dotCx = cx - logoHalf + 440 * scale;
  const dotCy = cy - logoHalf + 130 * scale;
  const dotR = Math.round(22 * scale);
  const sw = Math.round(34 * scale);
  const rx = Math.round(114 * scale);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="#0a0d14"/>
  <rect x="${cx - logoHalf}" y="${cy - logoHalf}" width="${logoSize}" height="${logoSize}" rx="${rx}" fill="#0a0d14" stroke="#22c55e22" stroke-width="2"/>
  <polyline points="${points}" fill="none" stroke="#22c55e" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="${dotCx}" cy="${dotCy}" r="${dotR}" fill="#22c55e"/>
  <text x="${cx}" y="${textY}" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="${fontSize}" font-weight="700" fill="#e2e8f0" letter-spacing="-0.5">TradeAura</text>
</svg>`;
}

const splashes = [
  { name: "splash-1170x2532.png", w: 1170, h: 2532 },
  { name: "splash-1536x2048.png", w: 1536, h: 2048 },
];

for (const { name, w, h } of splashes) {
  const svg = splashSvg(w, h);
  const png = renderPng(svg, w);
  writeFileSync(resolve(outDir, name), png);
  console.log(`Generated ${name} (${w}x${h})`);
}

console.log("All icons generated.");
