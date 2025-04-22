const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("Please Login !!");
    }
    const decodedData = jwt.verify(token, "DEV@Dinder");

    const { _id } = decodedData;
    const user = await User.findById(_id);
    if (!user) {
      return res.status(401).send("Unauthorized !!");
    }

    // Attach user to request object for further use in the route handlers
    req.user = user;
    next();
  } catch (err) {
    res.status(401).send("ERROR !!" + err.message);
  }
};

module.exports = { userAuth };
