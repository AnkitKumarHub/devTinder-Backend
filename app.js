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
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      throw new Error("Invalid Credential !!");
    } else {
      //Generate JWT Token => passing the secret key ( "Dev@Dinder" ) to sign the token && hiding the user id in the token
      const token = await jwt.sign({ _id: user._id }, "DEV@Dinder");
      console.log(token);

      //Add the token to the cookies & send the response back to the user
      res.cookie("token", token);
      res.send("Login Successful !!");
    }
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

app.get("/profile", async (req, res) => {
  try {
    const cookies = req.cookies;

    const { token } = cookies;
    if (!token) {
      throw new Error ("Unauthorized !!");
    }

    //verify the token from the cookies
    const decodedMessage = await jwt.verify(token, "DEV@Dinder");
    
    const {_id} = decodedMessage;
    console.log("Logged in User is: " + _id);

    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User Not Found !!");
    }

    res.send(user);
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

//finding one user by email
app.get("/user", async (req, res) => {
  const userEmail = req.body.email;
  try {
    const user = await User.find({ email: userEmail });
    if (user.length === 0) {
      res.status(404).send("User Not Found !!");
    } else {
      res.send(user);
    }
  } catch (error) {
    res.status(404).send("Error in finding user !!");
  }
});

//Feed API - GET /feed - get all the users from the database
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status(404).send("Error in finding user !!");
  }
});

//Delete a User from the database by ID
app.delete("/user", async (req, res) => {
  const userId = req.body._id;

  try {
    await User.findByIdAndDelete(userId);
    res.send("User Deleted Successfully !!");
  } catch (error) {
    res.status(404).send("Error in deleting user !!");
  }
});

//Update data of a User from the database by ID
app.patch("/user", async (req, res) => {
  const userId = req.body._id;
  const updateData = req.body;
  // console.log(updateData);

  try {
    const ALLOWED_UPDATES = ["photoUrl", "about", "skills", "age"];
    const isUpdateAllowed = Object.keys(updateData).every((update) =>
      ALLOWED_UPDATES.includes(update)
    );
    if (!isUpdateAllowed) {
      throw new Error("Invalid Update !!");
    }

    if (data?.skills?.length > 10) {
      throw new Error("Skills should be less than 10 !!");
    }

    await User.findByIdAndUpdate(userId, updateData, {
      runValidators: true,
    });
    res.send("User Updated Successfully !!");
  } catch (error) {
    res.status(400).send("Error in updating user !!" + error.message);
  }
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
