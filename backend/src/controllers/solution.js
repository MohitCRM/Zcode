const Problem = require('../models/problem');
const Submission = require('../models/submission');

const getSolutionsHub = async (req, res) => {
    try {
        const currentSeason = req.seasonConfig || req.season;
        if (!currentSeason) {
            return res.status(500).json({ error: "Configuration error: Tournament context missing." });
        }

        const activePhase = currentSeason.getCurrentPhase();
        let completedRound = 0;

        if (activePhase === "Round1Solution") {
            completedRound = 1;
        } else if (activePhase === "Round2Solution") {
            completedRound = 2;
        } else {
            return res.status(403).json({
                error: "Solutions Locked",
                message: "The code review phase is closed. You can only access the Solutions Hub during designated Solution windows!"
            });
        }

        const problems = await Problem.find({
            seasonId: currentSeason.seasonId,
            round: completedRound
        })
        .select("title difficulty tags baseEloReward releaseDay referencesolution")
        .sort({ releaseDay: 1 });

        if (problems.length === 0) {
            return res.status(200).json({
                seasonId: currentSeason.seasonId,
                activePhase,
                message: "No problems were deployed during this tournament round.",
                solutionsGrid: []
            });
        }

        const problemIds = problems.map(prob => prob._id);

        const communitySubmissions = await Submission.find({
            problemId: { $in: problemIds },
            status: "Accepted"
        })
        .select("userId problemId language code errorMessage createdAt")
        .populate("userId", "firstName")
        .sort({ createdAt: -1 });

        const solutionsGrid = problems.map(problem => {
            const matchingSolutions = communitySubmissions.filter(
                sub => sub.problemId.toString() === problem._id.toString()
            );

            return {
                problemId: problem._id,
                title: problem.title,
                difficulty: problem.difficulty,
                tags: problem.tags,
                baseEloReward: problem.baseEloReward,
                releaseDay: problem.releaseDay,
                
                officialReferenceSolutions: problem.referencesolution.map(sol => ({
                    language: sol.language,
                    code: sol.code 
                })),

                totalCommunitySolutions: matchingSolutions.length,
                peerSolutions: matchingSolutions.map(sub => ({
                    submissionId: sub._id,
                    submittedBy: sub.userId ? sub.userId.firstName : "Anonymous Competitor",
                    language: sub.language,
                    code: sub.code,
                    errorMessage: sub.errorMessage,
                    timestamp: sub.createdAt
                }))
            };
        });

        return res.status(200).json({
            seasonId: currentSeason.seasonId,
            activePhase,
            completedRound,
            totalProblems: problems.length,
            solutionsGrid
        });

    } catch (err) {
        return res.status(500).json({
            error: "Failed to assemble the community Solutions Hub payload",
            details: err.message
        });
    }
};

module.exports = { getSolutionsHub };