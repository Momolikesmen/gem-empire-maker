const DEFAULT_BACKGROUND_ROOT = 'Assets/defbackgrounds';

function setPageBackground(source) {
    const root = document.documentElement;
    if (!source) {
        root.style.removeProperty('--page-background-image');
        return;
    }
    root.style.setProperty('--page-background-image', `url(${JSON.stringify(source)})`);
}

function loadDefaultPageBackground() {
    const candidates = [
        `${DEFAULT_BACKGROUND_ROOT}/default-background.png`,
        `${DEFAULT_BACKGROUND_ROOT}/default-background.gif`
    ];
    let candidateIndex = 0;
    const image = new Image();

    image.onload = () => setPageBackground(image.src);
    image.onerror = () => {
        if (candidateIndex >= candidates.length) return;
        image.src = candidates[candidateIndex++];
    };
    image.src = candidates[candidateIndex++];
}

window.setPageBackground = setPageBackground;
window.loadDefaultPageBackground = loadDefaultPageBackground;
