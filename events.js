'use strict';

// Master Quicktime Events Pool
const QUICKTIME_EVENTS = [
    {
        id: 'porcelain_cracked',
        name: 'Porcelain Cracked',
        condition: (gems) => gems.some(g => g.type === 'Porcelain' && isGemUsable(g)),
        trigger: (gems) => {
            const porcelains = gems.filter(g => g.type === 'Porcelain' && isGemUsable(g));
            const porcelain = porcelains[Math.floor(Math.random() * porcelains.length)];
            porcelainsCrackEvent(porcelain);
        }
    },
    {
        id: 'soldier_fight',
        name: 'Soldier Fight',
        condition: (gems) => {
            const soldierTypes = ['Ruby', "Cat's Eye", 'Amethyst', 'Rose Quartz', 'Jasper', 'Citrine', 'Carnelian', 'Honey Quartz', 'Clear Quartz', 'Smoky Quartz', 'Milky Quartz', 'Ametrine', 'Prasiolite', "Tiger's Eye", "Hawk's Eye", 'Rutile', 'Bloodstone', 'Cherry Quartz', 'Flint', 'Chert'];
            return gems.filter(g => soldierTypes.includes(g.type) && isGemUsable(g)).length >= 2;
        },
        trigger: (gems) => {
            const soldierTypes = ['Ruby', "Cat's Eye", 'Amethyst', 'Rose Quartz', 'Jasper', 'Citrine', 'Carnelian', 'Honey Quartz', 'Clear Quartz', 'Smoky Quartz', 'Milky Quartz', 'Ametrine', 'Prasiolite', "Tiger's Eye", "Hawk's Eye", 'Rutile', 'Bloodstone', 'Cherry Quartz', 'Flint', 'Chert'];
            const soldiers = gems.filter(g => soldierTypes.includes(g.type) && isGemUsable(g));
            const soldierA = soldiers[Math.floor(Math.random() * soldiers.length)];
            const remaining = soldiers.filter(g => g.id !== soldierA.id);
            const soldierB = remaining[Math.floor(Math.random() * remaining.length)];
            soldierFightEvent(soldierA, soldierB);
        }
    },
    {
        id: 'fusion_sighting',
        name: 'Fusion Caught',
        condition: (gems) => {
            const fusable = gems.filter(g => isGemUsable(g) && g.type !== 'Zircon' && g.type !== 'Zirconium' && getPersonalityBehavior(g).canFuse);
            return fusable.length >= 2;
        },
        trigger: (gems) => {
            const fusable = gems.filter(g => isGemUsable(g) && g.type !== 'Zircon' && g.type !== 'Zirconium' && getPersonalityBehavior(g).canFuse);
            const gemA = fusable[Math.floor(Math.random() * fusable.length)];
            const remaining = fusable.filter(g => g.id !== gemA.id);
            const gemB = remaining[Math.floor(Math.random() * remaining.length)];
            resolveFusionEvent(gemA, gemB);
        }
    }
];

function registerCustomQuicktimeEvent(eventObj) {
    if (eventObj && eventObj.id && typeof eventObj.trigger === 'function') {
        QUICKTIME_EVENTS.push(eventObj);
    }
}

if (typeof window !== 'undefined') {
    window.QUICKTIME_EVENTS = QUICKTIME_EVENTS;
    window.registerCustomQuicktimeEvent = registerCustomQuicktimeEvent;
}
if (typeof globalThis !== 'undefined') {
    globalThis.QUICKTIME_EVENTS = QUICKTIME_EVENTS;
    globalThis.registerCustomQuicktimeEvent = registerCustomQuicktimeEvent;
}
