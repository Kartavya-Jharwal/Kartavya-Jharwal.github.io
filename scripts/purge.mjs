import { PurgeCSS } from 'purgecss';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const result = await new PurgeCSS().purge({
  content: [
    join(root, 'index.html'),
    join(root, 'assets/js/site.js'),
    join(root, 'assets/js/enhancements.js'),
    join(root, 'assets/js/polymath.js'),
  ],
  css: [
    join(root, 'assets/css/main.css'),
    join(root, 'assets/css/enhancements.css'),
    join(root, 'assets/css/theme.css'),
  ],
  safelist: [
    'active',
    'is-preload',
    'theme-dark',
    'keyboard-nav',
    'modal-open',
    'easter-egg-mode',
    'no-js',
    /^fa-/,
    /^fas/,
    /^fab/,
    /^icon/,
    'brands',
    'solid',
    'label',
  ],
  rejected: true,
});

const outDir = join(root, 'assets/css');
for (const file of result) {
  const name = file.file.includes('main.css')
    ? 'core.css'
    : file.file.includes('enhancements.css')
      ? 'ui.css'
      : 'theme.css';
  writeFileSync(join(outDir, name), file.css);
}

const summary = result.map((f) => ({
  source: f.file.split(/[/\\]/).pop(),
  output: f.file.includes('main.css') ? 'core.css' : f.file.includes('enhancements') ? 'ui.css' : 'theme.css',
  bytes: f.css.length,
  rejectedRules: f.rejected?.length ?? 0,
}));

writeFileSync(join(root, 'purge-summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
