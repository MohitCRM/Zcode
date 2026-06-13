const CURRENT_SEASON_ID = 1;

const SEASON_SCHEDULE = {
    seasonId: CURRENT_SEASON_ID,
    launchDate: new Date("2026-06-01T00:00:00Z"), 
    
    round1Start:        new Date("2026-06-01T00:00:00Z"),
    round1End:          new Date("2026-06-12T23:59:59Z"), 
    
    r1SolutionStart:    new Date("2026-06-13T00:00:00Z"),
    r1SolutionEnd:      new Date("2026-06-15T23:59:59Z"),
    
    round2Start:        new Date("2026-06-16T00:00:00Z"),
    round2End:          new Date("2026-06-22T23:59:59Z"), 
    
    r2SolutionStart:    new Date("2026-06-23T00:00:00Z"),
    r2SolutionEnd:      new Date("2026-06-25T23:59:59Z")  
};


const getActiveSeasonDay = () => {
    const now = new Date();
    const msDifference = now - SEASON_SCHEDULE.launchDate;
    const daysDifference = Math.floor(msDifference / (1000 * 60 * 60 * 24));
    return Math.max(1, daysDifference + 1);
};



const getCurrentPhase = () => {
    const now = new Date();

    if (now >= SEASON_SCHEDULE.round1Start && now <= SEASON_SCHEDULE.round1End) {
        return "Round1";
    }
    if (now >= SEASON_SCHEDULE.r1SolutionStart && now <= SEASON_SCHEDULE.r1SolutionEnd) {
        return "Round1Solution";
    }
    if (now >= SEASON_SCHEDULE.round2Start && now <= SEASON_SCHEDULE.round2End) {
        return "Round2";
    }
    if (now >= SEASON_SCHEDULE.r2SolutionStart && now <= SEASON_SCHEDULE.r2SolutionEnd) {
        return "Round2Solution";
    }
    
    return "OffSeason";
};

module.exports = {
    CURRENT_SEASON_ID,
    SEASON_SCHEDULE,
    getActiveSeasonDay,
    getCurrentPhase
};