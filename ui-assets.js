const UI_ASSET_ROOT = 'Assets/UI';
const UI_ASSET_GROUPS = {
    UIBoxes: `${UI_ASSET_ROOT}/UIBoxes`,
    ProfileCards: `${UI_ASSET_ROOT}/ProfileCards`,
    Infrastructure: `${UI_ASSET_ROOT}/Infrastructure`
};
const activeUiAssetRequests = new WeakMap();

function getUiAssetRoots(assetName, customRoot) {
    if (customRoot !== UI_ASSET_ROOT) return [customRoot];
    if (assetName.endsWith('-profile-card-ui')) return [UI_ASSET_GROUPS.ProfileCards, UI_ASSET_ROOT];
    if (assetName.endsWith('-infrastructure-option-ui') || /-(?:build|level|open|create-pearl|create-spinel|blueprint|repair|assign|store|withdraw|overseer|host-ball|court-trial)-button-ui$/.test(assetName) || /^(?:gem-forge-target|soldier-ship-(?:agate|gem)|reef-abalone|structure-storage|structure-overseer)-select-ui$/.test(assetName)) {
        return [UI_ASSET_GROUPS.Infrastructure, UI_ASSET_ROOT];
    }
    return [UI_ASSET_GROUPS.UIBoxes, UI_ASSET_ROOT];
}

function applyUiAsset(element, assetNames, kind = 'surface', assetRoot = UI_ASSET_ROOT) {
    if (!element) return;
    const candidates = (Array.isArray(assetNames) ? assetNames : [assetNames]).filter(Boolean);
    const requestId = Symbol('ui-asset-request');
    activeUiAssetRequests.set(element, requestId);
    element.classList.remove('ui-image-ready', 'ui-image-surface', 'ui-image-button');
    element.style.removeProperty('--ui-skin-image');
    element.style.removeProperty('--ui-button-width');
    element.style.removeProperty('--ui-button-height');
    delete element.dataset.uiResolvedAsset;
    if (!candidates.length) return;

    const buttonLabel = kind === 'button' ? element.getAttribute('aria-label') || element.textContent.trim() : '';
    const sources = candidates.flatMap(assetName => getUiAssetRoots(assetName, assetRoot).flatMap(root =>
        ['png', 'gif'].map(extension => ({
            assetName,
            source: `${root}/${encodeURIComponent(assetName)}.${extension}`
        }))
    ));
    let candidateIndex = 0;

    function tryNextCandidate() {
        if (activeUiAssetRequests.get(element) !== requestId || candidateIndex >= sources.length) return;
        const { assetName, source } = sources[candidateIndex++];
        const image = new Image();
        image.onload = () => {
            if (activeUiAssetRequests.get(element) !== requestId) return;
            element.style.setProperty('--ui-skin-image', `url("${image.src}")`);
            element.classList.add('ui-image-ready', `ui-image-${kind}`);
            element.dataset.uiResolvedAsset = source.split('/').pop();
            if (kind === 'button') {
                const bounds = element.getBoundingClientRect();
                element.style.setProperty('--ui-button-width', `${bounds.width}px`);
                element.style.setProperty('--ui-button-height', `${bounds.height}px`);
                element.setAttribute('aria-label', buttonLabel);
                element.title = buttonLabel;
            }
        };
        image.onerror = tryNextCandidate;
        image.src = source;
    }

    tryNextCandidate();
}

function initializeUiAssets() {
    document.querySelectorAll('[data-ui-asset]').forEach(element => {
        const names = element.dataset.uiAsset.split(',').map(name => name.trim());
        applyUiAsset(element, names, element.dataset.uiKind || 'surface');
    });
}