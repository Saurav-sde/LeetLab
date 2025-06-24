const Problem = require("../models/problem");
const Submission = require("../models/submission");
const {getLanguageById, submitBatch, submitToken} = require("../utils/problemUtility");


const submitCode = async(req,res) =>{
    try {
        const userId = req.result._id;
        const problemId = req.params.id;
        console.log(req.body);
    
        let {language,code} = req.body;

        if(!userId || !code || !problemId || !language)
            return res.status(400).send("Some Field Missing");

        if(language === 'cpp')
            language = 'c++';

        // fetch the problem from db, as we need hidden test cases to check the user submitted code
        const problem = await Problem.findById(problemId);

        // store the submission in db
        const submittedResult =  await Submission.create({
            userId,
            problemId,
            code,
            language,
            status:'pending',
            testCasesTotal: problem.hiddenTestCases.length
        })

        // submit the code to judge0
        const languageId = getLanguageById(language);

        // creating a batch submission
        const submission = problem.visibleTestCases.map((testcase)=>({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));

        const submitResult = await submitBatch(submission);
        const resultToken = submitResult.map((value)=>value.token); // ["token1","token2","token3"]
        const testResult = await submitToken(resultToken);
            
        // update the submittedResult
        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = "accepted";
        let errorMessage = null;
        for (const test of testResult) {
            if(test.status_id == 3){
                testCasesPassed++;
                runtime += parseFloat(test.time);
                memory = Math.max(memory,test.memory);
            } else {
                if(test.status_id == 4)
                    status = 'error';

                else
                    status = "wrong";
                errorMessage = test.stderr;
            }
        }

        // store the result in db in submission
        submittedResult.status = status;
        submittedResult.testCasesPassed = testCasesPassed;
        submittedResult.runtime = runtime;
        submittedResult.errorMessage = errorMessage;
        submittedResult.memory = memory;

        await submittedResult.save();

        // problemId ko insert karenege user Schema ke problemSolved me , if it is not present there
        if(!req.result.problemSolved.includes(problemId)){
            req.result.problemSolved.push(problemId);
            await req.result.save();
        }

        const accepted = (status == 'accepted');
        res.status(201).json({
            accepted,
            totalTestCases: submittedResult.testCasesTotal,
            passedTestCases: testCasesPassed,
            runtime,
            memory 
        });

    }catch (err) {
        res.status(500).send("Internal Server Error " + err);
    }
}

const runCode = async(req,res) =>{
    try {
        const userId = req.result._id;
        const problemId = req.params.id;
        console.log(req.body);
    
        let {language,code} = req.body;

        if(!userId || !code || !problemId || !language)
            return res.status(400).send("Some Field Missing");

        // fetch the problem from db, as we need hidden test cases to check the user submitted code
        const problem = await Problem.findById(problemId);

        if(language === 'cpp')
            language = 'c++';

        // submit the code to judge0
        const languageId = getLanguageById(language);

        // creating a batch submission
        const submission = problem.visibleTestCases.map((testcase)=>({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));

        const submitResult = await submitBatch(submission);
        const resultToken = submitResult.map((value)=>value.token); // ["token1","token2","token3"]
        const testResult = await submitToken(resultToken);

        // update the result
        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = true;
        let errorMessage = null;

        for (const test of testResult) {
            if(test.status_id == 3){
                testCasesPassed++;
                runtime += parseFloat(test.time);
                memory = Math.max(memory,test.memory);
            } else {
                if(test.status_id == 4)
                    status = 'false';

                else
                    status = "false";
                errorMessage = test.stderr;
            }
        }

        res.status(201).json({
            success:status,
            testCases: testResult,
            runtime, 
            memory
        });
    }catch (err) {
        res.status(500).send("Internal Server Error " + err);
    }
}


module.exports = {submitCode, runCode};