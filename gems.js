// Resets a Gem's level to zero
function rejuvenateGem(gemId) {
    const gem = CurrentEmpire.gemsRoster.find(g => g.id === gemId);
    if (!gem) return;
    
    gem.level = 0;
    logEmpireEvent(`${gem.name} was systematically rejuvenated back to level 0.`, "Strict");
}

// Drops a Gem's status to Poofed and schedules an auto-reform timer
function poofGem(gemId, currentYear) {
    const gem = CurrentEmpire.gemsRoster.find(g => g.id === gemId);
    if (!gem || gem.status === "Shattered") return;

    gem.status = "Poofed";
    gem.reformYear = currentYear + CONFIG.EVENTS.POOF_RECOVERY_YEARS;
    logEmpireEvent(`${gem.name} was poofed and retreated into their gemstone.`, "Neutral");
}

// Permadeaths a Gem, moves them to the greyed-out tracking registries, and adjusts reputation
function shatterGem(gemId) {
    const gemIndex = CurrentEmpire.gemsRoster.findIndex(g => g.id === gemId);
    if (gemIndex === -1) return;

    const gem = CurrentEmpire.gemsRoster[gemIndex];
    gem.status = "Shattered";
    gem.reformYear = null;
    
    // Log to global event tracker
    logEmpireEvent(`${gem.name} was shattered permanently.`, "Strict");
}

// High-priced restoration function requiring Diamond Essence
function reviveShatteredGem(gemId, essenceCost) {
    const gem = CurrentEmpire.gemsRoster.find(g => g.id === gemId);
    if (!gem || gem.status !== "Shattered") return;
    
    if (CurrentEmpire.resources.diamondEssence >= essenceCost) {
        CurrentEmpire.resources.diamondEssence -= essenceCost;
        gem.status = "Active";
        logEmpireEvent(`${gem.name} was miraculously mended with Diamond Essence.`, "Gentle");
    }
}
// Player Action: Order an empire Bismuth to forge and attach a boost item to a target Gem
function forgeAndEquipItem(blueprintId, targetGemId) {
    // 1. Ensure the player actually owns at least one active Bismuth unit to do the forging
    const hasBismuth = CurrentEmpire.gemsRoster.some(g => g.type === "Bismuth" && g.status === "Active");
    if (!hasBismuth) {
        alert("FORGERY FAILED: You need at least one active Bismuth in your empire roster to forge gear!");
        return false;
    }

    // 2. Fetch the target Gem and the chosen item blueprint
    const gem = CurrentEmpire.gemsRoster.find(g => g.id === targetGemId);
    const blueprint = FORGERY_BLUEPRINTS.find(b => b.id === blueprintId);
    
    if (!gem || !blueprint) return false;

    // 3. Enforce the hard rule constraint: Absolute limit of 6 boosts total per Gem
    if (gem.boosts.length >= 6) {
        alert(`FORGERY FAILED: ${gem.name} already has the maximum limit of 6 boosts/items equipped!`);
        return false;
    }

    // 4. Verify the player can afford the material and essence costs
    const costMaterials = blueprint.costs.colonyMaterials || 0;
    const costEssence = blueprint.costs.diamondEssence || 0;

    if (CurrentEmpire.resources.colonyMaterials < costMaterials || CurrentEmpire.resources.diamondEssence < costEssence) {
        alert("FORGERY FAILED: Insufficient colony materials or Diamond Essence inside your Vault.");
        return false;
    }

    // 5. Deduct costs and permanently weld the forged item to the Gem's profile card
    CurrentEmpire.resources.colonyMaterials -= costMaterials;
    CurrentEmpire.resources.diamondEssence -= costEssence;
    
    // Tag it as a forged item so we can tell it apart from natural birth powers later
    const forgedItem = {
        id: blueprint.id,
        name: blueprint.name,
        stat: blueprint.stat,
        desc: blueprint.desc,
        origin: "Forged"
    };
    
    gem.boosts.push(forgedItem);
    
    // Record to the master story history timeline
    logEmpireEvent(`An empire Bismuth successfully forged and attached [${blueprint.name}] to ${gem.name}.`, "Neutral");
    
    return true;
}
