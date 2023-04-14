const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title:{
        type: String,
        lowercase: true,
        trim: true,
    },
    description:{
        type: String,
        required: true,
    },
    jobSnippet:{
        type: String,
        required: true,
    },
    location:{
        type: String,
        required: true,
        lowercase: true,
        default: "Cairo",
    },
    salary:{
        type:Number,
    },
    type:{
        type: String,
        required: true,
        default: "Full Time",
    },
    remote:{
        type: Boolean,
        default: false,
    },
    date:{
        type: String,
        required: true,
    },
    employer:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    company:{
        type: String,
        required: true,
    },
    available:{
        type:Boolean,
        default: true
    },
    applictions:[
        {
            applicant: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "User",
            },
            name:String
        }
    ],
});

const JobPost = mongoose.model("JobPost", postSchema);
module.exports = JobPost;