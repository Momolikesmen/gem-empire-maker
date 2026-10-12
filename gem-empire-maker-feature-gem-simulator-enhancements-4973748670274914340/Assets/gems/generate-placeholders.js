'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const assetsRoot = __dirname;
const projectRoot = path.resolve(assetsRoot, '..', '..');
const gemDataSource = fs.readFileSync(path.join(projectRoot, 'gemData.js'), 'utf8');
const sandbox = {};

vm.runInNewContext(`${gemDataSource}
globalThis.gemAssetConfig = {
    types: Object.values(GEM_TIERS).flatMap(tier => tier.types),
    prefixes: PREFIX_TABLES
};`, sandbox);

const { types, prefixes } = JSON.parse(JSON.stringify(sandbox.gemAssetConfig));
const folderAliases = {
    amethyst: 'amythyst',
    'lapis lazuli': 'lapiz lazuli',
    porcelain: 'porceline',
    rhodonite: 'rhodanite',
    "tiger's eye": 'tigers eye',
    "hawk's eye": 'hawks eye'
};
const cuts = ['normal', 'defective', 'perfect'];
const removedSpecialPrefixes = {
    Jasper: ['Ocean', 'Kambaba', 'Bumblebee', 'Rainforest', 'Blue-Spot']
};
const assetFolders = new Map(
    fs.readdirSync(assetsRoot, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => [entry.name.toLowerCase(), entry.name])
);

function slug(value) {
    return value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[’']/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

function unique(values) {
    return [...new Set(values)];
}

function generatedPrefixes(type) {
    const specific = prefixes.SPECIALIZED[type];
    const colorPrefixes = prefixes.COLOR_PREFIXES_BY_TYPE[type]
        || (specific && specific[0] === 'Color_Link' ? prefixes.COLORS : []);
    const offColorPrefixes = prefixes.OFF_COLOR_PREFIXES[type] || [];
    if ((prefixes.COLOR_ONLY_TYPES || []).includes(type)) return unique([...colorPrefixes, ...offColorPrefixes]);
    const result = [...prefixes.GENERAL];
    if (!specific) return unique(result.concat(colorPrefixes, offColorPrefixes));
    return unique(result.concat(
        colorPrefixes,
        specific[0] === 'Color_Link' ? [] : specific,
        offColorPrefixes
    ));
}

function colorPrefixesFor(type) {
    const specific = prefixes.SPECIALIZED[type];
    return unique([
        ...(prefixes.COLOR_PREFIXES_BY_TYPE[type] || (specific && specific[0] === 'Color_Link' ? prefixes.COLORS : [])),
        ...(prefixes.OFF_COLOR_PREFIXES[type] || [])
    ]);
}

function removeMatchingFiles(folderPath, matches) {
    if (!fs.existsSync(folderPath)) return;
    for (const entry of fs.readdirSync(folderPath, { withFileTypes: true })) {
        if (!entry.isFile() || !matches(entry.name)) continue;
        fs.unlinkSync(path.join(folderPath, entry.name));
    }
}

function addName(set, name) {
    if (name) set.add(name);
}

let created = 0;
const missingTypes = [];

for (const type of unique(types)) {
    const key = type.toLowerCase();
    let folderName = assetFolders.get(folderAliases[key] || key);
    if (!folderName) {
        folderName = key;
        for (const group of ['bases', 'colors', 'highlights', 'extras', 'status']) {
            fs.mkdirSync(path.join(assetsRoot, folderName, group), { recursive: true });
        }
        assetFolders.set(folderName, folderName);
    }

    const typeSlug = slug(type);
    const prefixList = generatedPrefixes(type);
    const prefixStems = new Set(prefixList.map(prefix => `${slug(prefix)}-${typeSlug}`));
    const colorsAndPrefixes = new Set(prefixStems);

    const colorPrefixes = colorPrefixesFor(type);
    for (const color of colorPrefixes) {
        addName(colorsAndPrefixes, `${typeSlug}-${slug(color)}-1`);
        addName(colorsAndPrefixes, `${typeSlug}-${slug(color)}-2`);
    }

    if (type === 'Jasper' && prefixList.some(prefix => slug(prefix) === 'redstripe')) {
        addName(colorsAndPrefixes, 'redstripe-jasper1');
        addName(colorsAndPrefixes, 'redstripe-jasper2');
    }

    const filesByGroup = {
        bases: new Set(),
        colors: colorsAndPrefixes,
        highlights: new Set(),
        extras: new Set(),
        status: new Set()
    };

    for (const cut of cuts) {
        const baseStem = `${typeSlug}-base-${cut}`;
        addName(filesByGroup.bases, baseStem);
        addName(filesByGroup.bases, `${baseStem}-2`);
        addName(filesByGroup.highlights, `${typeSlug}-highlight-${cut}`);
        addName(filesByGroup.status, `${typeSlug}-crack-${cut}`);
    }

    if (type === 'Spinel') {
        for (const prefix of prefixList) {
            for (const cut of cuts) {
                const baseStem = `${slug(prefix)}-spinel-base-${cut}`;
                addName(filesByGroup.bases, baseStem);
                addName(filesByGroup.bases, `${baseStem}-2`);
            }
        }
    }

    for (const stem of colorsAndPrefixes) {
        addName(filesByGroup.extras, stem);
        if (!/^redstripe-jasper[12]$/.test(stem)) addName(filesByGroup.extras, `${stem}-2`);
    }

    addName(filesByGroup.status, `shattered-${typeSlug}`);
    addName(filesByGroup.status, `gem-shard-${typeSlug}`);

    for (const [group, names] of Object.entries(filesByGroup)) {
        const groupPath = path.join(assetsRoot, folderName, group);
        fs.mkdirSync(groupPath, { recursive: true });
        const validColorPrefixes = new Set(prefixList.map(prefix => slug(prefix)));
        if (group === 'status') {
            removeMatchingFiles(groupPath, name => /^corrupted-.*\.png(?:\.txt)?$/i.test(name));
        }
        if (group === 'colors') {
            const knownColors = new Set(prefixes.COLORS.map(slug));
            const allowedColors = new Set(colorPrefixes.map(slug));
            removeMatchingFiles(groupPath, name => {
                const match = name.match(new RegExp(`^${typeSlug}-(.+?)(?:-(?:normal|defective|perfect|1|2)(?:-2)?)?\\.png(?:\\.txt)?$`, 'i'));
                return match && knownColors.has(match[1].toLowerCase()) && !allowedColors.has(match[1].toLowerCase());
            });
            const legacyColorCuts = new RegExp(`^${typeSlug}-(?:${prefixes.COLORS.map(slug).join('|')})-(?:normal|defective|perfect)(?:-2)?\\.png(?:\\.txt)?$`, 'i');
            removeMatchingFiles(groupPath, name => legacyColorCuts.test(name));
        }
        if (group === 'colors' || group === 'extras') {
            const legacyPrefixFile = new RegExp(`^(${prefixes.COLORS.map(slug).join('|')})-${typeSlug}(?:-2)?\\.png(?:\\.txt)?$`, 'i');
            removeMatchingFiles(groupPath, name => {
                const match = name.match(legacyPrefixFile);
                return match && !validColorPrefixes.has(match[1]);
            });
            const removedPrefixFiles = new Set((removedSpecialPrefixes[type] || []).map(prefix => slug(prefix)));
            const removedSpecialPrefix = new RegExp(`^(${[...removedPrefixFiles].join('|')})-${typeSlug}(?:-2)?\\.png(?:\\.txt)?$`, 'i');
            removeMatchingFiles(groupPath, name => removedSpecialPrefix.test(name));
        }
        for (const name of names) {
            const pngPath = path.join(groupPath, `${name}.png`);
            const notePath = `${pngPath}.txt`;
            if (fs.existsSync(pngPath) || fs.existsSync(notePath)) continue;
            fs.writeFileSync(notePath, '');
            created += 1;
        }
    }
}

console.log(`Gem types: ${unique(types).length}; placeholders created: ${created}; existing PNGs preserved.`);
if (missingTypes.length) console.warn(`No asset folders found for: ${missingTypes.join(', ')}`);