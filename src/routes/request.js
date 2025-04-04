const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middleware/Auth.js");
const ConnectionRequest = require("../models/connectionRequest.js");
const User = require("../models/user");

requestRouter.post(
  "/request/send/:status/:userId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;      // req.user is set by the userAuth middleware
      const status = req.params.status;
      const toUserId = req.params.userId;
      
      const allowedStatus = ["interested", "ignored"];
      if(!allowedStatus.includes(status)){
        return res.status(400).json({ message: "Invalid status provided" });
      }

      //check if the fromUserId and toUserId are same or not => doing by schema.pre()
      // if(fromUserId.equals(toUserId) ){
      //   return res.status(400).json({ message: "You cannot send request to yourself" });
      // }
    
      //check if the toUser exists or not
      const toUser = await User.findById(toUserId);
      if(!toUser){
        return res.status(400).json({ message: "User not found" });
      }

      // Check if the user is already connected or not
      const existingRequest = await ConnectionRequest.findOne({
        $or:[{
          fromUserId: fromUserId,     // duplicate requests are not allowed
          toUserId: toUserId,
        },
        {
          fromUserId: toUserId,     //vice versa connection is not allowed
          toUserId: fromUserId,
        }]
      })
      if(existingRequest){
        return res.status(400).json({ message: "Connection request already exists" });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save(); // save the connection request to the database

      res.json({
        message: req.user.firstName + " " + req.user.lastName + status + " => "+ toUser.firstName + " " + toUser.lastName,
        data: data,
      })
      
    } catch (error) {
      console.error("Error in sending request:", error.message);
      res.status(400).json({ message: error.message });
    }
  }
);

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user; // Get the logged-in user's ID from the request
    const {status, requestId} = req.params;

    const allowedStatus = ["accepted", "rejected"];
    if(!allowedStatus.includes(status)){
      throw new Error("Invalid status provided !!");
    }

    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUser._id,
      status: "interested"
    })
    if(!connectionRequest){
      return res.status(404).json({ message: "Connection request not found" });
    }

    connectionRequest.status = status; // Update the status of the connection request
    const data = await connectionRequest.save(); // Save the updated connection request to the database

    res.json({message: "Connection request " + status + " successfully", data: data});

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
})

module.exports = requestRouter;
