const Season = require("../models/season");

const restrictToPhase = (allowedPhases) => {
    return async (req, res, next) => {
        try {
            let activeSeason = await Season.findOne({ isActive: true });

            if (!activeSeason) {
                activeSeason = await Season.findOne().sort({ seasonId: -1 });
            }
            
            if (!activeSeason) {
                return res.status(500).json({
                    error: "Configuration Error",
                    message: "No tournament seasons have been configured in the database system."
                });
            }

            const activePhase = activeSeason.getCurrentPhase();

            if (!allowedPhases.includes(activePhase)) {
                return res.status(403).json({
                    error: "Action Forbidden",
                    message: `This action is locked. It is only accessible during: ${allowedPhases.join(" or ")}. Current platform phase is: ${activePhase}.`
                });
            }

            req.season = activeSeason;

            next();
            
        } catch (err) {
            return res.status(500).json({
                error: "Internal Security Guard Error",
                details: err.message
            });
        }
    };
};

module.exports = restrictToPhase;