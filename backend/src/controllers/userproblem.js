const { getlanguagebyid, submitbatch, submittoken } = require('../utils/problemutility'); 
const { CURRENT_SEASON_ID } = require("../utils/dates"); 
const Problem = require('../models/problem');
const User = require('../models/user');
const Submission = require('../models/submission');

const createproblem = async (req, res) => {

    try {
        const { referencesolution, visibleTestCases, hiddenTestCases, round, releaseDay } = req.body;

        if (!round || !releaseDay) {
            return res.status(400).send("Missing timeline parameters: 'round' and 'releaseDay' are required.");
        }

        const totaltestcases = [...visibleTestCases, ...hiddenTestCases];

        for (const ele of referencesolution) {
            const { language, code } = ele;
            const id = getlanguagebyid(language);
            
            const submission = totaltestcases.map((testcase) => ({
                source_code: code,
                language_id: id,
                stdin: testcase.input,
                expected_output: testcase.output
            }));

            const submissionResult = await submitbatch(submission);


            const resultToken = submissionResult.map((res) => res.token); 

            const testResult = await submittoken(resultToken);


            for (const test of testResult) {
                if (parseInt(test.status_id) !== 3) {
                    return res.status(400).send(`Reference Solution validation failed. Judge0 status code: ${test.status_id}`);
                }
            }
        }

        await Problem.create({
            ...req.body,
            seasonId: req.seasonConfig ? req.seasonConfig.seasonId : CURRENT_SEASON_ID, 
            problemcreator: req.result._id
        });

        res.status(200).send("Problem Created Successfully");
    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
};

const problemupdate = async (req, res) => {
    const { pid } = req.params;
    try {
        if (!pid) return res.status(400).send("Missing pid field");

        const problem = await Problem.findById(pid);
        if (!problem) return res.status(404).send("Problem not found");

        const { referencesolution, visibleTestCases, hiddenTestCases } = req.body;
        const totaltestcases = [...visibleTestCases, ...hiddenTestCases];

        if (referencesolution && totaltestcases.length > 0) {
            for (const ele of referencesolution) {
                const { language, code } = ele;
                const langId = getlanguagebyid(language);

                const submission = totaltestcases.map((testcase) => ({
                    source_code: Buffer.from(code).toString('base64'),
                    language_id: langId,
                    stdin: Buffer.from(testcase.input).toString('base64'),
                    expected_output: Buffer.from(testcase.output).toString('base64')
                }));

                const submissionResult = await submitbatch(submission);
                const resultToken = submissionResult.map((res) => res.token); 

                const testResult = await submittoken(resultToken);

                for (const test of testResult) {
                    if (parseInt(test.status_id) !== 3) {
                        return res.status(400).send("Updated Reference Solution failed pipeline checks.");
                    }
                }
            }
        }

        const newproblem = await Problem.findByIdAndUpdate(pid, {
            ...req.body,
            problemcreator: req.result._id
        }, { runValidators: true, new: true });

        res.status(200).send(newproblem);
    } catch (err) {
        return res.status(400).send("Error Occured during updates: " + err.message);
    }
};

const problemdelete = async (req, res) => {
    const { pid } = req.params;
    try {
        if (!pid) return res.status(400).send("Missing pid field");

        const deletedprobem = await Problem.findByIdAndDelete(pid);
        if (!deletedprobem) return res.status(404).send("Problem not found");

        res.status(200).send("Problem Deleted Successfully");
    } catch (err) {
        return res.status(400).send("Error Occured");
    }
};

const problemfetch = async (req, res) => {
    const { pid } = req.params;
    try {
        if (!pid) return res.status(400).send("Missing pid field");

        const currentSeason = req.seasonConfig || req.season; 
        if (!currentSeason) {
            return res.status(500).send("Configuration error: Season context missing.");
        }

        const activePhase = currentSeason.getCurrentPhase();
        const currentSeasonDay = currentSeason.getActiveSeasonDay();
        
        let allowedRound = 0;
        if (activePhase === "Round1" || activePhase === "Round1Solution") {
            allowedRound = 1;
        } else if (activePhase === "Round2" || activePhase === "Round2Solution") {
            allowedRound = 2;
        }

        const problem = await Problem.findOne({
            _id: pid,
            seasonId: currentSeason.seasonId,
            round: allowedRound,
            releaseDay: { $lte: currentSeasonDay } 
        }).select("-hiddenTestCases -__v -createdAt -updatedAt -problemcreator");

        if (!problem) {
            return res.status(404).send("Problem not found, locked behind a future round, or unreleased!");
        }

        return res.status(200).send(problem);
    } catch (err) {
        return res.status(400).send("Error Occured: " + err.message);
    }
};

const allproblemfetch = async (req, res) => {
    try {
        const currentSeason = req.seasonConfig || req.season; 
        if (!currentSeason) {
            return res.status(500).json({ error: "Configuration error: Season context missing." });
        }

        const activePhase = currentSeason.getCurrentPhase();
        const currentSeasonDay = currentSeason.getActiveSeasonDay();
        let targetRound = 0;

        if (activePhase === "Round1") {
            targetRound = 1;
        } else if (activePhase === "Round2") {
            targetRound = 2;
        } else {
            return res.status(200).json({
                seasonId: currentSeason.seasonId,
                activePhase,
                currentSeasonDay,
                message: `Live competitive round is closed. Head over to the Solutions Hub to review peer submissions! 🔓`,
                problems: []
            });
        }

        const problems = await Problem.find({
            seasonId: currentSeason.seasonId, 
            round: targetRound,
            releaseDay: { $lte: currentSeasonDay }
        })
        .select("title difficulty tags baseEloReward releaseDay penaltyWrongAnswer") 
        .sort({ releaseDay: 1 });

        return res.status(200).json({
            seasonId: currentSeason.seasonId,
            activePhase,
            currentSeasonDay,
            totalUnlocked: problems.length,
            problems
        });
        
    } catch (err) {
        return res.status(500).json({ error: "Failed to retrieve active problem set", details: err.message });
    }
};

const solvedproblems = async (req, res) => {
    try {
        const userid = req.result._id;
        const user = await User.findById(userid).populate({
            path: "problemsolved",
            select: "_id title difficulty tags"
        });

        res.status(200).send(user.problemsolved);
    } catch (err) {
        return res.status(400).send("Error Occured: " + err.message);
    }
};

const sumbittedproblem = async (req, res) => {
    try {
        const userid = req.result._id;
        const problemid = req.params.pid;

        const submissions = await Submission.find({ userId: userid, problemId: problemid }).sort({ createdAt: -1 });

        if (submissions.length === 0) {
            return res.status(404).send("No submissions found");
        }
        
        res.status(200).send(submissions);
    } catch (err) {
        return res.status(400).send("Error Occured: " + err.message);
    }
};

module.exports = { 
    createproblem, 
    problemfetch, 
    allproblemfetch, 
    problemupdate, 
    problemdelete, 
    solvedproblems, 
    sumbittedproblem 
};