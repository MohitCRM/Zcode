const Problem = require('../models/problem');
const Submission = require('../models/submission');
const Leaderboard = require('../models/leaderboard');

const getProblemSolutionHub = async (req, res) => {
    try {
        const { pid } = req.params; 
        const userId = req.result._id;
        const currentSeason = req.seasonConfig || req.season;
        
        if (!currentSeason) {
            return res.status(500).json({ error: "Tournament context missing." });
        }

        const activePhase = currentSeason.getCurrentPhase();
        const currentSeasonDay = currentSeason.getActiveSeasonDay();
        const completedRound = activePhase === "Round1Solution" ? 1 : activePhase === "Round2Solution" ? 2 : null;

        if (!completedRound) {
            return res.status(403).json({ error: "Solutions Locked", message: "Review window closed." });
        }

        // 1. Fetch only the requested problem
        const problem = await Problem.findOne({ 
            _id: pid, 
            seasonId: currentSeason.seasonId, 
            round: completedRound 
        })
        .select("title difficulty tags baseEloReward releaseDay referencesolution");

        if (!problem) return res.status(404).json({ error: "Problem not found or solution access denied." });

        // 2. Fetch submissions for this specific problem
        const communitySubmissions = await Submission.find({
            problemId: pid,
            status: "Accepted"
        })
        .select("userId language code createdAt")
        .populate("userId", "firstName")
        .sort({ createdAt: -1 });

        // 3. Fetch user's own submissions
        const userSubmissions = await Submission.find({
            problemId: pid,
            userId: userId
        })
        .select("language code createdAt status passedTestCases totalTestCases errorMessage eloChange")
        .sort({ createdAt: -1 });

        // 4. Assemble the payload
        const solutionData = {
            problemId: problem._id,
            title: problem.title,
            difficulty: problem.difficulty,
            tags: problem.tags,
            baseEloReward: problem.baseEloReward,
            
            officialReferenceSolutions: problem.referencesolution.map(sol => ({
                language: sol.language,
                code: sol.code 
            })),

            totalCommunitySolutions: communitySubmissions.length,
            peerSolutions: communitySubmissions.map(sub => ({
                submissionId: sub._id,
                submittedBy: sub.userId?.firstName || "Anonymous Competitor",
                language: sub.language,
                code: sub.code,
                timestamp: sub.createdAt
            })),

            mySolutions: userSubmissions.map(sub => ({
                submissionId: sub._id,
                language: sub.language,
                code: sub.code,
                status: sub.status,
                submittedAt: new Date(sub.createdAt).toLocaleString(),
                passedTestCases: sub.passedTestCases,
                totalTestCases: sub.totalTestCases,
                errorMessage: sub.errorMessage,
                eloChange: sub.eloChange
            }))
        };

        return res.status(200).json({
            seasonId: currentSeason.seasonId,
            currentSeasonDay,
            activePhase,
            solutionData
        });

    } catch (err) {
        return res.status(500).json({ error: "Failed to fetch solutions", details: err.message });
    }
};

const getthisroundsolutions = async (req,res)=>{
    try {
        const userId = req.result._id;
        const currentSeason = req.seasonConfig || req.season; 
        if (!currentSeason) {
            return res.status(500).json({ error: "Configuration error: Season context missing." });
        }

        const activePhase = currentSeason.getCurrentPhase();
        const currentSeasonDay = currentSeason.getActiveSeasonDay();
        let targetRound = 0;

        if (activePhase === "Round1Solution") {
            targetRound = 1;
        } else if (activePhase === "Round2Solution") {
            targetRound = 2;
        } else {
            return res.status(200).json({
                seasonId: currentSeason.seasonId,
                activePhase,
                message: `Live competitive round is closed. Head over to the Solutions Hub to review peer submissions! 🔓`,
                problems: []
            });
        }

        const problems = await Problem.find({
            seasonId: currentSeason.seasonId, 
            round: targetRound,
        })
        .select(" _id title difficulty tags baseEloReward releaseDay penaltyWrongAnswer") 
        .sort({ releaseDay: 1 });

        const userSeasonalStats = await Leaderboard.findOne({
                userId: userId,
                seasonId: currentSeason.seasonId
            });
        
        const solvedIds = userSeasonalStats && userSeasonalStats.problemsSolved 
            ? userSeasonalStats.problemsSolved.map(id => id.toString()) 
            : [];
        
        const problemsSolved = problems.filter(problem => 
            solvedIds.includes(problem._id.toString()));

        return res.status(200).json({
            seasonId: currentSeason.seasonId,
            currentSeasonDay,
            activePhase,
            totalUnlocked: problems.length,
            problems,
            problemsSolved
        });
        
    } catch (err) {
        return res.status(500).json({ error: "Failed to retrieve active problem set", details: err.message });
    }
}

const guestgetallsolutions = async (req, res) => {
    try {
        const userId = req.result._id;
        const currentSeason = req.seasonConfig || req.season; 
        if (!currentSeason) {
            return res.status(500).json({ error: "Configuration error: Season context missing." });
        }

        // 1. Parse and sanitize pagination parameters from the query string
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10)); // Caps maximum limit at 100 for safety
        const skip = (page - 1) * limit;

        // 2. Fetch total count of problems for pagination calculations
        const totalProblemsCount = await Problem.countDocuments({
            seasonId: currentSeason.seasonId
        });

        // 3. Fetch paginated data chunk
        const problems = await Problem.find({
            seasonId: currentSeason.seasonId
        })
        .select("_id title difficulty tags baseEloReward releaseDay penaltyWrongAnswer") 
        .sort({ releaseDay: 1 })
        .skip(skip)
        .limit(limit);

        // 4. Check user's individual seasonal progress
        const userSeasonalStats = await Leaderboard.findOne({
            userId: userId,
            seasonId: currentSeason.seasonId
        });
        
        const solvedIds = userSeasonalStats && userSeasonalStats.problemsSolved 
            ? userSeasonalStats.problemsSolved.map(id => id.toString()) 
            : [];
        
        // 5. Intersect solved items only out of the CURRENT page chunk
        const problemsSolved = problems.filter(problem => 
            solvedIds.includes(problem._id.toString())
        );

        // 6. Assemble response data with navigation headers
        return res.status(200).json({
            seasonId: currentSeason.seasonId,
            pagination: {
                totalItems: totalProblemsCount,
                totalPages: Math.ceil(totalProblemsCount / limit),
                currentPage: page,
                itemsPerPage: limit,
                hasNextPage: skip + problems.length < totalProblemsCount,
                hasPrevPage: page > 1
            },
            totalUnlockedInView: problems.length,
            problems,
            problemsSolved
        });
        
    } catch (err) {
        return res.status(500).json({ error: "Failed to retrieve active problem set", details: err.message });
    }
}

const guestsolutionhub = async (req,res)=>{
    try {
        const { pid } = req.params; 
        const userId = req.result._id;
        const currentSeason = req.seasonConfig || req.season;
        
        if (!currentSeason) {
            return res.status(500).json({ error: "Tournament context missing." });
        }

        // 1. Fetch only the requested problem
        const problem = await Problem.findOne({ 
            _id: pid, 
            seasonId: currentSeason.seasonId
        })
        .select("title difficulty tags baseEloReward releaseDay referencesolution");

        if (!problem) return res.status(404).json({ error: "Problem not found or solution access denied." });

        // 2. Fetch submissions for this specific problem
        const allguestSubmissions = await Submission.find({
            problemId: pid,
            status: "Accepted"
        })
        .select("userId language code createdAt")
        .populate({
            path: "userId",
            select: "firstName role", 
            match: { role: "guest" } 
        })
        .sort({ createdAt: -1 });

        const communitySubmissions = allguestSubmissions.filter(sub => sub.userId !== null);

        // 3. Fetch user's own submissions
        const userSubmissions = await Submission.find({
            problemId: pid,
            userId: userId
        })
        .select("language code createdAt status passedTestCases totalTestCases errorMessage eloChange")
        .sort({ createdAt: -1 });

        // 4. Assemble the payload
        const solutionData = {
            problemId: problem._id,
            title: problem.title,
            difficulty: problem.difficulty,
            tags: problem.tags,
            baseEloReward: problem.baseEloReward,
            
            officialReferenceSolutions: problem.referencesolution.map(sol => ({
                language: sol.language,
                code: sol.code 
            })),

            totalCommunitySolutions: communitySubmissions.length,
            peerSolutions: communitySubmissions.map(sub => ({
                submissionId: sub._id,
                submittedBy: sub.userId?.firstName || "Anonymous Competitor",
                language: sub.language,
                code: sub.code,
                timestamp: sub.createdAt
            })),

            mySolutions: userSubmissions.map(sub => ({
                submissionId: sub._id,
                language: sub.language,
                code: sub.code,
                status: sub.status,
                submittedAt: new Date(sub.createdAt).toLocaleString(),
                passedTestCases: sub.passedTestCases,
                totalTestCases: sub.totalTestCases,
                errorMessage: sub.errorMessage,
                eloChange: sub.eloChange
            }))
        };

        return res.status(200).json({
            seasonId: currentSeason.seasonId,
            solutionData
        });

    } catch (err) {
        return res.status(500).json({ error: "Failed to fetch solutions", details: err.message });
    }
}
module.exports = { getProblemSolutionHub , getthisroundsolutions,guestgetallsolutions,guestsolutionhub};