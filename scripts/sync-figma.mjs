// Local only: copy a fresh Figma export (written by data/source/figma_scripts/export_render.js into _figma/)
// into the site: screens -> src/screens, image fills -> public/img, vector art -> public/gfx, styles -> design/.
import fs from 'node:fs';
const copyDir = (from, to, test = () => true) => { if (!fs.existsSync(from)) return 0; fs.mkdirSync(to, { recursive: true }); let n = 0; for (const f of fs.readdirSync(from)) if (test(f)) { fs.copyFileSync(`${from}/${f}`, `${to}/${f}`); n++; } return n; };
console.log('screens', copyDir('_figma/render', 'src/screens'));
console.log('images', copyDir('_figma/img', 'public/img'));
console.log('graphics', copyDir('_figma/gfx', 'public/gfx'));
if (fs.existsSync('_figma/styles.json')) fs.copyFileSync('_figma/styles.json', 'design/styles.json');

// Drop vector-art nodes whose SVG Figma could not export (layers with nothing visible): they would only 404.
const have = new Set(fs.readdirSync('public/gfx').map(f => f.replace(/\.svg$/, '')));
let dropped = 0;
for (const f of fs.readdirSync('src/screens')) {
  const spec = JSON.parse(fs.readFileSync(`src/screens/${f}`, 'utf8'));
  const prune = n => { if (n.k) n.k = n.k.filter(k => { if (k.t === 'G' && !have.has(k.g)) { dropped++; return false; } prune(k); return true; }); };
  prune(spec);
  fs.writeFileSync(`src/screens/${f}`, JSON.stringify(spec));
}
console.log('empty graphics removed', dropped);
