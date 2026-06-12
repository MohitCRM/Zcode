const Problem = require("../models/Problem")
const Submission = require("../models/Submission");
const {getLanguageId , submitbatch, submittoken } = require("../utils/problemutility");

const submitcode = async (req,res)=>{

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

        //I will first store the submission in the database in peding state, and i will rerun the pedning state if any error by judge0

        const submittedresult = await Submission.create({
            userid,
            problemid,
            code,
            language,
            passestestcases : 0,
            testcases : problems.hiddenTestCases.length,
            status:"pending"
        })
        
        //submitting code to judge0
        const languageid = getLanguageId(language);

        const submissions = problems.hiddenTestCases.map((testcase)=>({
            source_code : code,
            language_id : languageid,
            stdin : testcase.input,
            expected_output : testcase.output
        }))

        const tokenresult = await submitbatch(submissions);

        const tokens = tokenresult.map((res)=> res.token);

        const finalresult = await submittoken(tokens); //in the form of array

        //Updating
        let testcasepassed  = 0;
        let runtime = 0;
        let memory = 0;
        let status = "Accepted";
        let errormessage = null;

        for(const test of finalresult)
        {
            if(test.status_id == 3)
            {
                testcasepassed++;
                runtime = runtime + parseFloat(test.time);
                memory = Math.max(memory, test.memory);
            }
            else {
                if(test.status_id == 4)
                {
                    status = "Compilation Error";
                    errormessage = test.stderr;
                }
                else {
                    status = "Wrong Answer";
                    errormessage = test.stderr;
                }
            }
        }

        //Updating the submission in database
        submittedresult.status = status;
        submittedresult.runtime = runtime;
        submittedresult.memory = memory;
        submittedresult.passedtestcases = testcasepassed;
        submittedresult.errormessage = errormessage;

        await submittedresult.save();

        if(!req.result.problemsolved.includes(problemid))
        {
            req.result.problemsolved.push(problemid);
            await req.result.save();
        }

        res.status(201).send("Code Submitted Successfully");

    }catch(err)
    {
        res.status(400).send("Internal Server Error : " + err.message);
    }
}

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
        const languageid = getLanguageId(language);

        const submissions = problems.visibleTestCases.map((testcase)=>({
            source_code : code,
            language_id : languageid,
            stdin : testcase.input,
            expected_output : testcase.output
        }))

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