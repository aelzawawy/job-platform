const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title:{
        type: String,
        trim: true,
    },
    description:{
        type: String,
        required: true,
    },
    location:{
        type: String,
        required: true,
        default: "Cairo",
    },
    salary:{
        type:Number,
        required: true,
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