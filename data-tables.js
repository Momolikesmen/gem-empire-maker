// Global configuration data
const CONFIG = {
    TIME: {
        YEARS_PER_MINUTE: 10,
        TICK_RATE_MS: 1000 // 1 second in real life
    },
    CUT_RATES: {
        REGULAR: 0.97,   // 97%
        DEFECTIVE: 0.02, // 2%
        PERFECT: 0.01    // 1%
    },
    LEVELS: {
        MIN: 0,
        MAX: 100,
        PERFECT_START_BOOST: 10
    },
    RESOURCES: {
        DIAMOND_ESSENCE_PER_DIAMOND_TICK: 1
    }
};

const COLONY_OPTIONS = {
    PLANETS: [
        { name: "Earth (Colony 01)", materialRate: 5, essenceRate: 1, decayYears: 960, startingKindergartens: 2 },
        { name: "Alpha Centauri Prime", materialRate: 3, essenceRate: 1, decayYears: 960 },
        { name: "Kepler Outpost Grid", materialRate: 4, essenceRate: 1, decayYears: 960 },
        { name: "Gliese Operations Cluster", materialRate: 5, essenceRate: 2, decayYears: 960 },
        { name: "Sirius Miner Node", materialRate: 6, essenceRate: 2, decayYears: 960 }
    ],
    GEM_TYPES: Object.values(GEM_TIERS).flatMap(tier => tier.types).filter(type => type !== "Diamond"),
    MIN_RANDOM_GEM_TYPES: 3,
    MAX_RANDOM_GEM_TYPES: 4,
    MAX_KINDERGARTENS: 5,
    KINDERGARTEN_COST: 10000,
    INCUBATION_ESSENCE_COST: 50,
    COLONIZATION_COST: 300,
    KINDERGARTEN_DURATION_MS: 15 * 60 * 1000,
    SHRINE_KINDERGARTEN_COST: 2500,
    SHRINE_ESSENCE_COST: 1000,
    STRUCTURE_LEVEL_BASE_MATERIAL_COST: 10000,
    STRUCTURE_LEVEL_BASE_ESSENCE_COST: 500,
    STRUCTURE_TIME_REDUCTION_PER_LEVEL: 0.005,
    STRUCTURE_MAX_TIME_REDUCTION: 0.9,
    STRUCTURE_BUILD_COSTS: {
        "Extractor Injection Rig": 15000,
        "Homeworld Communications Spire": 40000,
        "Reef": 25000,
        "Spinel Funhouse": 30000,
        "Gem Forge": 35000,
        "Diamond Shrine": 250000,
        "Healing Center": 500000
        ,"Soldier Ship": 75000
    }
};

// Static lists for generation tables
const GENERATION_TABLES = {
    DIAMOND_PERSONALITIES: ["Authoritarian", "Benevolent", "Melancholic", "Volatile", "Reclusive"],
    GEM_PERSONALITIES: ["Loyal", "Anxious", "Proud", "Stoic", "Rebellious", "Meticulous", "Fiery"],
    WEAPONS: ["Scythe", "Spear", "Gauntlets", "Whip", "Shield", "Sword", "Helmet", "Crossbow"],
    PREFIXES: ["Cut-5Xn", "Facet-9G", "Cabochon-3B", "Facet-4D", "Cut-2L"]
};
// Add these to the existing CONFIG object in data-tables.js
CONFIG.EVENTS = {
    CHANCE_PER_10_YEARS: 0.05, // 5% chance every 10 fictional years
    POOF_RECOVERY_YEARS: 5     // Time it takes to reform automatically
};

// Personality-based behavioral weights for event probabilities
const PERSONALITY_BEHAVIORS = {
    "Fiery":      { conflictMultiplier: 2.0, rebellionMultiplier: 1.5 },
    "Rebellious": { conflictMultiplier: 1.5, rebellionMultiplier: 2.5 },
    "Loyal":      { conflictMultiplier: 0.5, rebellionMultiplier: 0.1 },
    "Anxious":    { conflictMultiplier: 0.8, rebellionMultiplier: 0.5 },
    "Proud":      { conflictMultiplier: 1.2, rebellionMultiplier: 1.0 },
    "Stoic":      { conflictMultiplier: 0.6, rebellionMultiplier: 0.6 },
    "Meticulous": { conflictMultiplier: 0.7, rebellionMultiplier: 0.7 }
};
// ==========================================
// GEM SYSTEM CONFIGURATIONS & BALANCING
// ==========================================
const GEM_PURPOSES = {
    ELITE_COMMANDER: {
        description: "Significantly boosts Empire military strength score in battle simulations.",
        levelCostType: "Very High",
        guardMinLevel: 0,
        validGuards: ["Pearl", "Spinel", "Ruby"]
    },
    ELITE_CAPTAIN: {
        description: "Provides a moderate boost to overall Empire combat capabilities.",
        levelCostType: "Very High",
        guardMinLevel: 0,
        validGuards: ["Pearl", "Spinel", "Ruby"]
    },
    ELITE_SPECIAL: {
        description: "Unlocks dedicated structures and shrinks building completion timers.",
        levelCostType: "Very High",
        guardMinLevel: 0,
        validGuards: ["Pearl", "Spinel", "Ruby"],
        specialRules: {
            "Taaffeite": { unlocksStructure: "Spinel Funhouse", outputUnit: "Spinel" }
        }
    },
    ELITE_ADVISOR: {
        description: "Boosts global luck stats, increasing high-yield colony extraction results.",
        levelCostType: "High",
        guardMinLevel: 10,
        validGuards: ["Pearl", "Spinel", "Ruby"]
    },
    QUARTZ_COMMANDER: {
        description: "Assigned to colonies to keep underlying soldiers and worker units from idling.",
        levelCostType: "Moderate",
        guardMinLevel: 500, // Explicitly tracks your design condition
        validGuards: ["Pearl", "Spinel", "Ruby"]
    },
    QUARTZ_SOLDIER: {
        description: "Adds directly to baseline physical Empire strength values.",
        levelCostType: "Moderate",
        guardMinLevel: "Perfect_Cut_Only", // Checked dynamically in logic
        validGuards: ["Pearl"]
    },
    JUSTICE: {
        description: "Used to navigate legal trials. Zircons can be assigned a Zirconium companion unit.",
        levelCostType: "Moderate",
        guardMinLevel: null, // Cannot be given a standard guard
        validGuards: []
    },
    AGRICULTURAL: {
        description: "Speeds up Kindergarten incubation. Baseline 20 mins, shaves 1% off per level.",
        baseIncubationTimeMins: 20,
        timeReductionPerLevel: 0.01,
        guardMinLevel: null,
        validGuards: []
    },
    TRANSPORTATION: {
        description: "Improves standard collection yields for construction materials by 1% per level.",
        yieldBoostPerLevel: 0.01,
        guardMinLevel: null,
        validGuards: []
    },
    ARMORER: {
        description: "Appends innate combat modifiers. Forges armor updates under the Forgery tab.",
        guardMinLevel: null,
        validGuards: [],
        boostRollsByCut: {
            "Defective": 0,
            "Regular": 1-2, // Picks randomly between 1 and 2
            "Perfect": 4       // Minimum of 4 automatically
        }
    },
    EXPENDABLE: {
        "Pearl": { canLevel: false, origin: "The Reef", task: "Assigned as cosmetic or status guards." },
        "Ruby": { canLevel: false, origin: "Colony Kindergartens", task: "Assigned as protection details." },
        "Spinel": { canLevel: true, origin: "Spinel Funhouse", task: "Reduces target Gem rebellion chance by 1% per level." }
    }
};
// ==========================================
// GEM PLACEMENT PSYCHOLOGY MAP
// ==========================================
const GEM_PLACEMENTS = {
    Forehead: {
        theme: "Logic, intellect, and rational thought.",
        behavior: "Prioritizes strategy, analysis, and cerebral problem-solving.",
        preferredPersonalities: ["Meticulous", "Stoic", "Proud"],
        conflictChanceMultiplier: 0.6
    },
    Chest: {
        theme: "Passion, impulse, and raw emotion.",
        behavior: "Governs those who act on instinctual feelings, vulnerability, and internal drive.",
        preferredPersonalities: ["Fiery", "Loyal", "Anxious"],
        conflictChanceMultiplier: 1.8
    },
    Navel: {
        theme: "Empathy, nurturing, and foundational connection.",
        behavior: "Centering of gut instinct, compassion, and life-giving energy.",
        preferredPersonalities: ["Loyal", "Anxious", "Stoic"],
        conflictChanceMultiplier: 0.4
    },
    Hands: {
        theme: "Action, balance, and physical agency.",
        behavior: "Signifies a hands-on approach to interacting with the world and maintaining equilibrium.",
        preferredPersonalities: ["Proud", "Meticulous", "Fiery"],
        conflictChanceMultiplier: 1.0
    },
    Back: {
        theme: "Burdens, hidden trauma, and the weight of history.",
        behavior: "Reflects aspects of the self that are difficult to face or directly perceive.",
        preferredPersonalities: ["Rebellious", "Anxious", "Stoic"],
        conflictChanceMultiplier: 1.2
    },
    Face: {
        theme: "Aggression, stubbornness, and forward-facing perception.",
        behavior: "Indicates a blunt, unyielding approach to conflict.",
        preferredPersonalities: ["Fiery", "Rebellious", "Proud"],
        conflictChanceMultiplier: 2.0
    }
};
// ==========================================
// BRAINSTORMED NATURAL & ELEMENTAL BOOSTS
// ==========================================
const BOOST_POOL = {
    UNIVERSAL: [
        { id: "well_formed", name: "Well-Formed Lattice", stat: "+15% Durability", desc: "Reduces the chance of being poofed in conflicts." },
        { id: "deep_crust", name: "Deep-Crust Density", stat: "+10% Heavy Stun", desc: "Provides physical knockback bonuses during tasks." },
        { id: "refractive", name: "Refractive Hardness", stat: "+12% Deflection", desc: "Deflects incoming weapon damage from the gemstone." }
    ],
    DEFECTIVE_ONLY: [
        { id: "erratic_burst", name: "Imperfect Crystal Structure", stat: "Erratic Strength", desc: "Lowers regular speed but triggers unpredictable strength surges." }
    ],
    SPECIALIZED: {
        "Ruby": [
            { id: "rock_melt", name: "Frictional Rock Melt", stat: "Pyrokinesis", desc: "Heats fists or weapons, dramatically boosting conflict damage." }
        ],
        "Jasper": [
            { id: "rock_melt", name: "Frictional Rock Melt", stat: "Pyrokinesis", desc: "Heats fists or weapons, dramatically boosting conflict damage." }
        ],
        "Sapphire": [
            { id: "cryo", name: "Sub-Zero Cryokinesis", stat: "Ice Aura", desc: "Freezes local air, calming down aggressive situations nearby." }
        ],
        "Aquamarine": [
            { id: "cryo", name: "Sub-Zero Cryokinesis", stat: "Ice Aura", desc: "Freezes local air, calming down aggressive situations nearby." }
        ],
        "Lapis Lazuli": [
            { id: "hydro", name: "Hydro-Dynamic Agency", stat: "Water Flight", desc: "Grants flying or terrain manipulation to speed up transit." }
        ],
        "Agate": [
            { id: "shockwave", name: "Piezoelectric Shockwave", stat: "Electric Whip", desc: "Discharges energy to keep lower-tier units from rebelling." }
        ],
        "Spinel": [
            { id: "sonic", name: "Sonic Resonator", stat: "Elastic Distortion", desc: "Distorts geometry or voice frequency to defuse arguments." }
        ]
    }
};
// ==========================================
// BISMUTH FORGERY BLUEPRINTS
// ==========================================
const FORGERY_BLUEPRINTS = [
    {
        id: "bismuth_edge",
        name: "Bismuth-Tipped Edgework",
        type: "Weaponry",
        stat: "+20% Duel Success",
        desc: "Sharpens summoned weapons, raising success rates during short-range skirmish popups.",
        costs: { colonyMaterials: 100, diamondEssence: 5 }
    },
    {
        id: "destabilizer_core",
        name: "Destabilizing Core Filament",
        type: "Weaponry",
        stat: "Poof Instigator",
        desc: "Imbues weapons with a disruptor charge, making conflicts more likely to poof opponents.",
        costs: { colonyMaterials: 250, diamondEssence: 20 }
    },
    {
        id: "paladin_plating",
        name: "Heavy Paladin Plating",
        type: "Armor",
        stat: "+30% Poof Resistance",
        desc: "Thick custom armor plating that protects a Gem from being easily poofed by hotheaded traits.",
        costs: { colonyMaterials: 300, diamondEssence: 10 }
    },
    {
        id: "limb_enhancers",
        name: "Peridot-Spec Limb Enhancers",
        type: "Utility",
        stat: "+5% Task Efficiency",
        desc: "Cybernetic extensions that speed up agricultural or technical unit project timers.",
        costs: { colonyMaterials: 150, diamondEssence: 15 }
    },
    {
        id: "gravity_boots",
        name: "Gravity-Anchor Boots",
        type: "Utility",
        stat: "+10% Resource Harvest",
        desc: "Anchors transportation units firmly to terrains, scaling their resource yields.",
        costs: { colonyMaterials: 200, diamondEssence: 5 }
    }
];
