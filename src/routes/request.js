const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middleware/Auth.js");


requestRouter.post("/sendConnectionRequest", userAuth, async (req, res) => {
  const user = req.user;

  res.send(
    "Connection Request Sent Successfully by " +
      user.firstName +
      " " +
      user.lastName
  );
});


module.exports = requestRouter;