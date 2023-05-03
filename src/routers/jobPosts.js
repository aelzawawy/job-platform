const express = require("express");
const router = express.Router();
const JobPost = require("../models/jobPost");
const auth = require("../middleware/auth");
const User = require("../models/user");
const searchAPI = require("../utils/jobs-api");
const getLocation = require("../utils/locationApi");
const { Configuration, OpenAIApi } = require("openai");
const natural = require("natural");
const pushNotification = require("../utils/fcm/admin");

// Add Job Posts
router.post("/posts/", auth.userAuth, auth.employerAuth, async (req, res) => {
  try {
    getLocation(req.body.location, async (locationErr, data) => {
      // if (locationErr) return res.send(locationErr);
      const jobPost = await JobPost.create({
        title: req.body.title,
        description: req.body.description,
        location: {
          address: locationErr? req.body.location : data.name,
          coordinates: locationErr? [] : data.coords,
        },
        salary: req.body.salary,
        company: req.body.company,
        type: req.body.type,
        remote: req.body.remote,
        employer: req.user._id,
        date: Date.now(),
      });
      res.status(200).send(jobPost);
    });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// get all posts
router.get("/feed/:page/:limit/:order", async (req, res) => {
  try {
    const { page, limit, order } = req.params;
    const posts = await JobPost.find({})
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: order });
    const count = await JobPost.count();
    const totalPages = Math.ceil(count / limit);
    // const groups = await JobPost.aggregate([
    //   {
    //     $group: {
    //       _id: { $dayOfMonth: "$date" },
    //       no_of_posts: { $sum: 1 },
    //       posts: { $push: "$$ROOT" },
    //     },
    //   },
    //   { $sort: { "posts.date": -1 } },
    // ]);
    res.status(200).send({ posts, totalPages });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// get all posts for an employer
router.get("/posts", auth.userAuth, auth.employerAuth, async (req, res) => {
  try {
    await req.user.populate("jobPosts");
    res.send(req.user.jobPosts);
  } catch (e) {
    res.send(e.message);
  }
});

// get by id
router.get("/posts/:id", async (req, res) => {
  try {
    const job = await JobPost.findById(req.params.id);
    if (!job) res.status(404).send({message: "Not found!"});
    res.status(200).send(job);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Patch posts
router.patch(
  "/posts/:id",
  auth.userAuth,
  auth.employerAuth,
  async (req, res) => {
    try {
      const _id = req.params.id;
      getLocation(req.body.location, async (locationErr, data) => {
        // if (locationErr) return res.send(locationErr);
        const jobPost = await JobPost.findByIdAndUpdate(_id, {
          title: req.body.title,
          description: req.body.description,
          location: {
            address: locationErr? req.body.location : data.name,
            coordinates: locationErr? [] : data.coords,
          },
          salary: req.body.salary,
          company: req.body.company,
          type: req.body.type,
          remote: req.body.remote,
          employer: req.user._id,
          date: Date.now(),
        }, {
          new: true,
          runValidators: true,
        });
        res.status(200).send({ message: "success" });
      });
    } catch (e) {
      res.status(400).send(e);
    }
  }
);

// Delete posts
router.delete(
  "/posts/:id",
  auth.userAuth,
  auth.employerAuth,
  async (req, res) => {
    try {
      const _id = req.params.id;
      const jobPost = await JobPost.findOneAndDelete({ _id });
      if (!jobPost) return res.status(404).send({message: "Not found!"});
      res.status(200).send(jobPost);
    } catch (e) {
      res.status(400).send(e.message);
    }
  }
);

// Apply for a job
router.get("/apply/:id", auth.userAuth, async (req, res) => {
  try {
    const _id = req.params.id;
    const jobPost = await JobPost.findById(_id);
    if (!jobPost || !jobPost.available)
      return res.send({ message: "job is not available anymore." });
    if (req.user._id.toString() == jobPost.employer._id.toString())
      return res.send({ message: "You posted this one, so you can't apply!!" });

    exists = function () {
      if (jobPost.applictions.length != 0) {
        for (let user of jobPost.applictions) {
          if (user.applicant._id == req.user._id.toString()) {
            return true;
          }
        }
      } else {
        return false;
      }
    };
    console.log(exists())
    if (!exists()) {
      jobPost.applictions.push({
        applicant: req.user._id,
        name: req.user.name,
      });
      await jobPost.save();
      // Notify employer
      const employer = await User.findById(jobPost.employer);
      if(employer.fcmToken){
        pushNotification({
          title: `Reach`,
          body: `${req.user.name} has applied for the ${jobPost.title}`,
          pathname: `http://localhost:4200/messaging?contact=${req.user._id}`,
          token: `${employer.fcmToken}`,
        });
      }
      employer.notifications.push({
        time: Date.now(),
        body: `${req.user.name} has applied for the ${jobPost.title} position.`,
        path: `http://localhost:4200/messaging?contact=${req.user._id}`,
      });
      await employer.save();
      res.status(200).send({ message: "Applied successfully✅" });
    } else {
      res.send({ message: "Applied already!" });
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Accept job application
router.get(
  "/accept/:jobId/:applicationId",
  auth.userAuth,
  auth.employerAuth,
  async (req, res) => {
    try {
      const jobPost = await JobPost.findById(req.params.jobId);
      const application = jobPost.applictions.find(
        (application) => application._id == req.params.applicationId.toString()
      );
      const applicant = await User.findById(application.applicant);

      if (!jobPost.available) return res.send({message: "jobPost not available anymore"});

      // Notify applicant
      if(applicant.fcmToken){
        pushNotification({
          title: `${req.user.name}`,
          body: `We accepted your offer for ${jobPost.title}`,
          pathname: `http://localhost:4200/messaging?contact=${req.user._id}`,
          token: `${applicant.fcmToken}`,
        });
      }
      applicant.notifications.push({
        time: Date.now(),
        body: `Your offer has been accepted for ${jobPost.title} position.`,
        path: `http://localhost:4200/messaging?contact=${req.user._id}`,
      });
      applicant.messages.push({
        from: req.user._id,
        to: application.applicant,
        name: req.user.name,
        time: Date.now(),
        message: `Dear Mr/Miss ${applicant.name}.\nWe would like to inform you that we accepted your offer for ${jobPost.title} position, please await for more details.`,
      });
      req.user.messages.push({
        from: req.user._id,
        to: application.applicant,
        sent: true,
        name: req.user.name,
        time: Date.now(),
        message: `Dear Mr/Miss ${applicant.name}.\nWe would like to inform you that we accepted your offer for ${jobPost.title} position.`,
      });

      // Add to contacts
      const exists = function () {
        if (
          applicant.contactList.length != 0 ||
          req.user.contactList.length != 0
        ) {
          for (let other of applicant.contactList) {
            for (let mine of req.user.contactList) {
              if (
                other.contact.toString() == req.user._id.toString() &&
                mine.contact.toString() == application.applicant
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
        applicant.contactList.push({
          contact: req.user._id,
        });
        req.user.contactList.push({
          contact: application.applicant,
        });
      }

      // clear applications list
      // jobPost.applictions.splice(0, jobPost.applictions.length);

      await applicant.save();
      await req.user.save();
      jobPost.available = false;
      await jobPost.save();
      res.status(200).send();
    } catch (err) {
      res.status(400).send(err.message);
    }
  }
);

// Decline job application
router.get(
  "/decline/:jobId/:applicationId",
  auth.userAuth,
  auth.employerAuth,
  async (req, res) => {
    try {
      const jobPost = await JobPost.findById(req.params.jobId);
      const application = jobPost.applictions.find(
        (application) => application._id == req.params.applicationId.toString()
      );
      // Notify applicant
      const applicant = await User.findById(application.applicant);
      if(applicant.fcmToken){
        pushNotification({
          title: `${req.user.name}`,
          body: `${req.user.name} has declined your offer for ${jobPost.title}`,
          pathname: `http://localhost:4200/messaging?contact=${req.user._id}`,
          token: `${applicant.fcmToken}`,
        });
      }
      applicant.notifications.push({
        time: Date.now(),
        body: `Your offer has been declined for ${jobPost.title} position.`,
        path: `http://localhost:4200/messaging?contact=${req.user._id}`,
      });
      applicant.messages.push({
        from: req.user._id,
        to: application.applicant,
        name: req.user.name,
        time: Date.now(),
        message: `Dear Mr/Miss ${applicant.name}.\nWe would like to inform you that your applicaton for ${jobPost.title} position has been declined.`,
      });

      await applicant.save();
      jobPost.applictions.splice(jobPost.applictions.indexOf(application), 1);
      await jobPost.save();
      res.status(200).send();
    } catch (err) {
      res.status(400).send(err.message);
    }
  }
);

// Save a job
router.get("/save/:id", auth.userAuth, async (req, res) => {
  try {
    const job = await JobPost.findById(req.params.id);

    const exists = function () {
      if (req.user.savedJobs.length != 0) {
        return req.user.savedJobs.some(
          (el) => el._id.toString() == req.params.id
        );
      } else {
        return false;
      }
    };
    if (!exists()) {
      req.user.savedJobs.push(job);
      await req.user.save();
      res.send({ message: "Added to bookmarks" });
    } else {
      res.send({ message: "Post Was already saved!" });
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Check saved?
router.get("/check_saved/:id", auth.userAuth, async (req, res) => {
  try {
    const exists = function () {
      if (req.user.savedJobs.length != 0) {
        return req.user.savedJobs.some(
          (el) => el._id.toString() == req.params.id
        );
      } else {
        return false;
      }
    };
    if (!exists()) {
      res.status(200).send(false);
    } else {
      res.send(true);
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Unsave a job
router.get("/unSave/:id", auth.userAuth, async (req, res) => {
  try {
    const index = req.user.savedJobs.indexOf(
      req.user.savedJobs.find((el) => el._id.toString() == req.params.id)
    );

    if (index == -1) {
      res.send({message: "Was not saved to begin with!"});
    } else {
      req.user.savedJobs.splice(index, 1);
      await req.user.save();
      res.status(200).send({ message: "Removed from bookmarks" });
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});


//! geo search
// const {search_terms, location, radius, unit, sort} = req.params;
//     const [lat, lng] = req.user.location.coordinates;
//     radius_in_radians = unit === 'mile'? (radius*1) / 3963.2 : (radius*1) / 6378.1
//     const geoPosts = await JobPost.find({
//       location: { $geoWithin: { $centerSphere: [[lat, lng], radius_in_radians] } },
//     });
//     console.log(geoPosts)

router.post("/api-search", async (req, res) => {
  try {
    const { search_terms, location, sort } = req.body;
    const posts = await JobPost.find(
      {
        $text: {
          $search: `${search_terms.trim()} ${location.trim()}`,
          $caseSensitive: false,
        },
      },
      {
        score: { $meta: "textScore" },
      }
    ).sort(sort ? { date: -1 } : { score: { $meta: "textScore" } });
    res.status(200).send(posts);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

module.exports = router;