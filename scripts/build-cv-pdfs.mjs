// Renders every CV style in both languages to PDF from the built site, so each download matches the page exactly.
// Run `npm run cv:pdf` after changing anything in src/data/resume.ts. It needs Playwright with Chromium installed.
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { preview } from 'vite';

const STYLES = ['designed', 'ats', 'compact', 'classic'];
const LANGUAGES = ['en', 'ar'];
const OUT = new URL('../public/downloads/', import.meta.url);

async function loadChromium() {
  // PLAYWRIGHT_MODULE can point at a global install, e.g. $(npm root -g)/playwright/index.mjs.
  const candidates = [process.env.PLAYWRIGHT_MODULE, 'playwright', 'playwright-core'].filter(Boolean);
  for (const candidate of candidates) {
    try {
      const target = candidate.startsWith('/') ? pathToFileURL(candidate).href : candidate;
      return (await import(target)).chromium;
    } catch {
      // try the next candidate
    }
  }
  throw new Error('Playwright not found. Install it, or set PLAYWRIGHT_MODULE to its index.mjs path.');
}

const server = await preview({ preview: { port: 4179, strictPort: true } });
const base = 'http://localhost:4179';
const chromium = await loadChromium();
const browser = await chromium.launch();
await mkdir(OUT, { recursive: true });

let hash = '';
const files = [];
try {
  for (const style of STYLES) {
    for (const language of LANGUAGES) {
      const page = await browser.newPage();
      await page.goto(`${base}${style === 'designed' ? '/cv' : `/cv-${style}`}?lang=${language}`, {
        waitUntil: 'networkidle',
      });
      await page.evaluate(() => document.fonts.ready);
      hash = await page.getAttribute('[data-cv-hash]', 'data-cv-hash');
      const name = `mohammed-nabil-cv-${style}-${language}.pdf`;
      await page.pdf({
        path: new URL(name, OUT).pathname,
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
      });
      files.push(name);
      await page.close();
    }
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}

await writeFile(new URL('cv-manifest.json', OUT), `${JSON.stringify({ hash, files }, null, 2)}\n`);
console.log(`Wrote ${files.length} PDFs, content hash ${hash}`);
