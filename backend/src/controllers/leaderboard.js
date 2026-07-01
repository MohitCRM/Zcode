const Leaderboard = require('../models/leaderboard');
const Season = require('../models/season');
const mongoose = require('mongoose');
const { validateGuestStats } = require('../utils/guestUtils');

const showallseasonid = async (req, res) => {
    try {
        const allseasons = await Leaderboard.distinct('seasonId');

        allseasons.sort((a, b) => a - b);

        const seasons = allseasons.map(sid => ({
            seasonId: sid,
            name: `Season ${sid}`,
            status: sid === 1 ? 'Active' : 'Ended'
        }))

        return res.status(200).json({ seasons: seasons });
    }
    catch (err) {
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
            .populate({ path: 'userId', select: "firstName" })
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
                name: stat.userId ? stat.userId.firstName : "Unknown person",
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

const getmystats = async (req, res) => {
    try {
        const seasonId = req.params.seasonId;
        const userId = req.result._id;

        if (!userId) {
            return res.status(400).json({ error: 'require UserId' });
        }

        const record = await Leaderboard.findOne({ userId: userId, seasonId: seasonId })
            .populate({ path: 'userId', select: "firstName" });

        if (!record) {
            return res.status(200).json({
                mystats: {
                    elo: 100,
                    accuracy: 100,
                    seasonCheckIns: 0,
                    problemsSolved: 0,
                    acceptedSubmissionsCount: 0,
                    wrongSubmissionsCount: 0
                }
            });
        }

        const totalSubmissions = (record.acceptedSubmissionsCount || 0) + (record.wrongSubmissionsCount || 0);
        const calculatedAccuracy = totalSubmissions > 0
            ? Math.round((record.acceptedSubmissionsCount / totalSubmissions) * 100)
            : 100;

        const calculatedCheckIns = record.checkInDays ? record.checkInDays.length : 0;

        const calculatedProblemsSolved = record.problemsSolved ? record.problemsSolved.length : 0;

        const mystats = {
            elo: record.elo ?? 100,
            accuracy: calculatedAccuracy,
            seasonCheckIns: calculatedCheckIns,
            problemsSolved: calculatedProblemsSolved,
            acceptedSubmissionsCount: record.acceptedSubmissionsCount || 0,
            wrongSubmissionsCount: record.wrongSubmissionsCount || 0,
            userId: record.userId,
            rank: record.rank
        };

        return res.status(200).json({ mystats: mystats });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch mystats', details: err.message });
    }
}
const manipulateGuestStats = async (req, res) => {
    try {
        const userId = req.result._id;

        if (req.result.role !== 'guest') {
            return res.status(403).json({ error: "Only guest users can manipulate stats directly." });
        }

        const currentSeason = req.season;
        if (!currentSeason) {
            return res.status(500).json({ error: "Tournament context missing." });
        }

        const { elo, acceptedSubmissionsCount, wrongSubmissionsCount } = req.body;

        // 1. Validate inputs using utility function
        try {
            validateGuestStats(elo, acceptedSubmissionsCount, wrongSubmissionsCount);
        } catch (validationError) {
            return res.status(400).json({ error: validationError.message });
        }

        // 2. Prepare update query
        const updateQuery = {};
        if (elo !== undefined) updateQuery.elo = elo;
        if (acceptedSubmissionsCount !== undefined) updateQuery.acceptedSubmissionsCount = acceptedSubmissionsCount;
        if (wrongSubmissionsCount !== undefined) updateQuery.wrongSubmissionsCount = wrongSubmissionsCount;

        // 3. Find and update the leaderboard entry for the guest
        // Ensure to trigger 'save' middleware if we were using .save(), but with findOneAndUpdate 
        // the tier details are re-calculated. Let's do findOne, modify, and save to trigger the pre-save hook.

        let stat = await Leaderboard.findOne({ userId: userId, seasonId: currentSeason.seasonId });

        if (!stat) {
            // Create one if they don't have stats yet
            stat = new Leaderboard({
                userId: userId,
                seasonId: currentSeason.seasonId,
                elo: elo ?? 100,
                acceptedSubmissionsCount: acceptedSubmissionsCount ?? 0,
                wrongSubmissionsCount: wrongSubmissionsCount ?? 0
            });
        } else {
            if (elo !== undefined) stat.elo = elo;
            if (acceptedSubmissionsCount !== undefined) stat.acceptedSubmissionsCount = acceptedSubmissionsCount;
            if (wrongSubmissionsCount !== undefined) stat.wrongSubmissionsCount = wrongSubmissionsCount;
        }

        await stat.save(); // This triggers the pre-save hook to update the rank string based on new Elo

        const totalSubmissions = stat.acceptedSubmissionsCount + stat.wrongSubmissionsCount;
        const calculatedAccuracy = totalSubmissions > 0
            ? Math.round((stat.acceptedSubmissionsCount / totalSubmissions) * 100)
            : 100;

        return res.status(200).json({
            message: "Stats successfully manipulated.",
            mystats: {
                elo: stat.elo,
                accuracy: calculatedAccuracy,
                acceptedSubmissionsCount: stat.acceptedSubmissionsCount,
                wrongSubmissionsCount: stat.wrongSubmissionsCount,
                rank: stat.rank
            }
        });

    } catch (err) {
        return res.status(500).json({ error: "Failed to manipulate stats", details: err.message });
    }
};

module.exports = { showallseasonid, getleaderboard, getmystats, manipulateGuestStats };