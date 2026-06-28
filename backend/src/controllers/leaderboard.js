const Leaderboard = require('../models/leaderboard');
const Season = require('../models/season');
const mongoose = require('mongoose');

const showallseasonid = async (req,res)=>{
    try{
        const allseasons = await Leaderboard.distinct('seasonId');

        allseasons.sort((a,b) => a-b);

        const seasons = allseasons.map(sid =>({
            seasonId : sid,
            name : `Season ${sid}`,
            status : sid === 1 ? 'Active' : 'Ended'
        }))

        return res.status(200).json({seasons : seasons});
    }
    catch(err)
    {
        return res.status(500).json({ error: "Failed to fetch seasons list", details: err.message });
    }
}

const getleaderboard = async (req, res) => {
    try {
        const { sid } = req.params;

        // 1. Validate ObjectId for the Season
        if (!mongoose.Types.ObjectId.isValid(sid)) {
            return res.status(400).json({ error: "Invalid Season ID format" });
        }

        // 2. Fetch the full season document to get the human-readable seasonId (Number)
        const seasonDoc = await Season.findById(sid);
        if (!seasonDoc) {
            return res.status(404).json({ error: "Season not found" });
        }
        
        const numericSeasonId = seasonDoc.seasonId; 

        // 3. Pagination setup
        let page = Math.max(1, parseInt(req.query.page) || 1);
        let limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const skipoffset = (page - 1) * limit;

        // 4. Query Leaderboard using the numeric seasonId
        const totalplayers = await Leaderboard.countDocuments({ seasonId: numericSeasonId });
        const totalpages = Math.ceil(totalplayers / limit);

        const stats = await Leaderboard.find({ seasonId: numericSeasonId })
            .populate({ path: 'userId', select: "firstName lastName" })
            .sort({ elo: -1 })
            .skip(skipoffset)
            .limit(limit);

        const standings = stats.map((stat, index) => {
            const accepted = stat.acceptedSubmissionsCount || 0;
            const wrong = stat.wrongSubmissionsCount || 0;
            const totalSubmissions = accepted + wrong;

            // Calculate accuracy safely preventing division by zero. 
            // Fixed to 1 decimal place to perfectly match your new front-end UI layout.
            const accuracy = totalSubmissions > 0 
                ? parseFloat(((accepted / totalSubmissions) * 100).toFixed(1)) 
                : 0.0;

            return {
                rank: skipoffset + index + 1,
                userId: stat.userId ? stat.userId._id : null,
                name: stat.userId ? `${stat.userId.firstName} ${stat.userId.lastName}` : "Unknown person",
                elo: stat.elo,
                rankTier: stat.tierDetails, // Accesses your mongoose virtual
                accuracy: accuracy,         // e.g., 85.4
                solved: stat.problemsSolved ? stat.problemsSolved.length : 0 // Size of array matching layout data tracking
            };
        });

        return res.status(200).json({
            season: seasonDoc, 
            pagination: {
                totalpages,
                currentPage: page,
                limit: limit,
                hasNextPage: page < totalpages,
                hasPrevPage: page > 1
            },
            standings: standings
        });
    } catch (err) {
        return res.status(500).json({ error: "Failed to fetch standings", details: err.message });
    }
}

module.exports = {showallseasonid,getleaderboard};