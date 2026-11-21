// Lists every [[placeholder]] value in content/ so the client can confirm them before launch.
// Usage: npm run placeholders
import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'content');
const files = ['site.json', ...fs.readdirSync(path.join(dir, 'pages')).map((f) => `pages/${f}`)];
let total = 0;
for (const f of files) {
  const lines = fs.readFileSync(path.join(dir, f), 'utf8').split('\n');
  const hits = [];
  lines.forEach((line, i) => {
    for (const m of line.matchAll(/\[\[([^\]]+)\]\]/g)) hits.push(`  line ${String(i + 1).padStart(4)}  ${m[1]}`);
  });
  if (hits.length) {
    console.log(`\ncontent/${f}  (${hits.length})`);
    console.log(hits.join('\n'));
    total += hits.length;
  }
}
console.log(`\n${total} placeholder value(s) to confirm. Replace [[value]] with the real value (no brackets).\n`);
