const redisClient = require('../config/redis');
const User = require('../models/user');
const Submission = require("../models/submission");
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


module.exports = {register, login, logout, adminRegister,deleteProfile};

