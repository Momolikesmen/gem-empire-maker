'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const assetsRoot = __dirname;
const projectRoot = path.resolve(assetsRoot, '..', '..', '..');
const gemData = fs.readFileSync(path.join(projectRoot, 'gemData.js'), 'utf8');
const dataTables = fs.readFileSync(path.join(projectRoot, 'data-tables.js'), 'utf8');
const sandbox = {};

vm.runInNewContext(`${gemData}\n${dataTables}\nglobalThis.profileOptions = {
    castes: Object.values(GEM_TIERS).map(tier => tier.name),
    types: Object.values(GEM_TIERS).flatMap(tier => tier.types),
    placements: Object.keys(GEM_PLACEMENTS),
    personalities: [...new Set([...GENERATION_TABLES.GEM_PERSONALITIES, ...GENERATION_TABLES.DIAMOND_PERSONALITIES])],
    qualities: ['Perfect', 'Regular', 'Defective'],
    statuses: ['Fine', 'Cracked', 'Poofed', 'Bubbled', 'Shattered', 'Fused'],
    guards: ['Pearl', 'Ruby', 'Spinel', 'Zirconium']
};`, sandbox);

const options = JSON.parse(JSON.stringify(sandbox.profileOptions));
const assetNames = new Set([
    'profile-gallery-frame-ui',
    'profile-nameplate-ui',
    'profile-quote-ui',
    'profile-level-panel-ui',
    'profile-boosts-panel-ui',
    'profile-guards-panel-ui',
    'fusion-guard-ineligible-panel-ui',
    'fusion-quality-box-ui',
    'fusion-caste-box-ui',
    'fusion-type-box-ui',
    'fusion-prefix-input-ui',
    'fusion-prefix-save-button-ui'
    'fusion-prefix-input-ui',
    'fusion-prefix-save-button-ui'
]);

function slug(value) {
    return value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[’']/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

for (const caste of options.castes) assetNames.add(`caste-${slug(caste)}-ui`);
for (const type of new Set(options.types)) assetNames.add(`type-${slug(type)}-ui`);
for (const placement of options.placements) assetNames.add(`placement-${slug(placement)}-ui`);
for (const personality of options.personalities) assetNames.add(`personality-${slug(personality)}-ui`);
for (const quality of options.qualities) assetNames.add(`quality-${slug(quality)}-ui`);
for (const status of options.statuses) assetNames.add(`status-${slug(status)}-ui`);
for (const guard of options.guards) assetNames.add(`guard-${slug(guard)}-ui`);

function addPairAssets(kind, values) {
    for (let firstIndex = 0; firstIndex < values.length; firstIndex++) {
        for (let secondIndex = firstIndex; secondIndex < values.length; secondIndex++) {
            const pair = [slug(values[firstIndex]), slug(values[secondIndex])].sort();
            assetNames.add(`fusion-${kind}-${pair[0]}-${pair[1]}-box-ui`);
        }
    }
}

addPairAssets('placement', options.placements);
addPairAssets('personality', options.personalities);

let created = 0;
for (const assetName of assetNames) {
    const pngPath = path.join(assetsRoot, `${assetName}.png`);
    const notePath = `${pngPath}.txt`;
    if (fs.existsSync(pngPath) || fs.existsSync(notePath)) continue;
    fs.writeFileSync(notePath, '');
    created += 1;
}

console.log(`Profile UI placeholders created: ${created}; option-specific assets: ${assetNames.size}.`);
