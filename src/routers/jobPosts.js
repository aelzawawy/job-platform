const express = require("express");
const router = express.Router();
const JobPost = require("../models/jobPost");
const auth = require("../middleware/auth");
const User = require("../models/user");
const axios = require("axios");
const { Configuration, OpenAIApi } = require("openai");
const natural = require("natural");
const fs = require("fs");
// const { application, response } = require("express");

// Add Job Posts
router.post("/posts/", auth.userAuth, auth.employerAuth, async (req, res) => {
  try {
    const jobPost = new JobPost({
      ...req.body,
      employer: req.user._id,
      date: Date.now(),
    });
    await jobPost.save();
    res.status(200).send(jobPost);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// get all posts
router.post("/jobs-feed", async (req, res) => {
  try {
    const { page, limit, order } = req.body;
    const posts = await JobPost.find({}).limit(limit * 1).skip((page - 1) * limit).sort({date: order});
    const count = await JobPost.count();
    const totalPages = Math.ceil(count / limit);
    res.status(200).send({posts, totalPages});
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
router.get("/jobs-feed/:id", (req, res) => {
  const _id = req.params.id;
  JobPost.findById(_id)
    .then((job) => {
      if (!job) {
        return res.status(404).send("Job not found");
      } else {
        res.status(200).send(job);
      }
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Patch posts
router.patch(
  "/posts/:id",
  auth.userAuth,
  auth.employerAuth,
  async (req, res) => {
    try {
      const _id = req.params.id;
      const jobPost = await JobPost.findByIdAndUpdate(_id, req.body, {
        new: true,
        runValidators: true,
      });
      res.status(200).send({message: "success"});
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
      if (!jobPost) return res.status(404).send("jobPost not found");
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

    if (req.user._id.toString() == jobPost.employer.toString())
      return res.send({message: "You posted this one, so you can't apply!!"});
    if (!jobPost.available) return res.send({message: "job is not available anymore."});

    exists = function () {
      if (jobPost.applictions.length != 0) {
        for (let user of jobPost.applictions) {
          if (user.applicant == req.user._id.toString()) {
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
      await jobPost.save();
      // Notify employer of acceptance
      const employer = await User.findById(jobPost.employer);
      employer.notifications.push({
        timeStamp: Date.now(),
        notification: `${req.user.name} has applied for the ${jobPost.title} position. please update him on ${req.user.phone} ASAP!`,
      });
      await employer.save();
      res.status(200).send({message: "Applied successfully✅"});
    } else {
      res.send({message: "Applied already!"});
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

      if (!jobPost.available) return res.send("jobPost not available anymore");

      // Notify applicant
      const applicant = await User.findById(application.applicant);
      applicant.messages.push({
        from: req.user._id,
        to: application.applicant,
        name: req.user.name,
        time: Date.now(),
        message: `Dear Mr/Miss ${applicant.name}.\nWe would like to inform you that we accepted your offer for ${jobPost.title} position.`,
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
      res.status(200).send(applicant);
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
      applicant.messages.push({
        from: req.user._id,
        to: application.applicant,
        name: req.user.name,
        time: Date.now(),
        message: `Dear Mr/Miss ${applicant.name}.\nWe would like to inform you that your applicaton for ${jobPost.title} position has been declined.`,
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

      await applicant.save();
      await req.user.save();
      jobPost.applictions.splice(jobPost.applictions.indexOf(application), 1);
      await jobPost.save();
      res.status(200).send(applicant);
    } catch (err) {
      res.status(400).send(err.message);
    }
  }
);

// Save a job
router.get("/save/:id", auth.userAuth, async (req, res) => {
  try {
    const job = await JobPost.findById(req.params.id)
    
    const exists = function () {
      if (req.user.savedJobs.length != 0) {
        return req.user.savedJobs.some(el => el._id.toString() == req.params.id);
      } else {
        return false;
      }
    };
    if (!exists()) {
      req.user.savedJobs.push(job);
      await req.user.save();
      res.send({message: "Added to favourites✅"});
    } else {
      res.send({message: "Post Was already saved!"});
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
        return req.user.savedJobs.some(el => el._id.toString() == req.params.id);
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
    const index = req.user.savedJobs.indexOf(req.user.savedJobs.find(el => el._id.toString() == req.params.id));
    
    if (index == -1) {
      res.send("Was not saved to begin with!");
    } else {
      req.user.savedJobs.splice(index, 1);
      await req.user.save();
      res.status(200).send({message: "Removed from favourites✅"});
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.post("/api-search", async (req, res) => {
  // try {
  //   const { search_terms, location, country = "gb" } = req.body;
  //   // const options = {
  //   //   method: "POST",
  //   //   url: "https://linkedin-jobs-search.p.rapidapi.com/",
  //   //   headers: {
  //   //     "content-type": "application/json",
  //   //     "X-RapidAPI-Key": "96148c67fdmshce77d5c2d96ee31p14f301jsnc3ed3a645ded",
  //   //     "X-RapidAPI-Host": "linkedin-jobs-search.p.rapidapi.com",
  //   //   },
  //   //   data: `{"search_terms":"${search_terms}","location":"${location}","page":"1"}`,
  //   //   limit: 10
  //   // };

  //   // axios.request(options).then(function (response) {
  //   //   res.status(200).send(response.data);
  //   // })
  //   // .catch(function (error) {
  //   //   res.status(400).send(error);
  //   // });


  try{
    const { search_terms, location, sort, country = "gb" } = req.body;
    if(sort){
      if(location == ''){
        const posts = await JobPost.find({
          $or: [
            { title: { $regex: `\\b${search_terms}\\b`} },
            { description: { $regex: `\\b${search_terms}\\b` } },
          ]
        }).sort({date: -1});
        res.status(200).send(posts);
      }else if(search_terms == ''){
        const posts = await JobPost.find({
          $or: [
            { location: { $regex: `\\b${location}\\b` } },
          ],
        }).sort({date: -1});
        res.status(200).send(posts);
      }else{
        const posts = await JobPost.find({
          $or: [
            { title: { $regex: `\\b${search_terms}\\b`} },
            { description: { $regex: `\\b${search_terms}\\b` } },
            { location: { $regex: `\\b${location}\\b` } },
          ]
        }).sort({date: -1});
        res.status(200).send(posts);
      }
    }else{
      if(location == ''){
        const posts = await JobPost.find({
          $or: [
            { title: { $regex: `\\b${search_terms}\\b`} },
            { description: { $regex: `\\b${search_terms}\\b` } },
          ]
        });
        const sorted = await sortByRelevance(posts, search_terms);
        res.status(200).send(sorted);
      }else if(search_terms == ''){
        const posts = await JobPost.find({
          $or: [
            { location: { $regex: `\\b${location}\\b` } },
          ],
        });
        const sorted = await sortByRelevance(posts, search_terms);
        res.status(200).send(sorted);
      }else{
        const posts = await JobPost.find({
          $or: [
            { title: { $regex: `\\b${search_terms}\\b`} },
            { description: { $regex: `\\b${search_terms}\\b` } },
            { location: { $regex: `\\b${location}\\b` } },
          ]
        });
        const sorted = await sortByRelevance(posts, search_terms);
        res.status(200).send(sorted);
      }
    }
  } catch (e){
    res.status(400).send(e.message);
  }
  //   //////////////// ADZONA
  // const targetURL = `${process.env.BASE_URL}/${country.toLowerCase()}/${process.env.BASE_PARAMS}&app_id=${process.env.APP_ID}&app_key=${ process.env.API_KEY}&what=${search_terms}&where=${location}`;
  // axios.get(targetURL).then(async (response) => {
  //     // const recommendedJobs = await getRecommendations(search_terms, location, response);
  //     res.send(response.data.results);
  //   }).catch((e) => {
  //     res.send(e);
  //   });
});

async function sortByRelevance(jobs, keyword) {
  return jobs.sort((job1, job2) => {
    // count the number of times the keyword appears in each job's title and description
    const job1Matches = ((job1.title + ' ' + job1.description).match(new RegExp(keyword, 'gi')) || []).length;
    const job2Matches = ((job2.title + ' ' + job2.description).match(new RegExp(keyword, 'gi')) || []).length;
    
    // sort the jobs by the number of matches, with the most matches first
    return job2Matches - job1Matches;
  });
}




// Define a function to match a job title or description to a list of keywords
// function matchKeywords(text, keywords) {
//   for (let i = 0; i < keywords.length; i++) {
//     if (text.toLowerCase().includes(keywords[i])) {
//       return true;
//     }
//   }
//   return false;
// }

// Define a list of keywords for each job category
// const categoryKeywords = {
//   "IT Jobs": ["software", "developer", "engineer", "programmer"],
//   "Engineering Jobs": ["engineer", "designer", "technician"],
//   "Finance Jobs": ["finance", "accountant", "banking"],
//   "Sales Jobs": ["sales", "marketing", "business development"],
//   "Healthcare Jobs": ["healthcare", "nurse", "doctor", "medical"],
// };

// Define a function to preprocess the job data
// function preprocessJobData(jobs) {
//   // Extract the relevant features from the job data
//   const features = jobs.map((job) => ({
//     title: job.title,
//     description: job.description,
//     category: job.category.label,
//     location: job.location.display_name,
//     url:job.redirect_url,
//   }));

//   // Match each job to a category based on keywords in the title or description
//   features.forEach((job) => {
//     for (const [category, keywords] of Object.entries(categoryKeywords)) {
//       if (matchKeywords(job.title, keywords) || matchKeywords(job.description, keywords)) {
//         job.category = category;
//         break;
//       }
//     }
//   });

//   return features;
// }

// function filterJobsByKeywords(jobs, keywords) {
//   return jobs.filter(job => {
//     const jobText = `${job.title} ${job.description}`;
//     return keywords.every(keyword => jobText.toLowerCase().includes(keyword.toLowerCase()));
//   });
// }

// function sortJobsByRelevance(jobs, query) {
//   return jobs.sort(async (a, b) => {
//     const aText = `${a.title} ${a.description}`;
//     const bText = `${b.title} ${b.description}`;
//     const aScore = calculateRelevanceScore(aText, query);
//     const bScore = calculateRelevanceScore(bText, query);
//     return bScore - aScore;
//   });
// }

// function calculateRelevanceScore(text, query) {
//   const textWords = text.toLowerCase().split(/\W+/);
//   const queryWords = query.toLowerCase().split(/\W+/);
//   const commonWords = textWords.filter(word => queryWords.includes(word));
//   return commonWords.length;
// }

// async function getRecommendations(search_terms, location, response) {
//  // Extract the search keywords from the query
//  const keywords = `${search_terms} ${location}`;

//  // Load the job data
//  const jobData = await preprocessJobData(response.data.results);
 
//  // Filter the job data based on the keywords
//  const filteredJobs = filterJobsByKeywords(jobData, [search_terms, location]);

//  // Sort the filtered jobs by relevance
//  const sortedJobs = sortJobsByRelevance(filteredJobs, keywords);

//  // Return the top 10 recommended jobs
//  const recommendedJobs = sortedJobs.slice(0, 10);
 
//  return recommendedJobs;
// }

// async function trainModel(jobs) {
//   const API_KEY = process.env.GPT_KEY;
//   const configuration = new Configuration({
//     apiKey: API_KEY,
//   });
//   const openai = new OpenAIApi(configuration);

//   // Preprocess and format your job data
//   const jobData = jobs.forEach((job) => preprocessJobData(job));

//   // Train the GPT-3 model on your job data
//   const response = await openai.createFineTune({
//     trainingData: jobData,
//     model: "davinci",
//   });

//   console.log(response);
// }

// function preprocessJobData(job) {
//   const processedData = {};

//   // Convert salary values to floats
//   processedData.salary_min = parseFloat(job.salary_min);
//   processedData.salary_max = parseFloat(job.salary_max);

//   // Label encode the category feature
//   processedData.category = job.category.label;

//   // Custom encode the location feature
//   const location = job.location.area;
//   processedData.location = encodeLocation(location);

//   // Convert job description to lowercase
//   processedData.description = job.description.toLowerCase();

//   // Return processed data
//   return processedData;
// }

// const encodeLocation = (location) => {
//   // Define encoding dictionary
//   const encoding = {
//     "uk": 0,
//     "london": 1,
//     "central london": 2,
//     "fenchurch st": 3,
//     // Add more locations as needed
//   };

//   // Encode location labels to integers
//   let encodedLocation = 0;
//   for (let i = 0; i < location.length; i++) {
//     const label = location[i].toLowerCase();
//     if (encoding[label]) {
//       encodedLocation += encoding[label];
//     } else {
//       // Handle unknown location labels
//       console.log(`Unknown location label: ${label}`);
//     }
//   }

//   return encodedLocation;
// }

// async function Ai(results) {
//   const API_KEY = process.env.GPT_KEY;
//   const configuration = new Configuration({
//     apiKey: API_KEY,
//   });
//   const openai = new OpenAIApi(configuration);
//   completion = await openai
//     .createChatCompletion({
//       model: "gpt-3.5-turbo",
//       messages: [{ role: "user", content: `${JSON.stringify(results)}`}],
//     })
//     .then((response) => {
//       console.log(response.data.choices[0].message.content);
//     })
//     .catch((error) => {
//       console.error(error);
//     });
// }
module.exports = router;