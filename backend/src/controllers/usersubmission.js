const Problem = require("../models/problem")
const Submission = require("../models/submission");
const User = require('../models/user');
const Leaderboard = require('../models/leaderboard');
const mongoose = require('mongoose');
const { getLanguageConfig, generateCppFullCode } = require('../utils/problemutility'); 
const { CURRENT_SEASON_ID } = require("../utils/dates");
const tierdata = require('../utils/tiersystem');
const { Sandbox } = require('e2b');
const fs = require('fs');
const path = require('path');


const submitcode = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { pid } = req.params;
        let { code, language } = req.body;
        const userid = req.result._id;

        if (!code || !language || !pid) throw new Error("Missing required fields");
        if (language === 'cpp') language = 'c++';

        const problem = await Problem.findById(pid).lean();
        if (!problem) return res.status(404).json({ error: "Problem not found" });

        const { timeLimit = 1.0 } = problem.constraints || {};
        const jsonLib = fs.readFileSync(path.join(__dirname, "../../libs/json.hpp"), 'utf-8');

        const [pendingSubmission] = await Submission.create([{
            userId: userid,
            problemId: pid,
            seasonId: req.season?.seasonId,
            code,
            language,
            status: "Pending"
        }], { session });

        const sandbox = await Sandbox.create();
        let passedCount = 0;
        let status = "Accepted";
        let errorMessage = null;

        try {
            const fullCode = generateCppFullCode(code, problem.drivercode);
            
            // 1. Atomic Sync: Ensure library and code are present
            await Promise.all([
                sandbox.files.write('/home/user/main.cpp', fullCode),
                sandbox.files.write('/home/user/json.hpp', jsonLib)
            ]);

            // 2. Compilation
            const compile = await sandbox.commands.run("cd /home/user && g++ -O2 -std=c++17 main.cpp -o main 2>&1");
            if (compile.exitCode !== 0) {
                status = "Compilation Error";
                errorMessage = compile.stdout;
            } else {
                // 3. Execution Loop with Normalization
                for (const tc of problem.hiddenTestCases) {
                    await sandbox.files.write('/home/user/input.txt', tc.input);
                    const run = await sandbox.commands.run("cd /home/user && ./main < input.txt", { timeout: timeLimit });
                    
                    if (run.exitCode !== 0) {
                        status = run.exitCode === 124 ? "Time Limit Exceeded" : "Runtime Error";
                        errorMessage = run.stderr;
                        break;
                    }

                    // Normalized Comparison
                    const actual = JSON.parse(run.stdout.trim());
                    const expected = JSON.parse(tc.output.trim());

                    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                        status = "Wrong Answer";
                        errorMessage = `Expected ${JSON.stringify(expected)}, Got ${JSON.stringify(actual)}`;
                        break;
                    }
                    passedCount++;
                }
            }
        } finally {
            await sandbox.kill();
        }

        // Database updates (Elo, Leaderboard, etc.) remains the same
        const isAccepted = status === "Accepted";
        const eloChange = isAccepted ? (problem.baseEloReward + (req.season?.getActiveSeasonDay() === problem.releaseDay ? (problem.baseEloReward * 0.3) : 0)) : -problem.penaltyWrongAnswer;

        await session.withTransaction(async () => {
            await Submission.updateOne({ _id: pendingSubmission._id }, { 
                $set: { status, errorMessage, eloChange, passedTestCases: passedCount, totalTestCases: problem.hiddenTestCases.length } 
            }, { session });

            if (isAccepted) await User.updateOne({ _id: userid }, { $addToSet: { problemsolved: pid } }, { session });

            const updatedLB = await Leaderboard.findOneAndUpdate(
                { userId: userid, seasonId: req.season?.seasonId ?? CURRENT_SEASON_ID },
                { $inc: { elo: eloChange, acceptedSubmissionsCount: isAccepted ? 1 : 0, wrongSubmissionsCount: isAccepted ? 0 : 1 } },
                { session, upsert: true, new: true }
            );
            await Leaderboard.updateOne({ _id: updatedLB._id }, { $set: { rank: tierdata(updatedLB.elo).currentRank.name } }, { session });
        });

        res.status(201).json({ status, eloChange, message: "Submission processed" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    } finally {
        session.endSession();
    }
};

const runcode = async (req, res) => {
    try {
        let { code, language } = req.body;
        const problem = await Problem.findById(req.params.pid).lean();
        if (!problem) return res.status(404).json({ error: "Problem not found" });
        if (language === 'cpp') language = 'c++';

        const { timeLimit = 1.0 } = problem.constraints || {};
        const jsonLib = fs.readFileSync(path.join(__dirname, '../../libs/json.hpp'), 'utf-8');
        const fullCode = generateCppFullCode(code, problem.drivercode);
        
        const sandbox = await Sandbox.create();
        const results = [];

        try {
            // 1. Atomic File Sync: Write Lib and Code together
            await Promise.all([
                sandbox.files.write('/home/user/json.hpp', jsonLib),
                sandbox.files.write('/home/user/main.cpp', fullCode)
            ]);

            // 2. Compilation with Debug Feedback
            const compile = await sandbox.commands.run("cd /home/user && g++ -O2 -std=c++17 main.cpp -o main 2>&1");
            if (compile.exitCode !== 0) {
                return res.status(200).json({ status: "Compilation Error", error: compile.stdout });
            }

            // 3. Execution Loop
            for (const tc of problem.visibleTestCases) {
                await sandbox.files.write('/home/user/input.txt', tc.input);
                const run = await sandbox.commands.run("cd /home/user && ./main < input.txt", { timeout: timeLimit });

                if (run.exitCode !== 0) {
                    results.push({ input: tc.input, status: "Runtime Error", stderr: run.stderr });
                    continue;
                }

                // 4. Normalized Comparison
                const actual = JSON.parse(run.stdout.trim());
                const expected = JSON.parse(tc.output.trim());
                const isCorrect = JSON.stringify(actual) === JSON.stringify(expected);
                
                results.push({
                    input: tc.input,
                    expected: tc.output,
                    actual: run.stdout.trim(),
                    status: isCorrect ? "Success" : "Wrong Answer"
                });
            }
        } finally {
            await sandbox.kill();
        }
        res.status(200).json({ results });
    } catch (err) {
        res.status(500).json({ error: "Execution failed: " + err.message });
    }
};
module.exports = {submitcode, runcode};