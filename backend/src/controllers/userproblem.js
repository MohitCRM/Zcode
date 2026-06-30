const { getLanguageConfig, generateCppFullCode } = require('../utils/problemutility'); 
const Problem = require('../models/problem');
const User = require('../models/user');
const Submission = require('../models/submission');
const Leaderboard = require('../models/leaderboard');
const { Sandbox } = require('e2b');
const path = require('path');
const fs = require('fs');

const guestfetchallproblmes = async (req,res)=>{
        try {
        const userId = req.result._id;
        const currentSeason = req.season;
        let page = Math.max(1, parseInt(req.query.page) || 1);
        let limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const skipoffset = (page - 1) * limit;

        const totalproblems = await Problem.countDocuments({});
        const totalpages = Math.ceil(totalproblems / limit);

        const problems = await Problem.find({})
            .sort({ seasonId: -1, releaseDay: -1 }) 
            .skip(skipoffset)
            .limit(limit);

        
        const userSeasonalStats = await Leaderboard.findOne({
        userId: userId,
        seasonId: currentSeason.seasonId
        });

        const solvedIds = userSeasonalStats && userSeasonalStats.problemsSolved 
            ? userSeasonalStats.problemsSolved.map(id => id.toString()) 
            : [];

        const problemsSolved = problems.filter(problem => 
            solvedIds.includes(problem._id.toString())
        );

        res.status(200).json({
            success: true,
            pagination: {
                totalproblems,
                totalpages,
                currentPage: page,
                limit: limit,
                hasNextPage: page < totalpages,
                hasPrevPage: page > 1
            },
            problems: problems,
            problemsSolved: problemsSolved
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: "Failed to fetch problems",
            details: err.message 
        });
    }
}
const adminfetchallproblems = async (req, res) => {
    try {
        let page = Math.max(1, parseInt(req.query.page) || 1);
        let limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const skipoffset = (page - 1) * limit;

        const totalproblems = await Problem.countDocuments({});
        const totalpages = Math.ceil(totalproblems / limit);

        const problems = await Problem.find({})
            .sort({ seasonId: -1, releaseDay: -1 }) 
            .skip(skipoffset)
            .limit(limit);

        res.status(200).json({
            success: true,
            pagination: {
                totalproblems,
                totalpages,
                currentPage: page,
                limit: limit,
                hasNextPage: page < totalpages,
                hasPrevPage: page > 1
            },
            problems: problems
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: "Failed to fetch problems",
            details: err.message 
        });
    }
};

const createproblem = async (req, res) => {
    try {
        console.log("--- REQUEST RECEIVED ---")
        const { referencesolution, visibleTestCases, hiddenTestCases, round, releaseDay, drivercode ,constraints} = req.body;

        if(!drivercode)
            throw new Error("Driver code is required");
        if (!round || !releaseDay) {
            return res.status(400).json({ error : "Missing timeline parameters."});
        }
        if(!constraints)
        {
            return res.status(400).json({error : "Constraints are required"});
        }

        const totalTestCases = [...visibleTestCases, ...hiddenTestCases];

        for (const ele of referencesolution) {
            let { language, code } = ele;
            if(language === 'cpp') language = 'c++';
            const config = getLanguageConfig(language);
            
            const fullCode = generateCppFullCode(code, drivercode);

            const jsonLib = fs.readFileSync(path.join(__dirname, "../../libs/json.hpp"), 'utf-8');

            const sandbox = await Sandbox.create();
            try {
                // Write the single main.cpp file
                await Promise.all([
                sandbox.files.write('/home/user/main.cpp', fullCode),
                sandbox.files.write('/home/user/json.hpp', jsonLib)
            ]);
            console.log("Environment ready: main.cpp and json.hpp exist.");

                // Compile: using -std=c++17 for modern C++ support
                const compile = await sandbox.commands.run("cd /home/user && g++ -O2 -std=c++17 main.cpp -o main 2>&1", { 
    timeout: 30 
});

if (compile.exitCode !== 0) {
    // This will print the EXACT reason why the compiler failed
    console.error("--- COMPILER FAILED ---");
    console.error("EXIT CODE:", compile.exitCode);
    console.error("STDOUT/STDERR:", compile.stdout); // This contains the error
    throw new Error("Compilation failed. Check the server terminal for details.");
}

                // Run Test Cases
                for (const testCase of totalTestCases) {
    await sandbox.files.write('/home/user/input.txt', testCase.input);
    const run = await sandbox.commands.run("cd /home/user && ./main < input.txt", { 
        timeout: constraints.timeLimit 
    });

    if (run.exitCode !== 0) {
        throw new Error(`Runtime Error: ${run.stderr}`);
    }

//     const output = run.stdout.trim();
// if (!output.startsWith('[') && output !== 'true' && output !== 'false') {
//     throw new Error("Wrong Answer: Output must be a valid JSON array or boolean.");
// }

    // --- FIX: Normalize both JSON strings ---
    const expected = JSON.parse(testCase.output.trim());
    const actual = JSON.parse(run.stdout.trim());

    // Compare the parsed objects
    if (JSON.stringify(expected) !== JSON.stringify(actual)) {
        throw new Error(`Wrong Answer: Expected ${JSON.stringify(expected)}, Got ${JSON.stringify(actual)}`);
    }
}
            } finally {
                await sandbox.kill();
            }
        }

        // 5. Save to database
        await Problem.create({
            ...req.body,
            seasonId: req.seasonId ? req.seasonId : CURRENT_SEASON_ID, 
            problemcreator: req.result._id
        });

        res.status(200).json({message : "Problem Created Successfully"});
    } catch (err) {
        res.status(400).json({error : "Error: " + err.message});

    }
}

const problemupdate = async (req, res) => {
    const { pid } = req.params;
    try {
        if (!pid) return res.status(400).json({ error: "Missing pid field" });

        const problem = await Problem.findById(pid);
        if (!problem) return res.status(404).json({ error: "Problem not found" });

        const { referencesolution, visibleTestCases, hiddenTestCases } = req.body;
        const drivercode = problem.drivercode;
        const constraints = problem.constraints; 
        const totalTestCases = [...visibleTestCases, ...hiddenTestCases];

        if (referencesolution && totalTestCases.length > 0) {
            const jsonLib = fs.readFileSync(path.join(__dirname, "../../libs/json.hpp"), 'utf-8');

            for (const ele of referencesolution) {
                let { language, code } = ele;
                if (language === 'cpp') language = 'c++';

                const fullCode = generateCppFullCode(code, drivercode);
                const sandbox = await Sandbox.create();
                
                try {
                    // 1. Sync Files
                    await Promise.all([
                        sandbox.files.write('/home/user/main.cpp', fullCode),
                        sandbox.files.write('/home/user/json.hpp', jsonLib)
                    ]);

                    // 2. Compile with debug feedback
                    const compile = await sandbox.commands.run("cd /home/user && g++ -O2 -std=c++17 main.cpp -o main 2>&1");
                    if (compile.exitCode !== 0) {
                        throw new Error(`Compile error: ${compile.stdout}`);
                    }

                    // 3. Run and Normalize
                    for (const testCase of totalTestCases) {
                        await sandbox.files.write('/home/user/input.txt', testCase.input);
                        const run = await sandbox.commands.run("cd /home/user && ./main < input.txt", { 
                            timeout: constraints.timeLimit || 2 
                        });

                        if (run.exitCode !== 0) throw new Error(`Runtime Error: ${run.stderr}`);
                        
                        
                        const expected = JSON.parse(testCase.output.trim());
                        const actual = JSON.parse(run.stdout.trim());

                        if (JSON.stringify(expected) !== JSON.stringify(actual)) {
                            throw new Error(`Wrong Answer: Expected ${JSON.stringify(expected)}, Got ${JSON.stringify(actual)}`);
                        }
                    }
                } finally {
                    await sandbox.kill();
                }
            }
        }

        const newProblem = await Problem.findByIdAndUpdate(pid, {
            ...req.body,
            problemcreator: req.result._id
        }, { runValidators: true, returnDocument: 'after' });

        res.status(200).json({ message: "Problem Updated Successfully", problem: newProblem });
    } catch (err) {
        return res.status(400).json({ error: "Error Occurred during updates: " + err.message });
    }
};

const problemdelete = async (req, res) => {
    const { pid } = req.params;
    try {
        if (!pid) return res.status(400).json({ error : "Missing pid field"});

        const deletedprobem = await Problem.findByIdAndDelete(pid);
        if (!deletedprobem) return res.status(404).json({error : "Problem not found"});

        res.status(200).json({message : "Problem Deleted Successfully"});
    } catch (err) {
        return res.status(400).json({error : "Error Occured"});
    }
};

const problemfetch = async (req, res) => {
    const { pid } = req.params;
    try {
        if (!pid) return res.status(400).json({error : "Missing pid field"});

        const currentSeason = req.seasonConfig || req.season; 
        if (!currentSeason) {
            return res.status(500).json({error : "Configuration error: Season context missing."});
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
            releaseDay: { $lte: currentSeasonDay },

        }).select("-hiddenTestCases -__v -createdAt -updatedAt -problemcreator -drivercode ");

        if (!problem) {
            return res.status(404).json({error : "Problem not found, locked behind a future round, or unreleased!"});
        }

        return res.status(200).json({problem : problem, today: problem.releaseDay === currentSeasonDay ? true : false});
    } catch (err) {
        return res.status(400).json({error : "Error Occured: " + err.message});
    }
};

const allproblemfetch = async (req, res) => {
    try {
        const currentSeason = req.seasonConfig || req.season; 
        if (!currentSeason) {
            return res.status(500).json({ error: "Configuration error: Season context missing." });
        }
        
        // Use the authenticated user ID from req.result
        const userId = req.result._id;
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
                problems: [],
                problemsSolved: []
            });
        }
        
        // 1. Fetch all problems assigned to this season and round
        const problems = await Problem.find({
            seasonId: currentSeason.seasonId, 
            round: targetRound,
        })
        .select("_id title difficulty tags baseEloReward releaseDay penaltyWrongAnswer") 
        .sort({ releaseDay: 1 });
        
        // 2. Query the leaderboard for this user and season instead of checking the User collection
        const userSeasonalStats = await Leaderboard.findOne({
            userId: userId,
            seasonId: currentSeason.seasonId
        });

        // 3. Extract the solved problem IDs from the leaderboard document
        const solvedIds = userSeasonalStats && userSeasonalStats.problemsSolved 
            ? userSeasonalStats.problemsSolved.map(id => id.toString()) 
            : [];

        // 4. Filter the already-fetched 'problems' array to get the details of what they solved
        // This eliminates running an unnecessary extra database query
        const problemsSolved = problems.filter(problem => 
            solvedIds.includes(problem._id.toString())
        );

        return res.status(200).json({
            seasonId: currentSeason.seasonId,
            activePhase,
            currentSeasonDay,
            problems,
            problemsSolved 
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

        res.status(200).json({ problemsolved : user.problemsolved});
    } catch (err) {
        return res.status(400).json({error : err.message});
    }
};

const sumbittedproblem = async (req, res) => {
    try {
        const userid = req.result._id;
        const problemid = req.params.pid;

        const submissions = await Submission.find({ userId: userid, problemId: problemid }).sort({ createdAt: -1 });

        if (submissions.length === 0) {
            return res.status(404).json({ error :"No submissions found"});
        }
        
        res.status(200).json({submissions : submissions});
    } catch (err) {
        return res.status(400).json({error : err.message});
    }
};

module.exports = { 
    createproblem, 
    problemfetch, 
    allproblemfetch, 
    problemupdate, 
    problemdelete, 
    solvedproblems, 
    sumbittedproblem ,
    adminfetchallproblems,
    guestfetchallproblmes
};