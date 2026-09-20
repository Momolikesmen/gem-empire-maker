// ==========================================
// 1. MASTER GEM HIERARCHY & TIERS
// ==========================================
const GEM_TIERS = {
    DIAMOND: {
        name: "Diamond Authority",
        rank: 13,
        types: ["Diamond"]
    },
    ELITE_COMMANDER: {
        name: "Elite Commander Tier",
        rank: 12,
        types: ["Hessonite", "Demantoid", "Pyrope"]
    },
    ELITE_CAPTAIN: {
        name: "Elite Captain Tier",
        rank: 11,
        types: ["Emerald", "Aquamarine", "Nephrite"]
    },
    ELITE_SPECIAL: {
        name: "Elite Special Tier",
        rank: 10,
        types: ["Morganite", "Jadeite", "Taaffeite"]
        
    },
    ELITE_ADVISOR: {
        name: "Elite Advisor Tier",
        rank: 9,
        types: ["Sapphire"]
    },
    ELITE_ENTERTAINER: {
        name: "Elite Entertainer Tier",
        rank: 8,
        types: ["Jade", "Porcelain", "Opal", "Rhodonite"]
    },
    QUARTZ_COMMANDER: {
        name: "Quartz Commander Tier",
        rank: 7,
        types: ["Agate", "Chalcedony", "Onyx"]
    },
    QUARTZ_SOLDIER: {
        name: "Quartz Soldier Tier",
        rank: 6,
        types: [
            "Amethyst", "Rose Quartz", "Jasper", "Citrine", "Carnelian", 
            "Honey Quartz", "Clear Quartz", "Smoky Quartz", "Milky Quartz", 
            "Ametrine", "Prasiolite", "Tiger's Eye", "Hawk's Eye", "Rutile", 
            "Bloodstone", "Cherry Quartz", "Flint", "Chert"
        ]
    },
    QUARTZ_ASSISTANT: {
        name: "Quartz Assistant Tier",
        rank: 5,
        types: ["Obsidian"]
    },
    JUSTICE: {
        name: "Justice Tier",
        rank: 4,
        types: ["Zircon", "Zirconium"]
    },
    AGRICULTURAL: {
        name: "Agricultural Tier",
        rank: 3,
        types: ["Peridot", "Lapis Lazuli", "Turquoise"]
    },
    TRANSPORTATION: {
        name: "Transportation Tier",
        rank: 2,
        types: ["Amber", "Jet"]
    },
    ARMORER: {
        name: "Armorer Tier",
        rank: 1,
        types: ["Bismuth"]
    },
    EXPENDABLE: {
        name: "Expendable Tier",
        rank: 0,
        types: ["Pearl", "Ruby", "Spinel"]
    }
};

// ==========================================
// 2. PROCEDURAL PREFIX & GENERATION TABLES
// ==========================================
const PREFIX_TABLES = {
    // Shared generalized modifiers used across any baseline gem spawn
    GENERAL: [
        "Calm", "Sleepy", "Snowflake", "Winter", "Autumn", 
        "Snarky", "Evil", "Innocent", "Serious", "Clumsy", 
        "Curious", "Giddy", "Sullen", "Bold", "Timid"
    ],
    
    // Shared color arrays for administrative, advisor, and aristocratic tracking units
    COLORS: [
        "Pink", "Blue", "Yellow", "Green", "White", "Purple", "Orange", 
        "Red", "Teal", "Lavender", "Brown", "Black", "Crimson", "Violet"
    ],

    // Specialized unique classification overlays mapped to target profiles
    SPECIALIZED: {
        "Jasper": [
            "Zebra", "Ocean", "Leopard", "Imperial", "Picture", "Brecciated", 
            "Dalmation", "Red", "Kambaba", "Green", "Bumblebee", "Rainforest", "Blue-Spot"
        ],
        "Aquamarine": [
            "Moss", "Milky"
        ],
        "Agate": [
            "Banded", "Moss", "Blue-Lace", "Crazy-Lace", "Holly Blue", "Fire", "Dendritic", "Botswana"
        ],
        "Sapphire": [
            "Padparadscha", "Peacock", "Mermaid", "Star", "Color Change"
        ],
        "Lapis Lazuli": [
            "Lazurite", "Calcite", "Pyrite"
        ],
        "Topaz": ["Color_Link"],
        "Zircon": ["Color_Link"],
        "Jade": ["Color_Link"]
    }
};

// ==========================================
// 3. ENGINE MECHANICS & PROFILE EDITS
// ==========================================

// Calculates and compiles a valid custom prefix description card upon birth
function generateGemPrefix(gemType) {
    let choices = [...PREFIX_TABLES.GENERAL];

    // Check if the type has a dedicated specialized custom array match
    if (PREFIX_TABLES.SPECIALIZED[gemType]) {
        const specList = PREFIX_TABLES.SPECIALIZED[gemType];
        
        // Handle standard color substitution linkages seamlessly
        if (specList[0] === "Color_Link") {
            choices = choices.concat(PREFIX_TABLES.COLORS);
        } else {
            choices = choices.concat(specList);
        }
    }

    // Pick a random prefix option from our compiled pool
    return choices[Math.floor(Math.random() * choices.length)];
}

// Player Action: Overwrite and save changes to a customized user profile label
function editGemNickname(gemId, newPrefix) {
    const gem = CurrentEmpire.gemsRoster.find(g => g.id === gemId);
    if (!gem) return;

    // Remove empty spaces or balance inputs
    const sanitizedPrefix = newPrefix.trim();
    
    if (sanitizedPrefix.length > 0) {
        gem.customPrefix = sanitizedPrefix;
        gem.name = `${sanitizedPrefix} ${gem.type}`;
        logEmpireEvent(`Gem designation altered manually to: ${gem.name}`, "Neutral");
    }
}
