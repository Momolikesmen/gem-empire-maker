'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const musicRoot = __dirname;
const projectRoot = path.resolve(musicRoot, '..', '..');
const gemDataSource = fs.readFileSync(path.join(projectRoot, 'gemData.js'), 'utf8');
const sandbox = {};

vm.runInNewContext(`${gemDataSource}\nglobalThis.gemTypes = Object.values(GEM_TIERS).flatMap(tier => tier.types);`, sandbox);

function slug(value) {
    return value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[’']/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

const trackNames = [
    'start-screen',
    'main-game-screen',
    'diamond-matriarch',
    'diamond-justice',
    'diamond-military',
    'diamond-entertainer',
    'fusion-1',
    'fusion-2',
    'fusion-3',
    'fusion-4',
    'colony-menu',
    'profile-poofed',
    'profile-shattered',
    'gem-poof-sfx'
];

for (const type of sandbox.gemTypes) {
    trackNames.push(`profile-${slug(type)}`);
}

const structures = [
    'extractor-injection-rig', 'reef', 'spinel-funhouse', 'gem-forge', 'diamond-shrine',
    'healing-center', 'soldier-ship', 'trial-building', 'grand-ballet-hall', 'grand-ballroom',
    'grand-theater', 'archives', 'organic-zoo', 'grand-circus', 'gathering-hall', 'grand-palace'
];

for (const struct of structures) {
    trackNames.push(`structure-${struct}`);
}

fs.mkdirSync(musicRoot, { recursive: true });

let created = 0;
for (const track of trackNames) {
    const mp3Path = path.join(musicRoot, `${track}.mp3`);
    const notePath = `${mp3Path}.txt`;
    if (!fs.existsSync(mp3Path) && !fs.existsSync(notePath)) {
        fs.writeFileSync(notePath, '');
        created += 1;
    }
}

console.log(`Music placeholders created: ${created} out of ${trackNames.length} total tracks.`);
