const Problem = require("../models/problem")
const Submission = require("../models/submission");
const User = require('../models/user');
const Leaderboard = require('../models/leaderboard');
const Season = require('../models/season');
const mongoose = require('mongoose');
const { getLanguageConfig, generateCppFullCode } = require('../utils/problemutility'); 
const tierdata = require('../utils/tiersystem');
const { Sandbox } = require('e2b');
const fs = require('fs');
const path = require('path');

const getErrorMessage = (exitCode, stderr, timeLimit) => {
    switch (exitCode) {
        case 124: return { status: "Time Limit Exceeded", message: `The code took longer than ${timeLimit}s to execute.` };
        case 137: return { status: "Time/Memory Limit Exceeded", message: "Process was killed (likely Time Limit or Out Of Memory)." };
        case 139: return { status: "Segmentation Fault", message: "Memory access violation (e.g., array out of bounds or null pointer)." };
        case 134: return { status: "Aborted", message: "The program aborted (often due to assertion failure or sanitizers)." };
        case 127: return { status: "Command Not Found", message: "The executable was not found in the sandbox." };
        default: return { status: "Runtime Error", message: stderr || `Process exited with code ${exitCode}` };
    }
};


const submitcode = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { pid } = req.params;
        let { code, language } = req.body;
        const userid = req.result._id;
        const user = await User.findById(userid);
        
        if (!code || !language || !pid) throw new Error("Missing required fields");
        if (language === 'cpp') language = 'c++';

        const problem = await Problem.findById(pid).lean();
        if (!problem) return res.status(404).json({ error: "Problem not found" });

        const isGuest = user.role === 'guest';
        let targetSeasonId = req.season?.seasonId ?? 1; // fallback to 1 if req.season is missing
        if (isGuest) {
            const guestSeason = await Season.findOne({ isGuestSeason: true });
            if (guestSeason) targetSeasonId = guestSeason.seasonId;
        }

        const { timeLimit = 1.0 } = problem.constraints || {};
        const jsonLib = fs.readFileSync(path.join(__dirname, "../../libs/json.hpp"), 'utf-8');

        const [pendingSubmission] = await Submission.create([{
            userId: userid,
            problemId: pid,
            seasonId: targetSeasonId,
            code,
            language,
            status: "Pending"
        }], { session });

        const sandbox = await Sandbox.create();
        let passedCount = 0;
        let status = "Accepted";
        let errorMessage = null;
        const totalTestCases = [...problem.visibleTestCases, ...problem.hiddenTestCases];

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
                for (const tc of totalTestCases) {
                    await sandbox.files.write('/home/user/input.txt', tc.input);
                    const run = await sandbox.commands.run(`cd /home/user && timeout -k 0.5s ${timeLimit}s ./main < input.txt`);
                    
                    if (run.exitCode !== 0) {
                        status = (run.exitCode === 124 || run.exitCode === 137) ? "Time Limit Exceeded" : "Runtime Error";
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
        } catch(err){
            if(err.name === 'CommandExitError') status = 'Compilation Error';
            else{
            const runtimeInfo = getErrorMessage(err.exitCode, err.stderr, 1.0);
            status = runtimeInfo.status;
            }
        } finally {
            await sandbox.kill();
        }

        // Database updates (Elo, Leaderboard, etc.) remains the same
        const isAccepted = status === "Accepted";
        const alreadySolved = user.problemsolved.some(id => id.toString() === pid.toString());
        let eloChange = 0;

        if(!alreadySolved){
        eloChange = isAccepted ? (problem.baseEloReward + (req.season?.getActiveSeasonDay() === problem.releaseDay ? (problem.baseEloReward * 0.3) : 0)) : -problem.penaltyWrongAnswer;
        }

       await session.withTransaction(async () => {
            // 1. ALWAYS save the submission record
            await Submission.updateOne({ _id: pendingSubmission._id }, { 
                $set: { 
                    status, 
                    errorMessage, 
                    eloChange, 
                    passedTestCases: passedCount, 
                    totalTestCases: totalTestCases.length 
                } 
            }, { session });

            // 2. Determine if this submission is a success or failure for stats
            const isAccepted = status === "Accepted";

            // 3. Update User/Leaderboard
            // We update stats regardless of whether it's already solved, 
            // but we only add to 'problemsSolved' array if it's a NEW solve.
            const updateQuery = {
                $inc: { 
                    elo: eloChange,
                    acceptedSubmissionsCount: alreadySolved ? 0 : (isAccepted ? 1 : 0),
                    wrongSubmissionsCount: alreadySolved ? 0 : (isAccepted ? 0 : 1) 
                }
            };

            if (!alreadySolved && isAccepted) {
                updateQuery.$addToSet = { problemsSolved: pid };
                await User.updateOne({ _id: userid }, { $addToSet: { problemsolved: pid } }, { session });
            }

            const updatedLB = await Leaderboard.findOneAndUpdate(
                { userId: userid, seasonId: targetSeasonId },
                updateQuery,
                { session, upsert: true, returnDocument: 'after' }
            );

            // 4. Refresh Rank
            const totalSubmissions = updatedLB.acceptedSubmissionsCount + updatedLB.wrongSubmissionsCount;
            const accuracy = totalSubmissions > 0 ? (updatedLB.acceptedSubmissionsCount / totalSubmissions) * 100 : 0;
            const problemsSolvedCount = updatedLB.problemsSolved ? updatedLB.problemsSolved.length : 0;

            const rankInfo = tierdata(updatedLB.elo, accuracy, problemsSolvedCount);
            await Leaderboard.updateOne({ _id: updatedLB._id }, { 
                $set: { 
                    rank: rankInfo.currentRank.name 
                } 
            }, { session });
        });
    
        res.status(201).json({ status, eloChange, message: "Submission processed" , passedTestCases: passedCount, totalTestCases: totalTestCases.length });
    } catch (err) {
        if (err.message && err.message.toLowerCase().includes("limit")) {
            return res.status(429).json({ error: "Servers are currently at maximum capacity. Please wait a few seconds and submit again!" });
        }
        res.status(500).json({ error: "Fatal System Error" + err});
    } finally {
        session.endSession(); 
    }
};

const runcode = async (req, res) => {
    let problem;
    let sandbox;
    try {
        let { code, language } = req.body;
        problem = await Problem.findById(req.params.pid).lean();
        if (!problem) return res.status(404).json({ error: "Problem not found" });
        if (language === 'cpp') language = 'c++';

        const timeLimit = 1;
        const jsonLib = fs.readFileSync(path.join(__dirname, '../../libs/json.hpp'), 'utf-8');
        const fullCode = generateCppFullCode(code, problem.drivercode);
        
        sandbox = await Sandbox.create();
        const results = [];
        let passed = 0
        try {
            await Promise.all([
                sandbox.files.write('/home/user/json.hpp', jsonLib),
                sandbox.files.write('/home/user/main.cpp', fullCode)
            ]);

            // Add -fsanitize=address for better debug info on SIGSEGV
            const compile = await sandbox.commands.run("cd /home/user && g++ -O2 -std=c++17 main.cpp -o main 2>&1");
            if (compile.exitCode !== 0) {
                return res.status(200).json({ 
                results: [], 
                passed: 0, 
                totalTestCases: problem.visibleTestCases.length, 
                error: "Compilation Error:\n" + compile.stdout 
                });
            }

            for (const tc of problem.visibleTestCases) {
                await sandbox.files.write('/home/user/input.txt', tc.input);
                const run = await sandbox.commands.run(`cd /home/user && timeout -k 0.5s ${timeLimit}s ./main < input.txt`);

                // Distinguish Runtime Error types
                // Distinguish Runtime Error types
                if (run.exitCode !== 0) {
                    const { status, message } = getErrorMessage(run.exitCode, run.stderr, timeLimit);
                    results.push({ 
                        input: tc.input, 
                        status, 
                        stderr: message 
                    });
                    continue;
                }

                try {
                    const actual = JSON.parse(run.stdout.trim());
                    const expected = JSON.parse(tc.output.trim());
                    
                    const isCorrect = (actual !== null && expected !== null) && 
                                      (JSON.stringify(actual) === JSON.stringify(expected));
                    if (isCorrect) passed++;
                    
                    results.push({
                        input: tc.input,
                        expected: tc.output,
                        actual: run.stdout.trim(),
                        status: isCorrect ? "Success" : "Wrong Answer",
                    });
                } catch (e) {
                    results.push({
                        input: tc.input,
                        status: "Format Error",
                        actual: run.stdout.trim(),
                        stderr: "Output was not in valid JSON format."
                    });
                }
            }
        } finally {
            await sandbox.kill();
        }
        res.status(200).json({ results, passed : passed, totalTestCases: problem.visibleTestCases.length });
    } catch (err) {
    if (err.message && err.message.toLowerCase().includes("limit")) {
        return res.status(429).json({ error: "Servers are currently at maximum capacity. Please wait a few seconds and run again!" });
    }
    if (err.name === 'CommandExitError') {
        let errorTitle = "Execution Error";
        
        // Combine stdout and stderr to ensure we don't miss the error message
        const combinedOutput = (err.stderr || "") + "\n" + (err.stdout || "");
        let errorMessage = combinedOutput.trim() || "Process exited with code " + err.exitCode;

        // 1. Check for compiler keywords in the combined output
        const isCompilationError = combinedOutput.toLowerCase().includes("error:") || 
                                   combinedOutput.toLowerCase().includes("fatal error:");

        if (isCompilationError) {
            errorTitle = "Compilation Error";
        } 
        else {
            const runtimeInfo = getErrorMessage(err.exitCode, err.stderr, 1.0);
            errorTitle = runtimeInfo.status;
            errorMessage = runtimeInfo.message;
        }

        return res.status(200).json({
            results: [],
            passed: 0,
            totalTestCases: problem?.visibleTestCases?.length || 0,
            error: `${errorTitle}:\n${errorMessage}`
        });
    }


    // 3. Handle truly unexpected system failures
    res.status(500).json({ error: "Internal server error. Please try again."  + err});
}
};
module.exports = {submitcode, runcode};