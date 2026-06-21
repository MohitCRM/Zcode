const Leaderboard = require('../models/leaderboard');

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

const getleaderboard = async (req,res)=>{
    try{
        const {sid} = req.params;
        const seasonId = parseInt(sid);

        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 20;

        page = Math.max(1,page);
        limit = Math.min(100,limit);
        limit = Math.max(1,limit);

        const skipoffset = (page - 1)*limit;

        const totalplayers = await Leaderboard.countDocuments({seasonId : seasonId});
        const totalpages = Math.ceil(totalplayers/limit);

        const stats = await Leaderboard.find({seasonId : seasonId}).populate({
            path : 'userId',
            select : "firstName lastName"
        })
        .sort({elo : -1})
        .skip(skipoffset)
        .limit(limit)

        const standings = stats.map((stat,index) =>({
            rank : skipoffset + index + 1,
            userId : stat.userId ? stat.userId._id : null,
            name: stat.userId ? `${stat.userId.firstName} ${stat.userId.lastName}` : "Unknown person",
            elo : stat.elo,
            rankTier: {
            name: stat.tierDetails.currentRank.name,
            color: stat.tierDetails.currentRank.color,
            badge: stat.tierDetails.currentRank.badgeUrl
            }
        }))

        return res.status(200).json({
            seasonId: seasonId,
            pagination: {
                totalpages,
                totalpages,
                currentPage: page,
                limit: limit,
                hasNextPage: page < totalpages,
                hasPrevPage: page > 1
            },
            standings : standings
        });
    }catch(err)
    {
        return res.status(500).json({ error: "Failed to fetch standings", details: err.message });
    }
}

module.exports = {showallseasonid,getleaderboard};