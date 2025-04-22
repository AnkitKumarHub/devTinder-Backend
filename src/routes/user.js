const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middleware/Auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

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

userRouter.get("/feed", userAuth, async(req,res)=>{
    try {
      const loggedInUser = req.user;

      const page = parseInt(req.query.page) || 1; // page number from the request params
      let limit = parseInt(req.query.limit) || 10; // number of users to fetch per page
      limit = Math.min(limit, 50); // limit the number of users to fetch to 50
      const skip = (page-1) * limit; // number of users to skip

      //find all the connections of the logged in user (sent + received)
      const connectionRequests = await ConnectionRequest.find({
        $or:[
          {fromUserId: loggedInUser._id},
          {toUserId: loggedInUser._id}
        ]
      }).select("fromUserId toUserId status");

      // all the user whom i want to hide from the feed => adding ids to the set because this will not allow duplicate enteries => so there will be set of the ids whome dont want to be on the feed 
      const hideUsersFromFeed = new Set();
      connectionRequests.forEach((req)=>{
        hideUsersFromFeed.add(req.fromUserId.toString());
        hideUsersFromFeed.add(req.toUserId.toString());
      })
      // console.log("hideUsersFromFeed", hideUsersFromFeed);

      //now the feed will be the users who are not in the hideUsersFromFeed set
      const users = await User.find({
        $and:[
          {_id: {$ne: loggedInUser._id}}, // not the logged in user
          {_id: {$nin: Array.from(hideUsersFromFeed)}}, // not in the hideUsersFromFeed set
        ]
      }).select(USER_SAFE_DATA).skip(skip).limit(limit); // select only the safe data

      res.json({ data: users });

    } catch (error) {
      res.status(400).json({message: "ERROR: " + error.message})
    }
})

module.exports = userRouter;
