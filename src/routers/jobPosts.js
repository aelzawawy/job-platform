const express = require("express");
const router = express.Router();
const JobPost = require("../models/jobPost");
const auth = require("../middleware/auth");
const User = require("../models/user");
// const findQualifiedUsers = require("../utils/findQualifiedUsers");
const getLocation = require("../utils/locationApi");
const pushNotification = require("../utils/fcm/admin");

// Add Job Posts
router.post(
  "/api/posts/",
  auth.userAuth,
  auth.employerAuth,
  async (req, res) => {
    try {
      getLocation(req.body.location, async (locationErr, data) => {
        // if (locationErr) return res.send(locationErr);
        const jobPost = await JobPost.create({
          title: req.body.title,
          description: req.body.description,
          location: {
            address: locationErr ? req.body.location : data.name,
            coordinates: locationErr ? [] : data.coords,
          },
          salary: req.body.salary,
          company: req.body.company,
          type: req.body.type,
          remote: req.body.remote,
          employer: req.user._id,
          date: Date.now(),
        });
        res.status(200).send(jobPost);

        //! Find users within radius to notify them
        const radius = 100; // in KM
        const [lat, lng] = data.coords;
        const radius_in_radians = (radius * 1) / 6378.1;
        const users_within = await User.find({
          id: { $ne: req.user._id.toString() },
          location: {
            $geoWithin: { $centerSphere: [[lat, lng], radius_in_radians] },
          },
        });
        // Notify users
        users_within.forEach((user) => {
          user.notifications.push({
            time: `${Date.now()}`,
            body: `Check the new job in your area for a ${req.body.title} position.`,
            path: `/job/${jobPost._id}`,
            jobId: `${jobPost._id}`,
          });
          if (user.fcmToken) {
            pushNotification({
              title: `Job alert`,
              body: `Check the new job in your area for a ${req.body.title} position.`,
              pathname: `/notifications`,
              token: `${user.fcmToken}`,
              time: `${Date.now()}`,
            });
          }
          user.save();
        });
        // findQualifiedUsers(jobPost, users_within, async (error, res) => {
        //   try {
        //     console.log(res);
        //   } catch (error) {
        //     console.log(error);
        //   }
        // });
      });
    } catch (e) {
      res.status(400).send(e.message);
    }
  }
);

// get all posts
router.get("/api/feed/:page/:limit/:order", async (req, res) => {
  try {
    const { page, limit, order } = req.params;
    const posts = await JobPost.find({})
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: order });
    const count = await JobPost.count();
    const totalPages = Math.ceil(count / limit);
    res.status(200).send({ posts, totalPages });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// get all posts for an employer
router.get("/api/posts", auth.userAuth, auth.employerAuth, async (req, res) => {
  try {
    await req.user.populate("jobPosts");
    res.send(req.user.jobPosts);
  } catch (e) {
    res.send(e.message);
  }
});

// get by id
router.get("/api/posts/:id", async (req, res) => {
  try {
    const job = await JobPost.findOne({ id: req.params.id });
    if (!job) {
      res.status(404).send({ message: "Not found!" });
      return;
    }
    res.status(200).send(job);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Patch posts
router.patch(
  "/api/posts/:id",
  auth.userAuth,
  auth.employerAuth,
  async (req, res) => {
    try {
      const _id = req.params.id;
      const jobPost = await JobPost.findOne({
        _id,
        employer: req.user._id.toString(),
      });
      if (!jobPost) {
        return res.status(403).send({ message: "Unauthorized" });
      }
      getLocation(req.body.location, async (locationErr, data) => {
        // if (locationErr) return res.send(locationErr);

        const jobPost = await JobPost.findByIdAndUpdate(
          _id,
          {
            title: req.body.title,
            description: req.body.description,
            location: {
              address: locationErr ? req.body.location : data.name,
              coordinates: locationErr ? [] : data.coords,
            },
            salary: req.body.salary,
            company: req.body.company,
            type: req.body.type,
            remote: req.body.remote,
            employer: req.user._id,
            date: Date.now(),
          },
          {
            new: true,
            runValidators: true,
          }
        );
        res.status(200).send({ message: "success" });
      });
    } catch (e) {
      res.status(400).send(e);
    }
  }
);

// Delete posts
router.delete(
  "/api/posts/:id",
  auth.userAuth,
  auth.employerAuth,
  async (req, res) => {
    try {
      const _id = req.params.id;
      const jobPost = await JobPost.findOneAndDelete({
        _id,
        employer: req.user._id.toString(),
      });
      if (!jobPost) {
        return res.status(404).send({ message: "Not found!" });
      }
      res.status(200).send(jobPost);
    } catch (e) {
      res.status(400).send(e.message);
    }
  }
);

// Apply for a job
router.get("/api/apply/:id", auth.userAuth, async (req, res) => {
  try {
    const _id = req.params.id;
    const jobPost = await JobPost.findById(_id);
    const employer = await User.findById(jobPost.employer);
    if (!jobPost || !jobPost.available) {
      return res.send({ message: "job is not available anymore." });
    }
    if (req.user._id.toString() == jobPost.employer._id.toString()) {
      return res.send({ message: "You posted this one, so you can't apply!!" });
    }
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

    if (!exists()) {
      jobPost.applictions.push({
        applicant: req.user._id,
        name: req.user.name,
      });
      employer.notifications.push({
        time: `${Date.now()}`,
        body: `${req.user.name} has applied for the ${jobPost.title} position.`,
        path: `/jobPosts`,
        jobId: `${jobPost._id}`,
      });
      await employer.save();
      await jobPost.save();

      // Notify employer
      if (employer.fcmToken) {
        pushNotification({
          title: `${req.user.name}`,
          body: `has applied for the ${jobPost.title} position.`,
          pathname: `/notifications`,
          token: `${employer.fcmToken}`,
          sender: `${req.user._id}`,
          time: `${Date.now()}`,
        });
      }
      res.status(200).send({ message: "Applied successfully✅" });
    } else {
      res.send({ message: "Applied already!" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
});

// Accept job application
router.get(
  "/api/accept/:jobId/:applicationId",
  auth.userAuth,
  auth.employerAuth,
  async (req, res) => {
    try {
      const jobPost = await JobPost.findOne({
        _id: req.params.jobId,
        employer: req.user._id.toString(),
      });
      if (!jobPost) {
        return res.status(403).send({ message: "Unauthorized" });
      }
      const application = jobPost.applictions.find(
        (application) => application._id == req.params.applicationId.toString()
      );
      const applicant = await User.findById(application.applicant);

      if (!jobPost.available)
        return res.send({ message: "jobPost not available anymore" });

      // Add to contacts
      if (
        !applicant.contactList.some(
          (el) => el.contact.toString() == req.user._id.toString()
        )
      ) {
        applicant.contactList.push({
          contact: req.user._id,
          sent_newMsg: true,
        });
      } else {
        applicant.contactList.find(
          (el) => el.contact.toString() == req.user._id.toString()
        ).sent_newMsg = true;
      }

      if (
        !req.user.contactList.some(
          (el) => el.contact.toString() == application.applicant
        )
      ) {
        req.user.contactList.push({
          contact: application.applicant,
        });
      }

      applicant.messages.push({
        from: req.user._id,
        to: application.applicant,
        name: req.user.name,
        time: Date.now(),
        message: `Dear ${applicant.name}.\nWe would like to inform you that we accepted your offer for ${jobPost.title} position.`,
      });
      req.user.messages.push({
        from: req.user._id,
        to: application.applicant,
        sent: true,
        name: req.user.name,
        time: Date.now(),
        message: `Dear ${applicant.name}.\nWe would like to inform you that we accepted your offer for ${jobPost.title} position.`,
      });
      // applicant.notifications.push({
      //   time: Date.now(),
      //   body: `Your offer has been accepted for ${jobPost.title} position.`,
      //   path: `/messaging?contact=${req.user._id}`,
      // });

      // clear applications list
      jobPost.applictions.splice(0, jobPost.applictions.length);
      // Set unavailable
      jobPost.available = false;

      applicant.save();
      req.user.save();
      jobPost.save();

      // Notify applicant
      if (applicant.fcmToken) {
        pushNotification({
          title: `${req.user.name}`,
          body: `We accepted your offer for ${jobPost.title}`,
          pathname: `${req.get("origin")}/messaging?contact=${req.user._id}`,
          token: `${applicant.fcmToken}`,
          sender: `${req.user._id}`,
          time: `${Date.now()}`,
        });
      }
      res.status(200).send();
    } catch (err) {
      res.status(400).send(err.message);
    }
  }
);

// Decline job application
router.get(
  "/api/decline/:jobId/:applicationId",
  auth.userAuth,
  auth.employerAuth,
  async (req, res) => {
    try {
      const jobPost = await JobPost.findOne({
        _id: req.params.jobId,
        employer: req.user._id.toString(),
      });
      if (!jobPost) {
        return res.status(403).send({ message: "Unauthorized" });
      }
      const application = jobPost.applictions.find(
        (application) => application._id == req.params.applicationId.toString()
      );
      const applicant = await User.findById(application.applicant);

      // Add to contacts
      if (
        !applicant.contactList.some(
          (el) => el.contact.toString() == req.user._id.toString()
        )
      ) {
        applicant.contactList.push({
          contact: req.user._id,
          sent_newMsg: true,
        });
      } else {
        applicant.contactList.find(
          (el) => el.contact.toString() == req.user._id.toString()
        ).sent_newMsg = true;
      }

      if (
        !req.user.contactList.some(
          (el) => el.contact.toString() == application.applicant
        )
      ) {
        req.user.contactList.push({
          contact: application.applicant,
        });
      }

      // applicant.notifications.push({
      //   time: Date.now(),
      //   body: `Your offer has been declined for ${jobPost.title} position.`,
      //   path: `messaging?contact=${req.user._id}`,
      // });
      applicant.messages.push({
        from: req.user._id,
        to: application.applicant,
        name: req.user.name,
        time: Date.now(),
        message: `Dear ${applicant.name}.\nWe would like to inform you that your applicaton for ${jobPost.title} position has been declined.`,
      });

      await applicant.save();
      jobPost.applictions.splice(jobPost.applictions.indexOf(application), 1);
      await jobPost.save();

      // Notify applicant
      if (applicant.fcmToken) {
        pushNotification({
          title: `${req.user.name}`,
          body: `We are sorry to say that we declined your offer for ${jobPost.title}`,
          pathname: `${req.get("origin")}/messaging?contact=${req.user._id}`,
          token: `${applicant.fcmToken}`,
          sender: `${req.user._id}`,
          time: `${Date.now()}`,
        });
      }
      res.status(200).send();
    } catch (err) {
      res.status(400).send(err.message);
    }
  }
);

// Save a job
router.get("/api/save/:id", auth.userAuth, async (req, res) => {
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
      req.user.savedJobs.unshift(job);
      await req.user.save();
      res.send({ job: job, message: "Added to bookmarks" });
    } else {
      res.send({ message: "Post Was already saved!" });
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Check saved?
router.get("/api/check_saved/:id", auth.userAuth, async (req, res) => {
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
router.get("/api/unSave/:id", auth.userAuth, async (req, res) => {
  try {
    const index = req.user.savedJobs.indexOf(
      req.user.savedJobs.find((el) => el._id.toString() == req.params.id)
    );

    if (index == -1) {
      res.send({ message: "Was not saved to begin with!" });
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

router.get("/api/job-search", async (req, res) => {
  try {
    const { search_terms, location, sort, remote } = req.query;
    let posts;
    if (!remote) {
      posts = await JobPost.find(
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
    }

    if (remote && !location && !search_terms) {
      posts = await JobPost.find({ remote: true }).sort(
        sort ? { date: -1 } : {}
      );
    } else if (!remote && location) {
      posts = await JobPost.find(
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
    } else if (remote && location) {
      posts = await JobPost.find(
        {
          remote: true,
          $text: {
            $search: `${search_terms.trim()} ${location.trim()}`,
            $caseSensitive: false,
          },
        },
        {
          score: { $meta: "textScore" },
        }
      ).sort(sort ? { date: -1 } : { score: { $meta: "textScore" } });
    }

    res.status(200).send(posts);
  } catch (e) {
    console.log(e.message);
    res.status(400).send(e.message);
  }
});

module.exports = router;
