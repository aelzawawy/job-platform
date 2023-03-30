const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decode = jwt.verify(token, process.env.JWT_WORD);
    const user = await User.findById({ _id: decode._id }); // decode._id => id is set in the module jwt.sign method
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ Error: "please login first." });
  }
};

const employerAuth = async(req, res, next) => {
    if(req.user.roles !== 'employer') res.status(401).send('Not employer');
    next();
}
module.exports = {
    userAuth,
    employerAuth,
}
