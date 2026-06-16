const Problem = require("../models/problem")
const Submission = require("../models/submission");
const { getlanguagebyid, submitbatch, submittoken } = require("../utils/problemutility");
const { CURRENT_SEASON_ID } = require("../utils/dates");


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

        const languageId = getlanguagebyid(language);
        const submissions = problem.hiddenTestCases.map(tc => ({
            source_code: Buffer.from(code).toString('base64'),
            language_id: languageId,
            stdin: Buffer.from(tc.input).toString('base64'),
            expected_output: Buffer.from(tc.output).toString('base64')
        }));

        const tokenResult = await submitbatch(submissions);
        const finalResult = await submittoken(tokenResult.map(r => r.token));

        let passedCount = 0, runtime = 0, memory = 0;
        let status = "Accepted";
        let errorMessage = null;

        for (const test of finalResult) {
            if (test.status_id === 3) {
                passedCount++;
                runtime += parseFloat(test.time || 0);
                memory = Math.max(memory, parseFloat(test.memory || 0));
            } else {
                status = test.status_id === 4 ? "Compilation Error" : "Wrong Answer";
                errorMessage = test.stderr;
                break;
            }
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

const runcode = async (req,res)=>{

    try{
        const userid = req.result._id;
        const problemid = req.params.id;
        const {code, language} = req.body;

        if(!code || !language || !problemid || !userid)
        {
            return res.status(400).send("missing fields");
        }

        const problems = await Problem.findById(problemid);

        if(!problems)
        {
            return res.status(404).send("Problem not found");
        }
   
        //submitting code to judge0
        const languageid = getlanguagebyid(language);

        const submissions = problems.visibleTestCases.map((testcase) => ({
    source_code: Buffer.from(code).toString('base64'),
    language_id: languageid,
    stdin: Buffer.from(testcase.input).toString('base64'),
    expected_output: Buffer.from(testcase.output).toString('base64')
}));

        const tokenresult = await submitbatch(submissions);

        const tokens = tokenresult.map((res)=> res.token);

        const finalresult = await submittoken(tokens); //in the form of array

        res.status(201).send(finalresult);

    }catch(err)
    {
        res.status(400).send("Internal Server Error : " + err.message);
    }
}

module.exports = {submitcode, runcode};