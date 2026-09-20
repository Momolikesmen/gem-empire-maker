// Simple tracking validation example for your custom UI buttons:
function canEquipGuard(gem, guardType) {
    if (gem.type === "Hessonite" || gem.type === "Taaffeite") return true; // Level 0 match!
    if (gem.type === "Sapphire" && gem.level >= 10) return true;
    if (gem.quality === "Perfect" && guardType === "Pearl") return true;
    return false;
}
