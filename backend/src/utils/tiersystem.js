const TIERS = [
    {
        name: "Newbie",
        minElo: 0,
        maxElo: 399,
        color: "#94a3b8", 
        badgeUrl: "/assets/badges/newbie.png",
        req: (elo, acc, probs) => elo >= 0
    },
    {
        name: "Adept",
        minElo: 400,
        maxElo: 899,
        color: "#10b981", 
        badgeUrl: "/assets/badges/adept.png",
        req: (elo, acc, probs) => elo >= 400
    },
    {
        name: "Expert",
        minElo: 900,
        maxElo: 1499,
        color: "#6366f1",
        badgeUrl: "/assets/badges/expert.png",
        req: (elo, acc, probs) => elo >= 900
    },
    {
        name: "Honoured One",
        minElo: 1500,
        maxElo: 2199,
        color: "#a855f7", 
        badgeUrl: "/assets/badges/honoured.png",
        req: (elo, acc, probs) => elo >= 1500
    },
    {
        name: "Monarch",
        minElo: 2200,
        maxElo: 3499,
        color: "#d97706", 
        badgeUrl: "/assets/badges/monarch.png",
        req: (elo, acc, probs) => elo >= 2200 && acc > 85
    },
    {
        name: "God",
        minElo: 3500,
        maxElo: 9999, 
        color: "#06b6d4", 
        badgeUrl: "/assets/badges/god.png",
        req: (elo, acc, probs) => elo >= 3500 && acc > 95 && probs >= 35
    }
];

const tierdata = (currelo, accuracy = 0, problemsSolved = 0) =>{
    let currtierindex = 0;
    
    // Evaluate from highest to lowest rank
    for (let i = TIERS.length - 1; i >= 0; i--) {
        if (TIERS[i].req(currelo, accuracy, problemsSolved)) {
            currtierindex = i;
            break;
        }
    }

    const currtier = TIERS[currtierindex];

    let nexttier = null;
    let progresspercentage = 100;

    if (currtierindex < TIERS.length - 1) {
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
