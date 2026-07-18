import { readFile } from 'node:fs/promises';
const css = await readFile('src/styles.css', 'utf8');
const html = await readFile('src/../index.html', 'utf8');
const checks = [
  ['mobile-first viewport', html.includes('width=device-width, initial-scale=1')],
  ['dark theme default', css.includes('--bg: #090b10')],
  ['sticky player', css.includes('position: sticky')],
  ['responsive cards', css.includes('grid-template-columns')]
];
for (const [label, ok] of checks) {
  if (!ok) throw new Error(`Review failed: ${label}`);
}
console.log('Review passed: structure looks aligned with the requested UX goals.');
