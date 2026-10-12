const QUICKTIME_FREQUENCY_SETTINGS = {
    Off: 0,
    Barely: 0.01,
    Moderately: 0.025,
    Frequently: 0.05
};
const PROFILE_UI_ASSET_ROOT = 'Assets/UI/Profile';
const LOCAL_SAVE_KEY = 'gemEmpireLocalSave';
const STRUCTURE_UNLOCK_REQUIREMENTS = {
    'Spinel Funhouse': ['Taaffeite'],
    'Gem Forge': ['Bismuth'],
    'Soldier Ship': ['Agate'],
    'Trial Building': ['Zircon', 'Aragonite'],
    'Grand Ballet Hall': ['Rhyolite'],
    'Grand Ballroom': ['Larkavite'],
    'Grand Theater': ['Cinnabar'],
    'Archives': ['Psilomelane'],
    'Organic Zoo': ['Scapolite'],
    'Grand Circus': ['Tanzanite']
};
const STRUCTURE_CARD_IDS = {
    'Extractor Injection Rig': 'rig-card',
    Reef: 'reef-card',
    'Spinel Funhouse': 'funhouse-card',
    'Gem Forge': 'forge-card',
    'Diamond Shrine': 'shrine-card',
    'Healing Center': 'healing-center-card',
    'Soldier Ship': 'soldier-ship-card',
    'Trial Building': 'trial-building-card',
    'Grand Ballet Hall': 'grand-ballet-hall-card',
    'Grand Ballroom': 'grand-ballroom-card',
    'Grand Theater': 'grand-theater-card',
    Archives: 'archives-card',
    'Organic Zoo': 'organic-zoo-card',
    'Grand Circus': 'grand-circus-card',
    'Gathering Hall': 'gathering-hall-card',
    'Grand Palace': 'grand-palace-card'
};

// Master Game State Object Container
let GameData = {
    name: "The Great Gem Empire",
    mode: "Classic",
    year: 0,
    essence: 200,
    materials: 500,
    gems: [],
    colonies: [],
    structures: [],
    structureLevels: {},
    structureJobs: {},
    structureStorage: {},
    soldierShip: { levels: 1, inventories: [{ agateId: null, gemIds: [] }] },
    rebellionWar: { active: false, rebelIds: [], progress: 0, difficulty: 0 },
    trialBuilding: { unlocked: false, trials: [] },
    fusionEvents: [],
    quicktimeFrequency: 0.025,
    reefs: [],
    spinels: [],
    forgeInventory: [],
    diamondsCouncil: [], // This will store our custom created Diamonds dynamically
    startingUniverseVector: "Nebula Quadrant E-19"
};

let selectedGemId = null;
let selectedColonyId = null;
let profileQuoteTimer = null;
let selectedSetupDiamondSlot = null;

const GEM_QUOTES = {
    Fiery: ["I was not shouting. The room was too quiet.", "Try me. Please.", "Heat is just confidence with better lighting.", "Spark a flame and watch them step back!"],
    Rebellious: ["Rules are suggestions with paperwork.", "I heard the order. I declined it.", "The system has a crack, and I found it.", "Why follow order when freedom is right here?"],
    Loyal: ["I will stand where I am needed.", "The court is worth protecting.", "You can count on me.", "Duty is my purpose and my shield."],
    Anxious: ["I have prepared for this. Probably.", "Is that a normal sound?", "I would like a smaller responsibility.", "What if everything goes wrong at once?"],
    Proud: ["Obviously, I handled it beautifully.", "Admire from a respectful distance.", "Excellence is a habit.", "Few can match my shine."],
    Stoic: ["Noted.", "The crystal holds.", "I have seen worse days.", "Silence speaks louder than panic."],
    Meticulous: ["There is a correct way to do this.", "I made a list for the emergency.", "Precision prevents regret.", "Double-checking is just good sense."],
    Calm: ["There is time to think before we act.", "Let the noise pass; the answer will remain.", "Breathe; the storm will clear."],
    Playful: ["Race you to the next disaster.", "I was being serious. Mostly.", "Rules are more fun when bent!"],
    Cheery: ["Well, this is a bright spot in the day.", "We can make something good of this.", "A smile makes any task lighter!"],
    Patient: ["We can wait until the right moment.", "No need to rush a good decision.", "Time is always on our side."],
    Arrogant: ["Naturally, I was the best choice.", "Try to keep up with excellence.", "I do not compete; I set the standard."],
    Empathetic: ["Tell me what you need; I am listening.", "Your worry matters to me.", "We are all connected in this court."],
    Sensitive: ["I felt the whole room change.", "Please be gentle with that truth.", "Words leave deep marks."],
    Lazy: ["Can this wait until after a rest?", "I am conserving energy for something important.", "Effort is overrated."],
    Cynical: ["I expected less, and still I am disappointed.", "Every promise has a footnote.", "Flattery gets you nowhere here."],
    Observant: ["The detail everyone missed is right there.", "I noticed the pause before the answer.", "Nothing escapes a watchful eye."],
    Melencholic: ["Some light takes longer to reach us.", "I remember when this felt easier.", "Shadows lengthen when day ends."],
    Curious: ["What happens if we try the other way?", "I have three questions and a theory.", "Every discovery begins with a question."],
    Airheaded: ["Wait, what were we talking about?", "I had a thought. It may come back.", "Look at that lovely light!"],
    Brave: ["Stand behind me. I will go first.", "Fear can come along; it does not lead.", "Forward without hesitation."],
    Shy: ["I had something to say. Maybe later.", "Could you stay while I try?", "I prefer watching from here."],
    Talkative: ["I can explain, but first there is a story.", "One more thing, then I promise I am done.", "Silence makes me nervous!"],
    Reserved: ["I have said enough for now.", "Some things are better kept quiet.", "Fewer words, fewer mistakes."],
    Mean: ["I could be kinder. I choose not to.", "That was your best effort?", "Softness is weakness."],
    Logical: ["The evidence points to one conclusion.", "Let us separate facts from assumptions.", "Emotion obscures reason."],
    Intelligent: ["I have already tested that possibility.", "There is a simpler solution.", "Analysis reveals the truth."],
    Flippant: ["Well, that went almost according to plan.", "I would worry, but it ruins the look.", "Oh dear, another catastrophe."],
    Puritanical: ["Some lines are not meant to be crossed.", "Discipline is its own kind of freedom.", "Purity in purpose, purity in form."],
    Clumsy: ["I meant to do that. Probably.", "The floor moved. I am sure of it.", "Oops! It was like that when I got here."],
    Authoritarian: ["Order keeps the court standing.", "The decision is made; carry it out.", "Obey without question."],
    Benevolent: ["Power is best used to shelter others.", "Let us choose the gentler answer.", "Kindness costs nothing."],
    Melancholic: ["The quiet has a familiar weight.", "I keep the memories others set down.", "Dusk falls on all of us."],
    Volatile: ["Do not mistake a pause for peace.", "My temper arrived before I did.", "One wrong move and it all blows up."],
    Reclusive: ["I prefer the company of a quiet room.", "You will find me when I am ready.", "Solitude is peaceful."]
};

const GEM_TYPE_QUOTES = {
    Sapphire: ["The future holds many paths; I see the clearest one.", "Cold clarity reveals what heat obscures.", "Vision is a quiet burden."],
    Ruby: ["I am ready for whatever comes next!", "Just give me the word, and I will take care of it.", "My heat never cools down."],
    Pearl: ["Everything is organized to perfection.", "At your service, as expected.", "Precision and elegance in all things."],
    Spinel: ["Ready to play! What are we doing next?", "I can turn any dull day into a spectacle!", "Laughter is the best form of order."],
    Agate: ["Order will be maintained across all ranks.", "Stand tall and do your duty.", "A disciplined soldier is a successful soldier."],
    Bismuth: ["Give me a forge, and I can shape anything.", "Built to last, forged to endure.", "The lattice holds strong."],
    Diamond: ["The empire shines under our guidance.", "Authority is not requested; it is embodied.", "Perfection is the baseline."],
    Peridot: ["Logistics check out; efficiency is up by 14%!", "Fascinating structural parameters!", "According to my calculations, we are on schedule."],
    "Lapis Lazuli": ["The tides answer to my call.", "A vast expanse of sky is all I need.", "Water shapes the hardest stone given time."],
    Jasper: ["Strength is the only truth that matters.", "I was forged for battle and nothing less.", "Defeat is not in my programming."],
    Amethyst: ["Why so serious? We got this!", "Rough around the edges, but tough as iron.", "Living life on my own terms."],
    "Rose Quartz": ["Every gem has a unique beauty.", "Love and compassion can change the empire.", "We are more than our designated purpose."],
    Emerald: ["Fleet status is green across all sectors.", "Command requires foresight and absolute control.", "The stars are ours to navigate."]
};

const QUALITY_QUOTES = {
    Perfect: [
        "Flawless cut, flawless execution.",
        "My lattice was born without a single defect.",
        "Perfection comes naturally when you are built right.",
        "I was born to set the standard."
    ],
    Defective: [
        "I might not fit the mold, but I am still here.",
        "Imperfections just mean I am one of a kind.",
        "They called me defective, but I keep pushing forward.",
        "My form is my own, regardless of what Homeworld says."
    ]
};

const FUSION_QUOTES = [
    "Two gems, one heartbeat, infinite possibilities.",
    "We are not two gems anymore; we are something entirely new.",
    "Together, we see further and hit harder.",
    "This bond makes us stronger than we ever were alone."
];

const SPLIT_FUSION_QUOTES = [
    "I still feel the echo of our shared mind...",
    "Being separated feels so quiet... I miss our fusion.",
    "We were so much more together. I want to fuse again.",
    "Part of me is still back there, in our combined form."
];

const ASSIGNED_GUARD_QUOTES = {
    Pearl: [
        "My Pearl keeps everything running seamlessly.",
        "I am never without a reliable Pearl at my side.",
        "An elegant Pearl makes managing my duties effortless."
    ],
    Spinel: [
        "My Spinel always knows how to brighten the mood.",
        "There is never a dull moment with my Spinel around!",
        "A little entertainment keeps the spirit high."
    ],
    Ruby: [
        "My Ruby guards keep a watchful eye on every threat.",
        "I feel completely secure with my Rubies on watch.",
        "Stand close, my Rubies will handle any danger."
    ]
};

function randomGemQuote(gem) {
    if (gem.placement === 'Mouth' || gem.gemPlacement === 'Mouth' || gem.fusionPlacements?.includes('Mouth')) {
        const mouthQuotes = ['*They seem happy*', '*They seem focused*', '*Nods quietly with a warm smile*'];
        return mouthQuotes[Math.floor(Math.random() * mouthQuotes.length)];
    }

    let candidates = [];

    // Personalities
    const personalities = gem.fusionPersonalities || (gem.personality ? [gem.personality] : []);
    personalities.forEach(p => {
        if (GEM_QUOTES[p]) candidates.push(...GEM_QUOTES[p]);
    });

    // Type quotes
    if (gem.type && GEM_TYPE_QUOTES[gem.type]) {
        candidates.push(...GEM_TYPE_QUOTES[gem.type]);
    }

    // Quality quotes
    if (gem.quality && QUALITY_QUOTES[gem.quality]) {
        candidates.push(...QUALITY_QUOTES[gem.quality]);
    }

    // Active fusion quotes
    if (gem.fusionMembers || gem.quality === 'Fusion') {
        candidates.push(...FUSION_QUOTES);
    }

    // Split fusion quotes
    if (gem.wasFused || gem.splitFusionPartner || gem.previouslyFused) {
        candidates.push(...SPLIT_FUSION_QUOTES);
    }

    // Assigned guards
    if (Array.isArray(gem.guards) && gem.guards.length > 0) {
        if (gem.guards.some(g => g.type === 'Pearl')) candidates.push(...ASSIGNED_GUARD_QUOTES.Pearl);
        if (gem.guards.some(g => g.type === 'Spinel')) candidates.push(...ASSIGNED_GUARD_QUOTES.Spinel);
        if (gem.guards.some(g => g.type === 'Ruby')) candidates.push(...ASSIGNED_GUARD_QUOTES.Ruby);
    }

    if (!candidates.length) {
        candidates = GEM_QUOTES.Stoic || ["The crystal holds."];
    }

    const mood = gem.status === 'Cracked' ? 'The fracture is inconvenient, not decisive.' : gem.level > 10 ? 'Experience has sharpened the edges.' : null;
    return mood && Math.random() < 0.35 ? mood : candidates[Math.floor(Math.random() * candidates.length)];
}

function saveLocalGame() {
    try {
        localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify(GameData));
    } catch (error) {
        console.warn('Local empire save could not be written.', error);
    }
}

function loadLocalGame() {
    try {
        let save = localStorage.getItem(LOCAL_SAVE_KEY);
        if (!save) {
            const legacySave = localStorage.getItem('gemEmpireSave');
            if (legacySave) {
                try {
                    save = JSON.stringify(JSON.parse(legacySave));
                } catch {
                    save = JSON.stringify(JSON.parse(atob(legacySave)));
                }
            }
        }
        if (!save) return false;
        const loaded = JSON.parse(save);
        if (!loaded || typeof loaded !== 'object' || Array.isArray(loaded)) return false;
        GameData = { ...GameData, ...loaded };
        for (const key of ['gems', 'colonies', 'structures', 'diamondsCouncil']) {
            if (!Array.isArray(GameData[key])) GameData[key] = [];
        }
        if (!GameData.structureLevels || typeof GameData.structureLevels !== 'object') GameData.structureLevels = {};
        if (!GameData.structureJobs || typeof GameData.structureJobs !== 'object') GameData.structureJobs = {};
        if (!GameData.structureStorage || typeof GameData.structureStorage !== 'object') GameData.structureStorage = {};
        if (!GameData.fusionsCache || typeof GameData.fusionsCache !== 'object') GameData.fusionsCache = {};
        if (!GameData.rebellionWar || typeof GameData.rebellionWar !== 'object') GameData.rebellionWar = { active: false, rebelIds: [], progress: 0, difficulty: 0 };
        if (!Array.isArray(GameData.rebellionWar.rebelIds)) GameData.rebellionWar.rebelIds = [];
        GameData.gems.forEach(gem => {
            gem.rebellion = Math.max(0, Math.min(100, Number(gem.rebellion || 0)));
            if (typeof gem.canFuse !== 'boolean') gem.canFuse = Math.random() >= 0.5;
            if (!gem.relationships || typeof gem.relationships !== 'object') gem.relationships = {};
        });
        GameData.gems.forEach(gem => { gem.inRebellion = GameData.rebellionWar.rebelIds.some(id => String(id) === String(gem.id)); });
        GameData.gems.filter(gem => Array.isArray(gem.fusionMembers)).forEach(normalizeFusionCharacter);
        saveLocalGame();
        localStorage.removeItem('gemEmpireSave');
        return true;
    } catch (error) {
        console.warn('The local empire save could not be restored.', error);
        return false;
    }
}

function restoreLocalGame() {
    if (!loadLocalGame()) return;
    const liveTitle = document.getElementById('live-empire-title');
    if (liveTitle) liveTitle.innerText = GameData.name;
    if (!GameData.started && !GameData.gems.length) return;
    switchScreen('screen-dashboard');
    switchTab('tab-court-roster');
    renderColonies();
    renderGemDirectories();
    renderNotifications();
}

function getGemStatus(gem) {
    return gem && gem.status === 'Active' ? 'Fine' : (gem && gem.status) || 'Fine';
}

function addNotification(text, type = 'Neutral') {
    if (!Array.isArray(GameData.notifications)) GameData.notifications = [];
    GameData.notifications.unshift({ text, type, year: Number(GameData.year || 0).toFixed(1), at: Date.now() });
    GameData.notifications = GameData.notifications.slice(0, 50);
    renderNotifications();
}

function renderNotifications() {
    const center = document.getElementById('notification-center');
    const count = document.getElementById('notification-count');
    const notifications = GameData.notifications || [];
    if (count) count.innerText = notifications.length;
    const setting = getQuicktimeFrequencySetting();
    if (center) {
        let frequencySelect = document.getElementById('quicktime-frequency');
        let notificationList = document.getElementById('notification-list');
        const initializeFrequencySelect = !frequencySelect || !notificationList || !center.contains(frequencySelect) || !center.contains(notificationList);
        if (initializeFrequencySelect) {
            center.replaceChildren();
            const settings = document.createElement('div');
            settings.className = 'notification-settings';
            const label = document.createElement('label');
            label.htmlFor = 'quicktime-frequency';
            label.textContent = 'Quicktime event frequency';
            frequencySelect = document.createElement('select');
            frequencySelect.id = 'quicktime-frequency';
            frequencySelect.dataset.uiAsset = 'quicktime-frequency-select-ui';
            frequencySelect.dataset.uiKind = 'textbox';
            frequencySelect.onchange = () => updateQuicktimeFrequency(frequencySelect.value);
            Object.keys(QUICKTIME_FREQUENCY_SETTINGS).forEach(option => frequencySelect.add(new Option(option, option)));
            settings.append(label, frequencySelect);
            notificationList = document.createElement('div');
            notificationList.id = 'notification-list';
            notificationList.className = 'notification-list';
            center.append(settings, notificationList);
            frequencySelect.value = setting;
            applyUiAsset(frequencySelect, 'quicktime-frequency-select-ui', 'textbox');
        }
        notificationList.innerHTML = notifications.length
            ? notifications.map(note => `<p style="margin:4px 0;"><strong>Year ${note.year}:</strong> ${note.text}</p>`).join('')
            : '<p>No events recorded.</p>';
    }
}

function getQuicktimeFrequencySetting() {
    const frequency = Number(GameData.quicktimeFrequency ?? QUICKTIME_FREQUENCY_SETTINGS.Moderately);
    return Object.entries(QUICKTIME_FREQUENCY_SETTINGS).reduce((closest, [setting, value]) =>
        Math.abs(value - frequency) < Math.abs(QUICKTIME_FREQUENCY_SETTINGS[closest] - frequency) ? setting : closest,
    'Moderately');
}

function updateQuicktimeFrequency(setting) {
    if (!(setting in QUICKTIME_FREQUENCY_SETTINGS)) return;
    GameData.quicktimeFrequency = QUICKTIME_FREQUENCY_SETTINGS[setting];
}

function toggleNotifications() {
    const center = document.getElementById('notification-center');
    if (!center) return;
    const isOpening = center.style.display === 'none';
    center.style.display = isOpening ? 'block' : 'none';
    applyUiAsset(document.querySelector('body > header'), isOpening ? 'header-open-ui' : 'header-closed-ui', 'surface');
}

function requestEmpireReset() {
    const modal = document.getElementById('reset-confirmation-modal');
    if (modal) modal.style.display = 'flex';
}

function cancelEmpireReset() {
    const modal = document.getElementById('reset-confirmation-modal');
    if (modal) modal.style.display = 'none';
}

function confirmEmpireReset() {
    localStorage.removeItem(LOCAL_SAVE_KEY);
    localStorage.removeItem('gemEmpireSave');
    localStorage.removeItem('gemEmpireAppearance');
    window.location.reload();
}

function isEventPopupOpen() {
    const popup = document.getElementById('event-popup');
    return Boolean(popup && popup.style.display !== 'none');
}

function showEventPopup(text) {
    const popup = document.getElementById('event-popup');
    const message = document.getElementById('event-popup-text');
    const actions = document.getElementById('event-popup-actions');
    if (message) message.innerText = text;
    if (actions) actions.innerHTML = '';
    if (popup) {
        applyUiAsset(popup, 'quicktime-event-popup-ui', 'surface');
        popup.style.display = 'block';
    }
}

function showEventChoices(text, choices) {
    showEventPopup(text);
    const actions = document.getElementById('event-popup-actions');
    if (actions) actions.innerHTML = choices.map(choice => `<button type="button" data-event-action="${choice.id}" data-ui-asset="quicktime-event-choice-button-ui" data-ui-kind="button" style="width:auto; margin:4px;">${choice.label}</button>`).join('');
    choices.forEach(choice => {
        const button = actions.querySelector(`[data-event-action="${choice.id}"]`);
        if (button) {
            button.setAttribute('aria-label', choice.label);
            applyUiAsset(button, 'quicktime-event-choice-button-ui', 'button');
            button.onclick = () => { choice.action(); closeEventPopup(); };
        }
    });
}

function closeEventPopup() {
    const popup = document.getElementById('event-popup');
    if (popup) popup.style.display = 'none';
}

function toggleGemDirectory(directoryId) {
    const directory = document.getElementById(directoryId);
    if (!directory) return;
    const isOpening = directory.style.display === 'none';
    directory.style.display = isOpening ? 'block' : 'none';
    if (directoryId === 'shattered-gems-directory') {
        applyUiAsset(document.getElementById('shattered-gems-panel'), isOpening ? 'shattered-gems-open-ui' : 'shattered-gems-closed-ui', 'surface');
    }
}

function normalizeGemStatus(gem) {
    if (!gem.status || gem.status === 'Active') gem.status = 'Fine';
    return gem.status;
}

function isGemUsable(gem) {
    const status = normalizeGemStatus(gem);
    return !gem.storedIn && (status === 'Fine' || status === 'Cracked');
}

// ==========================================
// 1. SCREEN NAVIGATION & MENU MANAGEMENT
// ==========================================
function switchScreen(screenId) {
    document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active-screen'));
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active-screen');
    }
    document.body.classList.toggle('dashboard-active', screenId === 'screen-dashboard');
    updateUI();
}

function switchTab(tabId) {
    document.querySelectorAll('.dashboard-tab').forEach(t => t.style.display = 'none');
    
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.style.display = 'block';
    }
    
    if (tabId === 'tab-court-roster') renderRoster();
    if (tabId === 'tab-celestial-colonies') renderColonies();
}

function randomizeStartingSector() {
    const galaxies = ["Andromeda Outpost", "Kepler Deep Field", "Homeworld Perimeter", "Gemini Void", "Tethys Grid"];
    const randomSector = galaxies[Math.floor(Math.random() * galaxies.length)] + " Vector-" + Math.floor(Math.random() * 900 + 100);
    GameData.startingUniverseVector = randomSector;
    const sectorDisplay = document.getElementById('sector-display-name');
    if (sectorDisplay) sectorDisplay.innerText = randomSector;
}

// ==========================================
// DIAMOND COUNCIL SETUP
// ==========================================

function setSetupDiamondColor(slot, color) {
    if (!slot || !color) return;
    slot.dataset.color = color;
    slot.style.setProperty('--diamond-color', color);
    const swatch = slot.querySelector('.diamond-swatch');
    if (swatch) swatch.style.backgroundColor = color;
}

function initializeDiamondSetup() {
    const slots = Array.from(document.querySelectorAll('.diamond-slot'));
    const pickerTarget = document.getElementById('diamond-color-wheel');
    const colorInput = document.getElementById('diamond-color-fallback');
    const targetLabel = document.getElementById('diamond-color-target');
    if (!slots.length) return;

    let colorPicker = null;
    if (window.iro && pickerTarget) {
        colorPicker = new iro.ColorPicker(pickerTarget, {
            width: 176,
            color: slots[0].dataset.color,
            borderWidth: 1,
            borderColor: '#e8e6e3'
        });
        colorPicker.on('color:change', color => {
            if (!selectedSetupDiamondSlot) return;
            setSetupDiamondColor(selectedSetupDiamondSlot, color.hexString);
            if (colorInput) colorInput.value = color.hexString;
        });
    }

    function selectSlot(slot) {
        selectedSetupDiamondSlot = slot;
        slots.forEach(candidate => {
            const button = candidate.querySelector('.diamond-select-color');
            if (button) button.setAttribute('aria-pressed', candidate === slot ? 'true' : 'false');
        });
        if (targetLabel) targetLabel.textContent = slot.querySelector('h4').textContent;
        if (colorPicker) colorPicker.color.set(slot.dataset.color);
        if (colorInput) colorInput.value = slot.dataset.color;
    }

    slots.forEach(slot => {
        setSetupDiamondColor(slot, slot.dataset.color);
        slot.querySelector('.diamond-select-color').addEventListener('click', () => selectSlot(slot));
    });
    selectedSetupDiamondSlot = slots[0];

    if (colorInput) {
        colorInput.addEventListener('input', () => {
            setSetupDiamondColor(selectedSetupDiamondSlot, colorInput.value);
            if (colorPicker) colorPicker.color.set(colorInput.value);
        });
    }
}

function collectSetupDiamondCouncil() {
    GameData.diamondsCouncil = Array.from(document.querySelectorAll('.diamond-slot')).map(slot => {
        const prefix = slot.querySelector('.diamond-prefix').value.trim() || slot.dataset.defaultName;
        const name = /diamond/i.test(prefix) ? prefix : `${prefix} Diamond`;
        return {
            id: `diamond_${slot.dataset.diamondRole}`,
            name,
            color: slot.dataset.color,
            assignedRoleTag: slot.dataset.roleTag,
            courtMembers: [],
            colonyIds: [],
            image: 'https://placehold.co/90x90?text=Diamond'
        };
    });
}

// ==========================================
// 2. LAUNCHER, INITIALIZATION & SAVES
// ==========================================
function launchNewEmpire() {
    collectSetupDiamondCouncil();
    const nameInput = document.getElementById('setup-empire-name');
    GameData.name = nameInput ? nameInput.value.trim() : "The Great Gem Empire";
    
    const modeSelect = document.getElementById('setup-game-mode');
    GameData.mode = modeSelect ? modeSelect.value : "Classic";
    GameData.started = true;
    
    // Require at least one leader to establish authority
    if (GameData.diamondsCouncil.length === 0) {
        alert("Your Empire must have at least one custom Diamond Matriarch logged to rule the council before launching!");
        return;
    }

    if (GameData.mode === "Roleplay") {
        GameData.essence = 999999;
        GameData.materials = 999999;
    } else {
        GameData.essence = 200;
        GameData.materials = 500;
    }

    // Automatically inject our logged council members into the core gems roster as game elements
    GameData.diamondsCouncil.forEach(diamond => {
        const placement = chooseRandomGemPlacement();
        let gemRecord = {
            id: diamond.id,
            type: "Diamond",
            name: diamond.name,
            quality: placement === 'Mouth' ? 'Defective' : 'Perfect',
            placement,
            personality: chooseRandomGemPersonality(true),
            level: 0,
            guards: [],
            boosts: [],
            courtId: null,
            courtMembers: [],
            colonyIds: [],
            location: "Court",
            guardOwnerId: null,
            image: diamond.image,
            galleryPool: [diamond.image]
        };
        GameData.gems.push(gemRecord);
    });

    const liveTitle = document.getElementById('live-empire-title');
    if (liveTitle) liveTitle.innerText = GameData.name;
    
    switchScreen('screen-dashboard');
    switchTab('tab-court-roster'); 
    saveLocalGame();
}

function togglePauseYearProgression() {
    GameData.isPaused = !GameData.isPaused;
    updatePauseButtonUI();
}

function updatePauseButtonUI() {
    const btn = document.getElementById('pause-year-button');
    if (btn) {
        btn.textContent = GameData.isPaused ? 'Unpause' : 'Pause';
        btn.setAttribute('aria-label', GameData.isPaused ? 'Unpause' : 'Pause');
    }
}

function updateUI() {
    const yearVal = document.getElementById('year-val');
    const essenceVal = document.getElementById('essence-val');
    const materialsVal = document.getElementById('materials-val');
    const popVal = document.getElementById('pop-val');

    if(yearVal) yearVal.innerText = GameData.year.toFixed(1);
    if(essenceVal) essenceVal.innerText = GameData.mode === "Roleplay" ? "∞" : GameData.essence;
    if(materialsVal) materialsVal.innerText = GameData.mode === "Roleplay" ? "∞" : GameData.materials;
    if(popVal) popVal.innerText = GameData.gems.length;

    updatePauseButtonUI();
    renderStructureInventoryButtons();
}

// ==========================================
// 3. CELESTIAL COLONIES & INCUBATION
// ==========================================
function getGemTypeRarityWeight(gemType) {
    const tier = Object.values(GEM_TIERS).find(entry => entry.types.includes(gemType));
    if (!tier) return 50;
    const rank = Number(tier.rank);
    if (gemType === 'Ruby' || rank === 0) return 150;
    if (rank <= 6) return 100;
    if (rank <= 9) return 20;
    if (rank <= 11) return 5;
    return 1;
}

function chooseColonyGemTypes() {
    const pool = [...COLONY_OPTIONS.GEM_TYPES];
    const count = Math.min(
        pool.length,
        Math.floor(Math.random() * (COLONY_OPTIONS.MAX_RANDOM_GEM_TYPES - COLONY_OPTIONS.MIN_RANDOM_GEM_TYPES + 1)) + COLONY_OPTIONS.MIN_RANDOM_GEM_TYPES
    );
    const selected = [];
    while (selected.length < count) {
        const totalWeight = pool.reduce((sum, gem) => sum + getGemTypeRarityWeight(gem), 0);
        let roll = Math.random() * totalWeight;
        let chosenIndex = 0;
        for (let i = 0; i < pool.length; i++) {
            roll -= getGemTypeRarityWeight(pool[i]);
            if (roll <= 0) {
                chosenIndex = i;
                break;
            }
        }
        selected.push(pool.splice(chosenIndex, 1)[0]);
    }
    return selected;
}

function toRomanNumeral(num) {
    const lookup = [
        [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
        [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
        [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
    ];
    let roman = '';
    for (const [val, char] of lookup) {
        while (num >= val) {
            roman += char;
            num -= val;
        }
    }
    return roman || 'I';
}

function getColonyCourtOptions() {
    const councilCourts = (GameData.diamondsCouncil || []).filter(diamond => diamond && diamond.id);
    if (councilCourts.length) return councilCourts;
    return GameData.gems.filter(gem => gem.type === 'Diamond').map(diamond => ({
        id: diamond.id,
        name: diamond.name,
        courtMembers: diamond.courtMembers || [],
        colonyIds: diamond.colonyIds || []
    }));
}

function assignColonyCourt(colony) {
    if (!colony) return null;
    const courts = getColonyCourtOptions();
    if (!courts.length) return null;
    let court = courts.find(candidate => String(candidate.id) === String(colony.courtId));
    if (!court) {
        court = courts[Math.floor(Math.random() * courts.length)];
        colony.courtId = court.id;
    }
    colony.courtName = court.name;
    if (!Array.isArray(court.colonyIds)) court.colonyIds = [];
    if (!court.colonyIds.some(id => String(id) === String(colony.id))) court.colonyIds.push(colony.id);
    const liveCourt = GameData.gems.find(gem => String(gem.id) === String(court.id));
    if (liveCourt) {
        if (!Array.isArray(liveCourt.colonyIds)) liveCourt.colonyIds = [];
        if (!liveCourt.colonyIds.some(id => String(id) === String(colony.id))) liveCourt.colonyIds.push(colony.id);
    }
    return court;
}

function foundColony() {
    if (GameData.mode !== "Roleplay" && GameData.materials < COLONY_OPTIONS.COLONIZATION_COST) return alert("Insufficient Colony Materials inside Vault!");
    if (GameData.mode !== "Roleplay") GameData.materials -= COLONY_OPTIONS.COLONIZATION_COST;

    const planet = COLONY_OPTIONS.PLANETS[Math.floor(Math.random() * COLONY_OPTIONS.PLANETS.length)];
    const colonyNum = GameData.colonies.length + 1;
    let discoveryColonyRecord = {
        id: Date.now() + Math.random(),
        name: `${toRomanNumeral(colonyNum)} Colony`,
        planetType: planet.name,
        yieldValue: planet.materialRate,
        essenceRate: planet.essenceRate,
        availableGemTypes: chooseColonyGemTypes(),
        decayYears: planet.decayYears,
        kindergartensBuilt: planet.startingKindergartens || 0,
        kindergartenJobs: [],
        shrineJobs: [],
        birthYear: GameData.year,
        isDecayed: false
    };
    assignColonyCourt(discoveryColonyRecord);
    GameData.colonies.push(discoveryColonyRecord);
    updateUI();
    renderColonies();
}

function renderColonies() {
    const colonyGridContainer = document.getElementById('colonies-grid');
    if (!colonyGridContainer) return;
    colonyGridContainer.innerHTML = '';
    
    GameData.colonies.forEach(colony => {
        const court = assignColonyCourt(colony);
        const itemCard = document.createElement('div');
        itemCard.className = 'card';
        const timerStatus = GameData.mode === 'Roleplay'
            ? '<p style="font-size:0.8rem; opacity:0.75;">Gem creation: Immediate</p>'
            : `<p style="font-size:0.8rem; opacity:0.75;">Timers: ${[...(colony.kindergartenJobs || []), ...(colony.shrineJobs || [])].map(job => formatTimer(job.readyAt)).join(', ') || 'None'}</p>`;
        
        let statusText = colony.isDecayed 
            ? `<p style="color:#ef4444; font-size:0.8rem; font-weight:bold; margin-top:5px;">⚠️ Crust Layer Decayed</p>` 
            : `<p style="opacity:0.6; font-size:0.85rem; margin-top:5px;">Output: +${colony.yieldValue} Materials, +${colony.essenceRate || 0} Essence/Tick</p>
               <p style="font-size:0.8rem; color:#00945c; margin-bottom: 5px;">Kindergartens: ${colony.kindergartensBuilt}/${COLONY_OPTIONS.MAX_KINDERGARTENS}</p>
               <p style="font-size:0.8rem; opacity:0.75;">Court: ${court?.name || 'Unassigned'}</p>
               <p style="font-size:0.8rem; opacity:0.75;">Gem types: ${(colony.availableGemTypes || COLONY_OPTIONS.GEM_TYPES).join(', ')}</p>
               ${timerStatus}
               <button onclick="openColonyControlPanel(${colony.id})" style="padding:4px; font-size:0.75rem; width: auto; margin-top:8px;">Open Colony Menu</button>`;

    itemCard.innerHTML = `<h3>🪐 ${colony.name}</h3> ${statusText}`;
colonyGridContainer.appendChild(itemCard);
        applyUiAsset(itemCard, 'colony-card-ui', 'surface');
    });
}

function openColonyControlPanel(id) {
    selectedColonyId = id;
    const colony = GameData.colonies.find(c => c.id === id);
    if (!colony || colony.isDecayed) return;
    if (!Array.isArray(colony.availableGemTypes)) colony.availableGemTypes = chooseColonyGemTypes();
    if (colony.availableGemTypes.length > COLONY_OPTIONS.MAX_RANDOM_GEM_TYPES) {
        colony.availableGemTypes = colony.availableGemTypes.slice(0, COLONY_OPTIONS.MAX_RANDOM_GEM_TYPES);
    }

    const gemTypeSelect = document.getElementById('colony-gem-type');
    const availableGemTypes = colony.availableGemTypes || COLONY_OPTIONS.GEM_TYPES;
    if (gemTypeSelect) {
        const optionsMatch = gemTypeSelect.options.length === availableGemTypes.length &&
            availableGemTypes.every((type, index) => gemTypeSelect.options[index].value === type);
        if (!optionsMatch) {
            const selectedType = gemTypeSelect.value;
            gemTypeSelect.innerHTML = availableGemTypes.map(type => `<option value="${type}">${type}</option>`).join('');
            if (availableGemTypes.includes(selectedType)) gemTypeSelect.value = selectedType;
        }
    }
    updateKindergartenButtonCost();
    document.getElementById('colony-modal-title').innerText = colony.name;
    const jobs = [...(colony.kindergartenJobs || []), ...(colony.shrineJobs || [])];
    const roleplayMode = GameData.mode === 'Roleplay';
    const jobText = roleplayMode ? 'Gem creation is immediate in Roleplay mode.' : jobs.length ? jobs.map(job => `${job.kind === 'diamond' ? 'Diamond Shrine' : job.gemType + ' Kindergarten'}: ${formatTimer(job.readyAt)}`).join(' | ') : 'No active kindergarten timers.';
    const court = assignColonyCourt(colony);
    document.getElementById('colony-modal-details').innerHTML = `<p>Planet type: ${colony.planetType || colony.name}</p><p>Diamond court: ${court?.name || 'Unassigned'}</p><p>Output: +${colony.yieldValue} Materials, +${colony.essenceRate || 0} Essence/Tick</p><p>Kindergartens: ${colony.kindergartensBuilt}/${COLONY_OPTIONS.MAX_KINDERGARTENS}</p><p>${roleplayMode ? 'Gem creation' : 'Active timers'}: ${jobText}</p>`;
    document.getElementById('colony-options-list').innerText = roleplayMode
        ? `This colony supports: ${availableGemTypes.join(', ')}. Kindergarten gem creation is immediate in Roleplay mode.`
        : `This colony supports: ${availableGemTypes.join(', ')}. Building a Kindergarten starts a ${Math.round(getKindergartenDurationMinutes() * 10) / 10}-minute timer and can produce up to three gems of one type.`;
    const diamondKindergartenButton = document.getElementById('diamond-kindergarten-button');
    if (diamondKindergartenButton) {
        const hasShrine = GameData.structures.includes('Diamond Shrine');
        diamondKindergartenButton.style.display = hasShrine ? 'inline-block' : 'none';
        diamondKindergartenButton.disabled = !hasShrine;
    }
    document.getElementById('colony-modal').style.display = 'flex';
}

function closeColonyControlPanel() {
    const modal = document.getElementById('colony-modal');
    if (modal) modal.style.display = 'none';
}

function buildColonyKindergarten() {
    const colony = GameData.colonies.find(c => c.id === selectedColonyId);
    if (!colony) return;
    if (colony.kindergartensBuilt >= COLONY_OPTIONS.MAX_KINDERGARTENS) return alert('This colony has reached its Kindergarten limit.');
    const gemTypeSelect = document.getElementById('colony-gem-type');
    const gemType = gemTypeSelect ? gemTypeSelect.value : null;
    if (!gemType || !(colony.availableGemTypes || []).includes(gemType)) return alert('Choose a gem type available on this colony.');
    const materialCost = getKindergartenCost(gemType);
    if (GameData.mode !== 'Roleplay' && GameData.materials < materialCost) return alert(`Not enough Materials to establish a ${gemType} Kindergarten. It costs ${materialCost} Materials.`);
    if (GameData.mode !== 'Roleplay') GameData.materials -= materialCost;
    if (!Array.isArray(colony.kindergartenJobs)) colony.kindergartenJobs = [];
    colony.kindergartensBuilt++;
    colony.yieldValue += 3;
    if (GameData.mode === 'Roleplay') {
        completeKindergartenJob(colony, { gemType });
    } else {
        colony.kindergartenJobs.push({
            kind: 'regular',
            gemType,
            startedAt: Date.now(),
            readyAt: Date.now() + getKindergartenDurationMs()
        });
        alert(`${gemType} Kindergarten started. Up to three gems will emerge when the timer completes.`);
    }
    updateUI();
    renderColonies();
    openColonyControlPanel(colony.id);
}

function getKindergartenDurationMs() {
    const agriculturalGems = GameData.gems.filter(gem =>
        (gem.type === 'Peridot' || gem.type === 'Lapis Lazuli' || gem.type === 'Aeschynite') && isGemUsable(gem)
    );
    const reductionPerLevel = GEM_PURPOSES.AGRICULTURAL.timeReductionPerLevel || 0;
    const totalReduction = Math.min(0.9, agriculturalGems.reduce((sum, gem) =>
        sum + Math.max(0, Number(gem.level || 0)) * reductionPerLevel * (gem.type === 'Aeschynite' ? 2 : 1), 0));
    return Math.max(60 * 1000, COLONY_OPTIONS.KINDERGARTEN_DURATION_MS * (1 - totalReduction));
}

function getKindergartenCost(gemType) {
    const tier = Object.values(GEM_TIERS).find(entry => entry.types.includes(gemType));
    if (!tier) return COLONY_OPTIONS.KINDERGARTEN_COST;
    const rank = Number(tier.rank);
    if (gemType === 'Ruby' || rank === 0 || rank === 6) return 500;
    if (rank >= 12) return 20000;
    if (rank >= 10) return 18000;
    if (rank === 9) return 15000;
    if (rank >= 7) return 10000;
    if (rank >= 5) return 5000;
    return 2500;
}

function updateKindergartenButtonCost() {
    const button = document.getElementById('colony-kindergarten-button');
    const select = document.getElementById('colony-gem-type');
    if (button && select && select.value) {
        button.textContent = `Build ${select.value} Kindergarten (${getKindergartenCost(select.value)} Materials)`;
    }
}

function getKindergartenDurationMinutes() {
    return getKindergartenDurationMs() / 60000;
}

function formatTimer(readyAt) {
    const remaining = Math.max(0, readyAt - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return remaining <= 0 ? 'Ready' : `${minutes}m ${String(seconds).padStart(2, '0')}s remaining`;
}

const SPECIAL_TRAIT_DESCRIPTIONS = {
    // Defective
    "Underbaked": "Lacks full physical density, reducing performance.",
    "Overbaked": "Slightly brittle form, reducing structural stability.",
    "Fading Future Vision": "Inconsistent glimpses of time, rendering vision mostly useless.",
    "Blurry Future Vision": "Unclear visions of the future, rendering predictions mostly useless.",
    "Present Vision": "Only sees what is happening right now, rendering vision useless.",
    "Two Left Feet": "Uncoordinated physical form, rendering entertainer duties useless.",
    "Uncoordinated": "Clumsy and imbalanced, rendering entertainer duties useless.",
    "Soft-Spoken": "Quiet and gentle voice, preventing assignment to Soldier Ships.",
    "Weak": "Substandard physical strength, rendering soldier combat useless.",
    "Legal Malpractice": "Flawed legal reasoning, almost guaranteeing court loss.",

    // Perfect
    "Efficient": "Optimized lattice, boosting contributed stats by up to 150%.",
    "All Seeing Vision": "Flawless foresight, boosting luck contribution by 200%.",
    "Cryokinesis": "Ability to freeze local moisture and drop temperature (purely for show).",
    "Graceful": "Exquisite movement and poise, making entertainer duties 200% more effective.",
    "Idolized": "Captivating aura and charm, making entertainer duties 200% more effective.",
    "Beefy": "Massive crystalline density, making soldier strength 200% higher.",
    "Pyrokinesis": "Ability to generate intense heat and flames.",
    "Metallokinesis": "Ferromagnetic control, boosting kindergarten efficiency by 200%.",
    "Informed": "Mastery of empire jurisprudence, ensuring court trial wins against regular opponents."
};

function getDefectiveDeformity(gemType, placement, customPrefix) {
    if (placement === 'Mouth') return null;
    if (gemType === 'Ruby' && customPrefix === 'Blue') return null;
    if (gemType === 'Sapphire' && customPrefix === 'Red') return null;

    const pool = ['Underbaked', 'Overbaked'];

    const tierEntry = Object.values(GEM_TIERS).find(t => t.types.includes(gemType));
    const tierName = tierEntry ? tierEntry.name : '';

    if (tierName === 'Elite Advisor Tier' || gemType === 'Sapphire') {
        pool.push('Fading Future Vision', 'Blurry Future Vision', 'Present Vision');
    }
    if (tierName === 'Elite Entertainer Tier') {
        pool.push('Two Left Feet', 'Uncoordinated');
    }
    if (tierName === 'Quartz Commander Tier') {
        pool.push('Soft-Spoken');
    }
    if (tierName === 'Quartz Soldier Tier' || gemType === 'Ruby') {
        pool.push('Weak');
    }
    if (tierName === 'Justice Tier') {
        pool.push('Legal Malpractice');
    }

    return pool[Math.floor(Math.random() * pool.length)];
}

function getPerfectBoost(gemType) {
    const pool = ['Efficient'];

    const tierEntry = Object.values(GEM_TIERS).find(t => t.types.includes(gemType));
    const tierName = tierEntry ? tierEntry.name : '';

    if (tierName === 'Elite Advisor Tier' || gemType === 'Sapphire') {
        pool.push('All Seeing Vision');
        if (gemType === 'Sapphire') pool.push('Cryokinesis');
    }
    if (tierName === 'Elite Entertainer Tier') {
        pool.push('Graceful', 'Idolized');
    }
    if (tierName === 'Quartz Soldier Tier' || gemType === 'Ruby') {
        pool.push('Beefy');
        if (gemType === 'Ruby') pool.push('Pyrokinesis');
    }
    if (gemType === 'Peridot') {
        pool.push('Metallokinesis');
    }
    if (tierName === 'Justice Tier') {
        pool.push('Informed');
    }

    return pool[Math.floor(Math.random() * pool.length)];
}

function determineStartingBoosts(quality, gemType, placement = null, customPrefix = null) {
    let finalBoosts = [];

    if (quality === 'Defective') {
        const deformity = getDefectiveDeformity(gemType, placement, customPrefix);
        if (deformity) {
            finalBoosts.push({
                id: 'deformity_' + deformity.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
                name: deformity,
                stat: 'Deformality',
                desc: SPECIAL_TRAIT_DESCRIPTIONS[deformity] || 'Defective physical trait.',
                origin: 'Defective'
            });
        }
        return finalBoosts;
    }

    if (quality === 'Perfect') {
        const perfectBoost = getPerfectBoost(gemType);
        if (perfectBoost) {
            finalBoosts.push({
                id: 'perfect_' + perfectBoost.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
                name: perfectBoost,
                stat: 'Perfect Trait',
                desc: SPECIAL_TRAIT_DESCRIPTIONS[perfectBoost] || 'Flawless physical trait.',
                origin: 'Perfect'
            });
        }
        let universal = typeof BOOST_POOL !== 'undefined' && BOOST_POOL.UNIVERSAL ? [...BOOST_POOL.UNIVERSAL] : [];
        if (typeof BOOST_POOL !== 'undefined' && BOOST_POOL.SPECIALIZED && BOOST_POOL.SPECIALIZED[gemType]) {
            universal = universal.concat(BOOST_POOL.SPECIALIZED[gemType]);
        }
        for (let i = 0; i < 3 && universal.length > 0; i++) {
            const idx = Math.floor(Math.random() * universal.length);
            finalBoosts.push(universal[idx]);
            universal.splice(idx, 1);
        }
        return finalBoosts;
    }

    const count = Math.random() < 0.5 ? 1 : 2;
    let available = typeof BOOST_POOL !== 'undefined' && BOOST_POOL.UNIVERSAL ? [...BOOST_POOL.UNIVERSAL] : [];
    if (typeof BOOST_POOL !== 'undefined' && BOOST_POOL.SPECIALIZED && BOOST_POOL.SPECIALIZED[gemType]) {
        available = available.concat(BOOST_POOL.SPECIALIZED[gemType]);
    }
    for (let i = 0; i < count && available.length > 0; i++) {
        const idx = Math.floor(Math.random() * available.length);
        finalBoosts.push(available[idx]);
        available.splice(idx, 1);
    }
    return finalBoosts;
}

function createGemFromKindergarten(gemType, colony) {
    const placement = chooseRandomGemPlacement();
    const quality = rollGemQuality(placement);
    const personality = choosePlacementWeightedPersonality(placement);
    const customPrefix = typeof generateGemPrefix === 'function' ? generateGemPrefix(gemType, personality) : 'Facet-' + Math.floor(Math.random() * 899 + 100);

    let gem = {
        id: Date.now() + Math.random(),
        type: gemType,
        customPrefix,
        name: `${customPrefix} ${gemType}`,
        quality,
        placement,
        personality,
        level: 0,
        guards: [],
        boosts: determineStartingBoosts(quality, gemType, placement, customPrefix),
        courtId: assignColonyCourt(colony)?.id ?? null,
        colonyId: colony?.id ?? null,
        colonyName: colony?.name ?? null,
        location: "Court",
        guardOwnerId: null,
        image: "https://placehold.co/200x200",
        galleryPool: ["https://placehold.co/200x200"],
        cutImage: "",
        canFuse: Math.random() >= 0.5,
        relationships: {}
    };
    gem.name = `${gem.customPrefix} ${gem.type}`;
    if (gem.courtId !== null) {
        const court = GameData.gems.find(candidate => String(candidate.id) === String(gem.courtId));
        if (court) {
            if (!Array.isArray(court.courtMembers)) court.courtMembers = [];
            if (!court.courtMembers.some(id => String(id) === String(gem.id))) court.courtMembers.push(gem.id);
        }
    }
    GameData.gems.push(gem);
    return gem;
}

function completeKindergartenJob(colony, job) {
    const outputCount = Math.floor(Math.random() * 3) + 1;
    const newGems = Array.from({ length: outputCount }, () => createGemFromKindergarten(job.gemType, colony));
    if (job) colony.kindergartenJobs = colony.kindergartenJobs.filter(activeJob => activeJob !== job);
    alert(`${newGems.length} ${job.gemType} gem${newGems.length === 1 ? '' : 's'} emerged from ${colony.name}.`);
    renderRoster();
    updateUI();
}

function createDiamondFromShrine(colony) {
    const name = `Diamond-${Math.floor(Math.random() * 900 + 100)}`;
    const placement = chooseRandomGemPlacement();
    return {
        id: 'diamond_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        type: 'Diamond',
        name,
        quality: placement === 'Mouth' ? 'Defective' : 'Perfect',
        placement,
        personality: chooseRandomGemPersonality(true),
        level: 0,
        guards: [],
        boosts: [],
        courtId: null,
        courtMembers: [],
        colonyIds: [],
        colonyId: colony?.id ?? null,
        colonyName: colony?.name ?? null,
        location: 'Court',
        guardOwnerId: null,
        image: 'https://placehold.co/200x200',
        galleryPool: ['https://placehold.co/200x200'],
        cutImage: '',
        status: 'Active',
        canFuse: Math.random() >= 0.5,
        relationships: {}
    };
}

function buildDiamondShrineKindergarten() {
    const colony = GameData.colonies.find(c => c.id === selectedColonyId);
    if (!colony) return;
    if (!GameData.structures.includes('Diamond Shrine')) return alert('Build the Diamond Shrine first.');
    if (colony.kindergartensBuilt + 5 > COLONY_OPTIONS.MAX_KINDERGARTENS) return alert('The Diamond Kindergarten requires five open Kindergarten spaces.');
    if (!Array.isArray(colony.shrineJobs)) colony.shrineJobs = [];
    if (colony.shrineJobs.length) return alert('This colony already has a Diamond Kindergarten in progress.');
    if (GameData.mode !== 'Roleplay' && GameData.essence < COLONY_OPTIONS.SHRINE_ESSENCE_COST) return alert('The Diamond Kindergarten requires 1000 Essence.');
    if (GameData.mode !== 'Roleplay') GameData.essence -= COLONY_OPTIONS.SHRINE_ESSENCE_COST;

    colony.kindergartensBuilt += 5;
    if (GameData.mode === 'Roleplay') {
        completeDiamondShrineJob(colony);
    } else {
        colony.shrineJobs.push({
            kind: 'diamond',
            startedAt: Date.now(),
            readyAt: Date.now() + getKindergartenDurationMs()
        });
        alert('Diamond Kindergarten started. One new Diamond will emerge when the timer completes.');
    }
    updateUI();
    renderColonies();
    openColonyControlPanel(colony.id);
}

function completeDiamondShrineJob(colony, job) {
    const diamond = createDiamondFromShrine(colony);
    GameData.gems.push(diamond);
    if (!Array.isArray(GameData.diamondsCouncil)) GameData.diamondsCouncil = [];
    GameData.diamondsCouncil.push({
        id: diamond.id,
        name: diamond.name,
        courtMembers: diamond.courtMembers,
        colonyIds: diamond.colonyIds
    });
    if (job) colony.shrineJobs = colony.shrineJobs.filter(activeJob => activeJob !== job);
    alert(`${diamond.name} emerged from the Diamond Shrine.`);
    renderRoster();
    updateUI();
}

function getPersonalityBehavior(gemOrPersonality) {
    const personality = typeof gemOrPersonality === 'string' ? gemOrPersonality : gemOrPersonality?.personality;
    return { ...PERSONALITY_BEHAVIOR_DEFAULTS, ...(PERSONALITY_BEHAVIORS[personality] || {}) };
}

function porcelainsCrackEvent(porcelain) {
    porcelain.status = 'Cracked';
    porcelain.crackCount = (porcelain.crackCount || 0) + 1;
    const courtDiamond = GameData.gems.find(g => String(g.id) === String(porcelain.courtId)) ||
        GameData.gems.find(g => g.type === 'Diamond' && isGemUsable(g)) || { name: 'their Diamond' };

    showEventChoices(
        `${porcelain.name} cracked while entertaining ${courtDiamond.name}! what will you do!`,
        [
            {
                id: 'heal',
                label: 'heal',
                action: () => {
                    porcelain.status = 'Fine';
                    addNotification(`${porcelain.name} was healed.`);
                    renderRoster();
                }
            },
            {
                id: 'shatter',
                label: 'just go ahead and shatter lil bruh',
                action: () => {
                    shatterLiveGem(porcelain.id);
                }
            },
            {
                id: 'ignore',
                label: 'ignore',
                action: () => {
                    addNotification(`${porcelain.name} was left cracked.`);
                    renderRoster();
                }
            }
        ]
    );
}

function soldierFightEvent(soldierA, soldierB) {
    soldierB.status = 'Cracked';
    soldierB.crackCount = (soldierB.crackCount || 0) + 1;

    showEventChoices(
        `${soldierA.name} and ${soldierB.name} got into a fight, and ${soldierA.name} cracked ${soldierB.name}! what will you do?`,
        [
            {
                id: 'heal-b',
                label: `heal ${soldierB.name}`,
                action: () => {
                    soldierB.status = 'Fine';
                    addNotification(`${soldierB.name} was healed after the fight.`);
                    renderRoster();
                }
            },
            {
                id: 'poof-a',
                label: `poof ${soldierA.name}`,
                action: () => {
                    poofLiveGem(soldierA.id);
                    addNotification(`${soldierA.name} was poofed for cracking ${soldierB.name}.`);
                }
            },
            {
                id: 'ignore-fight',
                label: 'Ignore',
                action: () => {
                    if (Math.random() < 0.25) {
                        const victim = Math.random() < 0.5 ? soldierA : soldierB;
                        GameData.pendingFightFollowup = { soldierA, soldierB, victim };
                    }
                    addNotification(`The fight between ${soldierA.name} and ${soldierB.name} was ignored.`);
                }
            }
        ]
    );
}

function triggerLiveGemEvent() {
    if (isEventPopupOpen()) return;

    if (GameData.pendingFightFollowup) {
        const { soldierA, soldierB, victim } = GameData.pendingFightFollowup;
        GameData.pendingFightFollowup = null;
        if (victim && isGemUsable(victim)) {
            showEventChoices(
                `${soldierA.name} and ${soldierB.name} started arguing again, and it got out of control. ${victim.name} got shattered in the fight. :(`,
                [{
                    id: 'fiddlesticks',
                    label: 'aw fiddlesticks',
                    action: () => {
                        shatterLiveGem(victim.id);
                    }
                }]
            );
            return;
        }
    }

    if (Math.random() >= (GameData.quicktimeFrequency ?? 0.025)) return;

    const usableGems = GameData.gems.filter(g => isGemUsable(g) && !g.fusionMembers && !g.inRebellion);

    const splitPairs = [];
    usableGems.forEach(gem => {
        if (gem.splitFusionPartner) {
            const partner = usableGems.find(other => String(other.id) === String(gem.splitFusionPartner));
            if (partner && !splitPairs.some(p => (p[0].id === gem.id && p[1].id === partner.id) || (p[0].id === partner.id && p[1].id === gem.id))) {
                splitPairs.push([gem, partner]);
            }
        }
    });

    if (splitPairs.length > 0 && Math.random() < 0.75) {
        const pair = splitPairs[Math.floor(Math.random() * splitPairs.length)];
        const [gemA, gemB] = pair;
        delete gemA.splitFusionPartner;
        delete gemB.splitFusionPartner;
        const fusion = createFusion(gemA, gemB);
        showEventChoices(
            `${gemA.name} and ${gemB.name} have fused again!`,
            [{
                id: 'refusion-ok',
                label: 'gyad damn queers...',
                action: () => {
                    closeEventPopup();
                }
            }]
        );
        return;
    }

    const availableEvents = typeof QUICKTIME_EVENTS !== 'undefined' ? QUICKTIME_EVENTS.filter(e => e.condition(usableGems)) : [];
    if (availableEvents.length > 0) {
        const chosen = availableEvents[Math.floor(Math.random() * availableEvents.length)];
        chosen.trigger(usableGems);
    }
}

function addDamagedTrait(gem) {
    if (!gem) return;
    if (!Array.isArray(gem.boosts)) gem.boosts = [];
    if (!gem.boosts.some(b => describeBoost(b) === 'Damaged' || b.id === 'damaged_trait')) {
        gem.boosts.push({
            id: 'damaged_trait',
            name: 'Damaged',
            stat: 'Historical Mark',
            desc: 'This gem was cracked multiple times or shattered once and restored. It bears the mark of its past hardships.',
            origin: 'Past Damage'
        });
    }
}

function crackLiveGem(gem) {
    if (!gem || ['Shattered', 'Bubbled'].includes(normalizeGemStatus(gem))) return;
    gem.crackCount = Number(gem.crackCount || 0) + 1;
    if (gem.crackCount >= 2) {
        addDamagedTrait(gem);
    }
    if (gem.crackCount > 2) {
        shatterLiveGem(gem.id, true);
        addNotification(`${gem.name} shattered after suffering more than two cracks.`);
        return;
    }
    gem.status = 'Cracked';
}

function getQualityScore(quality) {
    return { Defective: 0.65, Regular: 1, Perfect: 1.35 }[quality] || 1;
}

function getCasteScore(gem) {
    const caste = getGemCaste(gem);
    const tier = Object.values(GEM_TIERS).find(entry => entry.name === caste);
    return tier ? 1 + Number(tier.rank || 0) / 13 : 1;
}

function getTrialScore(defendant, zircon) {
    const zirconiumBonus = zircon.assignedZirconiumId ? 1.25 : 1;
    return (Number(defendant.level || 0) + 1) * getCasteScore(defendant) * getQualityScore(defendant.quality) * (Math.random() + 0.5) +
        (Number(zircon.level || 0) + 1) * getQualityScore(zircon.quality) * zirconiumBonus * (Math.random() + 0.5);
}

function resolveTrial(defendantA, zirconA, defendantB, zirconB) {
    const scoreA = getTrialScore(defendantA, zirconA);
    const scoreB = getTrialScore(defendantB, zirconB);
    const winnerSideA = scoreA >= scoreB;
    const loserGem = winnerSideA ? defendantB : defendantA;
    const loserZircon = winnerSideA ? zirconB : zirconA;
    shatterLiveGem(loserGem.id);
    shatterLiveGem(loserZircon.id);
    const winnerGem = winnerSideA ? defendantA : defendantB;
    const winnerZircon = winnerSideA ? zirconA : zirconB;
    addNotification(`${winnerGem.name} won the court trial with ${winnerZircon.name}; ${loserGem.name} and ${loserZircon.name} were shattered.`);
    renderRoster();
    renderGemDirectories();
}

function startTrialEvent() {
    if (!GameData.structures.includes('Trial Building')) return alert('Build the Trial Building first.');
    if (!canAccessShattering()) return alert('An Aragonite is required to authorize shattering in court trials.');
    const canEnterTrial = gem => getPersonalityBehavior(gem).canFight && getPersonalityBehavior(gem).canBeShattered;
    const zircons = GameData.gems.filter(gem => gem.type === 'Zircon' && isGemUsable(gem) && canEnterTrial(gem));
    const defendants = GameData.gems.filter(gem => gem.type !== 'Zircon' && gem.type !== 'Zirconium' && isGemUsable(gem) && canEnterTrial(gem));
    if (zircons.length < 2 || defendants.length < 2) return alert('A trial requires two usable Zircons and two usable defendant gems.');
    const zirconA = zircons[Math.floor(Math.random() * zircons.length)];
    const zirconB = zircons.filter(gem => gem.id !== zirconA.id)[Math.floor(Math.random() * (zircons.length - 1))];
    const defendantA = defendants[Math.floor(Math.random() * defendants.length)];
    const defendantB = defendants.filter(gem => gem.id !== defendantA.id)[Math.floor(Math.random() * (defendants.length - 1))];
    showEventChoices(`Court trial: ${zirconA.name} defends ${defendantA.name}; ${zirconB.name} defends ${defendantB.name}. Begin the trial?`, [
        { id: 'begin-trial', label: 'Begin Trial', action: () => resolveTrial(defendantA, zirconA, defendantB, zirconB) },
        { id: 'dismiss-trial', label: 'Dismiss', action: () => addNotification('The court trial was dismissed.') }
    ]);
}

function createFusion(gemA, gemB) {
    if (!gemA || !gemB || gemA === gemB || gemA.fusionMembers || gemB.fusionMembers) return null;
    if (gemA.canFuse === false || gemB.canFuse === false) return null;

    gemA.status = 'Fused';
    gemB.status = 'Fused';

    if (!GameData.fusionsCache) GameData.fusionsCache = {};
    const pairKey = [String(gemA.id), String(gemB.id)].sort().join(' + ');

    let fusion = GameData.fusionsCache[pairKey];
    if (fusion) {
        fusion.status = 'Fine';
        fusion.level = Math.max(Number(gemA.level || 0), Number(gemB.level || 0), Number(fusion.level || 0));
        if (!GameData.gems.some(g => String(g.id) === String(fusion.id))) {
            GameData.gems.push(fusion);
        }
    } else {
        const fusionType = getFusionGemType(gemA.type, gemB.type);
        const fusionPrefix = typeof getFusionPrefix === 'function' ? getFusionPrefix(gemA.customPrefix, gemB.customPrefix) : 'Placeholder';
        const fullName = fusionPrefix && fusionPrefix !== 'Placeholder' ? `${fusionPrefix} ${fusionType}`.trim() : fusionType;
        fusion = {
            id: `fusion_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            type: fusionType,
            name: fullName,
            customPrefix: fusionPrefix,
            quality: 'Fusion',
            placement: `${gemA.placement || gemA.gemPlacement} + ${gemB.placement || gemB.gemPlacement}`,
            fusionPlacements: [gemA.placement || gemA.gemPlacement, gemB.placement || gemB.gemPlacement],
            personality: `${gemA.personality} + ${gemB.personality}`,
            fusionPersonalities: [gemA.personality, gemB.personality],
            level: Math.max(Number(gemA.level || 0), Number(gemB.level || 0)),
            boosts: [...(gemA.boosts || []), ...(gemB.boosts || [])],
            guards: [],
            image: '',
            galleryPool: [],
            fusionMembers: [gemA.id, gemB.id],
            fusionMix: getFusionMixKey(gemA.type, gemB.type),
            status: 'Fine'
        };
        GameData.gems.push(fusion);
        GameData.fusionsCache[pairKey] = fusion;
    }

    addNotification(`${fusion.name} formed and replaced its component profile cards.`);
    renderRoster();
    updateUI();
    saveLocalGame();
    return fusion;
}

function normalizeFusionCharacter(fusion) {
    const members = (fusion.fusionMembers || [])
        .map(memberId => GameData.gems.find(gem => String(gem.id) === String(memberId)))
        .filter(Boolean);
    if (members.length !== 2) return;
    fusion.fusionPlacements = members.map(gem => gem.placement || gem.gemPlacement).filter(Boolean);
    fusion.fusionPersonalities = members.map(gem => gem.personality).filter(Boolean);
    fusion.fusionMix = getFusionMixKey(members[0].type, members[1].type);
    fusion.type = getFusionGemType(members[0].type, members[1].type);
    fusion.customPrefix = typeof getFusionPrefix === 'function' ? getFusionPrefix(members[0].customPrefix, members[1].customPrefix) : (fusion.customPrefix || 'Placeholder');
    fusion.name = fusion.customPrefix && fusion.customPrefix !== 'Placeholder' ? `${fusion.customPrefix} ${fusion.type}`.trim() : fusion.type;
    fusion.quality = 'Fusion';
    fusion.placement = fusion.fusionPlacements.join(' + ');
    fusion.personality = fusion.fusionPersonalities.join(' + ');
    fusion.guards = [];
}

function resolveFusionEvent(gemA, gemB) {
    const fusionType = getFusionGemType(gemA.type, gemB.type);
    const fusionPrefix = typeof getFusionPrefix === 'function' ? getFusionPrefix(gemA.customPrefix, gemB.customPrefix) : 'Placeholder';
    const fullName = (fusionPrefix && fusionPrefix !== 'Placeholder') ? `${fusionPrefix} ${fusionType}` : fusionType;

    const hasAragonite = GameData.gems.some(g => g.type === 'Aragonite' && isGemUsable(g));
    const hasRhyolite = GameData.gems.some(g => g.type === 'Rhyolite' && isGemUsable(g));

    const choices = [
        {
            id: 'keep-fusion',
            label: 'aww keep it',
            action: () => {
                const fusion = createFusion(gemA, gemB);
                if (fusion) {
                    addNotification(`${gemA.name} and ${gemB.name} fused into ${fusion.name}.`);
                }
            }
        },
        {
            id: 'split-fusion',
            label: 'no i hate love break up',
            action: () => {
                addNotification(`${gemA.name} and ${gemB.name} were forced to break up their fusion.`);
            }
        }
    ];

    if (hasAragonite) {
        choices.push({
            id: 'kill-fusion',
            label: 'ew kill it kill it',
            action: () => {
                shatterLiveGem(gemA.id);
                shatterLiveGem(gemB.id);
                addNotification(`${gemA.name} and ${gemB.name} were shattered.`);
            }
        });
    }

    if (hasRhyolite) {
        choices.push({
            id: 'neurolize-fusion',
            label: 'men in black neurolize them now',
            action: () => {
                gemA.level = 0; gemA.status = 'Fine';
                gemB.level = 0; gemB.status = 'Fine';
                addNotification(`${gemA.name} and ${gemB.name} were rejuvenated.`);
                renderRoster();
            }
        });
    }

    showEventChoices(`${gemA.name} and ${gemB.name} have been caught fusing into ${fullName}! what will you do?`, choices);
}

function splitFusionByMembers(gemA, gemB) {
    addGemRebellion(gemA, 15);
    addGemRebellion(gemB, 15);
    if (gemA) gemA.status = 'Fine';
    if (gemB) gemB.status = 'Fine';

    if (gemA && gemB) {
        const pairKey = [String(gemA.id), String(gemB.id)].sort().join(' + ');
        const fusion = GameData.gems.find(gem => gem.fusionMembers && gem.fusionMembers.includes(gemA.id) && gem.fusionMembers.includes(gemB.id));
        if (fusion) {
            if (!GameData.fusionsCache) GameData.fusionsCache = {};
            GameData.fusionsCache[pairKey] = fusion; // Preserve fusion profile in cache
            GameData.gems = GameData.gems.filter(gem => gem.id !== fusion.id);
        }
    }
    renderRoster();
    saveLocalGame();
    addNotification(`${gemA?.name || 'Gems'} split apart.`);
}

function splitFusionFromProfile(id) {
    const fusion = findLiveGem(id);
    if (!fusion || !fusion.fusionMembers) return;
    const members = fusion.fusionMembers.map(memberId => findLiveGem(memberId)).filter(Boolean);
    if (members.length === 2) {
        splitFusionByMembers(members[0], members[1]);
        closeProfile();
    }
}

// ==========================================
// 4. ROSTER & IMAGE GALLERY DIRECTORIES
// ==========================================
function populateGemTypeFilter() {
    const filter = document.getElementById('gem-type-filter');
    if (!filter) return;
    const selectedType = filter.value;
    const types = [...new Set([...Object.values(GEM_TIERS).flatMap(tier => tier.types), 'Placeholder'])]
        .sort((left, right) => left.localeCompare(right));
    filter.replaceChildren(new Option('All Gem Types', 'all'));
    types.forEach(type => filter.add(new Option(type, type)));
    if (types.includes(selectedType)) filter.value = selectedType;
}

function renderRoster() {
    const grid = document.getElementById('roster-grid');
    if(!grid) return;
    grid.innerHTML = '';
    
    const searchInput = document.getElementById('search-input');
    const filterInput = document.getElementById('gem-type-filter');
    const search = searchInput ? searchInput.value.toLowerCase() : '';
    const filter = filterInput ? filterInput.value : 'all';
    
    GameData.gems.filter(gem => !['Bubbled', 'Shattered', 'Fused'].includes(normalizeGemStatus(gem)) && !gem.inRebellion && !gem.storedIn).forEach(gem => {
        normalizeGemStatus(gem);
        const matchesSearch = gem.name.toLowerCase().includes(search) || gem.type.toLowerCase().includes(search);
        const matchesFilter = filter === 'all' || gem.type === filter;
        if (matchesSearch && matchesFilter) {
            const card = document.createElement('div');
            card.className = 'card';
            const safeId = String(gem.id).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            const caste = getGemCaste(gem);
            const unusable = ['Poofed', 'Bubbled', 'Shattered'].includes(gem.status);
            const qualityLabel = gem.fusionMembers ? 'Fusion' : `${gem.quality} Cut`;
            card.style.opacity = unusable ? '0.45' : '1';
            const rebellionMeter = gem.type === 'Diamond' ? '' : `<div class="gem-rebellion-meter" data-ui-asset="gem-rebellion-meter-ui" data-ui-kind="surface" role="meter" aria-label="Rebellion" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(gem.rebellion || 0)}" title="Rebellion: ${Math.round(gem.rebellion || 0)}%"><span style="height:${Math.max(0, Math.min(100, Number(gem.rebellion || 0)))}%"></span></div>`;
            card.innerHTML = `${rebellionMeter}${renderGemArtwork(gem, '', `${gem.name} portrait`)} <h4>${gem.name}</h4> <p style="font-size:0.75rem; opacity:0.7; margin:0 0 4px;">${caste}</p> <p style="font-size:0.8rem; opacity: 0.6; margin-bottom:4px;">${qualityLabel}</p> <p style="font-size:0.8rem; margin-bottom:10px;">Status: ${gem.status}</p> <button onclick="openProfile('${safeId}')" style="padding:6px; font-size:0.8rem; width:auto;">View Profile</button>`;
            grid.appendChild(card);
            if (rebellionMeter) applyUiAsset(card.querySelector('.gem-rebellion-meter'), 'gem-rebellion-meter-ui', 'surface');
        }
    });
    renderRebellionStatus();
}

function renderGemDirectories() {
    const bubbled = GameData.gems.filter(gem => normalizeGemStatus(gem) === 'Bubbled');
    const shattered = GameData.gems.filter(gem => normalizeGemStatus(gem) === 'Shattered');
    const bubbledBox = document.getElementById('bubbled-gems-directory');
    const shatteredBox = document.getElementById('shattered-gems-directory');
    if (bubbledBox) bubbledBox.innerHTML = bubbled.length ? bubbled.map(gem => `<div class="card gem-directory-row"><span class="gem-art-stack--directory">${renderGemArtwork(gem, '', `${gem.name} portrait`)}</span><span>${gem.name}<br><small>Status: Bubbled</small></span><button type="button" onclick="reformGem('${gem.id}')" style="width:auto; margin-left:auto;">Reform</button><button type="button" onclick="openProfile('${gem.id}')" style="width:auto;">Profile</button></div>`).join('') : 'No bubbled gems.';
    if (shatteredBox) shatteredBox.innerHTML = shattered.length ? shattered.map(gem => `<div class="card gem-directory-row" style="opacity:0.55;"><span class="gem-art-stack--directory">${renderGemArtwork(gem, '', `${gem.name} portrait`)}</span><span>${gem.name}<br><small>Status: Shattered, permanent</small></span><button type="button" onclick="openProfile('${gem.id}')" style="width:auto; margin-left:auto;">Profile</button></div>`).join('') : 'No shattered gems.';
}

function getStructureLevel(type) {
    if (!GameData.structureLevels) GameData.structureLevels = {};
    return Math.max(1, Number(GameData.structureLevels[type] || 1));
}

function getStructureSlots(type) {
    return 1 + Math.floor(getStructureLevel(type) / 50);
}

function getStructureTimeReduction(type) {
    return Math.min(COLONY_OPTIONS.STRUCTURE_MAX_TIME_REDUCTION, (getStructureLevel(type) - 1) * COLONY_OPTIONS.STRUCTURE_TIME_REDUCTION_PER_LEVEL);
}

function getActiveProductionJobs(type) {
    const jobs = GameData.structureJobs && GameData.structureJobs[type];
    return Array.isArray(jobs) ? jobs : [];
}

function getStructureTimerMs(type, baseMinutes) {
    const structureReduction = getStructureTimeReduction(type);
    const abaloneReduction = type === 'Reef' ? getReefAbaloneReduction() : 0;
    return Math.max(60 * 1000, baseMinutes * 60 * 1000 * (1 - structureReduction) * (1 - abaloneReduction));
}

function getStructureUiSlug(type) {
    return type.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function applyDynamicUiAssets(container) {
    container.querySelectorAll('[data-ui-asset]').forEach(element => {
        const names = element.dataset.uiAsset.split(',').map(name => name.trim());
        applyUiAsset(element, names, element.dataset.uiKind || 'surface');
    });
}

function renderStructureMenu(type, content) {
    const modal = document.getElementById('structure-modal');
    const title = document.getElementById('structure-modal-title');
    const menu = document.getElementById('structure-modal-content');
    if (!modal || !title || !menu) return;
    title.textContent = type;
    menu.innerHTML = content;
    applyDynamicUiAssets(menu);
    modal.style.display = 'flex';
}

function closeStructureModal() {
    const modal = document.getElementById('structure-modal');
    if (modal) modal.style.display = 'none';
}

function getStructureStorageRules(type) {
    const overseerRules = {
        'Grand Ballet Hall': { occupantType: 'Porcelain', overseerType: 'Rhyolite', overseersPerLevel: 20 },
        'Grand Ballroom': { occupantType: 'Jade', overseerType: 'Larkavite', overseersPerLevel: 20 },
        'Grand Theater': { occupantType: 'Lepidolite', overseerType: 'Cinnabar', overseersPerLevel: 20 },
        'Soldier Ship': {
            occupantTypes: [
                'Ruby', 'Amethyst', 'Rose Quartz', 'Jasper', 'Citrine', 'Carnelian',
                'Honey Quartz', 'Clear Quartz', 'Smoky Quartz', 'Milky Quartz',
                'Ametrine', 'Prasiolite', "Tiger's Eye", "Hawk's Eye", 'Rutile',
                'Bloodstone', 'Cherry Quartz', 'Flint', 'Chert', 'Obsidian'
            ],
            overseerType: 'Agate',
            overseersPerLevel: 20
        }
    };
    if (overseerRules[type]) return overseerRules[type];
    if (type === 'Archives') return { occupantType: 'Psilomelane', baseCapacity: 5, levelsPerSlot: 10, noOverseerRequired: true };
    if (type === 'Grand Circus') return { occupantType: 'Tanzanite', baseCapacity: 5, levelsPerSlot: 5, noOverseerRequired: true };
    if (type === 'Grand Palace') return { eliteOnly: true, baseCapacity: 10, levelsPerSlot: 10 };
    if (type === 'Reef') return { overseerType: 'Abalone', overseersPerLevel: Infinity, noOverseerRequired: true };
    return null;
}

function getStructureStorage(type) {
    if (!GameData.structureStorage || typeof GameData.structureStorage !== 'object') GameData.structureStorage = {};
    if (!GameData.structureStorage[type]) GameData.structureStorage[type] = { occupantIds: [], overseerIds: [] };
    const storage = GameData.structureStorage[type];
    if (!Array.isArray(storage.occupantIds)) storage.occupantIds = [];
    if (!Array.isArray(storage.overseerIds)) storage.overseerIds = [];
    return storage;
}

function getStructureStorageCapacity(type) {
    const rules = getStructureStorageRules(type);
    if (!rules || rules.overseerType) {
        if (!rules?.overseerType) return 0;
        if (type === 'Reef') return 1 + Math.floor((getStructureLevel(type) - 1) / 20);
        return (1 + Math.floor((getStructureLevel(type) - 1) / rules.overseersPerLevel)) * 10;
    }
    if (rules.eliteOnly) return rules.baseCapacity + Math.floor((getStructureLevel(type) - 1) / rules.levelsPerSlot) * 5;
    return rules.baseCapacity + Math.floor((getStructureLevel(type) - 1) / rules.levelsPerSlot);
}

function getEligibleStructureGems(type, role) {
    const rules = getStructureStorageRules(type);
    const storage = getStructureStorage(type);
    const storedIds = new Set([...storage.occupantIds, ...storage.overseerIds].map(String));
    if (role === 'overseer') {
        return GameData.gems.filter(gem => gem.type === rules.overseerType && isGemUsable(gem) && !storedIds.has(String(gem.id)));
    }
    return GameData.gems.filter(gem => {
        if (!isGemUsable(gem) || storedIds.has(String(gem.id))) return false;
        if (rules.eliteOnly) {
            const tier = Object.values(GEM_TIERS).find(entry => entry.types.includes(gem.type));
            return tier && tier.rank >= 8 && gem.type !== 'Diamond';
        }
        if (type === 'Soldier Ship' && (gem.deformity === 'Soft-Spoken' || (Array.isArray(gem.boosts) && gem.boosts.some(b => describeBoost(b) === 'Soft-Spoken')))) {
            return false;
        }
        if (Array.isArray(rules.occupantTypes)) {
            return rules.occupantTypes.includes(gem.type);
        }
        return gem.type === rules.occupantType;
    });
}

function renderStoredStructureMenu(type) {
    const rules = getStructureStorageRules(type);
    const storage = getStructureStorage(type);
    const level = getStructureLevel(type);
    const capacity = getStructureStorageCapacity(type);
    const occupants = storage.occupantIds.map(id => findLiveGem(id)).filter(Boolean);
    const overseers = storage.overseerIds.map(id => findLiveGem(id)).filter(Boolean);
    const eligible = getEligibleStructureGems(type, 'occupant');
    const slug = getStructureUiSlug(type);
    const safeType = escapeGemArtAttribute(type);
    const capacityLabel = capacity === Infinity ? 'Unlimited overseer positions' : `${occupants.length}/${capacity} stored`;
    const occupantOptions = eligible.map(gem => `<option value="${escapeGemArtAttribute(gem.id)}">${escapeGemArtAttribute(gem.name)} (${escapeGemArtAttribute(gem.type)})</option>`).join('');
    const occupantLabel = Array.isArray(rules.occupantTypes) ? 'soldier' : rules.occupantType;
    const occupantControl = rules.overseerType
        ? `<label>Store ${escapeGemArtAttribute(occupantLabel)}<select id="structure-storage-select" data-ui-asset="structure-storage-select-ui" data-ui-kind="textbox"><option value="">Choose gem</option>${occupantOptions}</select></label><button type="button" data-storage-add="occupant" data-ui-asset="${slug}-store-button-ui" data-ui-kind="button" ${occupants.length >= capacity ? 'disabled' : ''}>Store Gem</button>`
        : `<label>Store gem<select id="structure-storage-select" data-ui-asset="structure-storage-select-ui" data-ui-kind="textbox"><option value="">Choose gem</option>${occupantOptions}</select></label><button type="button" data-storage-add="occupant" data-ui-asset="${slug}-store-button-ui" data-ui-kind="button" ${occupants.length >= capacity ? 'disabled' : ''}>Store Gem</button>`;
    const overseerOptions = rules.overseerType ? getEligibleStructureGems(type, 'overseer')
        .map(gem => `<option value="${escapeGemArtAttribute(gem.id)}">${escapeGemArtAttribute(gem.name)}</option>`).join('') : '';
    const overseerControl = rules.overseerType
        ? `<div><label>Overseer (${overseers.length}/${capacity === Infinity ? 'unlimited' : 1 + Math.floor((level - 1) / rules.overseersPerLevel)})<select id="structure-overseer-select" data-ui-asset="structure-overseer-select-ui" data-ui-kind="textbox"><option value="">Choose ${escapeGemArtAttribute(rules.overseerType)}</option>${overseerOptions}</select></label><button type="button" data-storage-add="overseer" data-ui-asset="${slug}-overseer-button-ui" data-ui-kind="button" ${overseers.length >= (capacity === Infinity ? Infinity : 1 + Math.floor((level - 1) / rules.overseersPerLevel)) ? 'disabled' : ''}>Assign Overseer</button></div>`
        : '';
    const occupantRows = occupants.length ? occupants.map(gem => `<div class="stored-gem-row"><span>${escapeGemArtAttribute(gem.name)}</span><button type="button" data-storage-remove="occupant" data-gem-id="${escapeGemArtAttribute(gem.id)}" data-ui-asset="${slug}-withdraw-button-ui" data-ui-kind="button">Take Out</button></div>`).join('') : '<p>No gems stored.</p>';
    const overseerRows = overseers.map(gem => `<div class="stored-gem-row"><span>${escapeGemArtAttribute(gem.name)} (overseer)</span><button type="button" data-storage-remove="overseer" data-gem-id="${escapeGemArtAttribute(gem.id)}" data-ui-asset="${slug}-withdraw-button-ui" data-ui-kind="button">Take Out</button></div>`).join('');
    const content = `<div class="structure-menu-summary">Level ${level} | ${capacityLabel}</div><div class="structure-menu-actions"><button type="button" data-ui-asset="${slug}-level-button-ui" data-ui-kind="button" onclick="levelUpStructure('${safeType}')">Level Up Structure</button></div>${overseerControl}<div class="structure-menu-actions">${occupantControl}</div><div class="stored-gem-list">${overseerRows}${occupantRows}</div>`;
    renderStructureMenu(type, content);
    const menu = document.getElementById('structure-modal-content');
    menu.querySelectorAll('[data-storage-add]').forEach(button => {
        button.onclick = () => {
            const role = button.dataset.storageAdd;
            const select = document.getElementById(role === 'overseer' ? 'structure-overseer-select' : 'structure-storage-select');
            if (select?.value) storeGemInStructure(type, select.value, role);
        };
    });
    menu.querySelectorAll('[data-storage-remove]').forEach(button => {
        button.onclick = () => withdrawGemFromStructure(type, button.dataset.gemId);
    });
}

function storeGemInStructure(type, gemId, role = 'occupant') {
    const gem = findLiveGem(gemId);
    const rules = getStructureStorageRules(type);
    const storage = getStructureStorage(type);
    if (!gem || !rules || !isGemUsable(gem)) return;
    const destination = role === 'overseer' ? storage.overseerIds : storage.occupantIds;
    const capacity = role === 'overseer'
        ? (type === 'Reef' ? getStructureStorageCapacity(type) : (rules.overseersPerLevel === Infinity ? Infinity : 1 + Math.floor((getStructureLevel(type) - 1) / rules.overseersPerLevel)))
        : getStructureStorageCapacity(type);
    if (destination.length >= capacity) return alert(`${type} has no remaining ${role} capacity.`);
    const eligible = getEligibleStructureGems(type, role);
    if (!eligible.some(candidate => String(candidate.id) === String(gem.id))) return alert(`${gem.name} cannot be stored in ${type}.`);
    destination.push(gem.id);
    gem.storedIn = type;
    gem.location = type;
    addNotification(`${gem.name} entered ${type} and is now away from the active roster.`);
    renderRoster();
    showStructureInventory(type);
}

function withdrawGemFromStructure(type, gemId) {
    const storage = getStructureStorage(type);
    storage.occupantIds = storage.occupantIds.filter(id => String(id) !== String(gemId));
    storage.overseerIds = storage.overseerIds.filter(id => String(id) !== String(gemId));
    const gem = findLiveGem(gemId);
    if (gem) {
        delete gem.storedIn;
        gem.location = 'Court';
        addNotification(`${gem.name} left ${type} and returned to the active roster.`);
    }
    renderRoster();
    showStructureInventory(type);
}

function advanceStoredGemDepartures() {
    Object.entries(GameData.structureStorage || {}).forEach(([type, storage]) => {
        const rules = getStructureStorageRules(type);
        if (!rules || rules.noOverseerRequired || storage.overseerIds?.length) return;
        const storedIds = [...(storage.occupantIds || []), ...(storage.overseerIds || [])];
        if (!storedIds.length || Math.random() >= 0.001) return;
        const id = storedIds[Math.floor(Math.random() * storedIds.length)];
        storage.occupantIds = (storage.occupantIds || []).filter(memberId => String(memberId) !== String(id));
        storage.overseerIds = (storage.overseerIds || []).filter(memberId => String(memberId) !== String(id));
        const gem = findLiveGem(id);
        if (!gem) return;
        delete gem.storedIn;
        gem.location = 'Court';
        addNotification(`${gem.name} left ${type} without an overseer and returned to the active roster.`);
        renderRoster();
    });
}

function showStructureInventory(type) {
    if (!GameData.structures.includes(type)) return;
    if (type === 'Healing Center') return showHealingCenter();
    if (['Grand Ballet Hall', 'Grand Ballroom', 'Grand Theater', 'Archives', 'Grand Circus', 'Grand Palace', 'Soldier Ship'].includes(type)) return renderStoredStructureMenu(type);
    if (type === 'Organic Zoo') {
        return renderStructureMenu(type, '<div class="structure-menu-summary">The Organic Zoo is online. It has no active function yet.</div>');
    }
    if (type === 'Gathering Hall') {
        return renderStructureMenu(type, '<div class="structure-menu-summary">Gatherings lower Rebellion for every eligible gem.</div><div class="structure-menu-actions"><button type="button" data-ui-asset="gathering-hall-host-ball-button-ui" data-ui-kind="button" onclick="hostImperialBall()">Host Ball</button></div>');
    }

    const level = getStructureLevel(type);
    const slots = getStructureSlots(type);
    const structureReduction = getStructureTimeReduction(type);
    const timerLabel = GameData.mode === 'Roleplay' ? 'Immediate gem creation' : `Timer reduction: ${Math.round(structureReduction * 1000) / 10}%`;
    let content = '';

    if (type === 'Extractor Injection Rig') {
        content = `<div class="structure-menu-summary">Level ${level} | Extraction throughput increased.</div><div class="structure-menu-actions"><button type="button" data-ui-asset="extractor-injection-rig-level-button-ui" data-ui-kind="button" onclick="levelUpStructure('Extractor Injection Rig')">Level Rig</button></div>`;
    } else if (type === 'Diamond Shrine') {
        content = `<div class="structure-menu-summary">Level ${level} | ${slots} shrine slot${slots === 1 ? '' : 's'} | ${timerLabel}</div><div class="structure-menu-summary">Diamond Shrine online. Open a colony menu to start a Diamond Kindergarten.</div>`;
    } else if (type === 'Trial Building') {
        content = `<div class="structure-menu-summary">Trial Building unlocked.</div><div class="structure-menu-actions"><button type="button" data-ui-asset="trial-building-court-trial-button-ui" data-ui-kind="button" onclick="startTrialEvent()">Open Court Trial</button></div>`;
    } else if (type === 'Reef') {
        const pearls = GameData.gems.filter(gem => gem.type === 'Pearl' && isGemUsable(gem));
        const jobs = getActiveProductionJobs('Reef');
        const abaloneStorage = getStructureStorage('Reef');
        const abalone = abaloneStorage.overseerIds.map(id => findLiveGem(id)).filter(Boolean);
        const availableAbalone = getEligibleStructureGems('Reef', 'overseer');
        const abaloneOptions = availableAbalone.map(gem => `<option value="${escapeGemArtAttribute(gem.id)}">${escapeGemArtAttribute(gem.name)} (Level ${Number(gem.level || 0)})</option>`).join('');
        const assignedAbalone = abalone.map(gem => `<div class="stored-gem-row"><span>${escapeGemArtAttribute(gem.name)} oversees Pearl production</span><button type="button" data-reef-remove-abalone="${escapeGemArtAttribute(gem.id)}" data-ui-asset="reef-withdraw-button-ui" data-ui-kind="button">Withdraw</button></div>`).join('');
        content = `<div class="structure-menu-summary">Level ${level} | ${slots} production slot${slots === 1 ? '' : 's'} | Timer reduction: ${Math.round((structureReduction + getReefAbaloneReduction()) * 1000) / 10}%</div><div class="structure-menu-actions"><button type="button" data-ui-asset="reef-level-button-ui" data-ui-kind="button" onclick="levelUpStructure('Reef')">Level Reef</button><button type="button" data-ui-asset="reef-create-pearl-button-ui" data-ui-kind="button" onclick="createPearlFromReef()" ${GameData.mode !== 'Roleplay' && jobs.length >= slots ? 'disabled' : ''}>${GameData.mode === 'Roleplay' ? 'Create Pearl' : 'Start Pearl Creation (30 minutes)'}</button></div><label>Abalone overseer<select id="reef-abalone-select" data-ui-asset="reef-abalone-select-ui" data-ui-kind="textbox"><option value="">Choose Abalone</option>${abaloneOptions}</select></label><button type="button" data-ui-asset="reef-overseer-button-ui" data-ui-kind="button" onclick="assignSelectedAbaloneToReef()" ${abalone.length >= getStructureStorageCapacity('Reef') ? 'disabled' : ''}>Assign Abalone</button>${assignedAbalone}<div>${pearls.length ? pearls.map(pearl => `${escapeGemArtAttribute(pearl.name)} (${escapeGemArtAttribute(pearl.quality)})`).join('<br>') : '<span>No pearls available.</span>'}</div>`;
    } else if (type === 'Spinel Funhouse') {
        const spinels = GameData.gems.filter(gem => gem.type === 'Spinel' && isGemUsable(gem));
        const hasTaaffeite = GameData.gems.some(gem => gem.type === 'Taaffeite' && isGemUsable(gem));
        const jobs = getActiveProductionJobs('Spinel Funhouse');
        content = `<div class="structure-menu-summary">Level ${level} | ${slots} production slot${slots === 1 ? '' : 's'} | ${timerLabel}</div><div class="structure-menu-actions"><button type="button" data-ui-asset="spinel-funhouse-level-button-ui" data-ui-kind="button" onclick="levelUpStructure('Spinel Funhouse')">Level Funhouse</button><button type="button" data-ui-asset="spinel-funhouse-create-spinel-button-ui" data-ui-kind="button" onclick="createSpinelFromFunhouse()" ${!hasTaaffeite || (GameData.mode !== 'Roleplay' && jobs.length >= slots) ? 'disabled' : ''}>${GameData.mode === 'Roleplay' ? 'Create Spinel' : 'Start Spinel Creation (20 minutes)'}</button></div>${spinels.length ? spinels.map(spinel => `<div>${spinel.name} (${spinel.quality})</div>`).join('') : '<span>No spinels available.</span>'}`;
    } else if (type === 'Gem Forge') {
        const bismuths = GameData.gems.filter(gem => gem.type === 'Bismuth' && isGemUsable(gem));
        const targetOptions = GameData.gems
            .filter(gem => gem.type !== 'Bismuth' && isGemUsable(gem))
            .map(gem => `<option value="${gem.id}">${gem.name} (${getGemCaste(gem)})</option>`).join('');
        const blueprintButtons = FORGERY_BLUEPRINTS.map(blueprint =>
            `<button type="button" data-ui-asset="gem-forge-blueprint-button-ui" data-ui-kind="button" ${!bismuths.length || (GameData.mode !== 'Roleplay' && getActiveProductionJobs('Gem Forge').length >= slots) ? 'disabled' : ''} onclick="craftForgedBoost('${blueprint.id}')">${blueprint.name}</button>`
        ).join('');
        content = `<div class="structure-menu-summary">Level ${level} | ${slots} production slot${slots === 1 ? '' : 's'} | ${timerLabel}</div><div class="structure-menu-actions"><button type="button" data-ui-asset="gem-forge-level-button-ui" data-ui-kind="button" onclick="levelUpStructure('Gem Forge')">Level Forge</button></div><div><strong>Bismuth in forge:</strong> ${bismuths.length}</div><label for="forge-target-gem">Gem receiving the boost:</label><select id="forge-target-gem" data-ui-asset="gem-forge-target-select-ui" data-ui-kind="textbox">${targetOptions || '<option value="">No eligible gems</option>'}</select><div class="structure-menu-actions">${blueprintButtons || '<span>No blueprints available.</span>'}</div><div>Active boost jobs: ${getActiveProductionJobs('Gem Forge').length}/${slots}</div>`;
    }

    renderStructureMenu(type, content);
    document.querySelectorAll('[data-reef-remove-abalone]').forEach(button => {
        button.onclick = () => withdrawGemFromStructure('Reef', button.dataset.reefRemoveAbalone);
    });
}

function getReefAbaloneReduction() {
    const ids = GameData.structureStorage?.Reef?.overseerIds || [];
    const level = ids.map(id => findLiveGem(id)).filter(Boolean).reduce((sum, gem) => sum + Math.max(0, Number(gem.level || 0)), 0);
    return Math.min(0.8, level * 0.01);
}

function assignSelectedAbaloneToReef() {
    const select = document.getElementById('reef-abalone-select');
    if (select?.value) storeGemInStructure('Reef', select.value, 'overseer');
}

function hostImperialBall() {
    if (!GameData.structures.includes('Gathering Hall')) return alert('Build a Gathering Hall first.');
    if (GameData.mode === 'Roleplay') return alert('Rebellion meters do not change in Roleplay mode.');
    GameData.gems.forEach(gem => {
        if (gem.type !== 'Diamond') gem.rebellion = Math.max(0, Number(gem.rebellion || 0) - 25);
    });
    renderRoster();
    renderStructureMenu('Gathering Hall', '<div class="structure-menu-summary">The ball lowered Rebellion by 25 points for every non-Diamond gem.</div><div class="structure-menu-actions"><button type="button" data-ui-asset="gathering-hall-host-ball-button-ui" data-ui-kind="button" onclick="hostImperialBall()">Host Another Ball</button></div>');
    addNotification('The Gathering Hall hosted a ball. Rebellion fell across the empire.');
}

function craftForgedBoost(blueprintId, targetGemId) {
    const targetSelect = document.getElementById('forge-target-gem');
    const targetId = targetGemId || (targetSelect ? targetSelect.value : selectedGemId);
    const gem = GameData.gems.find(g => String(g.id) === String(targetId));
    if (!gem) return alert('Select a gem profile before forging a boost.');

    const blueprint = FORGERY_BLUEPRINTS.find(bp => bp.id === blueprintId);
    if (!blueprint) return alert('This forging blueprint is not available.');

    const bismuth = GameData.gems.find(g => g.type === 'Bismuth' && isGemUsable(g) && (!g.inForge || GameData.mode === 'Roleplay'));
    if (!bismuth) return alert('The forge needs at least one active Bismuth laborer assigned to it.');
    if (GameData.mode !== 'Roleplay' && getActiveProductionJobs('Gem Forge').length >= getStructureSlots('Gem Forge')) return alert('All Gem Forge production slots are busy.');

    if (!Array.isArray(gem.boosts)) gem.boosts = [];
    if (gem.boosts.some(boost => boost.id === blueprint.id || describeBoost(boost) === blueprint.name)) {
        return alert(`${gem.name} already has ${blueprint.name}.`);
    }

    if (GameData.mode === 'Roleplay') {
        gem.boosts.push({ id: blueprint.id, name: blueprint.name, stat: blueprint.stat, desc: blueprint.desc, origin: 'Forged' });
        showStructureInventory('Gem Forge');
        alert(`${blueprint.name} was forged instantly for ${gem.name}.`);
        return;
    }

    if (!GameData.structureJobs) GameData.structureJobs = {};
    if (!GameData.structureJobs['Gem Forge']) GameData.structureJobs['Gem Forge'] = [];
    bismuth.inForge = true;
    GameData.structureJobs['Gem Forge'].push({
        kind: 'boost',
        blueprintId: blueprint.id,
        targetGemId: gem.id,
        readyAt: Date.now() + getStructureTimerMs('Gem Forge', 30)
    });
    showStructureInventory('Gem Forge');
    alert(`${blueprint.name} is being forged for ${gem.name}. It will be ready when the 30-minute timer completes.`);
}

function getLevelCost(gem) {
    const currentLevel = Number(gem.level || 0);
    let materials = (30 + (currentLevel * 25)) * 10;
    let essence = (6 + (currentLevel * 4)) * 10;
    if (gem && gem.type === 'Diamond') {
        materials *= 3;
        essence *= 3;
    }
    return { materials, essence };
}

function getGemCaste(gem) {
    if (!gem) return "Unassigned";
    if (gem.fusionMembers) return 'Fusion';
    let bestTier = null;
    Object.entries(GEM_TIERS).forEach(([key, tier]) => {
        if (Array.isArray(tier.types) && tier.types.includes(gem.type)) {
            if (!bestTier || Number(tier.rank) > Number(bestTier.rank)) {
                bestTier = tier;
            }
        }
    });
    return bestTier ? bestTier.name : "Unclassified";
}

function describeBoost(boost) {
    if (!boost) return "Unknown boost";
    if (typeof boost === 'string') return boost;
    return boost.name || boost.stat || boost.id || 'Boost';
}

function getAvailableGuardUnits(guardType) {
    return GameData.gems.filter(gem =>
        gem.type === guardType &&
        isGemUsable(gem) &&
        !gem.guardOwnerId &&
        String(gem.id) !== String(selectedGemId)
    );
}

function canEquipGuard(gem, guardType) {
    if (!gem || gem.fusionMembers) return false;
    const caste = getGemCaste(gem).toLowerCase();
    if (['expendable', 'guard', 'soldier'].some(restrictedTier => caste.includes(restrictedTier))) return false;
    if (guardType === 'Zirconium') return gem.type === 'Zircon';
    if (!['Pearl', 'Ruby', 'Spinel'].includes(guardType)) return false;
    if (gem.type === 'Hessonite' || gem.type === 'Taaffeite') return true;
    if (gem.type === 'Sapphire' && Number(gem.level || 0) >= 10) return true;
    if (gem.quality === 'Perfect' && guardType === 'Pearl') return true;
    if (guardType === 'Spinel' && Number(gem.level || 0) >= 5) return true;
    if (guardType === 'Ruby' && Number(gem.level || 0) >= 1) return true;
    return false;
}

function renderGuardAssignmentMenu(gem) {
    const assignmentContainer = document.getElementById('guard-assignment-menu');
    if (!assignmentContainer) return;

    assignmentContainer.innerHTML = '';
    if (gem.fusionMembers) {
        const panel = document.createElement('div');
        panel.className = 'guard-ineligible-panel';
        panel.dataset.uiAsset = 'fusion-guard-ineligible-panel-ui';
        panel.dataset.uiKind = 'surface';
        panel.textContent = 'Fusions cannot be assigned guards.';
        assignmentContainer.appendChild(panel);
        applyUiAsset(panel, panel.dataset.uiAsset, panel.dataset.uiKind, PROFILE_UI_ASSET_ROOT);
        return;
    }

    const guardTypes = gem.type === 'Zircon' ? ['Zirconium'] : ['Pearl', 'Ruby', 'Spinel'];

    guardTypes.forEach((guardType) => {
        const available = getAvailableGuardUnits(guardType);
        if (!available.length || !canEquipGuard(gem, guardType)) return;

        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.gap = '8px';
        row.style.marginTop = '6px';

        const select = document.createElement('select');
        select.style.flex = '1';
        select.id = `guard-select-${guardType.toLowerCase()}`;

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = `Select ${guardType}`;
        select.appendChild(defaultOption);

        available.forEach(unit => {
            const option = document.createElement('option');
            option.value = String(unit.id);
            option.textContent = `${unit.name} (${unit.quality})`;
            select.appendChild(option);
        });

        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = `Assign ${guardType}`;
        button.style.width = 'auto';
        button.onclick = () => {
            const selectedId = select.value;
            if (!selectedId) return alert(`Choose a specific ${guardType} to assign.`);
            assignGuard(guardType, selectedId);
        };

        row.appendChild(select);
        row.appendChild(button);
        assignmentContainer.appendChild(row);
    });
}

function renderProfileAssignments(gem) {
    renderProfileGuardCards(gem);
    renderProfileBoosts(gem);
    const levelValue = document.getElementById('prof-level');
    const level = Math.max(0, Number(gem.level || 0));
    const maxLevel = Number(CONFIG.LEVELS.MAX || 100);
    if (levelValue) levelValue.innerText = String(level);

    const pearlEligible = canEquipGuard(gem, 'Pearl');
    const isMaxed = level >= maxLevel;
    const progress = pearlEligible || isMaxed ? 100 : Math.min(100, (level / maxLevel) * 100);
    const progressTrack = document.querySelector('.profile-level-track');
    const progressBar = document.getElementById('prof-level-progress');
    const milestone = document.getElementById('prof-level-milestone');
    const levelButton = document.getElementById('prof-level-up-button');
    if (progressTrack) progressTrack.setAttribute('aria-valuenow', String(Math.round(progress)));
    if (milestone) milestone.innerText = isMaxed ? 'Maximum level reached' : pearlEligible ? 'Pearl eligible' : `Progress to level ${maxLevel}`;
    if (progressBar) {
        progressBar.classList.add('is-animating');
        requestAnimationFrame(() => { progressBar.style.width = `${progress}%`; });
    }
    if (levelButton) levelButton.disabled = isMaxed;

    const casteValue = document.getElementById('prof-caste');
    if (casteValue) casteValue.innerText = getGemCaste(gem);

    const boostValue = document.getElementById('prof-boosts');
    if (boostValue) {
        const boosts = Array.isArray(gem.boosts) && gem.boosts.length ? gem.boosts.map(boost => boost.name || boost.id || 'Boost').join(', ') : 'None';
        boostValue.innerText = boosts;
    }

    const costLabel = document.getElementById('prof-level-cost');
    if (costLabel) {
        const nextCost = getLevelCost(gem);
        costLabel.innerText = isMaxed ? 'MAX LEVEL' : `Level ${level + 1}\n${nextCost.materials} Materials\n${nextCost.essence} Essence`;
    }

    renderGuardAssignmentMenu(gem);
}

function renderProfileGuardCards(gem) {
    const container = document.getElementById('prof-guards');
    if (!container) return;
    const guards = (Array.isArray(gem.guards) ? gem.guards : []).map(guard => ({
        record: guard,
        unit: GameData.gems.find(candidate => String(candidate.id) === String(guard.id))
    }));
    container.innerHTML = '';
    if (!guards.length) {
        container.textContent = 'No guards assigned';
        return;
    }
    guards.forEach(({ record, unit }) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'profile-guard-button';
        button.setAttribute('aria-label', `Open ${unit?.name || record.name || record.type} profile`);
        button.title = unit?.name || record.name || record.type || 'Guard';
        button.innerHTML = unit ? renderGemArtwork(unit, '', `${unit.name} portrait`, '', 'card', true) : '';
        if (unit) button.onclick = () => openProfile(unit.id);
        else button.disabled = true;
        container.appendChild(button);
    });
}

function renderProfileBoosts(gem) {
    const panel = document.getElementById('prof-boosts-panel');
    const list = document.getElementById('prof-boosts');
    if (!panel || !list) return;
    const boosts = Array.isArray(gem.boosts) ? gem.boosts : [];
    panel.hidden = boosts.length === 0;
    list.innerHTML = '';
    boosts.forEach(boost => {
        const item = document.createElement('li');
        item.textContent = describeBoost(boost);
        list.appendChild(item);
    });
}

function updateStructureCardButton(button, type, buildLabel, cost, canBuild = true) {
    if (!button) return;
    const isBuilt = GameData.structures.includes(type);
    const requirements = STRUCTURE_UNLOCK_REQUIREMENTS[type] || [];
    const prerequisitesMet = requirements.every(requiredType => GameData.gems.some(gem =>
        gem.type === requiredType && !['Shattered', 'Fused'].includes(normalizeGemStatus(gem))
    ));
    const card = document.getElementById(STRUCTURE_CARD_IDS[type]);
    if (card) {
        if (type === 'Diamond Shrine' || type === 'Reef') {
            card.hidden = !isBuilt && !canBuild;
        } else {
            card.hidden = !isBuilt && !prerequisitesMet;
        }
    }
    const label = isBuilt ? `Open ${type}` : buildLabel;
    const assetName = `${getStructureUiSlug(type)}-${isBuilt ? 'open' : 'build'}-button-ui`;
    const assetChanged = button.dataset.uiAsset !== assetName;
    button.textContent = label;
    button.setAttribute('aria-label', label);
    button.disabled = !isBuilt && (!canBuild || !prerequisitesMet);
    button.onclick = () => isBuilt ? showStructureInventory(type) : buildStructure(type, cost);
    if (assetChanged) {
        button.dataset.uiAsset = assetName;
        applyUiAsset(button, assetName, 'button');
    }
}

function renderStructureInventoryButtons() {
    const hasTaaffeite = GameData.gems.some(gem => gem.type === 'Taaffeite' && isGemUsable(gem));
    const hasBismuth = GameData.gems.some(gem => gem.type === 'Bismuth' && isGemUsable(gem));
    const hasZircon = GameData.gems.some(gem => gem.type === 'Zircon' && isGemUsable(gem));
    const hasAragonite = canAccessShattering();
    const hasAbalone = GameData.gems.some(gem => gem.type === 'Abalone' && !['Shattered', 'Fused'].includes(normalizeGemStatus(gem)));
    const hasLevel100Diamond = GameData.gems.some(gem => gem.type === 'Diamond' && Number(gem.level || 0) >= 100);

    updateStructureCardButton(document.getElementById('rig-structure-button'), 'Extractor Injection Rig', 'Build Rig (15000 Materials)', 15000);
    updateStructureCardButton(document.getElementById('reef-structure-button'), 'Reef', 'Build Reef (25000 Materials)', 25000, hasAbalone);
    updateStructureCardButton(document.getElementById('funhouse-structure-button'), 'Spinel Funhouse', hasTaaffeite ? 'Build Funhouse (30000 Materials)' : 'Build Funhouse (Taaffeite Required)', 30000, hasTaaffeite);
    updateStructureCardButton(document.getElementById('forge-structure-button'), 'Gem Forge', hasBismuth ? 'Build Forge (35000 Materials)' : 'Build Forge (Bismuth Required)', 35000, hasBismuth);
    updateStructureCardButton(document.getElementById('shrine-structure-button'), 'Diamond Shrine', 'Build Shrine (250000 Materials)', COLONY_OPTIONS.SHRINE_KINDERGARTEN_COST, hasLevel100Diamond);
    const hasAgate = GameData.gems.some(gem => gem.type === 'Agate' && isGemUsable(gem));
    updateStructureCardButton(document.getElementById('healing-center-button'), 'Healing Center', 'Build Healing Center (500000 Materials)', 500000);
    updateStructureCardButton(document.getElementById('soldier-ship-button'), 'Soldier Ship', hasAgate ? 'Build Soldier Ship (75000 Materials)' : 'Build Soldier Ship (Agate Required)', 75000, hasAgate);
    updateStructureCardButton(document.getElementById('trial-building-button'), 'Trial Building', hasZircon && hasAragonite ? 'Build Trial Building (100000 Materials)' : 'Trial Building (Zircon and Aragonite Required)', 100000, hasZircon && hasAragonite);
    updateStructureCardButton(document.getElementById('grand-ballet-hall-button'), 'Grand Ballet Hall', 'Build Grand Ballet Hall (750000 Materials)', COLONY_OPTIONS.STRUCTURE_BUILD_COSTS['Grand Ballet Hall']);
    updateStructureCardButton(document.getElementById('grand-ballroom-button'), 'Grand Ballroom', 'Build Grand Ballroom (750000 Materials)', COLONY_OPTIONS.STRUCTURE_BUILD_COSTS['Grand Ballroom']);
    updateStructureCardButton(document.getElementById('grand-theater-button'), 'Grand Theater', 'Build Grand Theater (750000 Materials)', COLONY_OPTIONS.STRUCTURE_BUILD_COSTS['Grand Theater']);
    updateStructureCardButton(document.getElementById('archives-button'), 'Archives', 'Build Archives (3000000 Materials)', COLONY_OPTIONS.STRUCTURE_BUILD_COSTS.Archives);
    updateStructureCardButton(document.getElementById('organic-zoo-button'), 'Organic Zoo', 'Build Organic Zoo (300000 Materials)', COLONY_OPTIONS.STRUCTURE_BUILD_COSTS['Organic Zoo']);
    updateStructureCardButton(document.getElementById('grand-circus-button'), 'Grand Circus', 'Build Grand Circus (400000 Materials)', COLONY_OPTIONS.STRUCTURE_BUILD_COSTS['Grand Circus']);
    updateStructureCardButton(document.getElementById('gathering-hall-button'), 'Gathering Hall', 'Build Gathering Hall (1000000 Materials)', COLONY_OPTIONS.STRUCTURE_BUILD_COSTS['Gathering Hall']);
    updateStructureCardButton(document.getElementById('grand-palace-button'), 'Grand Palace', 'Build Grand Palace (5000000 Materials)', COLONY_OPTIONS.STRUCTURE_BUILD_COSTS['Grand Palace']);
}

function getSoldierShipCapacity() {
    return 10 * Math.max(1, Number(GameData.soldierShip && GameData.soldierShip.levels || 1));
}

function renderSoldierShipInventory() {
    if (!GameData.structures.includes('Soldier Ship')) return;
    const ship = GameData.soldierShip || { levels: 1, inventories: [{ agateId: null, gemIds: [] }] };
    const eligible = GameData.gems.filter(gem => ['Ruby', 'Amethyst', 'Rose Quartz', 'Jasper', 'Citrine', 'Carnelian', 'Honey Quartz', 'Clear Quartz', 'Smoky Quartz', 'Milky Quartz', 'Ametrine', 'Prasiolite', "Tiger's Eye", "Hawk's Eye", 'Rutile', 'Bloodstone', 'Cherry Quartz', 'Flint', 'Chert', 'Obsidian'].includes(gem.type) && isGemUsable(gem));
    const agates = GameData.gems.filter(gem => gem.type === 'Agate' && isGemUsable(gem));
    const content = `<div class="structure-menu-summary">Level ${ship.levels} | Capacity ${getSoldierShipCapacity()} | Inventories ${ship.inventories.length}</div><div class="structure-menu-actions"><button type="button" data-ui-asset="soldier-ship-level-button-ui" data-ui-kind="button" onclick="levelUpSoldierShip()">Level Ship</button></div><label>Agate oversight<select id="ship-agate-select" data-ui-asset="soldier-ship-agate-select-ui" data-ui-kind="textbox"><option value="">Choose Agate</option>${agates.map(gem => `<option value="${gem.id}">${gem.name}</option>`).join('')}</select></label><label>Assign soldier<select id="ship-gem-select" data-ui-asset="soldier-ship-gem-select-ui" data-ui-kind="textbox"><option value="">Choose gem</option>${eligible.map(gem => `<option value="${gem.id}">${gem.name} (${gem.type})</option>`).join('')}</select></label><div class="structure-menu-actions"><button type="button" data-ui-asset="soldier-ship-assign-button-ui" data-ui-kind="button" onclick="assignGemToSoldierShip()">Assign to Ship</button></div><div>${ship.inventories.map((inventory, index) => `<p>Ship inventory ${index + 1}: ${inventory.gemIds.length}/${getSoldierShipCapacity()} assigned</p>`).join('')}</div>`;
    renderStructureMenu('Soldier Ship', content);
}

function showSoldierShipInventory() {
    renderSoldierShipInventory();
}

function levelUpSoldierShip() {
    const current = Number(GameData.soldierShip.levels || 1);
    const materials = 50000 * current;
    if (GameData.mode !== 'Roleplay' && GameData.materials < materials) return alert(`Ship level ${current + 1} requires ${materials} Materials.`);
    if (GameData.mode !== 'Roleplay') GameData.materials -= materials;
    GameData.soldierShip.levels = current + 1;
    if (GameData.soldierShip.levels % 10 === 0) GameData.soldierShip.inventories.push({ agateId: null, gemIds: [] });
    renderSoldierShipInventory();
    updateUI();
}

function assignGemToSoldierShip() {
    const gemSelect = document.getElementById('ship-gem-select');
    const agateSelect = document.getElementById('ship-agate-select');
    const gem = findLiveGem(gemSelect && gemSelect.value);
    if (!gem || !agateSelect || !agateSelect.value) return alert('Choose a gem and an Agate overseer.');
    const inventory = GameData.soldierShip.inventories.find(entry => entry.gemIds.length < getSoldierShipCapacity());
    if (!inventory) return alert('All Soldier Ship inventories are full.');
    if (!inventory.agateId) inventory.agateId = agateSelect.value;
    if (!inventory.gemIds.includes(gem.id)) inventory.gemIds.push(gem.id);
    gem.shipInventory = GameData.soldierShip.inventories.indexOf(inventory);
    renderSoldierShipInventory();
}

function showHealingCenter() {
    const cracked = GameData.gems.filter(gem => normalizeGemStatus(gem) === 'Cracked');
    const shattered = GameData.gems.filter(gem => normalizeGemStatus(gem) === 'Shattered');
    const repairButtons = gems => gems.map(gem => `<button type="button" data-ui-asset="healing-center-repair-button-ui" data-ui-kind="button" onclick="${normalizeGemStatus(gem) === 'Cracked' ? 'healCrackedGem' : 'healShatteredGem'}('${gem.id}')">${normalizeGemStatus(gem) === 'Cracked' ? `Heal ${gem.name} (100000)` : `Repair ${gem.name} (1000000)`}</button>`).join('');
    const content = `<div>Cracked repairs: ${cracked.length ? `<div class="structure-menu-actions">${repairButtons(cracked)}</div>` : 'None'}</div><div>Shattered repairs: ${shattered.length ? `<div class="structure-menu-actions">${repairButtons(shattered)}</div>` : 'None'}</div>`;
    renderStructureMenu('Healing Center', content);
}

function healCrackedGem(id) {
    const gem = findLiveGem(id);
    if (!gem || normalizeGemStatus(gem) !== 'Cracked') return;
    if (GameData.mode !== 'Roleplay' && GameData.materials < 100000) return alert('Healing a cracked gem costs 100000 Materials.');
    if (GameData.mode !== 'Roleplay') GameData.materials -= 100000;
    gem.status = 'Fine';
    if (Number(gem.crackCount || 0) >= 2) {
        addDamagedTrait(gem);
    }
    addNotification(`${gem.name} was healed from a crack.`);
    showHealingCenter();
    renderRoster();
    updateUI();
}

function healShatteredGem(id) {
    const gem = findLiveGem(id);
    if (!gem || normalizeGemStatus(gem) !== 'Shattered') return;
    if (GameData.mode !== 'Roleplay' && GameData.essence < 1000000) return alert('Repairing a shattered gem costs 1000000 Essence.');
    if (GameData.mode !== 'Roleplay') GameData.essence -= 1000000;
    gem.status = 'Fine';
    addDamagedTrait(gem);
    addNotification(`${gem.name} was restored by the Healing Center.`);
    showHealingCenter();
    renderRoster();
    updateUI();
}

function levelUpGem() {
    const gem = GameData.gems.find(g => String(g.id) === String(selectedGemId));
    if (!gem) return alert('No gem selected.');
    if (Number(gem.level || 0) >= Number(CONFIG.LEVELS.MAX || 100)) return alert('This gem has reached the maximum level.');

    const nextLevel = Number(gem.level || 0) + 1;
    const cost = getLevelCost(gem);
    if (GameData.mode !== 'Roleplay' && (GameData.materials < cost.materials || GameData.essence < cost.essence)) {
        alert(`Level ${nextLevel} requires ${cost.materials} Materials and ${cost.essence} Essence.`);
        return;
    }

    if (GameData.mode !== 'Roleplay') {
        GameData.materials -= cost.materials;
        GameData.essence -= cost.essence;
    }

    gem.level = nextLevel;
    renderProfileAssignments(gem);
    updateUI();
}

function assignGuard(guardType, selectedUnitId) {
    const gem = GameData.gems.find(g => String(g.id) === String(selectedGemId));
    if (!gem) return alert('No gem selected.');
    if (!canEquipGuard(gem, guardType)) {
        alert(`${gem.name} cannot be assigned a ${guardType} at this level.`);
        return;
    }

    const availableUnit = GameData.gems.find(unit => String(unit.id) === String(selectedUnitId) && unit.type === guardType && !unit.guardOwnerId);
    if (!availableUnit) {
        alert(`No available ${guardType} is ready to assign.`);
        return;
    }

    if (!Array.isArray(gem.guards)) gem.guards = [];
    const existingMatch = gem.guards.find(entry => entry.type === guardType);
    if (existingMatch) {
        const oldOwner = GameData.gems.find(unit => String(unit.id) === String(existingMatch.id));
        if (oldOwner) oldOwner.guardOwnerId = null;
        gem.guards = gem.guards.filter(entry => entry.type !== guardType);
    }

    availableUnit.guardOwnerId = gem.id;
    gem.guards.push({ type: guardType, id: availableUnit.id, name: availableUnit.name });
    if (guardType === 'Zirconium') gem.assignedZirconiumId = availableUnit.id;
    renderProfileAssignments(gem);
}

function openProfile(id) {
    const targetId = String(id);
    selectedGemId = id;
    const gem = GameData.gems.find(g => String(g.id) === targetId);
    if (!gem || gem.storedIn || gem.inRebellion) return;

    gem.level = Number(gem.level || 0);
    gem.guards = Array.isArray(gem.guards) ? gem.guards : [];
    normalizeGemStatus(gem);

    document.getElementById('prof-name').innerText = gem.name;
    document.getElementById('prof-type').innerText = gem.type;
    document.getElementById('prof-quality').innerText = gem.quality;
    document.getElementById('prof-placement').innerText = gem.placement;
    document.getElementById('prof-personality').innerText = gem.personality;
    document.getElementById('prof-status').innerText = gem.status;
    const quote = document.getElementById('prof-quote');
    if (quote) {
        quote.innerText = `"${randomGemQuote(gem)}"`;
        clearInterval(profileQuoteTimer);
        profileQuoteTimer = setInterval(() => {
            if (document.getElementById('profile-modal')?.style.display === 'flex') {
                quote.innerText = `"${randomGemQuote(gem)}"`;
            }
        }, 90000);
    }
    document.getElementById('prof-caste').innerText = getGemCaste(gem);
    const portrait = document.getElementById('prof-img');
    if (portrait) portrait.outerHTML = renderGemArtwork(gem, 'gem-art-stack--profile profile-hero-art', `${gem.name} artwork`, 'prof-img', 'menu');
    const casteArt = document.getElementById('prof-caste-art');
    if (casteArt) casteArt.innerHTML = renderGemArtwork(gem, 'profile-caste-gem-art', `${gem.name} caste mark`, '', 'none');
    const profileCard = document.querySelector('#profile-modal .modal-content');
    if (profileCard) applyUiAsset(profileCard, `${gemArtSlug(gem.type)}-profile-card-ui`, 'surface');

    renderProfileGallery(gem);
    applyProfileOptionAssets(gem);
    renderProfileAssignments(gem);
    renderProfileLifecycleActions(gem);

    const modal = document.getElementById('profile-modal');
    if (modal) modal.style.display = 'flex';
}

function applyProfileOptionAssets(gem) {
    const fusion = Array.isArray(gem.fusionMembers) && gem.fusionMembers.length === 2;
    const fusionMembers = fusion
        ? gem.fusionMembers.map(memberId => GameData.gems.find(member => String(member.id) === String(memberId))).filter(Boolean)
        : [];
    const fusionPlacements = gem.fusionPlacements || fusionMembers.map(member => member.placement || member.gemPlacement);
    const fusionPersonalities = gem.fusionPersonalities || fusionMembers.map(member => member.personality);
    const placementAsset = fusion
        ? getFusionMixAssetName('placement', ...fusionPlacements)
        : `placement-${gemArtSlug(gem.placement)}-ui`;
    const personalityAsset = fusion
        ? getFusionMixAssetName('personality', ...fusionPersonalities)
        : `personality-${gemArtSlug(gem.personality)}-ui`;
    const assets = [
        [document.getElementById('profile-caste-panel'), fusion ? 'fusion-caste-box-ui' : `caste-${gemArtSlug(getGemCaste(gem))}-ui`],
        [document.getElementById('profile-quality-box'), fusion ? 'fusion-quality-box-ui' : `quality-${gemArtSlug(gem.quality)}-ui`],
        [document.getElementById('profile-type-box'), fusion ? 'fusion-type-box-ui' : `type-${gemArtSlug(gem.type)}-ui`],
        [document.getElementById('profile-placement-box'), placementAsset],
        [document.getElementById('profile-personality-box'), personalityAsset],
        [document.getElementById('prof-status'), `status-${gemArtSlug(gem.status)}-ui`],
        [document.getElementById('prof-quote'), 'profile-quote-ui'],
        [document.getElementById('profile-gallery-frame'), 'profile-gallery-frame-ui'],
        [document.querySelector('.profile-nameplate'), 'profile-nameplate-ui'],
        [document.querySelector('.profile-level-panel'), 'profile-level-panel-ui'],
        [document.getElementById('prof-boosts-panel'), 'profile-boosts-panel-ui'],
        [document.getElementById('profile-guards-panel'), 'profile-guards-panel-ui']
    ];
    assets.forEach(([element, assetName]) => applyUiAsset(element, assetName, 'surface', PROFILE_UI_ASSET_ROOT));
}

function getFusionMixAssetName(kind, firstValue, secondValue) {
    const values = [firstValue, secondValue].map(gemArtSlug).sort();
    return `fusion-${kind}-${values[0]}-${values[1]}-box-ui`;
}

function getProfileGalleryImages(gem) {
    if (normalizeGemStatus(gem) === 'Bubbled') return [];
    const images = Array.isArray(gem.galleryPool) ? gem.galleryPool : [];
    const candidates = [...images, gem.image].filter(source =>
        typeof source === 'string' && source && !/^https?:\/\/placehold\.co\//i.test(source)
    );
    return [...new Set(candidates)];
}

function renderProfileGallery(gem) {
    const images = getProfileGalleryImages(gem);
    const image = document.getElementById('profile-gallery-image');
    const fallback = document.getElementById('prof-img');
    const count = document.getElementById('profile-gallery-count');
    const previous = document.querySelector('.profile-gallery-previous');
    const next = document.querySelector('.profile-gallery-next');
    const remove = document.querySelector('.profile-gallery-settings button');
    gem.galleryIndex = images.length ? Math.max(0, Math.min(Number(gem.galleryIndex || 0), images.length - 1)) : 0;
    if (count) count.textContent = images.length ? `${gem.galleryIndex + 1} / ${images.length}` : 'Gem artwork';
    if (previous) previous.disabled = images.length < 2;
    if (next) next.disabled = images.length < 2;
    if (remove) remove.disabled = images.length === 0;
    if (!image || !fallback) return;
    if (!images.length) {
        image.hidden = true;
        image.removeAttribute('src');
        fallback.hidden = false;
        return;
    }
    const source = images[gem.galleryIndex];
    image.dataset.gallerySource = source;
    image.onload = () => {
        if (image.dataset.gallerySource !== source) return;
        image.hidden = false;
        fallback.hidden = true;
    };
    image.onerror = () => {
        if (image.dataset.gallerySource !== source) return;
        image.hidden = true;
        fallback.hidden = false;
        if (count) count.textContent = 'Gem artwork';
    };
    image.src = source;
}

function changeProfileGalleryImage(direction) {
    const gem = findLiveGem(selectedGemId);
    if (!gem) return;
    const images = getProfileGalleryImages(gem);
    if (images.length < 2) return;
    gem.galleryIndex = (Number(gem.galleryIndex || 0) + direction + images.length) % images.length;
    renderProfileGallery(gem);
}

function addProfileGalleryImages(files) {
    const gem = findLiveGem(selectedGemId);
    const selectedFiles = Array.from(files || []).filter(file => ['image/png', 'image/gif'].includes(file.type));
    if (!gem || !selectedFiles.length) return;
    const results = selectedFiles.map(file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
        reader.readAsDataURL(file);
    }));
    Promise.all(results).then(images => {
        const existing = getProfileGalleryImages(gem);
        gem.galleryPool = [...existing, ...images];
        gem.galleryIndex = existing.length;
        if (String(selectedGemId) === String(gem.id)) {
            renderProfileGallery(gem);
            const status = document.getElementById('profile-gallery-settings-status');
            if (status) status.textContent = `${images.length} image${images.length === 1 ? '' : 's'} added to ${gem.name}.`;
        }
    }).catch(error => alert(error.message));
}

function removeCurrentProfileGalleryImage() {
    const gem = findLiveGem(selectedGemId);
    if (!gem) return;
    const images = getProfileGalleryImages(gem);
    if (!images.length) return;
    images.splice(Number(gem.galleryIndex || 0), 1);
    gem.galleryPool = images;
    gem.image = images[0] || '';
    gem.galleryIndex = Math.max(0, Math.min(Number(gem.galleryIndex || 0), images.length - 1));
    renderProfileGallery(gem);
    const status = document.getElementById('profile-gallery-settings-status');
    if (status) status.textContent = 'Current gallery image removed.';
}

function renderProfileLifecycleActions(gem) {
    const container = document.getElementById('profile-lifecycle-actions');
    if (!container) return;
    const id = String(gem.id).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const shatterAction = canAccessShattering() && getPersonalityBehavior(gem).canBeShattered
        ? `<button type="button" onclick="shatterLiveGem('${id}')">Shatter</button>`
        : '';
    if (gem.fusionMembers) {
        container.innerHTML = `<button type="button" onclick="poofLiveGem('${id}')" style="width:auto;">Poof Fusion</button><button type="button" onclick="splitFusionFromProfile('${id}')" style="width:auto;">Split Fusion</button>`;
    } else if (gem.status === 'Shattered') {
        container.innerHTML = '<span style="opacity:0.6;">This gem is shattered permanently.</span>';
    } else if (gem.status === 'Poofed') {
        container.innerHTML = `<button type="button" onclick="reformGem('${id}')">Reform</button><button type="button" onclick="bubbleGem('${id}')">Bubble</button>${shatterAction}`;
    } else if (gem.status === 'Bubbled') {
        container.innerHTML = `<button type="button" onclick="reformGem('${id}')">Reform</button>${shatterAction}`;
    } else {
        container.innerHTML = `<button type="button" onclick="poofLiveGem('${id}')">Poof</button>${shatterAction}`;
    }
}

function canAccessShattering() {
    return GameData.gems.some(gem => gem.type === 'Aragonite' && isGemUsable(gem));
}

function findLiveGem(id) {
    return GameData.gems.find(gem => String(gem.id) === String(id));
}

function getRebellionWarState() {
    if (!GameData.rebellionWar || typeof GameData.rebellionWar !== 'object') {
        GameData.rebellionWar = { active: false, rebelIds: [], progress: 0, difficulty: 0 };
    }
    if (!Array.isArray(GameData.rebellionWar.rebelIds)) GameData.rebellionWar.rebelIds = [];
    return GameData.rebellionWar;
}

function advanceAnnualRebellion() {
    GameData.gems.forEach(gem => {
        if (gem.type === 'Diamond' || gem.inRebellion || !isGemUsable(gem)) return;
        let rate = 0.3;
        const p = gem.personality;
        if (['Loyal', 'Benevolent', 'Calm', 'Patient', 'Puritanical'].includes(p)) rate = 0.06;
        else if (['Mean', 'Fiery', 'Rebellious', 'Volatile', 'Arrogant', 'Cynical'].includes(p)) rate = 0.6;

        gem.rebellion = Math.max(0, Math.min(100, Number(gem.rebellion || 0) + rate));
        if (gem.rebellion >= 100) recruitRebel(gem);
    });
}

function checkSapphireWarning() {
    if (isEventPopupOpen()) return false;
    const sapphires = GameData.gems.filter(g => g.type === 'Sapphire' && isGemUsable(g));
    if (!sapphires.length) return false;

    const highRebellionGems = GameData.gems.filter(g => g.type !== 'Diamond' && !g.inRebellion && isGemUsable(g) && Number(g.rebellion || 0) >= 80 && !g.warnedBySapphire);
    if (!highRebellionGems.length) return false;

    if (Math.random() < 0.15) {
        const affected = highRebellionGems[Math.floor(Math.random() * highRebellionGems.length)];
        const sapphire = sapphires[Math.floor(Math.random() * sapphires.length)];
        affected.warnedBySapphire = true;

        const courtDiamond = GameData.gems.find(g => String(g.id) === String(affected.courtId)) ||
            GameData.gems.find(g => g.type === 'Diamond' && isGemUsable(g)) || { name: 'their Diamond' };

        showEventChoices(
            `${sapphire.name} came to ${courtDiamond.name} and informed them that there is a possibility of rebellion! what will you do!`,
            [
                {
                    id: 'ignore-warning',
                    label: 'ignore',
                    action: () => {
                        addNotification(`Ignored ${sapphire.name}'s warning about ${affected.name}.`);
                    }
                },
                {
                    id: 'view-profile',
                    label: 'view profile of affected gem',
                    action: () => {
                        openProfile(affected.id);
                    }
                },
                {
                    id: 'poof-sapphire',
                    label: `poof ${sapphire.name}`,
                    action: () => {
                        poofLiveGem(sapphire.id);
                        addNotification(`${sapphire.name} was poofed for delivering unwelcome news.`);
                    }
                }
            ]
        );
        return true;
    }
    return false;
}

function addGemRebellion(gem, amount) {
    if (!gem || gem.type === 'Diamond' || GameData.mode === 'Roleplay') return;
    const rateFactor = 0.0005;
    gem.rebellion = Math.max(0, Math.min(100, Number(gem.rebellion || 0) + (amount * rateFactor * getRebellionResistanceMultiplier())));
    if (gem.rebellion >= 100) recruitRebel(gem);
}

function recruitRebel(gem) {
    const war = getRebellionWarState();
    if (war.rebelIds.some(id => String(id) === String(gem.id))) return;
    gem.inRebellion = true;
    war.rebelIds.push(gem.id);
    war.active = true;
    war.difficulty += 1000 + Math.max(0, Number(gem.level || 0)) * 10;
    if (war.rebelIds.length === 1) {
        addNotification(`${gem.name} reached maximum rebellion. War has broken out.`);
    } else {
        addNotification(`${gem.name} joined the rebellion. The uprising has grown stronger.`);
    }
    renderRebellionStatus();
}

function getRebellionSoldierPower() {
    return GameData.gems
        .filter(gem => getGemCaste(gem) === 'Quartz Soldier Tier' && isGemUsable(gem) && !gem.inRebellion)
        .reduce((power, gem) => power + 1 + Math.max(0, Number(gem.level || 0)), 0);
}

function getRebellionResistanceMultiplier() {
    const activeGems = GameData.gems.filter(gem => isGemUsable(gem));
    const goldLevels = activeGems.filter(gem => gem.type === 'Gold').reduce((sum, gem) => sum + Math.max(0, Number(gem.level || 0)), 0);
    const psilomelanes = GameData.gems.filter(gem => gem.type === 'Psilomelane' && !['Shattered', 'Fused'].includes(normalizeGemStatus(gem)));
    const archivedPsilomelaneIds = new Set(GameData.structureStorage?.Archives?.occupantIds?.map(String) || []);
    const psilomelaneStrength = psilomelanes.reduce((sum, gem) => {
        const archivedMultiplier = archivedPsilomelaneIds.has(String(gem.id)) ? 2 : 1;
        return sum + Math.max(1, Number(gem.level || 0)) * archivedMultiplier;
    }, 0);
    return Math.max(0.1, 1 - goldLevels * 0.005 - psilomelaneStrength * 0.02);
}

function advanceRebellionWar() {
    if (GameData.mode === 'Roleplay') return;
    const war = getRebellionWarState();
    const entertainers = GameData.gems.filter(gem =>
        getGemCaste(gem) === 'Elite Entertainer Tier' && isGemUsable(gem) && !gem.inRebellion
    ).length;
    GameData.gems.forEach(gem => {
        if (gem.type === 'Diamond' || gem.storedIn) return;
        gem.rebellion = Math.max(0, Number(gem.rebellion || 0) - entertainers);
        if (war.active && !gem.inRebellion) {
            const behavior = getPersonalityBehavior(gem);
            if (behavior.canDisobey && behavior.rebellionMultiplier > 0) {
                addGemRebellion(gem, 0.02 * behavior.rebellionMultiplier * (1 + Math.max(0, Number(gem.level || 0)) / 100));
            }
        }
    });

    if (war.active) {
        war.progress += getRebellionSoldierPower();
        if (war.progress >= Math.max(1000, Number(war.difficulty || 0))) {
            war.active = false;
            war.rebelIds = [];
            war.progress = 0;
            war.difficulty = 0;
            GameData.gems.forEach(gem => {
                gem.inRebellion = false;
                gem.rebellion = 0;
            });
            addNotification('The soldiers defeated the rebellion. The empire has been restored.');
            renderRoster();
        }
    }
    renderRebellionStatus();
}

function renderRebellionStatus() {
    const panel = document.getElementById('rebellion-war-status');
    if (!panel) return;
    const war = getRebellionWarState();
    panel.hidden = !war.active;
    if (!war.active) return;
    const soldierPower = getRebellionSoldierPower();
    const progress = Math.min(100, Math.round((war.progress / Math.max(1000, war.difficulty || 0)) * 100));
    panel.innerHTML = `<strong>Rebellion in progress</strong><span>${war.rebelIds.length} rebel gem${war.rebelIds.length === 1 ? '' : 's'} | Soldier strength: ${soldierPower}</span><div class="rebellion-war-progress" role="progressbar" aria-label="War progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><span style="width:${progress}%"></span></div>`;
    applyUiAsset(panel.querySelector('.rebellion-war-progress'), 'rebellion-war-progress-ui', 'surface');
}

function poofLiveGem(id) {
    const gem = findLiveGem(id);
    if (!gem || gem.status === 'Shattered' || gem.storedIn || gem.inRebellion) return;

    if (gem.fusionMembers && Array.isArray(gem.fusionMembers)) {
        const memberA = findLiveGem(gem.fusionMembers[0]);
        const memberB = findLiveGem(gem.fusionMembers[1]);

        GameData.gems = GameData.gems.filter(g => g.id !== gem.id);

        if (memberA) {
            memberA.status = 'Poofed';
            memberA.reformAt = Date.now() + 10 * 60 * 1000;
            memberA.splitFusionPartner = memberB ? memberB.id : null;
            memberA.wasFused = true;
            if (!GameData.gems.some(g => String(g.id) === String(memberA.id))) GameData.gems.push(memberA);
        }
        if (memberB) {
            memberB.status = 'Poofed';
            memberB.reformAt = Date.now() + 10 * 60 * 1000;
            memberB.splitFusionPartner = memberA ? memberA.id : null;
            memberB.wasFused = true;
            if (!GameData.gems.some(g => String(g.id) === String(memberB.id))) GameData.gems.push(memberB);
        }

        addNotification(`${gem.name} poofed and split into ${memberA ? memberA.name : 'its components'}${memberB ? ' and ' + memberB.name : ''}. Both are poofed.`);
        renderRoster();
        renderGemDirectories();
        if (document.getElementById('profile-modal')?.style.display === 'flex' && String(selectedGemId) === String(gem.id)) {
            closeProfile();
        }
        return;
    }

    addGemRebellion(gem, 15);
    gem.status = 'Poofed';
    gem.reformAt = Date.now() + 10 * 60 * 1000;
    addNotification(`${gem.name} poofed and is unusable until reformed.`);
    renderRoster();
    if (document.getElementById('profile-modal')?.style.display === 'flex' && String(selectedGemId) === String(gem.id)) {
        openProfile(gem.id);
    }
}

function bubbleGem(id) {
    const gem = findLiveGem(id);
    if (!gem || gem.storedIn || gem.inRebellion) return;
    if (normalizeGemStatus(gem) !== 'Poofed') {
        alert('A gem can only be bubbled after it has been poofed.');
        return;
    }
    ensureGemBubbleColor(gem);
    gem.status = 'Bubbled';
    gem.reformAt = null;
    addNotification(`${gem.name} was bubbled and moved to the Bubbled Gems directory.`);
    renderGemDirectories();
    renderRoster();
    if (document.getElementById('profile-modal')?.style.display === 'flex' && String(selectedGemId) === String(gem.id)) {
        closeProfile();
    }
}

function reformGem(id) {
    const gem = findLiveGem(id);
    if (!gem || gem.status === 'Shattered') return;
    gem.status = 'Fine';
    gem.reformAt = null;
    addNotification(`${gem.name} reformed and is usable again.`);
    renderGemDirectories();
    renderRoster();
    if (document.getElementById('profile-modal')?.style.display === 'flex' && String(selectedGemId) === String(gem.id)) {
        openProfile(gem.id);
    }
}

function rejuvenateLiveGem(id) {
    const gem = findLiveGem(id);
    if (!gem || gem.status === 'Shattered') return;
    Object.keys(gem).forEach(key => {
        if (typeof gem[key] === 'number' && key !== 'id') gem[key] = 0;
    });
    gem.level = 0;
    gem.boosts = [];
    gem.guards = [];
    gem.guardOwnerId = null;
    gem.reformAt = null;
    gem.status = 'Fine';
    addNotification(`${gem.name} was rejuvenated: level, boosts, and assignments reset.`);
    renderRoster();
    if (document.getElementById('profile-modal')?.style.display === 'flex' && String(selectedGemId) === String(gem.id)) {
        openProfile(gem.id);
    }
}

function shatterLiveGem(id, involuntary = false) {
    const gem = findLiveGem(id);
    if (!gem || gem.status === 'Shattered' || gem.storedIn || gem.inRebellion) return;
    if (!involuntary && !canAccessShattering()) return alert('An Aragonite is required to authorize shattering.');
    if (!getPersonalityBehavior(gem).canBeShattered) {
        addNotification(`${gem.name} cannot be shattered due to their personality.`);
        return;
    }
    gem.status = 'Shattered';
    gem.reformAt = null;
    gem.guards = [];
    gem.guardOwnerId = null;
    addNotification(`${gem.name} shattered permanently.`);
    renderGemDirectories();
    renderRoster();
    if (document.getElementById('profile-modal')?.style.display === 'flex' && String(selectedGemId) === String(gem.id)) {
        openProfile(gem.id);
    }
}

function closeProfile() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.style.display = 'none';
    clearInterval(profileQuoteTimer);
    profileQuoteTimer = null;
}

// ==========================================
// 5. STRUCTURES & HARDWARE PRODUCTION
// ==========================================
function createPearlFromReef() {
    if (!GameData.structures.includes('Reef')) {
        return alert('Build a Reef before producing pearls.');
    }
    if (GameData.mode !== 'Roleplay' && getActiveProductionJobs('Reef').length >= getStructureSlots('Reef')) return alert('All Reef production slots are busy.');
    if (GameData.mode === 'Roleplay') {
        completeStructureJob('Reef');
        showStructureInventory('Reef');
        alert('A Pearl was created instantly.');
        return;
    }
    if (!GameData.structureJobs) GameData.structureJobs = {};
    if (!GameData.structureJobs.Reef) GameData.structureJobs.Reef = [];
    GameData.structureJobs.Reef.push({ kind: 'pearl', readyAt: Date.now() + getStructureTimerMs('Reef', 30) });
    showStructureInventory('Reef');
    alert('Pearl creation started. The Reef will produce it when the timer completes.');
}

function createSpinelFromFunhouse() {
    if (!GameData.structures.includes('Spinel Funhouse')) {
        return alert('Build a Spinel Funhouse before producing spinels.');
    }
    if (!GameData.gems.some(g => g.type === 'Taaffeite' && isGemUsable(g))) return alert('A Taaffeite is required to operate the Spinel Funhouse.');
    if (GameData.mode !== 'Roleplay' && getActiveProductionJobs('Spinel Funhouse').length >= getStructureSlots('Spinel Funhouse')) return alert('All Spinel Funhouse production slots are busy.');
    if (GameData.mode === 'Roleplay') {
        completeStructureJob('Spinel Funhouse');
        showStructureInventory('Spinel Funhouse');
        alert('A Spinel was created instantly.');
        return;
    }
    if (!GameData.structureJobs) GameData.structureJobs = {};
    if (!GameData.structureJobs['Spinel Funhouse']) GameData.structureJobs['Spinel Funhouse'] = [];
    GameData.structureJobs['Spinel Funhouse'].push({ kind: 'spinel', readyAt: Date.now() + getStructureTimerMs('Spinel Funhouse', 20) });
    showStructureInventory('Spinel Funhouse');
    alert('Spinel creation started. The Funhouse will produce it when the timer completes.');
}

function createStructureGem(type) {
    const generatedGem = generateIndividualGem(type, null);
    const placeholderImage = 'https://placehold.co/200x200';
    return {
        ...generatedGem,
        placement: generatedGem.gemPlacement,
        guards: [],
        guardOwnerId: null,
        location: 'Court',
        image: placeholderImage,
        galleryPool: [placeholderImage],
        cutImage: ''
    };
}

function completeStructureJob(type, job) {
    if (type === 'Reef') {
        GameData.gems.push(createStructureGem('Pearl'));
    } else if (type === 'Spinel Funhouse') {
        GameData.gems.push(createStructureGem('Spinel'));
    } else if (type === 'Gem Forge') {
        const gem = GameData.gems.find(g => String(g.id) === String(job.targetGemId));
        const blueprint = FORGERY_BLUEPRINTS.find(bp => bp.id === job.blueprintId);
        if (gem && blueprint) gem.boosts.push({ id: blueprint.id, name: blueprint.name, stat: blueprint.stat, desc: blueprint.desc, origin: 'Forged' });
    }
    if (job) GameData.structureJobs[type] = getActiveProductionJobs(type).filter(activeJob => activeJob !== job);
    renderRoster();
    updateUI();
}

function buildStructure(structureDesignationName, productionMaterialCostValue) {
    productionMaterialCostValue = COLONY_OPTIONS.STRUCTURE_BUILD_COSTS[structureDesignationName] || productionMaterialCostValue * 100;
    const missingRequirement = (STRUCTURE_UNLOCK_REQUIREMENTS[structureDesignationName] || []).find(requiredType =>
        !GameData.gems.some(gem => gem.type === requiredType && !['Shattered', 'Fused'].includes(normalizeGemStatus(gem)))
    );
    if (missingRequirement) {
        return alert(`${missingRequirement} is required to unlock ${structureDesignationName}.`);
    }
    if (GameData.mode !== "Roleplay" && GameData.materials < productionMaterialCostValue) {
        return alert("Insufficient raw construction materials inside storage nodes!");
    }
    if (GameData.structures.includes(structureDesignationName)) {
        return alert("Infrastructure node coordinates already built!");
    }
    if (GameData.mode !== "Roleplay") GameData.materials -= productionMaterialCostValue;
    GameData.structures.push(structureDesignationName);
    if (!GameData.structureLevels) GameData.structureLevels = {};
    if (!GameData.structureJobs) GameData.structureJobs = {};
    GameData.structureLevels[structureDesignationName] = 1;
    GameData.structureJobs[structureDesignationName] = [];
    if (!GameData.structureStorage) GameData.structureStorage = {};
    GameData.structureStorage[structureDesignationName] = { occupantIds: [], overseerIds: [] };
    updateUI();
    renderStructureInventoryButtons();
    const structList = document.getElementById('structures-list');
    if (structList) structList.innerText = GameData.structures.join(', ');
    alert(`${structureDesignationName} framework successfully built!`);
}

function levelUpStructure(structureDesignationName) {
    if (!GameData.structures.includes(structureDesignationName)) return alert('Build this structure first.');
    const currentLevel = getStructureLevel(structureDesignationName);
    const materialCost = COLONY_OPTIONS.STRUCTURE_LEVEL_BASE_MATERIAL_COST * currentLevel;
    const essenceCost = COLONY_OPTIONS.STRUCTURE_LEVEL_BASE_ESSENCE_COST * currentLevel;
    if (GameData.mode !== 'Roleplay' && (GameData.materials < materialCost || GameData.essence < essenceCost)) {
        return alert(`Structure level ${currentLevel + 1} requires ${materialCost} Materials and ${essenceCost} Essence.`);
    }
    if (GameData.mode !== 'Roleplay') {
        GameData.materials -= materialCost;
        GameData.essence -= essenceCost;
    }
    GameData.structureLevels[structureDesignationName] = currentLevel + 1;
    updateUI();
    showStructureInventory(typeForStructure(structureDesignationName));
}

function typeForStructure(structureDesignationName) {
    return structureDesignationName;
}

function createBismuthForForge() {
    const bismuth = {
        id: 'bismuth_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        type: 'Bismuth',
        name: 'Bismuth-' + Math.floor(Math.random() * 900 + 100),
        quality: 'Regular',
        placement: 'Hands',
        personality: 'Meticulous',
        level: 0,
        guards: [],
        boosts: [],
        inForge: false,
        image: 'https://placehold.co/200x200',
        galleryPool: ['https://placehold.co/200x200'],
        status: 'Active',
        canFuse: Math.random() >= 0.5,
        relationships: {}
    };

    GameData.gems.push(bismuth);
    renderRoster();
    updateUI();
    renderStructureInventoryButtons();
    alert(`${bismuth.name} is ready to work in the forge.`);
}

function getPersonalityCompatibility(p1, p2) {
    if (!p1 || !p2) return 1.0;
    if (p1 === p2) return 1.5;
    const compatible = [
        ["Loyal", "Calm"], ["Loyal", "Stoic"], ["Playful", "Cheery"],
        ["Calm", "Patient"], ["Empathetic", "Sensitive"], ["Stoic", "Meticulous"],
        ["Curious", "Intelligent"], ["Brave", "Loyal"], ["Friendly", "Caring"]
    ];
    const conflicting = [
        ["Fiery", "Calm"], ["Mean", "Empathetic"], ["Arrogant", "Shy"],
        ["Volatile", "Stoic"], ["Rebellious", "Loyal"], ["Authoritarian", "Rebellious"],
        ["Cynical", "Cheery"], ["Lazy", "Meticulous"]
    ];
    for (const [a, b] of compatible) {
        if ((p1 === a && p2 === b) || (p1 === b && p2 === a)) return 2.0;
    }
    for (const [a, b] of conflicting) {
        if ((p1 === a && p2 === b) || (p1 === b && p2 === a)) return 0.2;
    }
    return 1.0;
}

function advanceRelationships() {
    const activeGems = GameData.gems.filter(gem => !gem.fusionMembers && isGemUsable(gem));
    const pairs = new Set();

    function addPair(g1, g2) {
        if (!g1 || !g2 || g1 === g2) return;
        if (g1.canFuse === false || g2.canFuse === false) return;
        if (g1.fusionMembers || g2.fusionMembers) return;
        const key = [String(g1.id), String(g2.id)].sort().join('::');
        pairs.add(key);
    }

    activeGems.forEach(gem => {
        // 1. Guard and Owner
        if (Array.isArray(gem.guards)) {
            gem.guards.forEach(guardRef => {
                const guard = GameData.gems.find(g => String(g.id) === String(guardRef.id));
                if (guard) addPair(gem, guard);
            });
            // 2. Co-guards
            for (let i = 0; i < gem.guards.length; i++) {
                for (let j = i + 1; j < gem.guards.length; j++) {
                    const g1 = GameData.gems.find(g => String(g.id) === String(gem.guards[i].id));
                    const g2 = GameData.gems.find(g => String(g.id) === String(gem.guards[j].id));
                    if (g1 && g2) addPair(g1, g2);
                }
            }
        }
        // 3. Court members
        if (gem.courtId) {
            const courtMates = activeGems.filter(other => other.id !== gem.id && String(other.courtId) === String(gem.courtId));
            courtMates.forEach(mate => addPair(gem, mate));
        }
    });

    pairs.forEach(key => {
        const [idA, idB] = key.split('::');
        const gemA = GameData.gems.find(g => String(g.id) === idA);
        const gemB = GameData.gems.find(g => String(g.id) === idB);
        if (!gemA || !gemB || !isGemUsable(gemA) || !isGemUsable(gemB)) return;

        if (!gemA.relationships) gemA.relationships = {};
        if (!gemB.relationships) gemB.relationships = {};

        const current = Number(gemA.relationships[gemB.id] || 0);
        const comp = getPersonalityCompatibility(gemA.personality, gemB.personality);
        const increase = 0.05 * comp;
        const nextScore = Math.min(100, current + increase);

        gemA.relationships[gemB.id] = nextScore;
        gemB.relationships[gemA.id] = nextScore;

        if (nextScore >= 100 && Math.random() < 0.005 && !isEventPopupOpen()) {
            const fusion = createFusion(gemA, gemB);
            if (fusion) {
                addNotification(`${gemA.name} and ${gemB.name} formed a bond and fused into ${fusion.name}.`);
            }
        }
    });
}

// ==========================================
// 6. HEARTBEAT TIMELINE AUTOMATION TICK
// ==========================================
setInterval(() => {
    saveLocalGame();
    const mainViewDashboard = document.getElementById('screen-dashboard');
    if (mainViewDashboard && mainViewDashboard.classList.contains('active-screen')) {
        const eventActive = isEventPopupOpen();
        if (!eventActive && !GameData.isPaused) {
            GameData.year += 0.16;
            if (Math.floor(GameData.year) > Math.floor(GameData.lastYearRebellionTick || 0)) {
                GameData.lastYearRebellionTick = Math.floor(GameData.year);
                advanceAnnualRebellion();
            }
        }
        const activeDiamonds = GameData.gems.filter(gem => gem.type === 'Diamond' && isGemUsable(gem)).length;
        const diamondEssenceRate = CONFIG.RESOURCES.DIAMOND_ESSENCE_PER_DIAMOND_TICK || 0;
        GameData.essence += activeDiamonds * diamondEssenceRate;
        GameData.colonies.forEach(colony => {
            if (!colony.isDecayed) {
                const serpentineLevels = GameData.gems.filter(gem => gem.type === 'Serpentine' && isGemUsable(gem))
                    .reduce((sum, gem) => sum + Math.max(0, Number(gem.level || 0)), 0);
                GameData.materials += colony.yieldValue * (1 + serpentineLevels * 0.01);
            GameData.essence += Number(colony.essenceRate || 0);
                (colony.kindergartenJobs || []).slice().forEach(job => {
                    if (GameData.mode === 'Roleplay' || Date.now() >= job.readyAt) completeKindergartenJob(colony, job);
                });
                (colony.shrineJobs || []).slice().forEach(job => {
                    if (GameData.mode === 'Roleplay' || Date.now() >= job.readyAt) completeDiamondShrineJob(colony, job);
                });
                if (GameData.year - colony.birthYear >= 960) {
                    colony.isDecayed = true;
                }
            }
        });
        GameData.gems.forEach(gem => {
            normalizeGemStatus(gem);
            if (gem.status === 'Poofed' && gem.reformAt && Date.now() >= gem.reformAt) {
                reformGem(gem.id);
                addNotification(`${gem.name} automatically reformed after remaining poofed for ten minutes.`);
            }
        });
        if (!eventActive) {
            triggerLiveGemEvent();
        }
        Object.keys(GameData.structureJobs || {}).forEach(type => {
            getActiveProductionJobs(type).slice().forEach(job => {
                if (GameData.mode === 'Roleplay' || Date.now() >= job.readyAt) {
                    if (type === 'Gem Forge') {
                        const bismuth = GameData.gems.find(g => g.inForge && isGemUsable(g));
                        if (bismuth) bismuth.inForge = false;
                    }
                    completeStructureJob(type, job);
                }
            });
        });
        advanceStoredGemDepartures();
        advanceRelationships();
        advanceRebellionWar();
        updateUI();
        renderGemDirectories();
        renderNotifications();
        if (selectedColonyId !== null && document.getElementById('colony-modal')?.style.display === 'flex') {
            openColonyControlPanel(selectedColonyId);
        }
    }
}, 1000);

// ==========================================
// 7. EXPOSE TO WINDOW FOR INLINE EVENT HANDLERS
// ==========================================
window.switchScreen = switchScreen;
window.switchTab = switchTab;
window.randomizeStartingSector = randomizeStartingSector;
window.launchNewEmpire = launchNewEmpire;
window.foundColony = foundColony;
window.openColonyControlPanel = openColonyControlPanel;
window.closeColonyControlPanel = closeColonyControlPanel;
window.buildColonyKindergarten = buildColonyKindergarten;
window.updateKindergartenButtonCost = updateKindergartenButtonCost;
window.buildDiamondShrineKindergarten = buildDiamondShrineKindergarten;
window.openProfile = openProfile;
window.startTrialEvent = startTrialEvent;
window.splitFusionFromProfile = splitFusionFromProfile;
window.showSoldierShipInventory = showSoldierShipInventory;
window.closeStructureModal = closeStructureModal;
window.levelUpSoldierShip = levelUpSoldierShip;
window.assignGemToSoldierShip = assignGemToSoldierShip;
window.closeProfile = closeProfile;
window.changeProfileGalleryImage = changeProfileGalleryImage;
window.addProfileGalleryImages = addProfileGalleryImages;
window.removeCurrentProfileGalleryImage = removeCurrentProfileGalleryImage;
window.toggleNotifications = toggleNotifications;
window.requestEmpireReset = requestEmpireReset;
window.confirmEmpireReset = confirmEmpireReset;
window.cancelEmpireReset = cancelEmpireReset;
window.toggleGemDirectory = toggleGemDirectory;
window.closeEventPopup = closeEventPopup;
window.poofLiveGem = poofLiveGem;
window.reformGem = reformGem;
window.bubbleGem = bubbleGem;
window.rejuvenateLiveGem = rejuvenateLiveGem;
window.shatterLiveGem = shatterLiveGem;
window.healCrackedGem = healCrackedGem;
window.healShatteredGem = healShatteredGem;
window.buildStructure = buildStructure;
window.createPearlFromReef = createPearlFromReef;
window.createSpinelFromFunhouse = createSpinelFromFunhouse;
window.levelUpGem = levelUpGem;
window.levelUpStructure = levelUpStructure;
window.assignGuard = assignGuard;
window.togglePauseYearProgression = togglePauseYearProgression;

// Safe runtime inputs fallback setup
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById('search-input');
    const filterInput = document.getElementById('gem-type-filter');
    populateGemTypeFilter();
    if (searchInput) searchInput.addEventListener('input', renderRoster);
    if (filterInput) filterInput.addEventListener('change', renderRoster);
    initializeDiamondSetup();
    loadDefaultPageBackground();
    initializeUiAssets();
    restoreLocalGame();
});
