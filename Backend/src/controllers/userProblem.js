const {getLanguageById, submitBatch, submitToken} = require('../utils/problemUtility');
const Problem = require("../models/problem");
const User = require("../models/user");
const Submission = require('../models/submission');
const SolutionVideo = require('../models/solutionVideo');

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
            // console.log(testResult);
            
            for (const test of testResult) {
                if(test.status_id != 3)
                    return res.status(400).json({ message: `Reference Solution failed for language '${language}' on one or more test cases. `});
            }
        }

        // now we can store it in db
        const newProblem = new Problem({
            ...req.body,
            problemCreator: req.result._id
        });
        await newProblem.save();
        await newProblem.populate('tags', 'name description');
        // console.log(newProblem);
        
        res.status(201).json(newProblem);

    } catch (err) {
        res.status(400).json({ message: "Failed to create problem.", error: err.message });
    }
}

const updateProblem = async(req,res) => {
    const {id} =  req.params;
    const {title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution, problemCreator} = req.body;
    try {

        if(!id)
            return res.status(400).json({ message: "Problem ID is required." });

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

        const updatedProblem = await Problem.findByIdAndUpdate(id,req.body, {runValidators:true, new:true}).populate('tags', 'name');

        if(!updatedProblem)
            return res.status(404).json({message: "Problem not found"});
        res.status(200).json(updatedProblem);
    } catch (err) {
        res.status(500).json({message: "Failed to update problem", error:err.message});
    }
}

const deleteProblem = async(req,res) => {
    const {id} = req.params;

    try {
        if(!id)
            return res.status(400).json({ message: "ID is missing" });

        const deletedProblem = await Problem.findByIdAndDelete(id);

        if(!deletedProblem)
            return res.status(404).json({ message: "Problem not found" });

        res.status(200).json({ message: "Problem successfully deleted", deletedProblemId: deletedProblem._id });
    } catch (err) {
        res.status(500).json({ message: "Error deleting problem.", error: err.message });
    }
}

const getProblemById = async(req,res) => {
    const {id} = req.params;

    try {
        if(!id)
            return res.status(400).json({ message: "ID is missing" });

        // const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution');
        const getProblem = await Problem.findById(id).select('-hiddenTestCases').populate('tags', 'name description');

        if(!getProblem)
            return res.status(404).json({message: "Problem not found"});

        // video ka jo bhi url hai wo le aao
        const videos = await SolutionVideo.findOne({problemId:id});

        if(videos)
        {
            const responseData = {
                ...getProblem.toObject(),
                secureUrl : videos.secureUrl,
                thumbnailUrl : videos.thumbnailUrl,
                duration : videos.duration,
            }
            return res.status(200).json(responseData);
        }

        res.status(200).json(getProblem);
    } catch (err) {
        res.status(500).json({message: "Server Error", error: err.message});
    }
}

const getAllProblem = async(req,res) => {
   try {
        const getProblem = await Problem.find({}).select('_id title difficulty tags').populate('tags','name');

        if(!getProblem.length)
            return res.status(200).json([]);

        res.status(200).json(getProblem);
    } catch (err) {
        res.status(500).json({message: "Server Error", error: err.message});
    } 
}

const solvedAllProblemByUser = async(req,res)=>{
    try {
        const userId = req.result._id;
        const user = await User.findById(userId).populate({
            path:"problemSolved",
            select:"_id title difficulty tags",
            populate: {
                path: 'tags',
                select: 'name'
            }
        }); 

        if(!user)
            return res.status(404).json({message: "User not found"});

        res.status(200).json(user.problemSolved);
    } catch (err) {
        res.status(500).json({message: "Server Error", error: err.message});
    }
}


const submittedProblem = async(req,res)=>{
    try {
        const userId = req.result._id;
        const problemId = req.params.id;

        const submissions = await Submission.find({userId, problemId});
        
        if(submissions.length == 0)
            res.status(200).send([]);

        console.log(submissions);
        
        res.status(200).json(submissions);
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
}

module.exports = {createProblem, updateProblem, deleteProblem, getProblemById, getAllProblem, solvedAllProblemByUser, submittedProblem};