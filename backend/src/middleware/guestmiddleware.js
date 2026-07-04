const Season = require("../models/season");

const GetSeason = async (req,res,next)=>
{
    try{
        const isGuest = req.result && req.result.role === 'guest';
        let activeSeason;
        if (isGuest) {
             activeSeason = await Season.findOne({ isGuestSeason: true });
        }

        if (!activeSeason) {
                return res.status(500).json({
                    error: "Configuration Error",
                    message: isGuest 
                        ? "Guest season has not been configured in the database system for guests."
                        : "No tournament seasons have been configured in the database system."
                });
            }

            req.season = activeSeason;

            next();
    }
    catch(err)
    {
        res.status(500).json({error : err.message});
    }
}

module.exports = GetSeason;