import { mkdir, cp, rm, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const file of ['index.html', 'src/styles.css', 'src/app.js', 'src/audios.xml']) {
  const target = file.startsWith('src/') ? file.replace('src/', '') : file;
  await cp(path.join(root, file), path.join(dist, target));
}
const htmlPath = path.join(dist, 'index.html');
let html = await readFile(htmlPath, 'utf8');
html = html.replace(/href="src\/styles.css"/, 'href="styles.css"').replace(/src="src\/app.js"/, 'src="app.js"');
await writeFile(htmlPath, html);
console.log('Built dist/ with static assets');
