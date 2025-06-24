const express = require('express');
const tagRouter = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const userMiddleware = require('../middleware/userMiddleware')
const {getAllTags} = require('../controllers/tagSection');


tagRouter.get("/getAll", userMiddleware, getAllTags);


module.exports = tagRouter;