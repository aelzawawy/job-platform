const express = require("express");
const router = express.Router();
const multer = require("multer");
const User = require("../models/user");
const auth = require("../middleware/auth");
const { set } = require("mongoose");
const sharp = require("sharp");
const { v4: uuidv4 } = require('uuid');


// profile image
const upload = multer({
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/)) return cb(new Error({message: "Please upload an image."}));
    cb(null, true); // accept file
  },
});

const fileUpload = multer({
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\..+$/)) {
      return cb(new Error({message: "Please upload a file with a valid extension."}));
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
      res.status(200).send({message: "Success"})
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
      const convertedImageBuffer = await sharp(req.file.buffer).jpeg({ quality: 80 }).toBuffer();
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
      const convertedImageBuffer = await sharp(req.file.buffer).jpeg({ quality: 80 }).toBuffer();
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
    await user.save();
    // generate token on our document(input data)
    const token = user.generateToken();
    res.status(200).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
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
    res.status(400).send(e);
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
    const ids = req.user.contactList.map(el => el.contact.toString())
    const contacts = await Promise.all(ids.map(async (id) => {
      return await User.findById(id)
    }))
    res.status(200).send(contacts);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Updating profile data
router.patch("/profile", auth.userAuth, async (req, res) => {
  const updates = Object.keys(req.body);
  try {
    updates.forEach((el) => (req.user[el] = req.body[el]));
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

// Sending messages
router.post("/message/:id", auth.userAuth, fileUpload.single("file"), async (req, res) => {
  try {
    if (req.body.message == "" && !req.file) return;
    const user = await User.findById(req.params.id);
    const messageId = uuidv4();
    const fileName = decodeURIComponent(req.body.encodedFileName);
    let message = {};
    
    if(req.file){
      file = Buffer.from(req.file.buffer).toString('base64');
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
      req.user.messages.push(message)
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
    }else{
      message = {
        id: messageId,
        from: req.user._id,
        to: req.params.id,
        sent: true,
        name: req.user.name,
        time: Date.now(),
        message: req.body.message,
      }
      req.user.messages.push(message)
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

    await user.save();
    await req.user.save();
    res.status(200).send(message);
  } catch (err) {
    res.status(400).send(err.message);
  }
});
function bytesToSize(bytes) {
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes == 0) return 'n/a';
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  if (i == 0) return bytes + ' ' + sizes[i];
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};

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
    const msgs = req.user.messages.filter(
      (msg) =>
        (msg.to == req.params.id && msg.from == req.user._id.toString()) ||
        (msg.to == req.user._id.toString() && msg.from == req.params.id)
    );
    res.status(200).send(msgs);
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;