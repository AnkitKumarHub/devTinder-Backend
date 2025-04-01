const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middleware/Auth.js");



profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user; // user is attached to the request object in the middleware

    res.send(user);
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

module.exports = profileRouter;
