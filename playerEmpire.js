// Active state container for the loaded empire
let CurrentEmpire = {
    meta: {
        name: "New Gempire",
        fictionalYear: 0,
        isPaused: true
    },
    resources: {
        diamondEssence: 100,
        colonyMaterials: 250
    },
    diamonds: [],     // Holds custom created Diamonds
    colonies: [],     // Holds randomly generated planets
    gemsRoster: [],   // Holds individual active Gems
    shatteredGems: [],// History logs of dead gems
    structures: [],   // Built infrastructure
    eventHistory: []  // History tracking log
};

// Utility to fetch active stats safely
function getEmpireResource(type) {
    return CurrentEmpire.resources[type] || 0;
}
// Append these helper tracking statistics utilities to player-empire.js
let ReputationTally = { strictActions: 0, gentleActions: 0 };

function logEmpireEvent(description, moralityType) {
    const record = {
        year: CurrentEmpire.meta.fictionalYear.toFixed(1),
        text: description
    };
    CurrentEmpire.eventHistory.unshift(record); // Add to persistent log

    // Handle Reputation calculation shifts over time
    if (moralityType === "Strict") ReputationTally.strictActions++;
    if (moralityType === "Gentle") ReputationTally.gentleActions++;
}

// The core engine function for your global Overview Dashboard menu
function getEmpireOversightSummary() {
    let summary = {
        totalLiving: 0,
        totalPoofed: 0,
        totalShattered: 0,
        byTypeCount: {},
        reputationText: "Balanced"
    };

    CurrentEmpire.gemsRoster.forEach(gem => {
        if (gem.status === "Active") summary.totalLiving++;
        if (gem.status === "Poofed") summary.totalPoofed++;
        if (gem.status === "Shattered") summary.totalShattered++;
        
        summary.byTypeCount[gem.type] = (summary.byTypeCount[gem.type] || 0) + 1;
    });

    // Evaluate current empire narrative personality
    if (ReputationTally.strictActions > ReputationTally.gentleActions + 3) {
        summary.reputationText = "Strict Order";
    } else if (ReputationTally.gentleActions > ReputationTally.strictActions + 3) {
        summary.reputationText = "Gentle Mercy";
    }

    return summary;
}
