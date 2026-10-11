'use strict';

const AUDIO_MUSIC_ROOT = 'Assets/Music';
let currentAudioTrack = null;
let currentTrackName = null;
let fadeInterval = null;

function playBackgroundMusic(trackName) {
    if (!trackName || currentTrackName === trackName) return;

    const newTrackName = trackName;
    const newSrc = `${AUDIO_MUSIC_ROOT}/${encodeURIComponent(trackName)}.mp3`;

    if (fadeInterval) clearInterval(fadeInterval);

    const oldAudio = currentAudioTrack;
    currentTrackName = newTrackName;

    const newAudio = new Audio(newSrc);
    newAudio.loop = true;
    newAudio.volume = 0;

    let hasLoaded = false;
    const startPlayback = () => {
        if (hasLoaded) return;
        hasLoaded = true;
        newAudio.play().then(() => {
            currentAudioTrack = newAudio;
            let vol = 0;
            fadeInterval = setInterval(() => {
                vol += 0.1;
                if (vol >= 1.0) {
                    newAudio.volume = 1.0;
                    clearInterval(fadeInterval);
                } else {
                    newAudio.volume = vol;
                }
                if (oldAudio && oldAudio.volume > 0) {
                    oldAudio.volume = Math.max(0, oldAudio.volume - 0.1);
                    if (oldAudio.volume === 0) oldAudio.pause();
                }
            }, 30);
        }).catch(() => {});
    };

    newAudio.oncanplaythrough = startPlayback;
    newAudio.onloadstart = startPlayback;

    newAudio.onerror = () => {
        if (oldAudio) {
            let vol = oldAudio.volume;
            fadeInterval = setInterval(() => {
                vol -= 0.1;
                if (vol <= 0) {
                    oldAudio.volume = 0;
                    oldAudio.pause();
                    clearInterval(fadeInterval);
                } else {
                    oldAudio.volume = vol;
                }
            }, 30);
        }
        currentAudioTrack = null;
    };
}

function playPoofSfx() {
    try {
        const sfx = new Audio(`${AUDIO_MUSIC_ROOT}/gem-poof-sfx.mp3`);
        sfx.volume = 0.8;
        sfx.play().catch(() => {});
    } catch {}
}

function getFusionMusicTrack(fusionId) {
    let hash = 0;
    const str = String(fusionId || 'fusion');
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    const idx = (Math.abs(hash) % 4) + 1;
    return `fusion-${idx}`;
}

if (typeof window !== 'undefined') {
    window.playBackgroundMusic = playBackgroundMusic;
    window.playPoofSfx = playPoofSfx;
    window.getFusionMusicTrack = getFusionMusicTrack;
}
