const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
require('dotenv').config();

const CACHE_DIR = process.env.CACHE_DIR || 'cache';
const IMAGE_PATH = path.join(CACHE_DIR, 'summary.png');

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
}

async function generateSummaryImage(total, top5, timestamp) {
  ensureCacheDir();
  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#111';
  ctx.font = 'bold 36px Sans';
  ctx.fillText(`Countries Summary`, 40, 70);

  ctx.font = '24px Sans';
  ctx.fillText(`Total countries: ${total}`, 40, 120);

  ctx.font = '20px Sans';
  ctx.fillText(`Last refresh: ${timestamp}`, 40, 160);

  ctx.fillText('Top 5 by estimated GDP:', 40, 210);

  let y = 250;
  ctx.font = '18px Sans';
  for (let i = 0; i < top5.length; i++) {
    const c = top5[i];
    const line = `${i + 1}. ${c.name} — ${Number(c.estimated_gdp).toLocaleString(undefined, {maximumFractionDigits:2})}`;
    ctx.fillText(line, 60, y);
    y += 34;
  }

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(IMAGE_PATH, buffer);
  return IMAGE_PATH;
}

function imageExists() {
  return fs.existsSync(IMAGE_PATH);
}

function getImagePath() {
  return IMAGE_PATH;
}

module.exports = { generateSummaryImage, imageExists, getImagePath };