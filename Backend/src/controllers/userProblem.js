const {getLanguageById, submitBatch, submitToken} = require('../utils/problemUtility');
const Problem = require("../models/problem");
const User = require("../models/user");
const Submission = require('../models/submission');

const createProblem = async(req,res) => {
    const {title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution, problemCreator} = req.body;

    try {

        for (const {language,completeCode} of referenceSolution) {
            const languageId = getLanguageById(language);

            // creating a batch submission
            const submission = visibleTestCases.map((testcase)=>({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }));

            const submitResult = await submitBatch(submission);
            console.log(submitResult);
            

            const resultToken = submitResult.map((value)=>value.token); // ["token1","token2","token3"]
            const testResult = await submitToken(resultToken);
            console.log(testResult);
            
            for (const test of testResult) {
                if(test.status_id != 3)
                    return res.status(400).send("Error Occurred!");
            }
        }

        // now we can store it in db
        const userProblem = await Problem.create({
            ...req.body,
            problemCreator: req.result._id
        });
        
        res.status(201).send("Problem Saved Successfully");

    } catch (err) {
        res.status(400).send("Error: " + err);
    }
}

const updateProblem = async(req,res) => {
    const {id} =  req.params;
    const {title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution, problemCreator} = req.body;
    try {

        if(!id)
            return res.status(400).send("Missing Id");

        const DsaProblem = await Problem.findById(id);
        if(!DsaProblem)
            return res.status(404).send("Id is not present in server");

        for (const {language,completeCode} of referenceSolution) {
            const languageId = getLanguageById(language);

            // creating a batch submission
            const submission = visibleTestCases.map((testcase)=>({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }));

            const submitResult = await submitBatch(submission);
            console.log(submitResult);
            

            const resultToken = submitResult.map((value)=>value.token); // ["token1","token2","token3"]
            const testResult = await submitToken(resultToken);
            console.log(testResult);
            
            for (const test of testResult) {
                if(test.status_id != 3)
                    return res.status(400).send("Error Occurred!");
            }
        }

        const newProblem = await Problem.findByIdAndUpdate(id,{...req.body}, {runValidators:true, new:true});

        res.status(200).send(newProblem);
    } catch (err) {
        res.status(500).send("Error : " + err);
    }
}

const deleteProblem = async(req,res) => {
    const {id} = req.params;

    try {
        if(!id)
            return res.status(400).send("ID is missing");

        const deletedProblem = await Problem.findByIdAndDelete(id);

        if(!deletedProblem)
            return res.status(404).send("Problem is missing");

        res.status(200).send("Successfully Deleted");
    } catch (err) {
        res.status(500).send("Error: " + err);
    }
}

const getProblemById = async(req,res) => {
    const {id} = req.params;

    try {
        if(!id)
            return res.status(400).send("ID is missing");

        const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution');
        // select('-hiddenTestCases') all fields get selected except hiddenTestCases

        if(!getProblem)
            return res.status(404).send("Problem is missing");

        res.status(200).send(getProblem);
    } catch (err) {
        res.status(500).send("Error: " + err);
    }
}

const getAllProblem = async(req,res) => {
   try {
        const getProblem = await Problem.find({}).select('_id title difficulty tags');

        if(!getProblem.length)
            return res.status(404).send("Problem is missing");

        res.status(200).send(getProblem);
    } catch (err) {
        res.status(500).send("Error: " + err);
    } 
}

const solvedAllProblemByUser = async(req,res)=>{
    try {
        const userId = req.result._id;
        const user = await User.findById(userId).populate({
            path:"problemSolved",
            select:"_id title difficulty tags"
        }); 
        res.status(200).send(user.problemSolved);
    } catch (err) {
        res.status(500).send("Server Error");
    }
}


const submittedProblem = async(req,res)=>{
    try {
        const userId = req.result._id;
        const problemId = req.params.id;

        const ans = await Submission.find({userId, problemId});
        if(ans.length == 0)
            res.status(200).send([]);
        res.status(200).send(ans);
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
}

module.exports = {createProblem, updateProblem, deleteProblem, getProblemById, getAllProblem, solvedAllProblemByUser, submittedProblem};