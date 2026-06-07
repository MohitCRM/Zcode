const {getlanguagebyid} = require('../utils/problemutility');
const {submitbatch} = require('../utils/problemutility');
const {sumbittoken} = require('../utils/problemutility');
const Problem = require('../models/Problem');
const User = require('../models/user');

const createproblem = async (req,res)=>{
    const {title,description,difficulty,tags,visibleTestCases,hiddenTestCases,startcode,referencesolution ,problemcreator } = req.body;

    //I need to check if the provided ref solution is correct or not

    try{

        for(const ele of referencesolution)
        {
            const {language,code} = ele;

            const id = getlanguagebyid(language);
            

            const submission = visibleTestCases.map((testcase,index)=>({
                source_code : code,
                language_id : id,
                stdin : testcase.input,
                expected_output : testcase.output
            }));

            const submissionResult = await submitbatch(submission);

            const resultToken = submissionResult.map((res)=> res.token); 

            const testResult = sumbittoken(resultToken);

            for(const test of testResult)
            {
                if(test.status_id != 3){
                    return res.status(400).send("Error Occured");
                }
            }
        }

        //We can store in db
        await Problem.create({
            ...req.body,
            problemcreator : req.result._id
        });

        res.status(200).send("Problem Created Successfully");

    }catch(err)
    {
        res.status(400).send("Error: " + err.message);
    }
}

const problemupdate = async (req,res)=>{
    const {id} = req.params;

        
    //I need to check if the provided ref solution is correct or not

    try{
        if(!id)
        {
            return res.status(400).send("Missing id field");
        }

        const problem = await Problem.findById(id);

        if(!problem)
        {
            return res.status(404).send("Problem not found");
        }
        const {title,description,difficulty,tags,visibleTestCases,hiddenTestCases,startcode,referencesolution ,problemcreator } = req.body;


        for(const ele of referencesolution)
        {
            const {language,code} = ele;

            const id = getlanguagebyid(language);
            

            const submission = visibleTestCases.map((testcase,index)=>({
                source_code : code,
                language_id : id,
                stdin : testcase.input,
                expected_output : testcase.output
            }));

            const submissionResult = await submitbatch(submission);

            const resultToken = submissionResult.map((res)=> res.token); 

            const testResult = sumbittoken(resultToken);

            for(const test of testResult)
            {
                if(test.status_id != 3){
                    return res.status(400).send("Error Occured");
                }
            }
        }
        const newproblem = await Problem.findByIdAndUpdate(id,{
        ...req.body,
        problemcreator : req.result._id
    },{runValidators : true, new : true});

    res.status(200).send(newproblem);
    }
    catch(err)
    {
        return res.status(400).send("Error Occured");
    }
    
  
}

const problemdelete = async (req,res)=>{
    const {id} = req.params;
try{
    if(!id)
    {
        return res.status(400).send("Missing id field");
    }

    const deletedprobem = await Problem.findByIdAndDelete(id);

    if(!deletedprobem)
    {
        return res.status(404).send("Problem not found");
    }

    res.status(200).send("Problem Deleted Successfully");
}catch(err)
{
    return res.status(400).send("Error Occured");
}
}

const problemfetch = async (req,res)=>{
    const {id} = req.params;

    try{
        if(!id)
        {
            return res.status(400).send("Missing id field");
        }

        const problem = await Problem.findById(id).select("-hiddenTestCases -__v -createdAt -updatedAt -problemcreator");

        if(!problem)
        {
            return res.status(404).send("Problem not found");
        }

        res.status(200).send(problem);
    }
    catch(err)
    {
        return res.status(400).send("Error Occured");
    }
}

const allproblemfetch = async (req,res)=>{
    try{
        const problems = await Problem.find({}).select("_id title description difficulty tags"); 

        if(problems.length === 0)
        {
            return res.status(404).send("No problems found");
        }
        res.status(200).send(problems);
    }
    catch(err)
    {
        return res.status(400).send("Error Occured");
    }
}

const solvedproblems = async (req,res)=>{
    try{
        const userid = req.result._id;

        const user = await User.findById(userid).populate({
            path : "problemsolved",
            select : "_id title  difficulty tags"
        })


        res.status(200).send(user.problemsolved);
    }catch(err)
    {
        return res.status(400).send("Error Occured: " + err.message);
    }
}

const sumbittedproblem = async (req,res)=>{
    
    try{

        const userid = req.result._id;
        const problemid = req.params.pid;;

        const submissions = await Submission.find({userId:userid,problemId:problemid});

        if(submissions.length === 0)
        {
            return res.status(404).send("No submissions found");
        }
        
        res.status(200).send(submissions);

    }catch(err){
        return res.status(400).send("Error Occured: " + err.message);
    }
}
module.exports = {createproblem, problemfetch, allproblemfetch, problemupdate, problemdelete, solvedproblems,sumbittedproblem};


