const { getLanguageConfig } = require('../utils/problemutility'); 
const { CURRENT_SEASON_ID } = require("../utils/dates");
const Problem = require('../models/problem');
const User = require('../models/user');
const Submission = require('../models/submission');
const { Sandbox } = require('e2b');



const createproblem = async (req, res) => {
    try {
        const { referencesolution, visibleTestCases, hiddenTestCases, round, releaseDay, drivercode } = req.body;

        if(!drivercode)
            throw new Error("Driver code is required");
        if (!round || !releaseDay) {
            return res.status(400).send("Missing timeline parameters.");
        }

        const totalTestCases = [...visibleTestCases, ...hiddenTestCases];

        for (const ele of referencesolution) {
            const { language, code } = ele;
            const config = getLanguageConfig(language);
            
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

            // 1. Create one sandbox per reference solution
            const sandbox = await Sandbox.create();

            try {
                // 2. Setup the environment
                await sandbox.files.write(`main.${config.ext}`, fullCode);
                if (config.compile) {
                    const compile = await sandbox.commands.run(config.compile);
                    if (compile.exitCode !== 0) throw new Error(`Compilation failed: ${compile.stderr}`);
                }

                // 3. Run all test cases in the SAME sandbox
                for (const testCase of totalTestCases) {
                    await sandbox.files.write('input.txt', testCase.input);
                    const run = await sandbox.commands.run(`${config.run} < input.txt`, { timeout: 5 });
                    
                    if (run.exitCode !== 0 || run.stdout.trim() !== testCase.output.trim()) {
                        throw new Error(`Reference solution failed on test case input ${testCase.input} : Expected Output ${testCase.output} but got ${run.stdout}`);
                    }
                }
            } finally {
                // 4. Always close the sandbox!
                await sandbox.kill();
            }
        }

        // 5. Save to database
        await Problem.create({
            ...req.body,
            seasonId: req.seasonId ? req.seasonId : CURRENT_SEASON_ID, 
            problemcreator: req.result._id
        });

        res.status(200).send("Problem Created Successfully");
    } catch (err) {
        res.status(400).send("Error: " + err.message);

    }
}

const problemupdate = async (req, res) => {
    const { pid } = req.params;
    try {
        if (!pid) return res.status(400).send("Missing pid field");

        const problem = await Problem.findById(pid);
        if (!problem) return res.status(404).send("Problem not found");

        const { referencesolution, visibleTestCases, hiddenTestCases } = req.body;
        const drivercode = problem.drivercode;
        const totalTestCases = [...visibleTestCases, ...hiddenTestCases];

        // Only validate if solution or test cases were provided
        if (referencesolution && totalTestCases.length > 0) {
            for (const ele of referencesolution) {
                const { language, code } = ele;
                const config = getLanguageConfig(language); // Ensure this helper is defined
                
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

                    ${code} // The user's solution
                    
                    int main() {
                        std::string input_line;
                        if (std::getline(std::cin, input_line)) {
                            ${drivercode} // The logic from your DB/Frontend
                        }
                        return 0;
                    }
                `;
                const sandbox = await Sandbox.create();
                try {
                    console.log("Sandbox is created");
                    await sandbox.files.write(`main.${config.ext}`, fullCode);
                    if (config.compile) {
                        const compile = await sandbox.commands.run(config.compile);
                        if (compile.exitCode !== 0) throw new Error(`Compile error: ${compile.stderr}`);
                    }

                    for (const testCase of totalTestCases) {
                        await sandbox.files.write('input.txt', testCase.input);
                        const run = await sandbox.commands.run(`${config.run} < input.txt`, { timeout: 2 });
                        
                        if (run.exitCode !== 0 || run.stdout.trim() !== testCase.output.trim()) {
                            throw new Error("Reference solution failed on updated test cases.");
                        }
                    }
                } finally {
                    console.log("Sandbox is killed")
                    await sandbox.kill();
                }
            }
        }

        const newProblem = await Problem.findByIdAndUpdate(pid, {
            ...req.body,
            problemcreator: req.result._id
        }, { runValidators: true, new: true });

        res.status(200).send(newProblem);
    } catch (err) {
        return res.status(400).send("Error Occurred during updates: " + err.message);
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