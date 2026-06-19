const Problem = require("../models/problem")
const Submission = require("../models/submission");
const User = require('../models/user');
const Leaderboard = require('../models/leaderboard');
const mongoose = require('mongoose');
const { getLanguageConfig } = require('../utils/problemutility'); 
const { CURRENT_SEASON_ID } = require("../utils/dates");
const tierdata = require('../utils/tiersystem');
const { Sandbox } = require('e2b');

const submitcode = async (req, res) => {
    const session = await mongoose.startSession();
    
    try {
        const { id: problemid } = req.params;
        const { code, language } = req.body;
        const userid = req.result._id;

        if (!code || !language || !problemid) throw new Error("Missing required fields");

        const problem = await Problem.findById(problemid).lean();
        if (!problem) return res.status(404).json({ error: "Problem not found" });

        const [pendingSubmission] = await Submission.create([{
            userId: userid,
            problemId: problemid,
            seasonId: req.season?.seasonId ?? CURRENT_SEASON_ID,
            code,
            language,
            status: "Pending"
        }], { session });

        const config = getLanguageConfig(language);

        const sandbox = Sandbox.create();

        let passedCount = 0;
        let status = "Accepted";
        let errorMessage = null;
        let runtime = 0;
        let memory = 0;

        try{
            const drivercode = problem.drivercode;

            const fullCode = `
                    #include <iostream>
                    #include <vector>
                    #include <string>
                    #include <sstream>
                    #include <algorithm>
                    
                    std::vector<int> parseVector(const std::string& input) {
                        std::vector<int> result;
                        std::string s = input;
                        s.erase(std::remove(s.begin(), s.end(), '['), s.end());
                        s.erase(std::remove(s.begin(), s.end(), ']'), s.end());
                        std::stringstream ss(s);
                        std::string item;
                        while (std::getline(ss, item, ',')) {
                            item.erase(std::remove(item.begin(), item.end(), ' '), item.end());
                            if (!item.empty()) {
                                result.push_back(std::stoi(item));
                            }
                        }
                        return result;
                    }

                    ${code} 
                    
                    int main() {
                        std::string input_line;
                        if (std::getline(std::cin, input_line)) {
                            ${drivercode} 
                        }
                        return 0;
                    }
                `;
            
            await sandbox.files.write(`main.${config.ext}`, fullCode);
            if (config.compile) {
                const compile = await sandbox.commands.run(config.compile);
                if (compile.exitCode !== 0) {
                    status = "Compilation Error";
                    errorMessage = compile.stderr;
                }
            }

            if (status === "Accepted") {
                for (const tc of problem.hiddenTestCases) {
                    await sandbox.files.write('input.txt', tc.input);
                    const run = await sandbox.commands.run(`${config.run} < input.txt`, { timeout: 2 });
                    
                    if (run.exitCode !== 0) {
                        status = run.exitCode === 124 ? "Time Limit Exceeded" : "Runtime Error";
                        errorMessage = run.stderr;
                        break;
                    } else if (run.stdout.trim() !== tc.output.trim()) {
                        status = "Wrong Answer";
                        break;
                    } else {
                        passedCount++;
                    }
                }
            }
        }finally{
            await sandbox.kill();
        }
        const isAccepted = status === "Accepted";
        const today = req.season?.getActiveSeasonDay() ?? 1;
        const bonus = (isAccepted && today === problem.releaseDay) ? (problem.baseEloReward * 0.3) : 0;
        const eloChange = isAccepted ? (problem.baseEloReward + bonus) : -problem.penaltyWrongAnswer;

        await session.withTransaction(async () => {
            await Submission.updateOne(
                { _id: pendingSubmission._id },
                { 
                    $set: { 
                        status, runtime, memory, errorMessage, eloChange,
                        passedTestCases: passedCount,
                        totalTestCases: problem.hiddenTestCases.length 
                    } 
                }, 
                { session }
            );

            if (isAccepted) {
                await User.updateOne({ _id: userid }, { $addToSet: { problemsolved: problemid } }, { session });
            }

            const updatedLB = await Leaderboard.findOneAndUpdate(
                { userId: userid, seasonId: req.season?.seasonId ?? CURRENT_SEASON_ID },
                { 
                    $inc: { elo: eloChange, acceptedSubmissionsCount: isAccepted ? 1 : 0, wrongSubmissionsCount: isAccepted ? 0 : 1 },
                    $addToSet: isAccepted ? { problemsSolved: problemid } : {}
                },
                { session, upsert: true, new: true }
            );

            const tier = tierdata(updatedLB.elo);
            await Leaderboard.updateOne({ _id: updatedLB._id }, { $set: { rank: tier.currentRank.name } }, { session });
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
        const { code, language } = req.body;
        const problem = await Problem.findById(req.params.id);
        if (!problem) return res.status(404).send("Problem not found");

        const config = getLanguageConfig(language);
        const sandbox = await Sandbox.create();
        const results = [];

        try {
            const drivercode = problem.drivercode;
            const fullCode = `
                    #include <iostream>
                    #include <vector>
                    #include <string>
                    #include <sstream>
                    #include <algorithm>
                    
                    std::vector<int> parseVector(const std::string& input) {
                        std::vector<int> result;
                        std::string s = input;
                        s.erase(std::remove(s.begin(), s.end(), '['), s.end());
                        s.erase(std::remove(s.begin(), s.end(), ']'), s.end());
                        std::stringstream ss(s);
                        std::string item;
                        while (std::getline(ss, item, ',')) {
                            item.erase(std::remove(item.begin(), item.end(), ' '), item.end());
                            if (!item.empty()) {
                                result.push_back(std::stoi(item));
                            }
                        }
                        return result;
                    }

                    ${code} 
                    
                    int main() {
                        std::string input_line;
                        if (std::getline(std::cin, input_line)) {
                            ${drivercode} 
                        }
                        return 0;
                    }
                `;

            await sandbox.files.write(`main.${config.ext}`, fullCode);
            if (config.compile) {
                const compile = await sandbox.commands.run(config.compile);
                if (compile.exitCode !== 0) {
                    return res.status(200).send([{ status: "Compilation Error", stderr: compile.stderr }]);
                }
            }

            for (const tc of problem.visibleTestCases) {
                await sandbox.files.write('input.txt', tc.input);
                const run = await sandbox.commands.run(`${config.run} < input.txt`, { timeout: 2 });
                const isCorrect = run.exitCode === 0 && run.stdout.trim() === tc.output.trim();
                
                results.push({
                    input: tc.input,
                    expected: tc.output,
                    actual: run.stdout.trim(),
                    status: isCorrect ? "Success" : (run.exitCode === 0 ? "Wrong Answer" : "Runtime Error"),
                    stderr: run.stderr
                });
            }
        } finally {
            await sandbox.kill();
        }
        res.status(200).json(results);
    } catch (err) {
        res.status(500).send(err.message);
    }
};
module.exports = {submitcode, runcode};