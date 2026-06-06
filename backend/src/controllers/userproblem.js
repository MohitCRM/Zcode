const {getlanguagebyid} = require('../utils/problemutility');
const {submitbatch} = require('../utils/problemutility');
const {sumbitToken} = require('../utils/problemutility');
const Problem = require('../models/Problem');

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

            const testResult = sumbitToken(resultToken);

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



