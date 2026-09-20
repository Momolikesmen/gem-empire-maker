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
    soldierShip: { levels: 1, inventories: [{ agateId: null, gemIds: [] }] },
    reefs: [],
    spinels: [],
    forgeInventory: [],
    diamondsCouncil: [], // This will store our custom created Diamonds dynamically
    startingUniverseVector: "Nebula Quadrant E-19"
};

let selectedGemId = null;
let selectedColonyId = null;
let profileQuoteTimer = null;

const GEM_QUOTES = {
    Fiery: ["I was not shouting. The room was too quiet.", "Try me. Please.", "Heat is just confidence with better lighting."],
    Rebellious: ["Rules are suggestions with paperwork.", "I heard the order. I declined it.", "The system has a crack, and I found it."],
    Loyal: ["I will stand where I am needed.", "The court is worth protecting.", "You can count on me."],
    Anxious: ["I have prepared for this. Probably.", "Is that a normal sound?", "I would like a smaller responsibility."],
    Proud: ["Obviously, I handled it beautifully.", "Admire from a respectful distance.", "Excellence is a habit."],
    Stoic: ["Noted.", "The crystal holds.", "I have seen worse days."],
    Meticulous: ["There is a correct way to do this.", "I made a list for the emergency.", "Precision prevents regret."]
};

function randomGemQuote(gem) {
    const pool = GEM_QUOTES[gem.personality] || GEM_QUOTES.Stoic;
    const mood = gem.status === 'Cracked' ? 'The fracture is inconvenient, not decisive.' : gem.level > 10 ? 'Experience has sharpened the edges.' : null;
    return mood && Math.random() < 0.45 ? mood : pool[Math.floor(Math.random() * pool.length)];
}

function applyAppearanceSettings() {
    const root = document.documentElement;
    const page = document.getElementById('theme-page-color');
    const panel = document.getElementById('theme-panel-color');
    const accent = document.getElementById('theme-accent-color');
    const font = document.getElementById('theme-font-select');
    const customize = document.getElementById('customization-toggle');
    if (customize && !customize.checked) return;
    if (page) root.style.setProperty('--page-background-color', page.value);
    if (panel) root.style.setProperty('--content-background-color', panel.value);
    if (accent) root.style.setProperty('--link-color', accent.value);
    if (accent) {
        root.style.setProperty('--button-background-color', accent.value);
        root.style.setProperty('--navbar-background-color', accent.value);
        root.style.setProperty('--navbar-background-gradient', `linear-gradient(180deg, ${accent.value} 0%, #30291c 100%)`);
    }
    if (font) root.style.setProperty('--theme-font-family', font.value === 'CustomGemFont' ? 'CustomGemFont' : font.value);
}

function toggleCustomizationOptions() {
    const toggle = document.getElementById('customization-toggle');
    const options = document.getElementById('global-customization-options');
    if (options) options.style.display = toggle && toggle.checked ? 'block' : 'none';
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
    if (center) center.innerHTML = notifications.length
        ? notifications.map(note => `<p style="margin:4px 0;"><strong>Year ${note.year}:</strong> ${note.text}</p>`).join('')
        : '<p>No events recorded.</p>';
}

function toggleNotifications() {
    const center = document.getElementById('notification-center');
    if (center) center.style.display = center.style.display === 'none' ? 'block' : 'none';
}

function showEventPopup(text) {
    const popup = document.getElementById('event-popup');
    const message = document.getElementById('event-popup-text');
    if (message) message.innerText = text;
    if (popup) popup.style.display = 'block';
}

function closeEventPopup() {
    const popup = document.getElementById('event-popup');
    if (popup) popup.style.display = 'none';
}

function toggleGemDirectory(directoryId) {
    const directory = document.getElementById(directoryId);
    if (directory) directory.style.display = directory.style.display === 'none' ? 'block' : 'none';
}

function normalizeGemStatus(gem) {
    if (!gem.status || gem.status === 'Active') gem.status = 'Fine';
    return gem.status;
}

function isGemUsable(gem) {
    const status = normalizeGemStatus(gem);
    return status === 'Fine' || status === 'Cracked';
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
// NEW FEATURES: SETUP MATRIARCH CREATION
// ==========================================

// Player Action: Log a custom Diamond to the Council array before starting
function addDiamondToSetupCouncil() {
    const nameInput = document.getElementById('setup-diamond-name');
    const legacyColorSelect = document.getElementById('dia1-color');
    const roleSelect = document.getElementById('dia1-role');
    const imgInput = document.getElementById('dia1-img');

    const rawName = nameInput ? nameInput.value.trim() : "";
    if (!rawName) {
        alert("Please enter a designation name for your custom Diamond first!");
        return;
    }

    const diamondColor = legacyColorSelect ? legacyColorSelect.value : "White";
    const diamondName = rawName.includes("Diamond") ? rawName : `${rawName} Diamond`;

    let customDiamond = {
        id: "diamond_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        name: diamondName,
        color: diamondColor,
        assignedRoleTag: roleSelect ? roleSelect.value : "Supreme Authority",
        image: (imgInput && imgInput.value.trim() !== '') ? imgInput.value.trim() : "https://placehold.co"
    };

    // Push into our pre-game council data
    GameData.diamondsCouncil.push(customDiamond);
    
    // Clear inputs for the next entry
    if (nameInput) nameInput.value = '';
    if (imgInput) imgInput.value = '';

    // Render the setup character card listing
    renderSetupDiamondCards();
}

// Render the temporary setup cards on the initialization screen
function renderSetupDiamondCards() {
    const setupGrid = document.getElementById('setup-diamonds-grid');
    if (!setupGrid) return;
    setupGrid.innerHTML = '';

    if (GameData.diamondsCouncil.length === 0) {
        setupGrid.innerHTML = `<p style="grid-column: 1/-1; opacity: 0.5; font-style: italic;">No custom Diamonds logged to the authority council yet.</p>`;
        return;
    }

    GameData.diamondsCouncil.forEach((diamond, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.borderTop = `4px solid ${getHexColorForDiamond(diamond.color)}`;
        card.innerHTML = `
            <img src="${diamond.image}" alt="Diamond Portrait">
            <h4>${diamond.name}</h4>
            <p style="font-size:0.8rem; color: var(--link-color); margin-top:2px;">${diamond.assignedRoleTag}</p>
            <button onclick="removeDiamondFromSetup(${index})" style="padding:4px; font-size:0.75rem; margin-top:8px; background-color: var(--button-secondary-background-color); color: var(--button-secondary-text-color);">Remove</button>
        `;
        setupGrid.appendChild(card);
    });
}

// Remove a Diamond from the list if the user changes their mind during setup
function removeDiamondFromSetup(index) {
    GameData.diamondsCouncil.splice(index, 1);
    renderSetupDiamondCards();
}

// Helper utility to get aesthetic borders based on gem colors
function getHexColorForDiamond(color) {
    const colors = {
        "White": "#ffffff",
        "Yellow": "#facc15",
        "Blue": "#3b82f6",
        "Pink": "#f472b6"
    };
    return colors[color] || "#ffffff";
}

// ==========================================
// 2. LAUNCHER, INITIALIZATION & SAVES
// ==========================================
function launchNewEmpire() {
    const nameInput = document.getElementById('setup-empire-name');
    GameData.name = nameInput ? nameInput.value.trim() : "The Great Gem Empire";
    
    const modeSelect = document.getElementById('setup-game-mode');
    GameData.mode = modeSelect ? modeSelect.value : "Classic";
    
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
        let gemRecord = {
            id: diamond.id,
            type: "Diamond",
            name: diamond.name,
            quality: "Perfect",
            placement: "Chest", 
            personality: "Stoic",
            level: 0,
            guards: [],
            boosts: [],
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
}

function exportSaveData() {
    const rawCode = btoa(JSON.stringify(GameData));
    alert("YOUR EMPIRE BACKUP SAVE CODE IS READY!\n\nCopy this text block to import later:\n\n" + rawCode);
    console.log("SAVE_CODE:", rawCode);
}

function executeImportSave() {
    const importBox = document.getElementById('import-text-box');
    const rawBoxInput = importBox ? importBox.value.trim() : "";
    if(!rawBoxInput) return alert("Please paste valid code block data matrix first!");

    try {
        const decodedState = JSON.parse(atob(rawBoxInput));
        GameData = decodedState;
        
        const liveTitle = document.getElementById('live-empire-title');
        if (liveTitle) liveTitle.innerText = GameData.name;
        
        switchScreen('screen-dashboard');
        switchTab('tab-court-roster');
        alert("Empire state safely synchronized!");
    } catch(err) {
        alert("CRITICAL CORE FAILURE: Invalid, expired, or corrupted save code string injected.");
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

    renderStructureInventoryButtons();
    renderSoldierShipInventory();
}

// ==========================================
// 3. CELESTIAL COLONIES & INCUBATION
// ==========================================
function chooseColonyGemTypes() {
    const pool = [...COLONY_OPTIONS.GEM_TYPES];
    const count = Math.min(
        pool.length,
        Math.floor(Math.random() * (COLONY_OPTIONS.MAX_RANDOM_GEM_TYPES - COLONY_OPTIONS.MIN_RANDOM_GEM_TYPES + 1)) + COLONY_OPTIONS.MIN_RANDOM_GEM_TYPES
    );
    const selected = [];
    while (selected.length < count) {
        const index = Math.floor(Math.random() * pool.length);
        selected.push(pool.splice(index, 1)[0]);
    }
    return selected;
}

function foundColony() {
    if (GameData.mode !== "Roleplay" && GameData.materials < COLONY_OPTIONS.COLONIZATION_COST) return alert("Insufficient Colony Materials inside Vault!");
    if (GameData.mode !== "Roleplay") GameData.materials -= COLONY_OPTIONS.COLONIZATION_COST;

    const planet = COLONY_OPTIONS.PLANETS[Math.floor(Math.random() * COLONY_OPTIONS.PLANETS.length)];
    let discoveryColonyRecord = {
        id: Date.now() + Math.random(),
        name: planet.name + " [C-" + Math.floor(Math.random() * 89 + 10) + "]",
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
    
    GameData.colonies.push(discoveryColonyRecord);
    updateUI();
    renderColonies();
}

function renderColonies() {
    const colonyGridContainer = document.getElementById('colonies-grid');
    if (!colonyGridContainer) return;
    colonyGridContainer.innerHTML = '';
    
    GameData.colonies.forEach(colony => {
        const itemCard = document.createElement('div');
        itemCard.className = 'card';
        
        let statusText = colony.isDecayed 
            ? `<p style="color:#ef4444; font-size:0.8rem; font-weight:bold; margin-top:5px;">⚠️ Crust Layer Decayed</p>` 
            : `<p style="opacity:0.6; font-size:0.85rem; margin-top:5px;">Output: +${colony.yieldValue} Materials, +${colony.essenceRate || 0} Essence/Tick</p>
               <p style="font-size:0.8rem; color:#00945c; margin-bottom: 5px;">Kindergartens: ${colony.kindergartensBuilt}/${COLONY_OPTIONS.MAX_KINDERGARTENS}</p>
               <p style="font-size:0.8rem; opacity:0.75;">Gem types: ${(colony.availableGemTypes || COLONY_OPTIONS.GEM_TYPES).join(', ')}</p>
               <p style="font-size:0.8rem; opacity:0.75;">Timers: ${[...(colony.kindergartenJobs || []), ...(colony.shrineJobs || [])].map(job => formatTimer(job.readyAt)).join(', ') || 'None'}</p>
               <button onclick="openColonyControlPanel(${colony.id})" style="padding:4px; font-size:0.75rem; width: auto; margin-top:8px;">Open Colony Menu</button>`;

itemCard.innerHTML = `<h3>🪐 ${colony.name}</h3> ${statusText}`;
colonyGridContainer.appendChild(itemCard);
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
        gemTypeSelect.innerHTML = availableGemTypes.map(type => `<option value="${type}">${type}</option>`).join('');
    }
    document.getElementById('colony-modal-title').innerText = colony.name;
    const jobs = [...(colony.kindergartenJobs || []), ...(colony.shrineJobs || [])];
    const jobText = jobs.length ? jobs.map(job => `${job.kind === 'diamond' ? 'Diamond Shrine' : job.gemType + ' Kindergarten'}: ${formatTimer(job.readyAt)}`).join(' | ') : 'No active kindergarten timers.';
    document.getElementById('colony-modal-details').innerHTML = `<p>Planet type: ${colony.planetType || colony.name}</p><p>Output: +${colony.yieldValue} Materials, +${colony.essenceRate || 0} Essence/Tick</p><p>Kindergartens: ${colony.kindergartensBuilt}/${COLONY_OPTIONS.MAX_KINDERGARTENS}</p><p>Active timers: ${jobText}</p>`;
    document.getElementById('colony-options-list').innerText = `This colony supports: ${availableGemTypes.join(', ')}. Building a Kindergarten starts a ${Math.round(getKindergartenDurationMinutes() * 10) / 10}-minute timer and can produce up to three gems of one type.`;
    const diamondKindergartenButton = document.getElementById('diamond-kindergarten-button');
    if (diamondKindergartenButton) diamondKindergartenButton.disabled = !GameData.structures.includes('Diamond Shrine');
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
    if (GameData.mode !== "Roleplay" && GameData.materials < COLONY_OPTIONS.KINDERGARTEN_COST) return alert('Not enough Materials to establish a Kindergarten core!');
    if (GameData.mode !== "Roleplay") GameData.materials -= COLONY_OPTIONS.KINDERGARTEN_COST;
    const gemTypeSelect = document.getElementById('colony-gem-type');
    const gemType = gemTypeSelect ? gemTypeSelect.value : null;
    if (!gemType || !(colony.availableGemTypes || []).includes(gemType)) return alert('Choose a gem type available on this colony.');
    if (!Array.isArray(colony.kindergartenJobs)) colony.kindergartenJobs = [];
    colony.kindergartensBuilt++;
    colony.yieldValue += 3;
    colony.kindergartenJobs.push({
        kind: 'regular',
        gemType,
        startedAt: Date.now(),
        readyAt: Date.now() + getKindergartenDurationMs()
    });
    alert(`${gemType} Kindergarten started. Up to three gems will emerge when the timer completes.`);
    updateUI();
    renderColonies();
    openColonyControlPanel(colony.id);
}

function getKindergartenDurationMs() {
    const agriculturalGems = GameData.gems.filter(gem =>
        (gem.type === 'Peridot' || gem.type === 'Lapis Lazuli') && isGemUsable(gem)
    );
    const reductionPerLevel = GEM_PURPOSES.AGRICULTURAL.timeReductionPerLevel || 0;
    const totalReduction = Math.min(0.9, agriculturalGems.reduce((sum, gem) => sum + Math.max(0, Number(gem.level || 0)) * reductionPerLevel, 0));
    return Math.max(60 * 1000, COLONY_OPTIONS.KINDERGARTEN_DURATION_MS * (1 - totalReduction));
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

function createGemFromKindergarten(gemType) {
    const qualities = ["Perfect", "Regular", "Regular", "Defective"];
    const placements = ["Forehead", "Chest", "Navel", "Hands", "Back", "Face"];
    const personalities = ["Fiery", "Meticulous", "Loyal", "Anxious", "Rebellious", "Stoic"];
    
    const quality = qualities[Math.floor(Math.random() * qualities.length)];
    
    let gem = {
        id: Date.now() + Math.random(),
        type: gemType,
        customPrefix: typeof generateGemPrefix === 'function' ? generateGemPrefix(gemType) : 'Facet-' + Math.floor(Math.random() * 899 + 100),
        name: "Facet-" + Math.floor(Math.random() * 899 + 100) + " " + gemType,
        quality,
        placement: placements[Math.floor(Math.random() * placements.length)],
        personality: personalities[Math.floor(Math.random() * personalities.length)],
        level: 0,
        guards: [],
        boosts: typeof determineStartingBoosts === 'function' ? determineStartingBoosts(quality, gemType) : [],
        location: "Court",
        guardOwnerId: null,
        image: "https://placehold.co/200x200",
        galleryPool: ["https://placehold.co/200x200"],
        cutImage: ""
    };
    gem.name = `${gem.customPrefix} ${gem.type}`;
    
    GameData.gems.push(gem);
    return gem;
}

function completeKindergartenJob(colony, job) {
    const outputCount = Math.floor(Math.random() * 3) + 1;
    const newGems = Array.from({ length: outputCount }, () => createGemFromKindergarten(job.gemType));
    colony.kindergartenJobs = colony.kindergartenJobs.filter(activeJob => activeJob !== job);
    alert(`${newGems.length} ${job.gemType} gem${newGems.length === 1 ? '' : 's'} emerged from ${colony.name}.`);
    renderRoster();
    updateUI();
}

function createDiamondFromShrine() {
    const name = `Diamond-${Math.floor(Math.random() * 900 + 100)}`;
    return {
        id: 'diamond_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        type: 'Diamond',
        name,
        quality: 'Perfect',
        placement: 'Chest',
        personality: GENERATION_TABLES.DIAMOND_PERSONALITIES[Math.floor(Math.random() * GENERATION_TABLES.DIAMOND_PERSONALITIES.length)],
        level: 0,
        guards: [],
        boosts: [],
        location: 'Court',
        guardOwnerId: null,
        image: 'https://placehold.co/200x200',
        galleryPool: ['https://placehold.co/200x200'],
        cutImage: '',
        status: 'Active'
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
    colony.shrineJobs.push({
        kind: 'diamond',
        startedAt: Date.now(),
        readyAt: Date.now() + getKindergartenDurationMs()
    });
    alert('Diamond Kindergarten started. One new Diamond will emerge when the timer completes.');
    updateUI();
    renderColonies();
    openColonyControlPanel(colony.id);
}

function completeDiamondShrineJob(colony, job) {
    const diamond = createDiamondFromShrine();
    GameData.gems.push(diamond);
    colony.shrineJobs = colony.shrineJobs.filter(activeJob => activeJob !== job);
    alert(`${diamond.name} emerged from the Diamond Shrine.`);
    renderRoster();
    updateUI();
}

function surveyColony() {
    const colony = GameData.colonies.find(c => c.id === selectedColonyId);
    if (!colony) return;
    alert(`${colony.name} survey:\n\nPlanet: ${colony.planetType || colony.name}\nMaterials: +${colony.yieldValue}/tick\nEssence: +${colony.essenceRate || 0}/tick\nGem types: ${(colony.availableGemTypes || COLONY_OPTIONS.GEM_TYPES).join(', ')}`);
}

function triggerLiveGemEvent() {
    const now = Date.now();
    const candidates = GameData.gems.filter(gem => isGemUsable(gem) && (!gem.eventCooldownUntil || gem.eventCooldownUntil <= now));
    if (!candidates.length || Math.random() > 0.025) return;

    const kind = candidates[Math.floor(Math.random() * candidates.length)];
    const personalityRisk = {
        Fiery: 1.9,
        Rebellious: 2.4,
        Proud: 1.4,
        Anxious: 1.1,
        Stoic: 0.45,
        Loyal: 0.35,
        Meticulous: 0.55
    }[kind.personality] || 1;
    const conflictPool = candidates.filter(gem => gem.id !== kind.id && (!gem.eventCooldownUntil || gem.eventCooldownUntil <= now));
    const startsConflict = conflictPool.length > 0 && Math.random() < Math.min(0.8, 0.22 * personalityRisk);
    const other = startsConflict ? conflictPool[Math.floor(Math.random() * conflictPool.length)] : null;
    const affected = other ? [kind, other] : [kind];
    const cooldownUntil = now + (2.5 * 60 * 1000);
    affected.forEach(gem => { gem.eventCooldownUntil = cooldownUntil; });

    let eventText;
    const roll = Math.random();
    if (other && roll < Math.min(0.5, 0.22 * personalityRisk)) {
        if (personalityRisk > 1.6) {
            kind.status = 'Cracked';
            other.status = 'Cracked';
            eventText = `${kind.name} and ${other.name} got into a heated conflict and cracked each other. The Healing Center can repair them.`;
        } else {
            eventText = `${kind.name} and ${other.name} argued, but ${kind.name}'s calmer nature kept the conflict from escalating.`;
        }
    } else if (roll < 0.55) {
        eventText = `${kind.name} accidentally fell from a transport ledge while trying to show off. The incident was contained.`;
    } else if (roll < 0.75) {
        kind.status = 'Cracked';
        eventText = `${kind.name} was caught in a chaotic equipment mishap and cracked. The Healing Center can repair them.`;
    } else if (roll < 0.9) {
        kind.status = 'Poofed';
        kind.reformAt = now + 10 * 60 * 1000;
        eventText = `${kind.name} poofed during a sudden rebellion and will remain unusable until reformed.`;
    } else {
        eventText = `${kind.name}'s ${kind.personality || 'unpredictable'} personality sparked a rebellion scare, but the court contained it.`;
    }

    addNotification(eventText);
    showEventPopup(eventText);
    renderRoster();
}

// ==========================================
// 4. ROSTER & IMAGE GALLERY DIRECTORIES
// ==========================================
function renderRoster() {
    const grid = document.getElementById('roster-grid');
    if(!grid) return;
    grid.innerHTML = '';
    
    const searchInput = document.getElementById('search-input');
    const filterInput = document.getElementById('quality-filter');
    const search = searchInput ? searchInput.value.toLowerCase() : '';
    const filter = filterInput ? filterInput.value : 'all';
    
    GameData.gems.filter(gem => !['Bubbled', 'Shattered'].includes(normalizeGemStatus(gem))).forEach(gem => {
        normalizeGemStatus(gem);
        const matchesSearch = gem.name.toLowerCase().includes(search) || gem.type.toLowerCase().includes(search);
        const matchesFilter = filter === 'all' || gem.quality === filter;
        if (matchesSearch && matchesFilter) {
            const card = document.createElement('div');
            card.className = 'card';
            const safeId = String(gem.id).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            const caste = getGemCaste(gem);
            const unusable = ['Poofed', 'Bubbled', 'Shattered'].includes(gem.status);
            card.style.opacity = unusable ? '0.45' : '1';
            card.innerHTML = `<img src="${gem.image}" alt="Portrait"> <h4>${gem.name}</h4> <p style="font-size:0.75rem; opacity:0.7; margin:0 0 4px;">${caste}</p> <p style="font-size:0.8rem; opacity: 0.6; margin-bottom:4px;">${gem.quality} Cut</p> <p style="font-size:0.8rem; margin-bottom:10px;">Status: ${gem.status}</p> <button onclick="openProfile('${safeId}')" style="padding:6px; font-size:0.8rem; width:auto;">View Profile</button>`;
            grid.appendChild(card);
        }
    });
}

function renderGemDirectories() {
    const bubbled = GameData.gems.filter(gem => normalizeGemStatus(gem) === 'Bubbled');
    const shattered = GameData.gems.filter(gem => normalizeGemStatus(gem) === 'Shattered');
    const bubbledBox = document.getElementById('bubbled-gems-directory');
    const shatteredBox = document.getElementById('shattered-gems-directory');
    if (bubbledBox) bubbledBox.innerHTML = bubbled.length ? bubbled.map(gem => `<div class="card" style="display:flex; align-items:center; gap:8px; margin:6px 0; text-align:left;"><img src="${gem.image}" alt="Portrait" style="width:42px; height:42px; margin:0;"><span>${gem.name}<br><small>Status: Bubbled</small></span><button type="button" onclick="reformGem('${gem.id}')" style="width:auto; margin-left:auto;">Reform</button><button type="button" onclick="openProfile('${gem.id}')" style="width:auto;">Profile</button></div>`).join('') : 'No bubbled gems.';
    if (shatteredBox) shatteredBox.innerHTML = shattered.length ? shattered.map(gem => `<div class="card" style="display:flex; align-items:center; gap:8px; margin:6px 0; text-align:left; opacity:0.55;"><img src="${gem.image}" alt="Portrait" style="width:42px; height:42px; margin:0;"><span>${gem.name}<br><small>Status: Shattered, permanent</small></span><button type="button" onclick="openProfile('${gem.id}')" style="width:auto; margin-left:auto;">Profile</button></div>`).join('') : 'No shattered gems.';
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
    return Math.max(60 * 1000, baseMinutes * 60 * 1000 * (1 - getStructureTimeReduction(type)));
}

function showStructureInventory(type) {
    const inventoryBox = document.getElementById(
        type === 'Reef' ? 'reef-inventory' :
        type === 'Spinel Funhouse' ? 'funhouse-inventory' :
        'forge-inventory'
    );

    if (!inventoryBox) return;

    const level = getStructureLevel(type);
    const slots = getStructureSlots(type);
    const structureReduction = getStructureTimeReduction(type);

    if (type === 'Diamond Shrine') {
        inventoryBox.innerHTML = `<div>Level ${level} | ${slots} shrine slot${slots === 1 ? '' : 's'} | Timer reduction: ${Math.round(structureReduction * 1000) / 10}%</div><div>Diamond Shrine online. Open a colony menu to start a Diamond Kindergarten.</div>`;
        inventoryBox.style.display = 'block';
        return;
    }

    if (type === 'Reef') {
        const pearls = GameData.gems.filter(g => g.type === 'Pearl' && isGemUsable(g));
        inventoryBox.innerHTML = `<div>Level ${level} | ${slots} production slot${slots === 1 ? '' : 's'} | Timer reduction: ${Math.round(structureReduction * 1000) / 10}%</div><button type="button" onclick="levelUpStructure('Reef')">Level Reef</button><button type="button" onclick="createPearlFromReef()" ${getActiveProductionJobs('Reef').length >= slots ? 'disabled' : ''}>Start Pearl Creation (30 minutes)</button>` + (pearls.length
            ? pearls.map(p => `<div>${p.name} (${p.quality})</div>`).join('')
            : '<span>No pearls available.</span>');
        inventoryBox.style.display = 'block';
        return;
    }

    if (type === 'Spinel Funhouse') {
        const spinels = GameData.gems.filter(g => g.type === 'Spinel' && isGemUsable(g));
        const hasTaaffeite = GameData.gems.some(g => g.type === 'Taaffeite' && isGemUsable(g));
        inventoryBox.innerHTML = `<div>Level ${level} | ${slots} production slot${slots === 1 ? '' : 's'} | Timer reduction: ${Math.round(structureReduction * 1000) / 10}%</div><button type="button" onclick="levelUpStructure('Spinel Funhouse')">Level Funhouse</button><button type="button" onclick="createSpinelFromFunhouse()" ${!hasTaaffeite || getActiveProductionJobs('Spinel Funhouse').length >= slots ? 'disabled' : ''}>Start Spinel Creation (20 minutes)</button>` + (spinels.length
            ? spinels.map(s => `<div>${s.name} (${s.quality})</div>`).join('')
            : '<span>No spinels available.</span>');
        inventoryBox.style.display = 'block';
        return;
    }

    const bismuths = GameData.gems.filter(g => g.type === 'Bismuth' && isGemUsable(g));
    const targetOptions = GameData.gems
        .filter(g => g.type !== 'Bismuth' && isGemUsable(g))
        .map(g => `<option value="${g.id}">${g.name} (${getGemCaste(g)})</option>`).join('');
    const blueprintButtons = FORGERY_BLUEPRINTS.map(bp => `
        <button type="button" ${!bismuths.length || getActiveProductionJobs('Gem Forge').length >= slots ? 'disabled' : ''} style="width:auto; margin:3px 3px 0 0; padding:4px 8px;" onclick="craftForgedBoost('${bp.id}')">${bp.name}</button>
    `).join('');

    inventoryBox.innerHTML = `
        <div>Level ${level} | ${slots} production slot${slots === 1 ? '' : 's'} | Timer reduction: ${Math.round(structureReduction * 1000) / 10}%</div>
        <button type="button" onclick="levelUpStructure('Gem Forge')">Level Forge</button>
        <div><strong>Bismuth in forge:</strong> ${bismuths.length}</div>
        <label for="forge-target-gem" style="display:block; margin-top:8px;">Gem receiving the boost:</label>
        <select id="forge-target-gem" style="width:100%; margin-top:4px;">${targetOptions || '<option value="">No eligible gems</option>'}</select>
        <div style="margin-top:6px;">${blueprintButtons || '<span>No blueprints available.</span>'}</div>
        <div style="margin-top:6px;">Active boost jobs: ${getActiveProductionJobs('Gem Forge').length}/${slots}</div>
    `;
    inventoryBox.style.display = 'block';
}

function craftForgedBoost(blueprintId, targetGemId) {
    const targetSelect = document.getElementById('forge-target-gem');
    const targetId = targetGemId || (targetSelect ? targetSelect.value : selectedGemId);
    const gem = GameData.gems.find(g => String(g.id) === String(targetId));
    if (!gem) return alert('Select a gem profile before forging a boost.');

    const blueprint = FORGERY_BLUEPRINTS.find(bp => bp.id === blueprintId);
    if (!blueprint) return alert('This forging blueprint is not available.');

    const bismuth = GameData.gems.find(g => g.type === 'Bismuth' && isGemUsable(g) && !g.inForge);
    if (!bismuth) return alert('The forge needs at least one active Bismuth laborer assigned to it.');
    if (getActiveProductionJobs('Gem Forge').length >= getStructureSlots('Gem Forge')) return alert('All Gem Forge production slots are busy.');

    if (!Array.isArray(gem.boosts)) gem.boosts = [];
    if (gem.boosts.some(boost => boost.id === blueprint.id || describeBoost(boost) === blueprint.name)) {
        return alert(`${gem.name} already has ${blueprint.name}.`);
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
    const materials = (30 + (currentLevel * 25)) * 10;
    const essence = (6 + (currentLevel * 4)) * 10;
    return { materials, essence };
}

function getGemCaste(gem) {
    if (!gem) return "Unassigned";
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
        gem.status !== 'Shattered' &&
        !gem.guardOwnerId &&
        String(gem.id) !== String(selectedGemId)
    );
}

function canEquipGuard(gem, guardType) {
    if (!gem) return false;
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
    const guardTypes = ['Pearl', 'Ruby', 'Spinel'];

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
    const guardList = document.getElementById('prof-guards');
    if (guardList) {
        const assigned = Array.isArray(gem.guards) && gem.guards.length ? gem.guards.map(g => g.name || g.type).join(', ') : 'None';
        guardList.innerText = assigned;
    }

    const levelValue = document.getElementById('prof-level');
    if (levelValue) levelValue.innerText = String(Number(gem.level || 0));

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
        costLabel.innerText = `${nextCost.materials} Materials / ${nextCost.essence} Essence`;
    }

    renderGuardAssignmentMenu(gem);
}

function renderStructureInventoryButtons() {
    const hasTaaffeite = GameData.gems.some(g => g.type === 'Taaffeite' && isGemUsable(g));
    const hasBismuth = GameData.gems.some(g => g.type === 'Bismuth' && isGemUsable(g));
    const reefButton = document.getElementById('reef-structure-button');
    const funhouseButton = document.getElementById('funhouse-structure-button');
    const forgeButton = document.getElementById('forge-structure-button');
    const rigButton = document.getElementById('rig-structure-button');
    const healingButton = document.getElementById('healing-center-button');
    const soldierShipButton = document.getElementById('soldier-ship-button');

    if (rigButton) rigButton.disabled = GameData.structures.includes('Extractor Injection Rig');

    if (healingButton) {
        healingButton.textContent = GameData.structures.includes('Healing Center') ? 'Inventory' : 'Build Healing Center (500000 Materials)';
        healingButton.onclick = () => GameData.structures.includes('Healing Center') ? showHealingCenter() : buildStructure('Healing Center', 500000);
    }

    if (soldierShipButton) {
        soldierShipButton.textContent = GameData.structures.includes('Soldier Ship') ? 'Inventory' : 'Build Soldier Ship (75000 Materials)';
        soldierShipButton.onclick = () => GameData.structures.includes('Soldier Ship') ? showSoldierShipInventory() : buildStructure('Soldier Ship', 75000);
    }
    const shrineButton = document.getElementById('shrine-structure-button');

    if (reefButton) {
        if (GameData.structures.includes('Reef')) {
            reefButton.textContent = 'Inventory';
            reefButton.onclick = () => showStructureInventory('Reef');
            const inventoryBox = document.getElementById('reef-inventory');
            if (inventoryBox) inventoryBox.style.display = 'block';
        } else {
            reefButton.textContent = 'Build Reef (25000 Materials)';
            reefButton.onclick = () => buildStructure('Reef', 250);
            const inventoryBox = document.getElementById('reef-inventory');
            if (inventoryBox) inventoryBox.style.display = 'none';
        }
    }

    if (funhouseButton) {
        if (GameData.structures.includes('Spinel Funhouse')) {
            funhouseButton.textContent = 'Inventory';
            funhouseButton.onclick = () => showStructureInventory('Spinel Funhouse');
            const inventoryBox = document.getElementById('funhouse-inventory');
            if (inventoryBox) inventoryBox.style.display = 'block';
        } else {
            funhouseButton.textContent = hasTaaffeite ? 'Build Funhouse (30000 Materials)' : 'Build Funhouse (Taaffeite Required)';
            funhouseButton.onclick = () => buildStructure('Spinel Funhouse', 300);
            funhouseButton.disabled = !hasTaaffeite;
            const inventoryBox = document.getElementById('funhouse-inventory');
            if (inventoryBox) inventoryBox.style.display = 'none';
        }
    }

    if (forgeButton) {
        if (GameData.structures.includes('Gem Forge')) {
            forgeButton.textContent = 'Inventory';
            forgeButton.onclick = () => showStructureInventory('Gem Forge');
            const inventoryBox = document.getElementById('forge-inventory');
            if (inventoryBox) inventoryBox.style.display = 'block';
        } else {
            forgeButton.textContent = hasBismuth ? 'Build Forge (35000 Materials)' : 'Build Forge (Bismuth Required)';
            forgeButton.onclick = () => buildStructure('Gem Forge', 350);
            forgeButton.disabled = !hasBismuth;
            const inventoryBox = document.getElementById('forge-inventory');
            if (inventoryBox) inventoryBox.style.display = 'none';
        }
    }

    if (shrineButton) {
        if (GameData.structures.includes('Diamond Shrine')) {
            shrineButton.textContent = 'Inventory';
            shrineButton.onclick = () => showStructureInventory('Diamond Shrine');
            const inventoryBox = document.getElementById('shrine-inventory');
            if (inventoryBox) {
                inventoryBox.style.display = 'block';
                inventoryBox.textContent = 'Diamond Shrine online. Open a colony menu to start a Diamond Kindergarten.';
            }
        } else {
            shrineButton.textContent = 'Build Shrine (250000 Materials)';
            shrineButton.onclick = () => buildStructure('Diamond Shrine', COLONY_OPTIONS.SHRINE_KINDERGARTEN_COST);
            const inventoryBox = document.getElementById('shrine-inventory');
            if (inventoryBox) inventoryBox.style.display = 'none';
        }
    }
}

function getSoldierShipCapacity() {
    return 10 * Math.max(1, Number(GameData.soldierShip && GameData.soldierShip.levels || 1));
}

function renderSoldierShipInventory() {
    const box = document.getElementById('soldier-ship-inventory');
    if (!box || !GameData.structures.includes('Soldier Ship')) return;
    const ship = GameData.soldierShip || { levels: 1, inventories: [{ agateId: null, gemIds: [] }] };
    const eligible = GameData.gems.filter(gem => ['Ruby', 'Amethyst', 'Rose Quartz', 'Jasper', 'Citrine', 'Carnelian', 'Honey Quartz', 'Clear Quartz', 'Smoky Quartz', 'Milky Quartz', 'Ametrine', 'Prasiolite', "Tiger's Eye", "Hawk's Eye", 'Rutile', 'Bloodstone', 'Cherry Quartz', 'Flint', 'Chert', 'Obsidian'].includes(gem.type) && isGemUsable(gem));
    const agates = GameData.gems.filter(gem => gem.type === 'Agate' && isGemUsable(gem));
    box.style.display = 'block';
    box.innerHTML = `<div>Level ${ship.levels} | Capacity ${getSoldierShipCapacity()} | Inventories ${ship.inventories.length}</div><button type="button" onclick="levelUpSoldierShip()" style="width:auto;">Level Ship</button><label>Agate oversight<select id="ship-agate-select"><option value="">Choose Agate</option>${agates.map(g => `<option value="${g.id}">${g.name}</option>`).join('')}</select></label><label>Assign soldier<select id="ship-gem-select"><option value="">Choose gem</option>${eligible.map(g => `<option value="${g.id}">${g.name} (${g.type})</option>`).join('')}</select></label><button type="button" onclick="assignGemToSoldierShip()" style="width:auto;">Assign to Ship</button><div>${ship.inventories.map((inventory, index) => `<p>Ship inventory ${index + 1}: ${inventory.gemIds.length}/${getSoldierShipCapacity()} assigned</p>`).join('')}</div>`;
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
    const box = document.getElementById('healing-center-inventory');
    if (!box) return;
    const cracked = GameData.gems.filter(gem => normalizeGemStatus(gem) === 'Cracked');
    const shattered = GameData.gems.filter(gem => normalizeGemStatus(gem) === 'Shattered');
    box.style.display = 'block';
    box.innerHTML = `<div>Cracked repairs: ${cracked.length ? cracked.map(gem => `<button type="button" onclick="healCrackedGem('${gem.id}')" style="width:auto; margin:2px;">Heal ${gem.name} (100000)</button>`).join('') : 'None'}</div><div style="margin-top:6px;">Shattered repairs: ${shattered.length ? shattered.map(gem => `<button type="button" onclick="healShatteredGem('${gem.id}')" style="width:auto; margin:2px;">Repair ${gem.name} (1000000)</button>`).join('') : 'None'}</div>`;
}

function healCrackedGem(id) {
    const gem = findLiveGem(id);
    if (!gem || normalizeGemStatus(gem) !== 'Cracked') return;
    if (GameData.mode !== 'Roleplay' && GameData.materials < 100000) return alert('Healing a cracked gem costs 100000 Materials.');
    if (GameData.mode !== 'Roleplay') GameData.materials -= 100000;
    gem.status = 'Fine';
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
    addNotification(`${gem.name} was restored by the Healing Center.`);
    showHealingCenter();
    renderRoster();
    updateUI();
}

function levelUpGem() {
    const gem = GameData.gems.find(g => String(g.id) === String(selectedGemId));
    if (!gem) return alert('No gem selected.');

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
    renderProfileAssignments(gem);
}

function openProfile(id) {
    const targetId = String(id);
    selectedGemId = id;
    const gem = GameData.gems.find(g => String(g.id) === targetId);
    if (!gem) return;

    gem.level = Number(gem.level || 0);
    gem.guards = Array.isArray(gem.guards) ? gem.guards : [];
    normalizeGemStatus(gem);

    document.getElementById('prof-name').innerText = gem.name;
    document.getElementById('prof-type').innerText = gem.type;
    document.getElementById('prof-quality').innerText = gem.quality;
    document.getElementById('prof-placement').innerText = gem.placement;
    document.getElementById('prof-personality').innerText = gem.personality;
    document.getElementById('prof-status').innerText = gem.status;
    const prefixInput = document.getElementById('prof-prefix-input');
    if (prefixInput) prefixInput.value = gem.customPrefix || (gem.name || '').split(' ')[0];
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
    document.getElementById('prof-img').src = gem.image;
    const cutPreview = document.getElementById('prof-cut-img');
    if (cutPreview) {
        cutPreview.src = gem.cutImage || '';
        cutPreview.style.display = gem.cutImage ? 'block' : 'none';
    }
    applyStoredProfileCustomization(gem);

    renderProfileAssignments(gem);
    renderProfileLifecycleActions(gem);

    const urlInput = document.getElementById('img-url-input');
    if (urlInput) urlInput.value = '';
    
    if (!gem.galleryPool) {
        gem.galleryPool = [gem.image];
    }
    
    renderProfileGallery(gem);
    const modal = document.getElementById('profile-modal');
    if (modal) modal.style.display = 'flex';
}

function renderProfileLifecycleActions(gem) {
    const container = document.getElementById('profile-lifecycle-actions');
    if (!container) return;
    const id = String(gem.id).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    if (gem.status === 'Shattered') {
        container.innerHTML = '<span style="opacity:0.6;">This gem is shattered permanently.</span>';
    } else if (gem.status === 'Poofed') {
        container.innerHTML = `<button type="button" onclick="reformGem('${id}')" style="width:auto;">Reform</button><button type="button" onclick="bubbleGem('${id}')" style="width:auto;">Bubble</button>`;
    } else if (gem.status === 'Bubbled') {
        container.innerHTML = `<button type="button" onclick="reformGem('${id}')" style="width:auto;">Reform</button>`;
    } else {
        container.innerHTML = `<button type="button" onclick="poofLiveGem('${id}')" style="width:auto;">Poof</button><button type="button" onclick="rejuvenateLiveGem('${id}')" style="width:auto;">Rejuvenate</button><button type="button" onclick="shatterLiveGem('${id}')" style="width:auto;">Shatter</button>`;
    }
}

function findLiveGem(id) {
    return GameData.gems.find(gem => String(gem.id) === String(id));
}

function poofLiveGem(id) {
    const gem = findLiveGem(id);
    if (!gem || gem.status === 'Shattered') return;
    gem.status = 'Poofed';
    gem.reformAt = Date.now() + 10 * 60 * 1000;
    addNotification(`${gem.name} poofed and is unusable until reformed.`);
    renderRoster();
    openProfile(gem.id);
}

function bubbleGem(id) {
    const gem = findLiveGem(id);
    if (!gem || gem.status !== 'Poofed') return;
    gem.status = 'Bubbled';
    gem.reformAt = null;
    addNotification(`${gem.name} was bubbled and moved to the Bubbled Gems directory.`);
    renderGemDirectories();
    renderRoster();
    openProfile(gem.id);
}

function reformGem(id) {
    const gem = findLiveGem(id);
    if (!gem || gem.status === 'Shattered') return;
    gem.status = 'Fine';
    gem.reformAt = null;
    addNotification(`${gem.name} reformed and is usable again.`);
    renderGemDirectories();
    renderRoster();
    openProfile(gem.id);
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
    openProfile(gem.id);
}

function shatterLiveGem(id) {
    const gem = findLiveGem(id);
    if (!gem || gem.status === 'Shattered') return;
    gem.status = 'Shattered';
    gem.reformAt = null;
    gem.guards = [];
    gem.guardOwnerId = null;
    addNotification(`${gem.name} shattered permanently.`);
    renderGemDirectories();
    renderRoster();
    openProfile(gem.id);
}

function renderProfileGallery(gem) {
    const container = document.getElementById('prof-gallery-container');
    if (!container) return;
    container.innerHTML = '';
    
    gem.galleryPool.forEach(imgUrl => {
        const img = document.createElement('img');
        img.src = imgUrl;
        img.className = 'gallery-thumb';
        img.style.width = '50px';
        img.style.height = '50px';
        img.style.margin = '5px';
        img.style.cursor = 'pointer';
        img.style.borderRadius = '4px';
        
        if (gem.image === imgUrl) {
            img.style.border = '2px solid #c594a0';
        } else {
            img.style.border = '1px solid #444';
        }
        
        img.onclick = () => {
            gem.image = imgUrl;
            document.getElementById('prof-img').src = imgUrl;
            renderProfileGallery(gem);
            renderRoster();
        };
        container.appendChild(img);
    });
}

function appendImageToGalleryPool() {
    const urlInput = document.getElementById('img-url-input');
    const url = urlInput ? urlInput.value.trim() : "";
    if (url === '') return alert("Please input a valid artwork illustration address string first!");
    
    const gem = GameData.gems.find(g => g.id === selectedGemId);
    if (gem) {
        if (!gem.galleryPool) gem.galleryPool = [];
        if (!gem.galleryPool.includes(url)) {
            gem.galleryPool.push(url);
        }
        gem.image = url;
        document.getElementById('prof-img').src = url;
        if (urlInput) urlInput.value = '';
        renderProfileGallery(gem);
        renderRoster();
    }
}

function saveGemCutImage() {
    const input = document.getElementById('cut-img-url-input');
    const gem = GameData.gems.find(g => String(g.id) === String(selectedGemId));
    const url = input ? input.value.trim() : '';
    if (!gem) return alert('Open a gem profile before adding a cut photo.');
    if (!url) return alert('Please enter a valid gem cut image URL.');
    gem.cutImage = url;
    const preview = document.getElementById('prof-cut-img');
    if (preview) {
        preview.src = url;
        preview.style.display = 'block';
    }
    if (input) input.value = '';
}

function saveGemPrefix() {
    const gem = findLiveGem(selectedGemId);
    const input = document.getElementById('prof-prefix-input');
    const prefix = input ? input.value.trim() : '';
    if (!gem || !prefix) return alert('Enter a prefix first.');
    gem.customPrefix = prefix;
    gem.name = `${prefix} ${gem.type}`;
    addNotification(`${gem.name} received a customized prefix.`);
    renderRoster();
    openProfile(gem.id);
}

function applyStoredProfileCustomization(gem) {
    const panel = document.querySelector('#profile-modal .modal-content');
    const portrait = document.getElementById('prof-img');
    const backgroundColor = document.getElementById('profile-bg-color');
    const backgroundImage = document.getElementById('profile-bg-image');
    const frameImage = document.getElementById('profile-frame-image');
    const fontSelect = document.getElementById('profile-font-select');
    if (!panel || !portrait) return;
    const settings = gem.profileCustomization || {};
    panel.style.backgroundColor = settings.backgroundColor || '#2d3133';
    panel.style.backgroundImage = settings.backgroundImage ? `url("${settings.backgroundImage}")` : 'none';
    panel.style.fontFamily = settings.fontFamily || 'inherit';
    portrait.style.borderImage = settings.frameImage ? `url("${settings.frameImage}") 30 round` : 'none';
    portrait.style.borderWidth = settings.frameImage ? '12px' : '2px';
    if (backgroundColor) backgroundColor.value = settings.backgroundColor || '#2d3133';
    if (backgroundImage) backgroundImage.value = settings.backgroundImage || '';
    if (frameImage) frameImage.value = settings.frameImage || '';
    if (fontSelect) fontSelect.value = settings.fontFamily || 'inherit';
}

function applyProfileCustomization() {
    const gem = findLiveGem(selectedGemId);
    if (!gem) return;
    gem.profileCustomization = {
        backgroundColor: document.getElementById('profile-bg-color')?.value || '#2d3133',
        backgroundImage: document.getElementById('profile-bg-image')?.value.trim() || '',
        frameImage: document.getElementById('profile-frame-image')?.value.trim() || '',
        fontFamily: document.getElementById('profile-font-select')?.value || 'inherit'
    };
    applyStoredProfileCustomization(gem);
}

function openCourtAssignment() {
    const select = document.getElementById('court-diamond-select');
    if (!select) return;
    const diamonds = GameData.gems.filter(gem => gem.type === 'Diamond' && isGemUsable(gem));
    select.innerHTML = diamonds.map(diamond => `<option value="${diamond.id}">${diamond.name}</option>`).join('');
    document.getElementById('court-modal').style.display = 'flex';
}

function closeCourtAssignment() {
    document.getElementById('court-modal').style.display = 'none';
}

function assignSelectedGemToCourt() {
    const gem = findLiveGem(selectedGemId);
    const select = document.getElementById('court-diamond-select');
    if (!gem || !isGemUsable(gem) || !select || !select.value) return alert('Choose a usable gem and Diamond court.');
    const diamond = findLiveGem(select.value);
    if (!diamond || diamond.type !== 'Diamond' || !isGemUsable(diamond)) return alert('Choose a usable Diamond court.');
    gem.courtId = select.value;
    if (!Array.isArray(diamond.courtMembers)) diamond.courtMembers = [];
    if (!diamond.courtMembers.includes(gem.id)) diamond.courtMembers.push(gem.id);
    addNotification(`${gem.name} was assigned to a Diamond court.`);
    closeCourtAssignment();
    openProfile(gem.id);
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
    if (getActiveProductionJobs('Reef').length >= getStructureSlots('Reef')) return alert('All Reef production slots are busy.');
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
    if (getActiveProductionJobs('Spinel Funhouse').length >= getStructureSlots('Spinel Funhouse')) return alert('All Spinel Funhouse production slots are busy.');
    if (!GameData.structureJobs) GameData.structureJobs = {};
    if (!GameData.structureJobs['Spinel Funhouse']) GameData.structureJobs['Spinel Funhouse'] = [];
    GameData.structureJobs['Spinel Funhouse'].push({ kind: 'spinel', readyAt: Date.now() + getStructureTimerMs('Spinel Funhouse', 20) });
    showStructureInventory('Spinel Funhouse');
    alert('Spinel creation started. The Funhouse will produce it when the timer completes.');
}

function completeStructureJob(type, job) {
    if (type === 'Reef') {
        GameData.gems.push({ id: 'pearl_' + Date.now(), type: 'Pearl', name: 'Pearl-' + Math.floor(Math.random() * 900 + 100), quality: 'Perfect', placement: 'Navel', personality: 'Loyal', level: 0, guards: [], boosts: [], guardOwnerId: null, image: 'https://placehold.co/200x200', galleryPool: ['https://placehold.co/200x200'] });
    } else if (type === 'Spinel Funhouse') {
        GameData.gems.push({ id: 'spinel_' + Date.now(), type: 'Spinel', name: 'Spinel-' + Math.floor(Math.random() * 900 + 100), quality: 'Perfect', placement: 'Face', personality: 'Meticulous', level: 0, guards: [], boosts: [], guardOwnerId: null, image: 'https://placehold.co/200x200', galleryPool: ['https://placehold.co/200x200'] });
    } else if (type === 'Gem Forge') {
        const gem = GameData.gems.find(g => String(g.id) === String(job.targetGemId));
        const blueprint = FORGERY_BLUEPRINTS.find(bp => bp.id === job.blueprintId);
        if (gem && blueprint) gem.boosts.push({ id: blueprint.id, name: blueprint.name, stat: blueprint.stat, desc: blueprint.desc, origin: 'Forged' });
    }
    GameData.structureJobs[type] = getActiveProductionJobs(type).filter(activeJob => activeJob !== job);
    renderRoster();
    updateUI();
}

function buildStructure(structureDesignationName, productionMaterialCostValue) {
    productionMaterialCostValue = COLONY_OPTIONS.STRUCTURE_BUILD_COSTS[structureDesignationName] || productionMaterialCostValue * 100;
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
        status: 'Active'
    };

    GameData.gems.push(bismuth);
    renderRoster();
    updateUI();
    renderStructureInventoryButtons();
    alert(`${bismuth.name} is ready to work in the forge.`);
}

// ==========================================
// 6. HEARTBEAT TIMELINE AUTOMATION TICK
// ==========================================
setInterval(() => {
    const mainViewDashboard = document.getElementById('screen-dashboard');
    if (mainViewDashboard && mainViewDashboard.classList.contains('active-screen')) {
        GameData.year += 0.16;
        const activeDiamonds = GameData.gems.filter(gem => gem.type === 'Diamond' && isGemUsable(gem)).length;
        const diamondEssenceRate = CONFIG.RESOURCES.DIAMOND_ESSENCE_PER_DIAMOND_TICK || 0;
        GameData.essence += activeDiamonds * diamondEssenceRate;
        GameData.colonies.forEach(colony => {
            if (!colony.isDecayed) {
                GameData.materials += colony.yieldValue;
            GameData.essence += Number(colony.essenceRate || 0);
                (colony.kindergartenJobs || []).slice().forEach(job => {
                    if (Date.now() >= job.readyAt) completeKindergartenJob(colony, job);
                });
                (colony.shrineJobs || []).slice().forEach(job => {
                    if (Date.now() >= job.readyAt) completeDiamondShrineJob(colony, job);
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
        triggerLiveGemEvent();
        Object.keys(GameData.structureJobs || {}).forEach(type => {
            getActiveProductionJobs(type).slice().forEach(job => {
                if (Date.now() >= job.readyAt) {
                    if (type === 'Gem Forge') {
                        const bismuth = GameData.gems.find(g => g.inForge && isGemUsable(g));
                        if (bismuth) bismuth.inForge = false;
                    }
                    completeStructureJob(type, job);
                }
            });
        });
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
window.exportSaveData = exportSaveData;
window.executeImportSave = executeImportSave;
window.foundColony = foundColony;
window.openColonyControlPanel = openColonyControlPanel;
window.closeColonyControlPanel = closeColonyControlPanel;
window.buildColonyKindergarten = buildColonyKindergarten;
window.buildDiamondShrineKindergarten = buildDiamondShrineKindergarten;
window.surveyColony = surveyColony;
window.openProfile = openProfile;
window.appendImageToGalleryPool = appendImageToGalleryPool;
window.saveGemCutImage = saveGemCutImage;
window.applyAppearanceSettings = applyAppearanceSettings;
window.toggleCustomizationOptions = toggleCustomizationOptions;
window.saveGemPrefix = saveGemPrefix;
window.openCourtAssignment = openCourtAssignment;
window.closeCourtAssignment = closeCourtAssignment;
window.assignSelectedGemToCourt = assignSelectedGemToCourt;
window.applyProfileCustomization = applyProfileCustomization;
window.showSoldierShipInventory = showSoldierShipInventory;
window.levelUpSoldierShip = levelUpSoldierShip;
window.assignGemToSoldierShip = assignGemToSoldierShip;
window.closeProfile = closeProfile;
window.toggleNotifications = toggleNotifications;
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
window.addDiamondToSetupCouncil = addDiamondToSetupCouncil;
window.removeDiamondFromSetup = removeDiamondFromSetup;
window.levelUpGem = levelUpGem;
window.levelUpStructure = levelUpStructure;
window.assignGuard = assignGuard;

// Safe runtime inputs fallback setup
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById('search-input');
    const filterInput = document.getElementById('quality-filter');
    if (searchInput) searchInput.addEventListener('input', renderRoster);
    if (filterInput) filterInput.addEventListener('change', renderRoster);
});
