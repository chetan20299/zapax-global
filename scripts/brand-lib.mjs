// Shared helpers for brand asset generation.
import opentype from 'opentype.js';
import { readFileSync } from 'node:fs';
import puppeteer from 'puppeteer-core';
import { executablePath, launchArgs } from './chrome.mjs';

const tagFont = opentype.parse(readFileSync('brand-src/fonts/archivo-112-600.ttf').buffer.slice(0));

// Convert text to vector outlines so logo files need no installed font.
export function taglinePath(text, size, letterSpacing = 0.01) {
  let x = 0;
  const parts = [];
  const glyphs = tagFont.stringToGlyphs(text);
  const scale = size / tagFont.unitsPerEm;
  glyphs.forEach((g, i) => {
    parts.push(g.getPath(x, size * 0.8, size).toPathData(2));
    x += g.advanceWidth * scale + letterSpacing * size;
    if (i < glyphs.length - 1) x += tagFont.getKerningValue(g, glyphs[i + 1]) * scale;
  });
  const width = x - letterSpacing * size;
  return { width, height: size, body: `<path d="${parts.join('')}"/>` };
}

export async function browser() {
  return puppeteer.launch({ executablePath, args: launchArgs });
}

// Render an SVG string to a transparent PNG at a given pixel width.
export async function svgToPng(page, svg, width, height, file) {
  await page.setViewport({ width: Math.round(width), height: Math.round(height), deviceScaleFactor: 1 });
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${width}px;height:${height}px}</style>${svg}`);
  await page.screenshot({ path: file, omitBackground: true, clip: { x: 0, y: 0, width: Math.round(width), height: Math.round(height) } });
}

// Render an SVG string to a vector PDF of exact physical size (mm).
export async function svgToPdf(page, svg, wmm, hmm, file, bg = 'transparent') {
  await page.setContent(`<style>@page{size:${wmm}mm ${hmm}mm;margin:0}html,body{margin:0;background:${bg}}svg{display:block;width:${wmm}mm;height:${hmm}mm}</style>${svg}`);
  await page.pdf({ path: file, width: `${wmm}mm`, height: `${hmm}mm`, printBackground: true, pageRanges: '1' });
}
