'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const assetsRoot = __dirname;
const projectRoot = path.resolve(assetsRoot, '..', '..');
const source = fs.readFileSync(path.join(projectRoot, 'gemData.js'), 'utf8');
const sandbox = {};

vm.runInNewContext(`${source}\nglobalThis.gemTypes = Object.values(GEM_TIERS).flatMap(tier => tier.types);`, sandbox);

const gemTypes = JSON.parse(JSON.stringify(sandbox.gemTypes));
const infrastructure = [
    { slug: 'extractor-injection-rig', buttons: ['build', 'open', 'level'] },
    { slug: 'homeworld-communications-spire', buttons: ['build', 'open'] },
    { slug: 'reef', buttons: ['build', 'open', 'level', 'create-pearl', 'overseer'], controls: ['reef-abalone-select-ui'] },
    { slug: 'spinel-funhouse', buttons: ['build', 'open', 'level', 'create-spinel'] },
    { slug: 'gem-forge', buttons: ['build', 'open', 'level', 'blueprint'], controls: ['gem-forge-target-select-ui'] },
    { slug: 'diamond-shrine', buttons: ['build', 'open'] },
    { slug: 'healing-center', buttons: ['build', 'open', 'repair'] },
    { slug: 'soldier-ship', buttons: ['build', 'open', 'level', 'store', 'withdraw', 'overseer'], controls: ['structure-storage-select-ui', 'structure-overseer-select-ui'] },
    { slug: 'trial-building', buttons: ['build', 'open', 'court-trial'] },
    { slug: 'grand-ballet-hall', buttons: ['build', 'open', 'level', 'store', 'withdraw', 'overseer'], controls: ['structure-storage-select-ui', 'structure-overseer-select-ui'] },
    { slug: 'grand-ballroom', buttons: ['build', 'open', 'level', 'store', 'withdraw', 'overseer'], controls: ['structure-storage-select-ui', 'structure-overseer-select-ui'] },
    { slug: 'grand-theater', buttons: ['build', 'open', 'level', 'store', 'withdraw', 'overseer'], controls: ['structure-storage-select-ui', 'structure-overseer-select-ui'] },
    { slug: 'archives', buttons: ['build', 'open', 'level', 'store', 'withdraw'], controls: ['structure-storage-select-ui'] },
    { slug: 'organic-zoo', buttons: ['build', 'open'] },
    { slug: 'grand-circus', buttons: ['build', 'open', 'level', 'store', 'withdraw'], controls: ['structure-storage-select-ui'] },
    { slug: 'gathering-hall', buttons: ['build', 'open', 'host-ball'] },
    { slug: 'grand-palace', buttons: ['build', 'open', 'level', 'store', 'withdraw'], controls: ['structure-storage-select-ui'] }
];
const assets = {
    UIBoxes: new Set([
        'setup-empure-name-ui',
        'setup-game-mode-ui',
        'empire-designation-input-ui',
        'game-mode-select-ui',
        'diamond-prefix-input-ui',
        'diamond-color-select-button-ui',
        'quicktime-frequency-select-ui',
        'quicktime-event-popup-ui',
        'quicktime-event-choice-button-ui',
        'quicktime-event-close-button-ui',
        'notifications-button-ui',
        'reset-empire-button-ui',
        'reset-empire-confirmation-modal-ui',
        'reset-empire-confirm-button-ui',
        'reset-empire-cancel-button-ui',
        'header-closed-ui',
        'header-open-ui',
        'notification-scroll-panel-ui',
        'colonies-panel-ui',
        'colonies-grid-ui',
        'colony-card-ui',
        'found-colony-button-ui',
        'colony-control-modal-ui',
        'colony-close-button-ui',
        'colony-details-box-ui',
        'colony-gem-type-select-ui',
        'colony-kindergarten-button-ui',
        'diamond-kindergarten-button-ui',
        'colony-survey-button-ui',
        'colony-options-box-ui',
        'structure-control-modal-ui',
        'structure-modal-close-button-ui',
        'structure-menu-content-ui',
        'structures-log-ui',
        'bubbled-gems-toggle-button-ui',
        'bubbled-gems-panel-ui',
        'shattered-gems-toggle-button-ui',
        'shattered-gems-closed-ui',
        'shattered-gems-open-ui',
        'diamondslot-matriarch-ui',
        'diamondslot-military-ui',
        'diamondslot-justice-ui',
        'diamondslot-entertainer-ui',
        'diamond-color-wheel-ui',
        'launch-new-empire-button-ui',
        'roster-search-input-ui',
        'gem-type-filter-select-ui',
        'rebellion-war-panel-ui',
        'rebellion-war-progress-ui',
        'gem-rebellion-meter-ui',
        'pause-year-button-ui'
    ]),
    ProfileCards: new Set(),
    Infrastructure: new Set()
};

function slug(value) {
    return value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[’']/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

for (const type of [...gemTypes, 'placeholder']) assets.ProfileCards.add(`${slug(type)}-profile-card-ui`);

for (const item of infrastructure) {
    assets.Infrastructure.add(`${item.slug}-infrastructure-option-ui`);
    for (const action of item.buttons) assets.Infrastructure.add(`${item.slug}-${action}-button-ui`);
    for (const control of item.controls || []) assets.Infrastructure.add(control);
}

let created = 0;
for (const [group, assetNames] of Object.entries(assets)) {
    const groupPath = path.join(assetsRoot, group);
    fs.mkdirSync(groupPath, { recursive: true });
    for (const assetName of assetNames) {
        const pngPath = path.join(groupPath, `${assetName}.png`);
        const notePath = `${pngPath}.txt`;
        if (fs.existsSync(pngPath) || fs.existsSync(notePath)) continue;
        fs.writeFileSync(notePath, '');
        created += 1;
    }
}

console.log(`UI placeholders created: ${created}; profile cards: ${assets.ProfileCards.size}; infrastructure assets: ${assets.Infrastructure.size}; UI boxes: ${assets.UIBoxes.size}.`);