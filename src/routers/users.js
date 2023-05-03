const express = require("express");
const router = express.Router();
const multer = require("multer");
const User = require("../models/user");
const auth = require("../middleware/auth");
const { set } = require("mongoose");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const sendEmail = require("../utils/email");
const getLocation = require("../utils/locationApi");
const crypto = require("crypto");
const pushNotification = require("../utils/fcm/admin");

// profile image
const upload = multer({
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/))
      return cb(new Error({ message: "Please upload an image." }));
    cb(null, true); // accept file
  },
});

const fileUpload = multer({
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\..+$/)) {
      return cb(
        new Error({ message: "Please upload a file with a valid extension." })
      );
    }
    cb(null, true); // accept file
  },
});

router.post(
  "/resume",
  auth.userAuth,
  fileUpload.single("resume"),
  async (req, res) => {
    try {
      req.user.resume = req.file.buffer;
      await req.user.save();
      res.status(200).send({ message: "Success" });
    } catch (e) {
      res.status(500).send(e.message);
    }
  }
);

router.post(
  "/profileImage",
  auth.userAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      // To JPEG of 80%
      const convertedImageBuffer = await sharp(req.file.buffer)
        .jpeg({ quality: 80 })
        .toBuffer();
      req.user.image = convertedImageBuffer;
      await req.user.save();
      res.status(200).send();
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

router.delete("/profileImage", auth.userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.image = undefined;
    await user.save();
    res.status(200).send();
  } catch (error) {
    res.status(500).send({ error: "Failed to delete user image." });
  }
});

router.post(
  "/backgoroundImage",
  auth.userAuth,
  upload.single("backgoroundImage"),
  async (req, res) => {
    try {
      // Convert the image to JPEG format with a quality of 40%
      const convertedImageBuffer = await sharp(req.file.buffer)
        .jpeg({ quality: 80 })
        .toBuffer();
      req.user.backgoroundImage = convertedImageBuffer;
      await req.user.save();
      res.status(200).send();
    } catch (e) {
      res.send(e);
    }
  }
);

router.delete("/backgoroundImage", auth.userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.backgoroundImage = undefined;
    await user.save();
    res.status(200).send();
  } catch (error) {
    res.status(500).send({ error: "Failed to delete user image." });
  }
});

// Signup
router.post("/signup", async (req, res) => {
  try {
    const user = new User(req.body);
    // generate token on our document(input data)
    const token = user.generateToken();
    const verifyToken = user.createVerifyToken();
    await user.save();
    const url = `${req.protocol}://inreach-af837.web.app/verify/${user.id}/${verifyToken}`;
    sendEmail({
      email: user.email,
      subject: "Welcome",
      message: `We're lucky to have you with us, please verify your email address by clicking the link below.\n${url}`,
    });
    res.status(200).send({ user, token });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// Verify account
router.get("/verify/:id/:token", async (req, res) => {
  try {
    const { id, token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      _id: id,
      verifyToken: hashedToken,
    });
    if (!user) {
      return res.status(400).send({ message: "User not found!" });
    }
    user.verified = true;
    user.verifyToken = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(200).send({ messages: "You're verified now!" });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = user.generateToken();
    res.status(200).send({ user, token });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//! Deactivate account
router.delete("/deactivate", async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { active: false });
    req.status(204).send();
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//! Forgot Password
router.post("/forgotPassword", async (req, res) => {
  try {
    //todo 1: Get user bu his email address
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).send("User not found");
    // Generate token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    // Send email
    const resetURL = `${req.protocol}://inreach-af837.web.app/resetPassword/${resetToken}`;
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message: `Your token is valid for 10 minutes only!\nClick the link to reset your password.\n${resetURL}\nIf you haven't forgotten your password, please ignore this email.`,
    });
    res.status(200).send({ message: "Email sent successfully" });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//! Reset Password
router.patch("/resetPassword/:token", async (req, res) => {
  try {
    //todo 1: Get user based on token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }, // Check if token isn't expired
    });
    console.log(user);
    //todo 2: Set a new password if token isn't expired and the user exists
    if (!user) {
      return res.status(400).send("Invalid token or expired");
    }
    user.password = req.body.password;
    user.passwordResetToken = undefined; // Reset
    user.passwordResetExpires = undefined; // Reset
    await user.save({ validateBeforeSave: false });

    //todo 3: Update the passwordChanedAt porperty
    //todo 4: redirect user to login
    const token = user.generateToken();
    res.status(200).send({
      message: "Password has been changed successfully",
    });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// get all
router.get("/users", auth.userAuth, async (req, res) => {
  try {
    const user = await User.find({});
    res.send(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Get by id
router.get("/users/:id", auth.userAuth, (req, res) => {
  const _id = req.params.id; // get user id
  User.findById(_id)
    .select(
      "-messages -notifications -contactList -savedJobs -verifyToken -verified"
    )
    .then((user) => {
      if (!user) return res.status(404).send("User not found");
      res.status(200).send(user);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// profile router
router.get("/profile", auth.userAuth, async (req, res) => {
  res.send(req.user);
});

// Get cotacts
router.get("/contacts", auth.userAuth, async (req, res) => {
  try {
    const ids = req.user.contactList.map((el) => el.contact);
    const contacts = await User.find({ _id: { $in: ids } }).select(
      "-messages -notifications -contactList -savedJobs -verifyToken -verified"
    );
    res.status(200).send(contacts);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Updating profile data
router.patch("/profile", auth.userAuth, async (req, res) => {
  try {
    getLocation(req.body.location.address, async (locationErr, data) => {
      // if (locationErr) console.log(locationErr);
      await User.findByIdAndUpdate(req.user._id, {
        name: req.body.name,
        email: req.body.email,
        location: {
          address: locationErr
            ? req.body.location.address && data.name
            : data.name,
          coordinates: locationErr ? [] : data.coords,
        },
        headline: req.body.headline,
        about: req.body.about,
        phone: req.body.phone,
      });
    });
    await req.user.save();
    res.status(200).send(req.user);
  } catch (err) {
    res.status(400).send(err);
  }
});

// User search
router.get("/profile/:key", auth.userAuth, async (req, res) => {
  try {
    const users = await User.find({
      $or: [
        { name: { $regex: req.params.key } },
        { email: { $regex: req.params.key } },
      ],
    });
    res.send(users.filter((user) => user.email != req.user.email));
  } catch (err) {
    res.status(400).send(err);
  }
});

router.patch("/saveToken", auth.userAuth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      fcmToken: req.body.token,
    });
    await req.user.save();
    res.status(200).send({ message: "success" });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.patch("/removeToken", auth.userAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, {
      fcmToken: '',
    });
    await req.user.save();
    res.status(200).send(user);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// Sending messages
router.post(
  "/message/:id",
  auth.userAuth,
  fileUpload.single("file"),
  async (req, res) => {
    try {
      if (req.body.message == "" && !req.file) return;
      const user = await User.findById(req.params.id);
      const messageId = uuidv4();
      const fileName = decodeURIComponent(req.body.encodedFileName);
      let message = {};

      // Send push notification
      if(user.fcmToken){
        pushNotification({
          title: `New message from ${req.user.name}`,
          body: `${req.body.message}`,
          pathname: `http://localhost:4200/messaging?contact=${req.user._id}`,
          token: `${user.fcmToken}`,
        });
      }

      if (req.file) {
        file = Buffer.from(req.file.buffer).toString("base64");
        message = {
          id: messageId,
          from: req.user._id,
          to: req.params.id,
          sent: true,
          name: req.user.name,
          time: Date.now(),
          file: file,
          file_size: `${bytesToSize(req.file.size)}`,
          file_name: fileName,
          message: req.body.message,
        };
        req.user.messages.push(message);
        user.messages.push({
          id: messageId,
          from: req.user._id,
          to: req.params.id,
          name: req.user.name,
          time: Date.now(),
          file: file,
          file_size: `${bytesToSize(req.file.size)}`,
          file_name: fileName,
          message: req.body.message,
        });
      } else {
        message = {
          id: messageId,
          from: req.user._id,
          to: req.params.id,
          sent: true,
          name: req.user.name,
          time: Date.now(),
          message: req.body.message,
        };
        req.user.messages.push(message);
        user.messages.push({
          id: messageId,
          from: req.user._id,
          to: req.params.id,
          name: req.user.name,
          time: Date.now(),
          message: req.body.message,
        });
      }

      const exists = function () {
        if (user.contactList.length != 0 || req.user.contactList.length != 0) {
          for (let other of user.contactList) {
            for (let mine of req.user.contactList) {
              if (
                other.contact.toString() == req.user._id.toString() &&
                mine.contact.toString() == req.params.id
              ) {
                return true;
              }
            }
          }
        } else {
          return false;
        }
      };

      if (exists() != true) {
        user.contactList.push({
          contact: req.user._id,
        });
        req.user.contactList.push({
          contact: req.params.id,
        });
      }

      user.save();
      req.user.save();
      res.status(200).send(message);
    } catch (err) {
      res.status(400).send(err.message);
    }
  }
);
function bytesToSize(bytes) {
  var sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "n/a";
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  if (i == 0) return bytes + " " + sizes[i];
  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
}

// delete messages
router.get("/delMessage/:id", auth.userAuth, async (req, res) => {
  try {
    const msg = req.user.messages.find((msg) => msg.id == req.params.id);
    const user = await User.findById(msg.to.toString());
    const user_msg = user.messages.find((msg) => msg.id == req.params.id);

    req.user.messages.splice(req.user.messages.indexOf(msg), 1);
    user.messages.splice(user.messages.indexOf(user_msg), 1);
    await req.user.save();
    await user.save();
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get messages
router.get("/message/:id", auth.userAuth, async (req, res) => {
  try {
    // const msgs = req.user.messages.filter(
    //   (msg) =>
    //     (msg.to == req.params.id && msg.from == req.user._id.toString()) ||
    //     (msg.to == req.user._id.toString() && msg.from == req.params.id)
    // );
    const test = await User.findById(req.user._id).select("messages").find({
      to: req.params.id,
      from: req.user._id,
    });
    res.status(200).send(test[0].messages);
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
