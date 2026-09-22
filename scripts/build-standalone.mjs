import { build } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

async function buildStandalone() {
  console.log('Building standalone Health Wallet bundle...');
  await build({
    build: {
      rollupOptions: {
        input: 'index.dev.html'
      }
    }
  });

  const distDevHtml = path.resolve('dist', 'index.dev.html');
  const distHtml = path.resolve('dist', 'index.html');
  const rootHtml = path.resolve('index.html');

  if (fs.existsSync(distDevHtml)) {
    fs.copyFileSync(distDevHtml, distHtml);
    fs.copyFileSync(distDevHtml, rootHtml);
    fs.unlinkSync(distDevHtml);
    console.log('Successfully created standalone index.html at:');
    console.log('  - ' + rootHtml + ' (' + (fs.statSync(rootHtml).size / 1024).toFixed(1) + ' KB)');
    console.log('  - ' + distHtml + ' (' + (fs.statSync(distHtml).size / 1024).toFixed(1) + ' KB)');
  }
}

buildStandalone().catch((err) => {
  console.error(err);
  process.exit(1);
});
