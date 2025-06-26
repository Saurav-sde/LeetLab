const Tag = require('../models/tags');

const getAllTags = async(req, res) => {
    try {
        const getTags = await Tag.find({}).sort('name');
        if(getTags.length === 0)
            return res.status(200).json([]);
        res.status(200).json(getTags);
    } catch (err) {
        res.status(500).json({message: "Server Error", error: err.message});
    }
}

module.exports = { getAllTags };