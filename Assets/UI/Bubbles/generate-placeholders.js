'use strict';

const fs = require('node:fs');
const path = require('node:path');

const assetsRoot = __dirname;
const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
const variants = ['card', 'menu'];
let created = 0;

for (const color of colors) {
    for (const variant of variants) {
        const name = `bubble-${color}-${variant}`;
        const pngPath = path.join(assetsRoot, `${name}.png`);
        const notePath = `${pngPath}.txt`;
        if (fs.existsSync(pngPath) || fs.existsSync(notePath)) continue;
        fs.writeFileSync(notePath, '');
        created += 1;
    }
}

console.log(`Bubble UI placeholders created: ${created}; color variants: ${colors.length * variants.length}.`);
