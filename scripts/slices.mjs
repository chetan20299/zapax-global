// Viewport-height slices of a page for visual review: node scripts/slices.mjs /path width
import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';
import { executablePath } from './chrome.mjs';
import { server } from './serve.mjs';
const [path = '/', w = '1280'] = process.argv.slice(2);
const h = +w < 600 ? 1400 : 1000;
await new Promise((r) => server.listen(8092, r));
await mkdir('qa-shots/slices', { recursive: true });
const b = await puppeteer.launch({ executablePath });
const p = await b.newPage();
await p.setViewport({ width: +w, height: h });
await p.goto('http://localhost:8092' + path, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 1200));
const total = await p.evaluate(() => document.documentElement.scrollHeight);
const name = path.replace(/\//g, '_');
for (let y = 0, i = 0; y < total; y += h, i++) await p.screenshot({ path: `qa-shots/slices/${name}${w}-${i}.png`, clip: { x: 0, y, width: +w, height: Math.min(h, total - y) }, captureBeyondViewport: true });
console.log(Math.ceil(total / h), 'slices');
await b.close(); server.close();
