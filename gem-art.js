const GEM_ART_ROOT = 'Assets/gems';
const GEM_ART_FOLDER_ALIASES = {
    amethyst: 'amythyst',
    'lapis lazuli': 'lapiz lazuli',
    porcelain: 'porceline',
    rhodonite: 'rhodanite',
    "tiger's eye": 'tigers eye',
    "hawk's eye": 'hawks eye'
};
const GEM_ART_COLORS = new Set(PREFIX_TABLES.COLORS.map(gemArtSlug));
const GEM_BUBBLE_COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

function gemArtSlug(value) {
    return String(value || '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[’']/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

function gemArtPath(folderName, group, fileName) {
    return `${GEM_ART_ROOT}/${encodeURIComponent(folderName)}/${group}/${fileName}.png`;
}

function stableGemArtChoice(gem, key, options) {
    if (!gem.artSelections || typeof gem.artSelections !== 'object') gem.artSelections = {};
    const available = options.filter(Boolean);
    if (!available.length) return '';
    if (!available.includes(gem.artSelections[key])) {
        gem.artSelections[key] = available[Math.floor(Math.random() * available.length)];
    }
    return gem.artSelections[key];
}

function preferredGemArtChoice(gem, key, options) {
    if (!gem.artSelections || typeof gem.artSelections !== 'object') gem.artSelections = {};
    const preferred = options.find(Boolean) || '';
    if (gem.artSelections[key] !== preferred) gem.artSelections[key] = preferred;
    return preferred;
}

function stableGemArtRoll(gem, key) {
    if (!gem.artSelections || typeof gem.artSelections !== 'object') gem.artSelections = {};
    if (typeof gem.artSelections[key] !== 'number') gem.artSelections[key] = Math.random();
    return gem.artSelections[key];
}

function gemArtFileVariants(stem) {
    return [`${stem}.png`, `${stem}-2.png`];
}

function getGemArtBaseFile(gem, folderName, typeSlug) {
    const quality = String(gem.quality || 'Regular').toLowerCase();
    let cut = 'normal';
    if (quality === 'perfect' && stableGemArtRoll(gem, 'perfectBaseRoll') < 0.1) cut = 'perfect';
    if (quality === 'defective' && stableGemArtRoll(gem, 'defectiveBaseRoll') < 0.2) cut = 'defective';

    const prefix = gemArtSlug(gem.customPrefix || (gem.name || '').split(' ')[0]);
    const candidates = gem.type === 'Spinel' && prefix
        ? [`${prefix}-spinel-base-${cut}`, `spinel-base-${cut}`]
        : [`${typeSlug}-base-${cut}`];
    const stem = preferredGemArtChoice(gem, `base:${cut}:${prefix}`, candidates);
    const variant = stableGemArtChoice(gem, `baseVariant:${stem}`, gemArtFileVariants(stem));
    const fallbackStems = uniqueGemArtValues([
        stem.replace(/-2$/, ''),
        ...candidates.slice(1)
    ]);
    gem.artSelections.baseFallbackPaths = fallbackStems.map(fallbackStem =>
        gemArtPath(folderName, 'bases', fallbackStem)
    );
    gem.artSelections.baseCut = cut;
    return gemArtPath(folderName, 'bases', variant.replace(/\.png$/, ''));
}

function uniqueGemArtValues(values) {
    return [...new Set(values.filter(Boolean))];
}

function getGemArtOverlayStem(gem, typeSlug) {
    const prefixText = gem.customPrefix || (gem.name || '').split(' ')[0] || '';
    const prefixSlug = gemArtSlug(prefixText);
    const specialized = PREFIX_TABLES?.SPECIALIZED?.[gem.type] || [];
    const colorPrefixes = PREFIX_TABLES?.COLOR_PREFIXES_BY_TYPE?.[gem.type]
        || (specialized[0] === 'Color_Link' ? PREFIX_TABLES.COLORS : []);
    const offColorPrefixes = PREFIX_TABLES?.OFF_COLOR_PREFIXES?.[gem.type] || [];
    const isColorPrefix = GEM_ART_COLORS.has(prefixSlug)
        && [...colorPrefixes, ...offColorPrefixes].some(value => gemArtSlug(value) === prefixSlug);

    if (gem.type === 'Jasper' && prefixSlug === 'redstripe') {
        return stableGemArtChoice(gem, 'overlay:redstripe-jasper', ['redstripe-jasper1', 'redstripe-jasper2']);
    }

    if (isColorPrefix) {
        return preferredGemArtChoice(gem, `overlay:${typeSlug}:${prefixSlug}`, [`${typeSlug}-${prefixSlug}`]);
    }

    return stableGemArtChoice(gem, `overlay:${typeSlug}:${prefixSlug}`, [`${prefixSlug}-${typeSlug}`]);
}

function getGemArtworkLayers(gem) {
    const folderName = GEM_ART_FOLDER_ALIASES[gem.type.toLowerCase()] || gem.type.toLowerCase();
    const typeSlug = gemArtSlug(gem.type);
    const status = String(gem.status || 'Fine').toLowerCase();
    if (status === 'shattered' && gem.artSelections) gem.artSelections.baseFallbackPaths = [];
    const base = status === 'shattered'
        ? gemArtPath(folderName, 'status', `gem-shard-${typeSlug}`)
        : getGemArtBaseFile(gem, folderName, typeSlug);
    const baseCut = gem.artSelections?.baseCut || 'normal';
    const statusOverlay = status === 'shattered'
        ? gemArtPath(folderName, 'status', `shattered-${typeSlug}`)
        : '';

    if (status === 'shattered') return { base, status: statusOverlay };

    const overlayStem = getGemArtOverlayStem(gem, typeSlug);
    const crackOverlay = status === 'cracked'
        ? gemArtPath(folderName, 'status', `${typeSlug}-crack-${baseCut}`)
        : '';
    const prefixText = gem.customPrefix || (gem.name || '').split(' ')[0] || '';
    const prefixSlug = gemArtSlug(prefixText);
    const specialized = PREFIX_TABLES?.SPECIALIZED?.[gem.type] || [];
    const colorPrefixes = PREFIX_TABLES?.COLOR_PREFIXES_BY_TYPE?.[gem.type]
        || (specialized[0] === 'Color_Link' ? PREFIX_TABLES.COLORS : []);
    const offColorPrefixes = PREFIX_TABLES?.OFF_COLOR_PREFIXES?.[gem.type] || [];
    const isColorPrefix = GEM_ART_COLORS.has(prefixSlug)
        && [...colorPrefixes, ...offColorPrefixes].some(value => gemArtSlug(value) === prefixSlug);
    const colorStem = isColorPrefix
        ? stableGemArtChoice(gem, `colorVariant:${overlayStem}`, [`${overlayStem}-1`, `${overlayStem}-2`])
        : overlayStem;
    const extrasPrefixStem = isColorPrefix ? `${prefixSlug}-${typeSlug}` : overlayStem;
    const extrasStem = gem.type === 'Jasper' && gemArtSlug(gem.customPrefix) === 'redstripe'
        ? overlayStem
        : stableGemArtChoice(gem, `extras:${overlayStem}`, [extrasPrefixStem, `${extrasPrefixStem}-2`]);
    return {
        base,
        color: gemArtPath(folderName, 'colors', colorStem),
        highlight: gemArtPath(folderName, 'highlights', `${typeSlug}-highlight-${baseCut}`),
        extras: gemArtPath(folderName, 'extras', extrasStem),
        crack: crackOverlay
    };
}

function escapeGemArtAttribute(value) {
    return String(value || '').replace(/[&"<>']/g, character => ({
        '&': '&amp;',
        '"': '&quot;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;'
    })[character]);
}

function ensureGemBubbleColor(gem) {
    if (!GEM_BUBBLE_COLORS.includes(gem.bubbleColor)) {
        gem.bubbleColor = GEM_BUBBLE_COLORS[Math.floor(Math.random() * GEM_BUBBLE_COLORS.length)];
    }
    return gem.bubbleColor;
}

function renderGemBubbleOverlay(gem, variant) {
    if (String(gem.status || '').toLowerCase() !== 'bubbled' || variant === 'none') return '';
    const color = ensureGemBubbleColor(gem);
    const stem = `bubble-${color}-${variant}`;
    const source = `Assets/UI/Bubbles/${stem}.png`;
    const fallback = `Assets/UI/Bubbles/${stem}.gif`;
    return `<img class="gem-art-layer gem-art-bubble" src="${source}" data-fallbacks="${fallback}" alt="" aria-hidden="true" onerror="advanceGemArtImage(this)">`;
}

function gemArtImageCandidates(source) {
    if (!source) return [];
    const stem = source.replace(/\.(?:png|gif)$/i, '');
    return [`${stem}.png`, `${stem}.gif`];
}

function advanceGemArtImage(image) {
    const candidates = (image.dataset.fallbacks || '').split('|').filter(Boolean);
    const nextSource = candidates.shift();
    if (!nextSource) {
        image.remove();
        return;
    }
    image.dataset.fallbacks = candidates.join('|');
    image.src = nextSource;
}

function syncGemArtMasks(image) {
    const stack = image.closest('.gem-art-stack');
    const base = stack?.querySelector('.gem-art-base');
    if (!base?.complete || !base.naturalWidth) return;
    const mask = `url("${base.currentSrc || base.src}")`;
    stack.querySelectorAll('.gem-art-color, .gem-art-highlight, .gem-art-extras, .gem-art-crack').forEach(layer => {
        layer.style.maskImage = mask;
        layer.style.webkitMaskImage = mask;
    });
}

function renderGemArtwork(gem, className = '', alt = 'Gem artwork', id = '', bubbleVariant = 'card') {
    if (gem.fusionMembers && typeof GameData !== 'undefined') {
        const members = gem.fusionMembers
            .map(memberId => GameData.gems.find(candidate => String(candidate.id) === String(memberId)))
            .filter(Boolean)
            .slice(0, 2);
        if (members.length) {
            const memberArt = members.map(member => renderGemArtwork(member, 'fusion-art-piece', `${member.name} artwork`, '', bubbleVariant)).join('');
            const elementId = id ? ` id="${escapeGemArtAttribute(id)}"` : '';
            return `<span${elementId} class="gem-art-stack gem-art-fusion ${className}" role="img" aria-label="${escapeGemArtAttribute(alt)}">${memberArt}</span>`;
        }
    }
    const knownType = Object.values(GEM_TIERS).some(tier => tier.types.includes(gem.type));
    const bubbleOverlay = renderGemBubbleOverlay(gem, bubbleVariant);
    if (!knownType) {
        const fallbackImage = gem.image
            ? `<img class="gem-art-layer" src="${escapeGemArtAttribute(gem.image)}" alt="" aria-hidden="true" onerror="this.remove()">`
            : '';
        const fallbackId = id ? ` id="${escapeGemArtAttribute(id)}"` : '';
        return `<span${fallbackId} class="gem-art-stack ${className}" role="img" aria-label="${escapeGemArtAttribute(alt)}">${fallbackImage}${bubbleOverlay}</span>`;
    }
    const layers = getGemArtworkLayers(gem);
    const layerMarkup = Object.entries(layers)
        .filter(([, source]) => source)
        .map(([layer, source]) => {
            const maskSource = ['color', 'highlight', 'extras', 'crack'].includes(layer)
                ? layers.base
                : layer === 'corruption' ? layers.color : '';
            const mask = maskSource
                ? ` style="mask-image:url('${maskSource}');-webkit-mask-image:url('${maskSource}');mask-size:100% 100%;-webkit-mask-size:100% 100%;mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat"`
                : '';
            const fallbackSources = [
                ...gemArtImageCandidates(source),
                ...(layer === 'base' ? gem.artSelections?.baseFallbackPaths || [] : []),
                ...(layer === 'extras' && source.endsWith('-2.png') ? [source.replace(/-2\.png$/, '.png')] : [])
            ].flatMap(gemArtImageCandidates).filter(candidate => candidate !== source);
            const fallbackCandidates = [...new Set(fallbackSources)];
            const fallbackAttributes = fallbackCandidates.length
                ? ` data-fallbacks="${fallbackCandidates.join('|')}"`
                : '';
            return `<img class="gem-art-layer gem-art-${layer}" src="${source}"${mask}${fallbackAttributes} alt="" aria-hidden="true" onload="syncGemArtMasks(this)" onerror="advanceGemArtImage(this)">`;
        })
        .join('');
    const elementId = id ? ` id="${escapeGemArtAttribute(id)}"` : '';
    return `<span${elementId} class="gem-art-stack ${className}" role="img" aria-label="${escapeGemArtAttribute(alt)}">${layerMarkup}${bubbleOverlay}</span>`;
}