const redisClient = require('../config/redis');
const User = require('../models/user');
const Submission = require("../models/submission");
const Problem = require("../models/problem");
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async(req,res) =>{
    try {
        // validate the data
        validate(req.body);
        const {firstName, emailId, password} = req.body;

        req.body.password = await bcrypt.hash(password, 10);
        req.body.role = 'user'; // now from this route only user gets registered not the admin
        
        const user = await User.create(req.body);
        // give the token
        const token = jwt.sign({id:user._id, emailId:emailId,role:'user'}, process.env.JWT_KEY,{expiresIn: 3600})

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role
        }
        res.cookie('token',token,{maxAge:60*60*1000});
        res.status(201).json({
            user:reply,
            message:"User Registered Successfully"
        });

    } catch (err) {
        res.status(400).send("Error: " + err);
    }
}

const login = async(req,res) => {
    try {
        const {emailId, password} = req.body;

        if(!emailId || !password)
            throw new Error("Invalid Ceredentials");

        const user = await User.findOne({emailId});
        const match = await bcrypt.compare(password,user.password);

        if(!match)
            throw new Error("Invalid Ceredentials");

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role
        }

        // give the token
        const token = jwt.sign({_id:user._id, emailId:emailId, role:user.role}, process.env.JWT_KEY,{expiresIn: 3600})
        res.cookie('token',token,{maxAge:60*60*1000});
        res.status(200).json({
            user:reply,
            message:"login successfully"
        })
        
    } catch (err) {
        res.status(401).send("Error: " + err);
    }
}

// logout
const logout = async (req,res) => {
    console.log("logout page");
    try {
        const {token} = req.cookies;
        const payload = jwt.decode(token);

        await redisClient.set(`token:${token}`,'Blocked');
        await redisClient.expireAt(`token:${token}`,payload.exp);

        res.cookie("token",null,{expires: new Date(Date.now())});
        res.send("Logged Out Successfully");
    } catch (err) {
        res.status(503).send("Error: " + err);
    }
}


const adminRegister = async(req,res) =>{
    try {
        // validate the data
        validate(req.body);
        const {firstName, emailId, password} = req.body;

        req.body.password = await bcrypt.hash(password, 10);
        
        const user = await User.create(req.body);
        // give the token
        const token = jwt.sign({id:user._id, emailId:emailId,role:user.role}, process.env.JWT_KEY,{expiresIn: 3600})
        res.cookie('token',token,{maxAge:60*60*1000});
        res.status(201).send("User Registered Successfully");

    } catch (err) {
        res.status(400).send("Error: " + err);  
    }
}

const deleteProfile = async(req,res)=>{
    try {
        const userId = req.result._id;
        // userSchema
        await User.findByIdAndDelete(userId);

        //submissionSchema se bhi delete karo
        // await Submission.deleteMany({userId}); instead of it we defined a post method in schema

        res.status(200).send("Deleted Successfully");
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
}


const calculateActivity = (submissions) => {
    if (!submissions || submissions.length === 0) {
        return {
            heatmapData: {},
            totalActiveDays: 0,
            maxStreak: 0,
            currentStreak: 0
        };
    }

    const submissionDates = new Set();
    const heatmapData = {};

    submissions.forEach(sub => {
        const date = sub.createdAt.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        submissionDates.add(date);
        heatmapData[date] = (heatmapData[date] || 0) + 1;
    });

    const sortedDates = Array.from(submissionDates).sort();
    const totalActiveDays = sortedDates.length;

    let maxStreak = 0;
    let currentStreak = 0;

    if (totalActiveDays > 0) {
        maxStreak = 1;
        currentStreak = 1;

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        // Check if the user was active today or yesterday to determine the current streak
        if (submissionDates.has(today) || submissionDates.has(yesterday)) {
            for (let i = sortedDates.length - 1; i > 0; i--) {
                const currentDate = new Date(sortedDates[i]);
                const prevDate = new Date(sortedDates[i - 1]);
                const diffTime = currentDate - prevDate;
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    currentStreak++;
                } else {
                    break; // Streak is broken
                }
            }
        } else {
            currentStreak = 0; // No recent activity
        }

        // Calculate max streak
        let tempStreak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
            const currentDate = new Date(sortedDates[i]);
            const prevDate = new Date(sortedDates[i - 1]);
            const diffTime = currentDate - prevDate;
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                tempStreak++;
            } else {
                tempStreak = 1; // Reset streak
            }
            if (tempStreak > maxStreak) {
                maxStreak = tempStreak;
            }
        }
    }

    return { heatmapData, totalActiveDays, maxStreak, currentStreak };
};

const userDashboard = async(req,res) => {
    try {
        const { userId } = req.params;
    
        // find the user
        const user = await User.findById(userId).select("-password");

        // get total number of problem
        const totalProblems = await Problem.countDocuments();
        const totalEasyProblems = await Problem.countDocuments({ difficulty: 'easy' });
        const totalMediumProblems = await Problem.countDocuments({ difficulty: 'medium' });
        const totalHardProblems = await Problem.countDocuments({ difficulty: 'hard' });

        if(!user)
            return res.status(404).json({message: "User not found"});
    
        // Find all submissions for this user
        const allSubmissions = await Submission.find({userId: userId})
            .sort({createdAt: -1})
            .populate({
                path: "problemId",
                select: "title difficulty tags",
                populate: {
                    path:'tags',
                    select: 'name'
                }
            });
         
        console.log(allSubmissions);
            
    
        // calculate all the stats
        const acceptedSubmissions = allSubmissions.filter(s => s.status === 'accepted');
        console.log(acceptedSubmissions);
        
        // create a array of unique Problem IDs
        const solvedProblems = new Map();
        acceptedSubmissions.forEach(s => {
            // Use a map to only store the unique solved problems
            if (s.problemId && !solvedProblems.has(s.problemId._id.toString())) {
                solvedProblems.set(s.problemId._id.toString(), s.problemId);
            }
        });
        console.log(solvedProblems);
        

        const problemStats = {
            totalProblems,
            totalEasy: totalEasyProblems,
            totalMedium: totalMediumProblems,
            totalHard: totalHardProblems,
            totalSolved: solvedProblems.size,
            easySolved: 0,
            mediumSolved: 0,
            hardSolved: 0
        }
    
        solvedProblems.forEach(problem => {
            if(problem.difficulty === 'easy')
                problemStats.easySolved++;
            else if(problem.difficulty === 'medium')
               problemStats.mediumSolved++;
            else if(problem.difficulty === 'hard')
                problemStats.hardSolved++;
        })

        // skillstats
        const skillStats = {};
        solvedProblems.forEach(problem => {
            problem.tags.forEach(tag => {
                const tagName = tag.name;
                if (skillStats[tagName]) {
                    skillStats[tagName]++;
                } else {
                    skillStats[tagName] = 1;
                }
            });
        });
        
        // language stats
        const languageStats = { cpp: 0, java: 0, javascript: 0 };
        acceptedSubmissions.forEach(submission => {
            if (submission.language === 'javascript') languageStats.javascript++;
            else if (submission.language === 'java') languageStats.java++;
            else if (submission.language === 'c++') languageStats.cpp++; 
        });

        const sortedSkillStats = Object.entries(skillStats)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 7); 

        // recent accepted submissions list
        const recentSubmissions = acceptedSubmissions.slice(0, 10).map(s => ({
            problemTitle: s.problemId.title,
            problemId: s.problemId._id,
            submittedAt: s.createdAt,
            status: s.status,
            language: s.language
        }));
    
        // calculate heatMap and Streak Data
        const { heatmapData, totalActiveDays, maxStreak, currentStreak } = calculateActivity(allSubmissions);
        
    
        // assemble final json data
        const dashboardData = {
            user,
            stats: {
                problemStats,
                languageStats,
                skillStats: sortedSkillStats
            },
            recentSubmissions, // get last 10 most recent submissions
            activity: {
                totalSubmissions: allSubmissions.length,
                heatmapData,
                totalActiveDays,
                maxStreak,
                currentStreak
            }
        }
    
        res.status(200).json(dashboardData);
        
    } catch (error) {
        console.error('Dashboard data fetching error:', error);
        res.status(500).json({ message: 'Server error while fetching dashboard data.' });
    }
}

module.exports = {register, login, logout, adminRegister,deleteProfile, userDashboard};

