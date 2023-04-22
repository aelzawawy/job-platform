const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  jobSnippet: {
    type: String,
  },
  location: {
    type: {
      type: String,
      default: "Point",
    },
    coordinates: [Number],
    address: {
      type: String,
      lowercase: true,
      trim: true,
    },
  },
  salary: {
    type: Number,
  },
  type: {
    type: String,
    required: true,
    default: "Full Time",
  },
  remote: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    required: true,
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  company: {
    type: String,
    required: true,
  },
  available: {
    type: Boolean,
    default: true,
  },
  applictions: [
    {
      applicant: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
      name: String,
    },
  ],
});

// postSchema.pre(/^find/, function(next) {
//     this.start = Date.now();
//     next();
// });

// postSchema.post(/^find/, function(docs, next){
//     console.log(`Query took ${Date.now() - this.start} ms!`)
//     next()
// })

postSchema.pre(/^find/, function (next) {
  this.populate({
    path: "employer",
    select: "name image headline",
  });
  next();
});
const JobPost = mongoose.model("JobPost", postSchema);
module.exports = JobPost;
