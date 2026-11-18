// Local only: copy a fresh Figma export (written by data/source/figma_scripts/export_render.js into _figma/)
// into the site: screens -> src/screens, image fills -> public/img, vector art -> public/gfx, styles -> design/.
import fs from 'node:fs';
const copyDir = (from, to, test = () => true) => { if (!fs.existsSync(from)) return 0; fs.mkdirSync(to, { recursive: true }); let n = 0; for (const f of fs.readdirSync(from)) if (test(f)) { fs.copyFileSync(`${from}/${f}`, `${to}/${f}`); n++; } return n; };
console.log('screens', copyDir('_figma/render', 'src/screens'));
console.log('images', copyDir('_figma/img', 'public/img'));
console.log('graphics', copyDir('_figma/gfx', 'public/gfx'));
if (fs.existsSync('_figma/styles.json')) fs.copyFileSync('_figma/styles.json', 'design/styles.json');
