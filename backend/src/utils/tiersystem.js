const TIERS = [
    {
        name: "Newbie",
        minElo: 0,
        maxElo: 1199,
        color: "#9ca3af", 
        badgeUrl: "/assets/badges/newbie.png"
    },
    {
        name: "Skilled",
        minElo: 1200,
        maxElo: 1499,
        color: "#3b82f6", 
        badgeUrl: "/assets/badges/skilled.png"
    },
    {
        name: "Expert",
        minElo: 1500,
        maxElo: 1799,
        color: "#10b981",
        badgeUrl: "/assets/badges/expert.png"
    },
    {
        name: "Honoured One",
        minElo: 1800,
        maxElo: 1999,
        color: "#8b5cf6", 
        badgeUrl: "/assets/badges/honoured.png"
    },
    {
        name: "Monarch",
        minElo: 2000,
        maxElo: 2399,
        color: "#f59e0b", 
        badgeUrl: "/assets/badges/monarch.png"
    },
    {
        name: "God",
        minElo: 2400,
        maxElo: 9999, 
        color: "#ef4444", 
        badgeUrl: "/assets/badges/god.png"
    }
];

const tierdata = (currelo) =>{
    const currtierindex = TIERS.findIndex(
        tier => currelo >= tier.minElo && currelo <= tier.maxElo
    );

    const currtier = currtierindex !== -1 ? TIERS[currtierindex] : TIERS[0];

    let nexttier = null;
    let progresspercentage = 100;

    if (currtierindex !== -1 && currtierindex < TIERS.length - 1) {
        nexttier = TIERS[currtierindex + 1];
        
        const tierRange = nexttier.minElo - currtier.minElo;
        const currprogress = currelo - currtier.minElo;
        
        progresspercentage = Math.min(100, Math.max(0, parseFloat(((currprogress / tierRange) * 100).toFixed(1))));
    }

    return {
        currentRank: {
            name: currtier.name,
            color: currtier.color,
            badgeUrl: currtier.badgeUrl,
            floor: currtier.minElo,
            ceiling: nexttier ? nexttier.minElo - 1 : Infinity
        },
        nextRank: nexttier ? {
            name: nexttier.name,
            requiredElo: nexttier.minElo,
            color: nexttier.color
        } : null,
        elo: currelo,
        progresspercentage
    };
}

module.exports = tierdata;
