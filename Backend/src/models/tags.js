const mongoose = require('mongoose');
const { Schema } = mongoose;

const tagSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Tag name is required.'],
        unique: true, 
        trim: true,
        lowercase: true 
    },
    description: {
        type: String,
        trim: true
    }
});

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;