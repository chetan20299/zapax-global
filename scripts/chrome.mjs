import { existsSync } from 'node:fs';
const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);
export const executablePath = candidates.find(existsSync);
if (!executablePath) throw new Error('Chrome not found. Set CHROME_PATH.');
// Greyscale text anti-aliasing: subpixel (LCD) rendering adds coloured fringes, which are off-palette in brand artwork.
export const launchArgs = ['--disable-lcd-text', '--font-render-hinting=none'];
