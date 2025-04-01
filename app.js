//Middleware and Error Handlers

const express = require("express");
const app = express();
const connectDb = require("./src/config/dB.js");
const User = require("./src/models/user.js");
const { validateSignUpData } = require("./src/utils/validation.js");
const bcrypt = require("bcrypt");
const validator = require("validator");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./src/middleware/Auth.js");

//Route Handler => "use" can be used for all types of requests wether it is get, post, put, delete

// app.use("/user", (req, res, next)=>{
//     console.log("Request to /user");
//     next();
//     // res.send("User Page");
// }, (req, res, next)=>{
//     console.log("Request to /user2 !!");
//     // res.send("User Page 2nd !!");
//     next();
// });

//Handle Auth Middleware for all GET, POST, PUT, DELETE requests
// const {adminAuth, userAuth} = require("./middleware/Auth.js");

// app.use("/admin", adminAuth);

// app.get("/admin/getAllData", (req, res)=>{
//   res.send("Admin Page of all data send ");
// });
// app.get("/admin/deleteData", (req, res)=>{
//   res.send("Admin Page of delete data ");
// });

// app.get("/user", userAuth,  (req, res)=>{
//   res.send("Admin Page of all data send ");
// });

//*********************** DATABASE SCHEMA & MODELS MONGOOSE **********************/

app.use(express.json()); // to read the json data from the body of the request
app.use(cookieParser()); // to read the cookies from the request

app.post("/signup", async (req, res) => {
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
app.post("/login", async (req, res) => {
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

      console.log("Token: ", token);
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

app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user; // user is attached to the request object in the middleware

    res.send(user);
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

app.post("/sendConnectionRequest", userAuth, async (req, res) => {
  const user = req.user;

  res.send(
    "Connection Request Sent Successfully by " +
      user.firstName +
      " " +
      user.lastName
  );
});

connectDb()
  .then(() => {
    console.log("Database Connected");
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.log("Error in connecting database", err);
  });
