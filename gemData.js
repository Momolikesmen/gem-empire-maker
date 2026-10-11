// ==========================================
// 1. MASTER GEM HIERARCHY & TIERS
// ==========================================
const GEM_TIERS = {
    DIAMOND: {
        name: "Diamond Authority",
        rank: 14,
        types: ["Diamond"]
    },
    ELITE_ARISTOCRATIC: {
        name: "Elite Aristocratic Tier",
        rank: 13,
        types: ["Gold", "Rhyolite"]
    },
    ELITE_COMMANDER: {
        name: "Elite Commander Tier",
        rank: 12,
        types: ["Hessonite", "Demantoid", "Pyrope", "Aragonite"]
    },
    ELITE_CAPTAIN: {
        name: "Elite Captain Tier",
        rank: 11,
        types: ["Emerald", "Aquamarine", "Nephrite"]
    },
    ELITE_SPECIAL: {
        name: "Elite Special Tier",
        rank: 10,
        types: ["Morganite", "Jadeite", "Taaffeite", "Psilomelane", "Cinnabar", "Abalone", "Scapolite", "Larkavite"]
        
    },
    ELITE_ADVISOR: {
        name: "Elite Advisor Tier",
        rank: 9,
        types: ["Sapphire"]
    },
    ELITE_ENTERTAINER: {
        name: "Elite Entertainer Tier",
        rank: 8,
        types: ["Jade", "Porcelain", "Opal", "Rhodonite", "Lepidolite", "Tanzanite"]
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
        types: ["Peridot", "Lapis Lazuli", "Turquoise", "Serpentine", "Aeschynite"]
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
        "Curious", "Giddy", "Sullen", "Bold", "Timid", "Summer",
        "Misty", "Stormy", "Sunny", "Shy", "Brave", "Mischevious",
        "Cheerful", "Grumpy", "Gentle", "Quiet", "Lazy",
        "Kind", "Lonely", "Playful", "Clever", "Witty", "Wise", "Fierce",
        "Loyal", "Friendly", "Caring", "Brilliant", "Daring", "Noble",
        "Elegant", "Charming", "Radiant", "Vibrant", "Mysterious",
        "Enchanting", "Majestic", "Regal", "Divine", "Celestial",
        "Ethereal", "Heavenly", "Magical", "Mythical"
    ],
    
    // Shared color arrays for administrative, advisor, and aristocratic tracking units
    COLORS: [
        "Pink", "Blue", "Yellow", "Green", "White", "Purple", "Orange", 
        "Red", "Teal", "Lavender", "Brown", "Black", "Crimson", "Violet",
        "Indigo", "Turquoise", "Magenta", "Cyan", "Amber", "Coral",
        "Fuchsia", "Maroon", "Olive", "Peach", "Plum", "Salmon", "Tan", 
        "Beige", "Mint", "Navy", "Sky", "Lime", "Chocolate", "Lemon",
        "Burgundy", "Tangerine", "Blood", "Blush", "Carmine", "Scarlet",
        "Periwinkle", "Azure", "Cerulean", "Lavender", "Blueberry", "Rasberry", "Gold", "Cream",
        "Apricot", "Saffron", "Mauve", "Lilac", "Sage"
    ],

    COLOR_PREFIXES_BY_TYPE: {
        "Gold": ["Yellow", "Lemon", "Saffron", "Gold"],
        "Serpentine": ["Green", "Olive", "Lime", "Mint", "Sage"],
        "Rhyolite": ["Pink", "Blush", "Fuchsia", "Magenta", "Salmon", "Peach", "Mauve"],
        "Psilomelane": ["Black", "White"],
        "Aeschynite": ["Black", "Brown", "Indigo", "Navy", "Burgundy", "Chocolate"],
        "Cinnabar": ["Red", "Crimson", "Carmine", "Scarlet", "Blood"],
        "Lepidolite": ["White", "Pink", "Blush", "Lavender", "Peach", "Mint", "Sky", "Lemon", "Lilac"],
        "Abalone": ["White", "Blush", "Peach", "Lavender", "Mint", "Sky", "Lilac"],
        "Scapolite": ["Pink", "Blush", "Fuchsia", "Magenta", "Salmon", "Peach", "Mauve"],
        "Larkavite": ["Black", "Brown", "Indigo", "Navy", "Burgundy", "Chocolate", "Maroon"],
        "Emerald": ["Yellow", "Green", "Olive", "Lime", "Lemon", "Mint", "Sage"],
        "Amethyst": ["Purple", "Violet", "Indigo", "Lavender", "Plum", "Periwinkle", "Mauve", "Lilac"],
        "Jasper": ["Red", "Orange", "Yellow", "Crimson", "Amber", "Coral", "Maroon", "Burgundy", "Tangerine", "Blood", "Carmine", "Scarlet", "Apricot", "Saffron"],
        "Amber": ["Red", "Orange", "Yellow", "Crimson", "Amber", "Coral", "Maroon", "Burgundy", "Tangerine", "Blood", "Carmine", "Scarlet", "Apricot", "Saffron"],
        "Honey Quartz": ["Orange", "Yellow", "Amber", "Coral", "Peach", "Lemon", "Tangerine", "Apricot", "Saffron"],
        "Citrine": ["Orange", "Yellow", "Amber", "Coral", "Peach", "Lemon", "Tangerine", "Apricot", "Saffron"],
        "Ruby": ["Red", "Orange", "Crimson", "Maroon", "Burgundy", "Blood", "Carmine", "Scarlet", "Coral", "Tangerine"],
        "Rutile": ["Red", "Black", "Yellow", "Crimson", "Carmine", "Scarlet", "Lemon"],
        "Nephrite": ["Green", "Yellow", "Olive", "Lime", "Lemon", "Mint", "Sage"],
        "Lapis Lazuli": ["Blue", "Teal", "Navy", "Sky", "Indigo", "Turquoise", "Cyan", "Azure", "Cerulean", "Blueberry"],
        "Aquamarine": ["Blue", "Teal", "Navy", "Sky", "Indigo", "Turquoise", "Cyan", "Azure", "Cerulean", "Blueberry"],
        "Turquoise": ["Blue", "Teal", "Navy", "Sky", "Indigo", "Turquoise", "Cyan", "Azure", "Cerulean", "Blueberry"],
        "Rose Quartz": ["Pink", "Blush", "Fuchsia", "Magenta", "Salmon", "Peach", "Lavender", "Mauve"],
        "Morganite": ["Pink", "Blush", "Fuchsia", "Magenta", "Salmon", "Peach", "Lavender", "Mauve"],
        "Opal": ["White", "Blush", "Pink", "Lavender", "Peach", "Mint", "Sky", "Lemon", "Periwinkle", "Beige", "Lilac"],
        "Carnelian": ["Red", "Crimson", "Maroon", "Burgundy", "Blood", "Carmine", "Scarlet"],
        "Aragonite": ["White", "Cream", "Tan", "Yellow", "Peach"]
    },

    COLOR_ONLY_TYPES: ["Gold", "Serpentine", "Rhyolite", "Psilomelane", "Aeschynite", "Cinnabar", "Lepidolite", "Abalone", "Scapolite", "Larkavite"],

    OFF_COLOR_PREFIXES: {
        "Sapphire": ["Red"],
        "Ruby": ["Blue"]
    },

    // Specialized unique classification overlays mapped to target profiles
    SPECIALIZED: {
        "Jasper": [
            "Zebra", "Leopard", "Imperial", "Picture", "Brecciated", 
            "Dalmation", "Red", "Redstripe"
        ],
        "Aquamarine": [
            "Moss", "Milky"
        ],
        "Agate": [
            "Banded", "Moss", "Blue-Lace", "Crazy-Lace", "Holly Blue", "Fire", "Dendritic", "Botswana"
        ],
        "Sapphire": [
            "Padparadscha", "Peacock", "Mermaid", "Star", "Color Change", "Pink"
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

const PERSONALITY_PREFIX_BLACKLISTS = {
    Reserved: ["Giddy", "Talkative", "Snarky", "Fierce", "Playful", "Cheerful", "Mischevious", "Bold", "Daring", "Flippant", "Grumpy", "Evil"],
    Shy: ["Giddy", "Talkative", "Snarky", "Fierce", "Playful", "Cheerful", "Mischevious", "Bold", "Daring", "Flippant", "Grumpy", "Evil", "Proud"],
    Quiet: ["Giddy", "Talkative", "Snarky", "Fierce", "Playful", "Cheerful", "Mischevious", "Bold", "Daring", "Flippant"],
    Reclusive: ["Giddy", "Talkative", "Snarky", "Fierce", "Playful", "Cheerful", "Mischevious", "Bold", "Daring", "Flippant", "Social"],
    Fiery: ["Lazy", "Sleepy", "Shy", "Timid", "Gentle", "Quiet", "Calm", "Innocent", "Caring", "Friendly", "Lonely"],
    Mean: ["Lazy", "Sleepy", "Shy", "Timid", "Gentle", "Quiet", "Calm", "Innocent", "Caring", "Friendly", "Kind", "Cheerful"],
    Volatile: ["Lazy", "Sleepy", "Shy", "Timid", "Gentle", "Quiet", "Calm", "Innocent", "Caring", "Friendly"],
    Arrogant: ["Lazy", "Sleepy", "Shy", "Timid", "Gentle", "Quiet", "Innocent", "Clumsy"],
    Rebellious: ["Lazy", "Sleepy", "Timid", "Gentle", "Quiet", "Calm", "Innocent", "Loyal"],
    Authoritarian: ["Lazy", "Sleepy", "Shy", "Timid", "Gentle", "Innocent", "Clumsy", "Airheaded"],
    Lazy: ["Fierce", "Brave", "Daring", "Serious", "Meticulous", "Brilliant", "Wise", "Bold", "Clever", "Witty"],
    Sleepy: ["Fierce", "Brave", "Daring", "Serious", "Meticulous", "Brilliant", "Wise", "Bold", "Clever"],
    Stoic: ["Giddy", "Mischevious", "Lazy", "Playful", "Clumsy", "Airheaded", "Sleepy", "Snarky", "Cheerful"],
    Logical: ["Giddy", "Mischevious", "Lazy", "Playful", "Clumsy", "Airheaded", "Sleepy", "Snarky"],
    Intelligent: ["Clumsy", "Airheaded", "Lazy", "Sleepy", "Snarky", "Evil"],
    Meticulous: ["Clumsy", "Airheaded", "Lazy", "Sleepy", "Snarky","Cynical"],
    Serious: ["Giddy", "Mischevious", "Lazy", "Playful", "Clumsy", "Airheaded", "Sleepy"],
    Calm: ["Evil", "Snarky", "Grumpy", "Fierce", "Mean", "Giddy", "Mischevious", "Sullen"],
    Patient: ["Evil", "Snarky", "Grumpy", "Fierce", "Mean", "Giddy", "Mischevious", "Sullen","Cynical"],
    Gentle: ["Evil", "Snarky", "Grumpy", "Fierce", "Mean", "Giddy", "Mischevious", "Sullen"],
    Benevolent: ["Evil", "Snarky", "Grumpy", "Fierce", "Mean","cynical", "Melencholic", "Melancholic", "Sullen"],
    Cheery: ["Sullen", "Grumpy", "Lazy", "Evil", "Serious", "Cynical", "Melencholic", "Melancholic", "Snarky", "Sleepy"],
    Cheerful: ["Sullen", "Grumpy", "Lazy", "Evil", "Serious", "Cynical", "Melencholic", "Melancholic", "Snarky", "Sleepy"],
    Playful: ["Sullen", "Grumpy", "Lazy", "Evil", "Serious", "Cynical", "Melencholic", "Melancholic"],
    Giddy: ["Sullen", "Grumpy", "Lazy", "Evil", "Serious", "Cynical", "Melencholic", "Melancholic", "Stoic"],
    Anxious: ["Bold", "Daring", "Fierce", "Arrogant", "Snarky", "Evil", "Grumpy", "Mean"],
    Sensitive: ["Bold", "Daring", "Fierce", "Arrogant", "Snarky", "Evil", "Grumpy", "Mean"],
    Brave: ["Timid", "Shy", "Lazy", "Sleepy", "Evil", "Snarky", "Sullen"],
    Loyal: ["Evil", "Snarky", "Rebellious", "Lazy","Cynical", "Melencholic", "Melancholic", "Grumpy", "Mean"],
};

// Calculates and compiles a valid custom prefix description card upon birth
function generateGemPrefix(gemType, personality = null) {
    let choices = PREFIX_TABLES.COLOR_ONLY_TYPES.includes(gemType) ? [] : [...PREFIX_TABLES.GENERAL];
    const colorPrefixes = PREFIX_TABLES.COLOR_PREFIXES_BY_TYPE[gemType];
    if (colorPrefixes) choices = choices.concat(colorPrefixes);

    // Check if the type has a dedicated specialized custom array match
    if (PREFIX_TABLES.SPECIALIZED[gemType]) {
        const specList = PREFIX_TABLES.SPECIALIZED[gemType];
        
        // Handle standard color substitution linkages seamlessly
        if (specList[0] === "Color_Link" && !colorPrefixes) {
            choices = choices.concat(PREFIX_TABLES.COLORS);
        } else if (specList[0] !== "Color_Link") {
            choices = choices.concat(specList);
        }
    }

    const offColorPrefixes = PREFIX_TABLES.OFF_COLOR_PREFIXES[gemType] || [];
    choices = choices.filter(prefix => !offColorPrefixes.includes(prefix));
    choices = [...new Set(choices)];

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
