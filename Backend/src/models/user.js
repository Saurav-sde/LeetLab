const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    firstName:{
        type: String,
        required: true,
        minLength:3,
        maxLength:20
    },
    lastName:{
        type: String,
        minLength:3,
        maxLength:20
    },
    emailId:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        immutable: true
    },
    age: {
        type:Number,
        min:6,
        max:80
    },
    role:{
        type: String,
        enum:['user','admin'],
        default: 'user'
    },
    problemSolved: {
        type:[{
            type: Schema.Types.ObjectId,
            ref: 'problem',
            unique:true
        }],
    },
    password: {
        type: String,
        required: true
    },
    avatarUrl: {
        type: String,
        default: 'default-avatar-url.png' // A default image
    },
    bio: {
        type: String,
        maxLength: 500,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    university: {
        type: String,
        default: ''
    },
    contestStats: {
        rating: { type: Number, default: 1500 },
        globalRank: { type: Number, default: 0 },
        contestsAttended: { type: Number, default: 0 }
    },
    github: {
        type: String,
        default: ''
    },
    linkedin: {
        type: String,
        default: ''
    },
    twitter: {
        type: String,
        default: ''
    },
    technicalSkills: {
        type:[{
            type: String,
            unique: true
        }]
    },
    createdPlaylists : [{
        type: Schema.Types.ObjectId,
        ref:'playlist'
    }]
},{timestamps:true});

userSchema.post('findOneAndDelete', async function(userInfo){
    if(userInfo){
        await mongoose.model('submission').deleteMany({userId: userInfo._id})
    }
});

const User = mongoose.model("user",userSchema);
module.exports = User;