const express = require('express');
const authRouter = express.Router();
const {register, login, logout, adminRegister, deleteProfile, userDashboard} = require("../controllers/userAuthenticate");
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

authRouter.post('/register',register);
authRouter.post('/login', login);
authRouter.post('/logout',userMiddleware,logout);
authRouter.post('/admin/register',adminMiddleware,adminRegister);
authRouter.delete('/deleteProfile',userMiddleware, deleteProfile);
authRouter.get('/check',userMiddleware,(req,res) => {
    const reply = {
        emailId: req.result.emailId,
        firstName:req.result.firstName,
        _id: req.result._id,
        role: req.result.role
    }

    res.status(200).json({
        user:reply,
        message:"Valid User"
    })
})
authRouter.get('/dashboard/:userId',userMiddleware,userDashboard);

module.exports = authRouter;