const mongoose = require("mongoose");
const validator = require("validator");
const { isValidPassword } = require("mongoose-custom-validators");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const fs = require("fs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
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
        "Passwords must have upper and lower case letters, at least 1 number and special character, not match or contain email, and be at least 10 characters long.",
    },
  },
  confirm_password: {
    type: String,
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: "Passwords are not the same",
    },
  },
  Company: {
    name: {
      type: String,
      trim: true,
      lowercase: true,
    },
    website_link: String,
  },
  industry: {
    type: String,
    trim: true,
    lowercase: true,
  },
  headline: {
    type: String,
    lowercase: true,
  },
  about: {
    type: String,
    lowercase: true,
  },
  skills: [
    {
      type: String,
      lowercase: true,
      trim: true,
    },
  ],
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
  phone: {
    type: String,
    // validate: {
    //   validator: function (value) {
    //     return /^(010|011|012|015)([0-9]{8})$/.test(value);
    //   },
    //   message:
    //     "Phone number must start with 010,011,012 or 015, and be 11 numbers",
    // },
  },
  roles: {
    type: String,
    enum: ["user", "employer"],
    default: "user",
  },
  notifications: [
    {
      time: String,
      body: String,
      path: String,
      jobId: String,
      read: {
        type: Boolean,
        default: false,
      },
    },
  ],
  messages: [
    {
      id: String,
      from: mongoose.Schema.Types.ObjectId,
      to: mongoose.Schema.Types.ObjectId,
      name: String,
      time: String,
      file: String,
      file_size: String,
      file_name: {
        type: String,
        trim: true,
      },
      sent: {
        type: Boolean,
        default: false,
      },
      message: {
        type: String,
        trim: true,
      },
    },
  ],
  contactList: [
    {
      contact: mongoose.Schema.Types.ObjectId,
      sent_newMsg: {
        type: Boolean,
        default: false,
      },
    },
  ],
  savedJobs: [
    {
      type: Object,
      required: true,
      ref: "JobPost",
    },
  ],
  image: {
    type: Buffer,
    default: fs.readFileSync("assets/34AD2.png"),
  },
  backgoroundImage: {
    type: Buffer,
    default: fs.readFileSync("assets/bg.jpg"),
  },
  resume: {
    type: Buffer,
  },
  passwordChanedAt: {
    type: Date,
    select: false,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verifyToken: {
    type: String,
  },
  fcmToken: {
    type: String,
  },
  lastActive: {
    type: String,
  },
  online: {
    type: Boolean,
    default: false,
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
  this.password = await bcryptjs.hash(this.password, 12);
  this.confirm_password = undefined;
});

// login data check
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found!");

  const matchPass = await bcryptjs.compare(password, user.password);
  if (!matchPass) throw new Error("Wrong password!");

  return user;
};

// create Token
userSchema.methods.generateToken = function () {
  const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_WORD);
  return token;
};

// Password Reset Token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
userSchema.methods.createVerifyToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.verifyToken = crypto.createHash("sha256").update(token).digest("hex");
  return token;
};

// Update passwordChanedAt property
userSchema.pre("save", function (next) {
  //! Exit if modified or when new document is created
  if (!this.isModified("password") || this.isNew) return next();
  //! To ensure tat the token is created after the password has been changed
  this.passwordChanedAt = Date.now() - 1000;
  next();
});

// Not sending passwords to frontEnd
userSchema.methods.toJSON = function () {
  const userObj = this.toObject();
  delete userObj.password;
  return userObj;
};

//! filtering active users
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } }).select("-__v");
  next();
});

const User = mongoose.model("User", userSchema); // Must come last
module.exports = User;
