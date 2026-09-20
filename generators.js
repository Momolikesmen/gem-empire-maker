// Configuration setting for user auto-pausing behavior
let AUTO_PAUSE_ON_EVENT = true; 

function triggerRandomSandboxEvent() {
    // Check if we even have any gems to build a story around
    const activeGems = CurrentEmpire.gemsRoster.filter(g => g.status === "Active");
    if (activeGems.length === 0) return;

    // Handle auto-pausing the sandbox loop if enabled by the user
    if (AUTO_PAUSE_ON_EVENT) {
        pauseSimulation();
    }

    // Select up to two random gems for character interactions
    const gemA = activeGems[Math.floor(Math.random() * activeGems.length)];
    const remainingGems = activeGems.filter(g => g.id !== gemA.id);
    const gemB = remainingGems.length > 0 ? remainingGems[Math.floor(Math.random() * remainingGems.length)] : null;

    // Sample Event Scenarios List
    const scenarios = [
        {
            title: "Forbidden Fusion Sighting",
            condition: gemB !== null,
            text: `Scouts caught ${gemA.name} and ${gemB.name} fused into an unauthorized crystalline structure on a nearby outpost! How do you handle this infraction?`,
            choices: [
                { text: "Allow the Fusion", action: () => logEmpireEvent(`You allowed the fusion of ${gemA.name} and ${gemB.name} to exist.`, "Gentle") },
                { text: "Rejuvenate Both", action: () => { rejuvenateGem(gemA.id); rejuvenateGem(gemB.id); } },
                { text: "Shatter Them", action: () => { shatterGem(gemA.id); shatterGem(gemB.id); } }
            ]
        },
        {
            title: "Kindergarten Mishap",
            condition: true,
            text: `${gemA.name} tripped and tumbled headfirst into an injector column while performing silly choreography.`,
            choices: [
                { text: "Laugh it off", action: () => { poofGem(gemA.id, CurrentEmpire.meta.fictionalYear); } }
            ]
        }
    ];

    // Filter out scenes that don't meet constraints (like needing 2 gems)
    const validScenarios = scenarios.filter(s => s.condition);
    const chosenEvent = validScenarios[Math.floor(Math.random() * validScenarios.length)];

    // Send the event details out to your custom UI popups renderer
    if (typeof renderEventPopupUI === "function") {
        renderEventPopupUI(chosenEvent);
    } else {
        // Fallback fallback log if UI hook isn't built yet
        console.log(`EVENT: ${chosenEvent.title} - ${chosenEvent.text}`);
        chosenEvent.choices[0].action(); // Auto-select option 1
    }
}
function determineStartingBoosts(quality, gemType) {
    let finalBoosts = [];
    let count = 0;

    // 1. Determine how many boosts the Gem gets based on Cut Quality
    if (quality === "Defective") {
        if (BOOST_POOL.DEFECTIVE_ONLY.length > 0) {
            // Pick the first defective penalty item out of the array cleanly
            finalBoosts.push(BOOST_POOL.DEFECTIVE_ONLY[0]);
        }
        return finalBoosts; 
    } else if (quality === "Regular") {
        count = Math.random() < 0.5 ? 1 : 2; 
    } else if (quality === "Perfect") {
        count = 4; 
    }

    // 2. Build a custom pool of options available for this specific Gem birth
    let availableOptions = [...BOOST_POOL.UNIVERSAL];
    
    if (BOOST_POOL.SPECIALIZED[gemType]) {
        availableOptions = availableOptions.concat(BOOST_POOL.SPECIALIZED[gemType]);
    }

    // 3. Randomly select unique boosts until the quota is filled
    for (let i = 0; i < count; i++) {
        if (availableOptions.length === 0) break;
        
        const randomIndex = Math.floor(Math.random() * availableOptions.length);
        const selectedBoost = availableOptions[randomIndex];
        
        finalBoosts.push(selectedBoost);
        availableOptions.splice(randomIndex, 1);
    }

    return finalBoosts;
}
// Generate a gem with placement-influenced personality and boost rolling.
function generateIndividualGem(gemType, assignedCourtId) {
    const randomPrefix = typeof generateGemPrefix === "function"
        ? generateGemPrefix(gemType)
        : GENERATION_TABLES.PREFIXES[Math.floor(Math.random() * GENERATION_TABLES.PREFIXES.length)];
    const randomWeapon = GENERATION_TABLES.WEAPONS[Math.floor(Math.random() * GENERATION_TABLES.WEAPONS.length)];
    
    // 1. Pick a completely random physical Gem Placement first
    const placementOptions = Object.keys(GEM_PLACEMENTS);
    const chosenPlacement = placementOptions[Math.floor(Math.random() * placementOptions.length)];
    const placementData = GEM_PLACEMENTS[chosenPlacement];

    // 2. Determine personality based on placement weights
    let pool = [...GENERATION_TABLES.GEM_PERSONALITIES];
    // Double the weight of preferred traits to make them much more likely to roll!
    placementData.preferredPersonalities.forEach(p => {
        pool.push(p);
        pool.push(p); 
    });
    const finalPersonality = pool[Math.floor(Math.random() * pool.length)];

    // 3. Weighted roll for Cut Quality (97% Regular, 2% Defective, 1% Perfect)
    const roll = Math.random();
    let quality = "Regular";
    let startingLevel = CONFIG.LEVELS.MIN;
    if (roll < CONFIG.CUT_RATES.PERFECT) {
        quality = "Perfect";
        startingLevel = CONFIG.LEVELS.PERFECT_START_BOOST;
    } else if (roll < CONFIG.CUT_RATES.PERFECT + CONFIG.CUT_RATES.DEFECTIVE) {
        quality = "Defective";
    }

    // 4. Handle innate armorer boost assignments
    const startingBoosts = typeof determineStartingBoosts === "function" ? determineStartingBoosts(quality, gemType) : [];

    return {
        id: "gem_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        name: `${randomPrefix} ${gemType}`,
        customPrefix: randomPrefix,
        type: gemType,
        quality: quality,
        level: startingLevel,
        personality: finalPersonality,
        gemPlacement: chosenPlacement, // Safely saved inside the character profile dataset!
        weapon: randomWeapon,
        courtId: assignedCourtId,
        currentLocation: "Homeworld", 
        status: "Active",
        reformYear: null,
        photoUrl: "assets/images/placeholder-gem.png",
        boosts: startingBoosts,
        relationships: {}
    };
}
