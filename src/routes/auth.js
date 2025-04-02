const express = require("express");
const authRouter = express.Router();
const { validateSignUpData } = require("../utils/validation.js");
const User = require("../models/user.js");
const bcrypt = require("bcrypt");
const validator = require("validator");

authRouter.post("/signup", async (req, res) => {
  try {
    //validate the data from the request body
    validateSignUpData(req);

    const { firstName, lastName, email, password } = req.body;
    //encrypt the password
    const hashPassword = await bcrypt.hash(password, 10);

    // creating a new instance of the User Model
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashPassword,
    });
    // console.log(req.body);

    await user.save();
    res.send("User Created Successfully !!");
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

//Login API - POST /login - login a user
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("Email and Password are required !!");
    }
    if (!validator.isEmail(email)) {
      throw new Error("Email is invalid !!");
    }

    //find the user by email
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("User Not Found !!");
    }
    const isPasswordMatch = user.validatePassword(password); // using the method from the user model to validate the password ( offloaded the logic to the userSchema )
    if (!isPasswordMatch) {
      throw new Error("Invalid Credential !!");
    } else {
      //Generate JWT Token => passing the secret key ( "Dev@Dinder" ) to sign the token && hiding the user id in the token
      // const token = await jwt.sign({ _id: user._id }, "DEV@Dinder", {
      //   expiresIn: "1Day",
      // }); // 1 day expiration time

      const token = await user.getJWT(); // using the method from the user model to get the token ( offloaded the logic to the userSchema )

      //Add the token to the cookies & send the response back to the user
      res.cookie("token", token, {
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day expiration time
      });
      res.send("Login Successful !!");
    }
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("Logout Successful !!");
});

module.exports = authRouter;
