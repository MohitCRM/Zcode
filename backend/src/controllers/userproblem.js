const {getlanguagebyid} = require('../utils/problemutility');
const {submitbatch} = require('../utils/problemutility');
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

        }
    }catch(err)
    {
        res.status(400).send("Error: " + err.message);
    }
}



