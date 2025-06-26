const mongoose = require('mongoose');
const {Schema} = mongoose;

const playlistSchema = new Schema({
    name : {
        type: String,
        required: [true, 'Playlist name is required'],
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    playlistCreator: {
        type: Schema.Types.ObjectId,
        ref:'user',
        required: true,
        index: true
    },
    problems: [{
        type: Schema.Types.ObjectId,
        ref: 'problem'
    }],
    isPublic: {
        type: Boolean,
        default: false
    }
},{timestamps: true});

const Playlist = mongoose.model('playlist', playlistSchema);
module.exports = Playlist;
