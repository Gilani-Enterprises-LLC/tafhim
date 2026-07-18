import { readFile } from 'node:fs/promises';
const xml = await readFile('src/audios.xml', 'utf8');
const html = await readFile('dist/index.html', 'utf8');
const js = await readFile('dist/app.js', 'utf8');
const audioCount = (xml.match(/<audio /g) || []).length;
if (audioCount < 100) throw new Error(`Expected 100+ audio records, found ${audioCount}`);
for (const token of ['localStorage', 'theme-toggle', 'lastPlayedAudioId', 'audioHistory']) {
  if (!js.includes(token)) throw new Error(`Missing expected JS token: ${token}`);
}
if (!html.includes('theme-toggle')) throw new Error('Theme toggle missing from HTML');
console.log(`QA passed: ${audioCount} audio records, localStorage hooks, theme toggle present.`);
