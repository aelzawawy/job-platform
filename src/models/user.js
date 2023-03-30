const mongoose = require("mongoose");
const validator = require("validator");
const { isValidPassword } = require("mongoose-custom-validators");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require('fs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid");
      }
    },
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: isValidPassword,
      message:
        "Passwords must have upper and lower case letters, at least 1 number and special character, not match or contain email, and be at least 8 characters long.",
    },
  },
  job_title: {
    type: String,
    trim: true,
    lowercase: true,
  },
  Employment_type:{
    type: String,
    trim: true,
    lowercase: true,
  },
  Company_name:{
    type: String,
    trim: true,
    lowercase: true,
  },
  job_Location:{
    type: String,
    trim: true,
    lowercase: true,
  },
  industry:{
    type: String,
    trim: true,
    lowercase: true,
  },
  headline: {
    type: String,
    lowercase: true,
    default: '--'
  },
  location: {
    type: String,
    lowercase: true,
    default: 'Egypt',
  },
  phone: {
    type: String,
    validate: {
      validator: function (value) {
        return /^(010|011|012|015)([0-9]{8})$/.test(value);
      },
      message:
        "Phone number must start with 010,011,012 or 015, and be 11 numbers",
    },
  },
  roles: {
    type: String,
    enum: ["user", "employer"],
    default: "user",
  },
  notifications: [
    {
      time: String,
      notification: {
        type: String,
        trim: true,
      },
    },
  ],
  messages: [
    {
      from:mongoose.Schema.Types.ObjectId,
      to:mongoose.Schema.Types.ObjectId,
      name: String,
      time: String,
      sent: {
        type: Boolean,
        default: false
      },
      message: {
        type: String,
        trim: true,
      },
    },
  ],
  contactList: [
    {
      contact:mongoose.Schema.Types.ObjectId,
    },
  ],
  savedJobs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "JobPost",
    },
  ],
  image: {
    type: Buffer,
    default: fs.readFileSync('assets/34AD2.png'),
  },
  backgoroundImage: {
    type: Buffer,
    default: fs.readFileSync('assets/bg.jpg'),
  },
});

// user(Employer)-jobPosts relation
userSchema.virtual("jobPosts", {
  localField: "_id",
  foreignField: "employer",
  ref: "JobPost",
});

// Hashing passwords
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcryptjs.hash(this.password, 8);
});

// login data check
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Wrong email!");

  const matchPass = await bcryptjs.compare(password, user.password);
  if (!matchPass) throw new Error("Wrong password!");

  return user;
};

// create Token
userSchema.methods.generateToken = function () {
  const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_WORD);
  return token;
};

// Not sending passwords to frontEnd
userSchema.methods.toJSON = function () {
  const userObj = this.toObject();
  delete userObj.password;
  return userObj;
};

const User = mongoose.model("User", userSchema); // Must come last
module.exports = User;
