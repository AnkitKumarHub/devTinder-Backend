const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middleware/Auth.js");
const { validateEditProfileData } = require("../utils/validation.js");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user; // user is attached to the request object in the middleware

    res.send(user);
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      // validate the data from the request body (data sanitization)
      throw new Error("Invalid Edit Request !!");
    }
    const loggedInUser = req.user; // user is attached to the request object in the middleware

    //1st way to update the user data
    // loggedInUser.firstName = req.body.firstName || loggedInUser.firstName;
    // loggedInUser.lastName = req.body.lastName || loggedInUser.lastName;

    //Better way to update the user data
    Object.keys(req.body).forEach((key) => {
      loggedInUser[key] = req.body[key] || loggedInUser[key];
    });

    await loggedInUser.save(); // save the updated user data to the database

    // res.send(`${loggedInUser.firstName} Your, Profile was Updated Successfully !!`);

    res.json({
      message: `${loggedInUser.firstName} Your, Profile was Updated Successfully !!`,
      user: loggedInUser,
    });
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

profileRouter.patch("/profile/editPassword", userAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      throw new Error("Old Password and New Password are required !!");
    }
    const loggedInUser = req.user;
    const isPasswordMatch = loggedInUser.validatePassword(oldPassword);
    if (!isPasswordMatch) {
      throw new Error("Invalid Credential !!");
    } else if (oldPassword === newPassword) {
      throw new Error("Old Password and New Password are same !!");
    } else if (!validator.isStrongPassword(newPassword)) {
      throw new Error("Password is weak !!");
    } else {
      loggedInUser.password = newPassword;
      await loggedInUser.save(); // save the updated user data to the database
      res.send("Your Password was Updated Successfully !!");
    }
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

module.exports = profileRouter;
