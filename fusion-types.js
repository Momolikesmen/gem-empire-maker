'use strict';

// Add per-pair type names here; every unlisted combination remains "Placeholder".
const FUSION_GEM_TYPE_OVERRIDES = {};
const FUSION_GEM_COMBINATIONS = [];
const FUSION_GEM_TYPE_MAP = {};

function getFusionMixKey(typeA, typeB) {
    return [typeA, typeB].sort((left, right) => left.localeCompare(right)).join(' + ');
}

const fusionGemTypeNames = [...new Set(Object.values(GEM_TIERS).flatMap(tier => tier.types))];
for (let firstIndex = 0; firstIndex < fusionGemTypeNames.length; firstIndex++) {
    for (let secondIndex = firstIndex; secondIndex < fusionGemTypeNames.length; secondIndex++) {
        const types = [fusionGemTypeNames[firstIndex], fusionGemTypeNames[secondIndex]];
        const mix = getFusionMixKey(types[0], types[1]);
        const fusionType = FUSION_GEM_TYPE_OVERRIDES[mix] || 'Placeholder';
        FUSION_GEM_TYPE_MAP[mix] = fusionType;
        FUSION_GEM_COMBINATIONS.push({ mix, types, fusionType });
    }
}

function getFusionGemType(typeA, typeB) {
    return FUSION_GEM_TYPE_MAP[getFusionMixKey(typeA, typeB)] || 'Placeholder';
}
