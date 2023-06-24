const express = require("express");
const router = express.Router();
const multer = require("multer");
const User = require("../models/user");
const auth = require("../middleware/auth");
const { v4: uuidv4 } = require("uuid");
const sendEmail = require("../utils/email");
const getLocation = require("../utils/locationApi");
const crypto = require("crypto");
const pushNotification = require("../utils/fcm/admin");
const fs = require("fs");
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
  "/api/resume",
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
  "/api/profileImage",
  auth.userAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      // To JPEG of 80%
      const convertedImageBuffer = await sharp(req.file.buffer)
        .jpeg({ quality: 80 })
        .toBuffer();
      req.user.image = convertedImageBuffer;
      req.user.save();
      res.status(200).send({ message: "Success", user: req.user });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

router.delete("/api/profileImage", auth.userAuth, async (req, res) => {
  try {
    req.user.image = fs.readFileSync("assets/34AD2.png");
    req.user.save();
    res.status(200).send({ message: "Success", user: req.user });
  } catch (error) {
    res.status(500).send({ error: "Failed to delete user image." });
  }
});

router.post(
  "/api/backgoroundImage",
  auth.userAuth,
  upload.single("backgoroundImage"),
  async (req, res) => {
    try {
      // Convert the image to JPEG format with a quality of 40%
      const convertedImageBuffer = await sharp(req.file.buffer)
        .jpeg({ quality: 80 })
        .toBuffer();
      req.user.backgoroundImage = convertedImageBuffer;
      req.user.save();
      res.status(200).send({ message: "Success", user: req.user });
    } catch (e) {
      res.send(e);
    }
  }
);

router.delete("/api/backgoroundImage", auth.userAuth, async (req, res) => {
  try {
    req.user.backgoroundImage = fs.readFileSync("assets/bg.jpg");
    req.user.save();
    res.status(200).send({ message: "Success", user: req.user });
  } catch (error) {
    res.status(500).send({ error: "Failed to delete user image." });
  }
});

// Signup
router.post("/api/signup", async (req, res) => {
  try {
    const user = new User(req.body);
    // generate token on our document(input data)
    const token = user.generateToken();
    const verifyToken = user.createVerifyToken();
    await user.save();
    const url = `${req.get("origin")}/verify/${user.id}/${verifyToken}`;
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
router.get("/api/verify/:id/:token", async (req, res) => {
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
router.post("/api/login", async (req, res) => {
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
router.delete("/api/deactivate", async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { active: false });
    req.status(204).send();
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//! Forgot Password
router.post("/api/forgotPassword", async (req, res) => {
  try {
    //todo 1: Get user bu his email address
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).send("User not found");
    // Generate token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    // Send email
    const resetURL = `${req.get("origin")}/resetPassword/${resetToken}`;
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
router.patch("/api/resetPassword/:token", async (req, res) => {
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
router.get("/api/users", auth.userAuth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      "-messages -notifications -contactList -savedJobs -verifyToken -verified -fcmToken -passwordResetExpires -passwordResetToken"
    );
    res.send(users);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get by id
router.get("/api/users/:id", auth.userAuth, (req, res) => {
  const _id = req.params.id; // get user id
  User.findById(_id)
    .select(
      "-messages -notifications -contactList -savedJobs -verifyToken -verified -fcmToken -passwordResetExpires -passwordResetToken"
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
router.get("/api/profile", auth.userAuth, async (req, res) => {
  res.send(req.user);
});

// Get cotacts
router.get("/api/contacts", auth.userAuth, async (req, res) => {
  try {
    const ids = req.user.contactList.map((el) => el.contact);
    const contacts = await User.find({ _id: { $in: ids } }).select(
      "-messages -notifications -contactList -savedJobs -verifyToken -verified -fcmToken -passwordResetExpires -passwordResetToken"
    );
    res.status(200).send(contacts);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Updating profile data
router.patch("/api/profile", auth.userAuth, async (req, res) => {
  try {
    //* "findOneAndUpdate" returns the updated document (or the original document if the option new is false)
    //* "findByIdAndUpdate" does not return anything.
    //* Therefore, using "findOneAndUpdate" with the option {new: true} can help you get the updated document back without having to query it again.
    getLocation(req.body.location.address, async (locationErr, data) => {
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.user._id },
        {
          name: req.body.name,
          email: req.body.email,
          location: {
            address: locationErr
              ? req.body.location.address && data.name
              : data.name,
            coordinates: locationErr ? [] : data.coords,
          },
          company: {
            name: req.body.company_name,
            website_link: req.body.company_website,
          },
          headline: req.body.headline,
          about: req.body.about,
          skills: req.body.skills,
          industry: req.body.industry,
          phone: req.body.phone,
        },
        { new: true }
      );
      await updatedUser.save();
      res.status(200).send(updatedUser);
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

// Mark online
router.patch("/api/mark_online", auth.userAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.body.id, {
      online: true,
      lastActive: Date.now(),
    });
    user.save();
    res.status(200).send({ message: "Success" });
  } catch (e) {
    res.status(400).send(e.message);
  }
});
// Mark offline
router.patch("/api/mark_offline", auth.userAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.body.id, {
      online: false,
    });
    user.save();
    res.status(200).send({ message: "Success" });
  } catch (e) {
    res.status(400).send(e.message);
  }
});
// User search & filtering
router.get("/api/user_search", auth.userAuth, async (req, res) => {
  try {
    const { search_terms, location, industry, skills } = req.query;
    let users;

    // Gett all (unfiltered)
    users = await User.aggregate([
      {
        $match: {
          _id: { $ne: req.user._id },
          roles: { $ne: "employer" },
          $text: {
            $search: `${search_terms.trim()}`,
            $caseSensitive: false,
          },
        },
      },
      {
        $unset: [
          "messages",
          "notifications",
          "contactList",
          "savedJobs",
          "verifyToken",
          "verified",
          "fcmToken",
          "roles",
          "passwordResetExpires",
          "passwordResetToken",
        ],
      },
      {
        $sort: {
          score: { $meta: "textScore" },
        },
      },
    ]);

    //!>>>> Filter by industry

    if (industry && !skills) {
      const groups = await User.aggregate([
        {
          $match: {
            _id: { $ne: req.user._id },
            $text: {
              $search: `${search_terms.trim()}`,
              $caseSensitive: false,
            },
          },
        },
        {
          $unset: [
            "messages",
            "notifications",
            "contactList",
            "savedJobs",
            "verifyToken",
            "verified",
            "fcmToken",
            "roles",
            "passwordResetExpires",
            "passwordResetToken",
          ],
        },
        {
          $sort: {
            score: { $meta: "textScore" },
          },
        },
        {
          $group: {
            _id: "$industry",
            count: { $sum: 1 },
            users: { $push: "$$ROOT" },
          },
        },
      ]);

      users = groups
        .filter((el) => industry.includes(el._id))
        .flatMap((el) => el.users);

      //!>>>> Filter by skill
    } else if (skills && !industry) {
      const groups = await User.aggregate([
        {
          $match: {
            _id: { $ne: req.user._id },
            $text: {
              $search: `${search_terms.trim()} ${location.trim()}`,
              $caseSensitive: false,
            },
          },
        },
        {
          $sort: {
            score: { $meta: "textScore" },
          },
        },
        {
          $unwind: "$skills",
        },
        {
          $group: {
            _id: "$skills",
            count: { $sum: 1 },
            ids: { $push: { $getField: "_id" } },
          },
        },
      ]);

      const ids = groups
        .filter((el) => skills.includes(el._id))
        .flatMap((el) => el.ids);

      users = await User.find({ _id: { $in: ids } }).select(
        "-messages -notifications -contactList -savedJobs -verifyToken -verified -fcmToken -passwordResetExpires -passwordResetToken"
      );

      //!>>>> Filter by both
    } else if (industry && skills) {
      const groups = await User.aggregate([
        {
          $match: {
            _id: { $ne: req.user._id },
            $text: {
              $search: `${search_terms.trim()} ${location.trim()}`,
              $caseSensitive: false,
            },
          },
        },
        {
          $sort: {
            score: { $meta: "textScore" },
          },
        },
        {
          //* $unwind stage, to separate each skill into its own document, which allows grouping based on each skill
          $unwind: "$skills",
        },
        {
          $group: {
            _id: {
              industry: "$industry",
              skill: "$skills",
            },
            count: { $sum: 1 },
            ids: { $push: { $getField: "_id" } },
          },
        },
      ]);
      //! Filtering and extracting unique IDs with the currently selected filters
      const ids_unique = Array.from(
        new Set(
          groups
            .filter(
              (el) =>
                skills.includes(el._id.skill) ||
                industry.includes(el._id.industry)
            )
            .flatMap((el) => el.ids)
            .map((id) => id.toString())
        )
      );

      users = await User.find({ _id: { $in: ids_unique } }).select(
        "-messages -notifications -contactList -savedJobs -verifyToken -verified -fcmToken -passwordResetExpires -passwordResetToken"
      );
    }

    if (location) {
      users = users.filter((user) => user.location.address.includes(location));
    }

    res.status(200).send(users);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.patch("/api/saveToken", auth.userAuth, async (req, res) => {
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

router.patch("/api/removeToken", auth.userAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, {
      fcmToken: "",
    });
    await req.user.save();
    res.status(200).send(user);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// Sending messages
router.post(
  "/api/message/:id",
  auth.userAuth,
  fileUpload.single("file"),
  async (req, res) => {
    try {
      if (req.body.message == "" && !req.file) return;
      const user = await User.findById(req.params.id);
      const messageId = uuidv4();
      const fileName = decodeURIComponent(req.body.encodedFileName);
      let message = {};

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

      // Add to contacts
      if (
        !user.contactList.some(
          (el) => el.contact.toString() == req.user._id.toString()
        )
      ) {
        user.contactList.push({
          contact: req.user._id,
          sent_newMsg: true,
        });
      } else {
        user.contactList.find(
          (el) => el.contact.toString() == req.user._id.toString()
        ).sent_newMsg = true;
      }

      if (
        !req.user.contactList.some(
          (el) => el.contact.toString() == req.params.id
        )
      ) {
        req.user.contactList.push({
          contact: req.params.id,
        });
      }

      user.save();
      req.user.save();

      // Send push notification
      if (user.fcmToken) {
        pushNotification({
          title: `${req.user.name}`,
          body: `${req.body.message}`,
          pathname: `${req.get("origin")}/messaging?contact=${req.user._id}`,
          token: `${user.fcmToken}`,
          sender: `${req.user._id}`,
          time: `${Date.now()}`,
        });
      }
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

// delete a message
router.delete("/api/delMessage/:id", auth.userAuth, async (req, res) => {
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

// delete chat
router.delete(
  "/api/delChat/:id/:forBoth/:rmContact",
  auth.userAuth,
  async (req, res) => {
    try {
      const { id, forBoth, rmContact } = req.params;
      const contact = await User.findById(id);

      const deleteContact = (user, contactId) => {
        user.contactList = user.contactList.filter(
          (el) => el.contact != contactId
        );
      };

      req.user.messages = req.user.messages.filter(
        (msg) => !(msg.to == id || msg.from == id)
      );

      if (rmContact == "true") {
        deleteContact(req.user, id);
      }

      if (forBoth == "true") {
        contact.messages = contact.messages.filter(
          (msg) =>
            !(
              msg.to == req.user._id.toString() ||
              msg.from == req.user._id.toString()
            )
        );

        if (rmContact == "true") {
          deleteContact(contact, req.user._id.toString());
        }
      }

      req.user.save();
      contact.save();
      res.status(200).send({ message: "Removed successfully" });
    } catch (err) {
      res.status(400).send(err.message);
    }
  }
);

// Get messages
router.get("/api/messages", auth.userAuth, async (req, res) => {
  try {
    res.status(200).send(req.user.messages);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Mark read messages
router.patch("/api/read_messages/:id", auth.userAuth, async (req, res) => {
  try {
    req.user.contactList.find(
      (el) => el.contact == req.params.id
    ).sent_newMsg = false;
    req.user.save();
    res.status(200).send({ message: "Success" });
  } catch (err) {
    res.status(400).send(err);
  }
});

// Get notifications
router.get("/api/notifications", auth.userAuth, async (req, res) => {
  try {
    const notification = await req.user.notifications;
    res.status(200).send(notification);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// Get contacts-stats
router.get("/api/contactStats", auth.userAuth, async (req, res) => {
  try {
    const contactStats = await req.user.contactList;
    res.status(200).send(contactStats);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// Delete notifications
router.delete(
  "/api/deleteNotification/:id",
  auth.userAuth,
  async (req, res) => {
    try {
      const notification = await req.user.notifications.find(
        (el) => el._id == req.params.id
      );
      req.user.notifications.splice(
        req.user.notifications.indexOf(notification),
        1
      );
      req.user.save();
      res.status(200).send({ message: "Success" });
    } catch (e) {
      res.status(400).send(e.message);
    }
  }
);

// Mark read notifications
router.patch("/api/markRead/:id", auth.userAuth, async (req, res) => {
  try {
    const notification = await req.user.notifications.find(
      (el) => el._id == req.params.id
    );
    notification.read = true;
    req.user.save();
    res.status(200).send({ message: "Success" });
  } catch (e) {
    res.status(400).send(e.message);
  }
});
module.exports = router;
