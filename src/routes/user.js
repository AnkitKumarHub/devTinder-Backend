const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middleware/Auth");
const ConnectionRequest = require("../models/connectionRequest");

const USER_SAFE_DATA = "firstName lastName age gender photUrl about skills";

// Get all "pending" connection requests for the logged in user
userRouter.get("/user/request/received", userAuth, async (req, res) => {
  try {
    const loggedinUser = req.user;

    const pendingRequests = await ConnectionRequest.find({
      toUserId: loggedinUser._id,
      status: "interested",
    }).populate(
      "fromUserId",
      "firstName lastName age gender photUrl about skills"
    );
    // }).populate("fromUserId", ["firstName", "lastName", "age", "gender", "photUrl", "about", "skills"]); // this will populate the fromUserId field with the user data

    res.json({
      message: "Data fetched successfully",
      data: pendingRequests,
    });
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedinUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedinUser._id, status: "accepted" },
        { toUserId: loggedinUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.equals(loggedinUser._id)) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({
      message: "Data fetched successfully",
      data: data,
    });
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

module.exports = userRouter;
