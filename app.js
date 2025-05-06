//Middleware and Error Handlers

const express = require("express");
const app = express();
const connectDb = require("./src/config/dB.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const http = require("http"); //for creating a server using the express app for socket.io

require("dotenv").config();

require("./src/utils/cronjobs")

// app.set("trust proxy", 1);


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
app.use(cors
  ({
  //cookies were not set bcuz if we're not on the same domain or we're not on a secure network => the axios/browser doesn't allow setting cookies  => so we've to use corsoptions to whitelist some domains

  // origin: "https://dev-tinder-delta-one.vercel.app",//FROM WHERE THE FRONTEND IS HOSTED
  origin: "http://localhost:5173",//FROM WHERE THE FRONTEND IS HOSTED
  credentials: true,
  //allow credentials to be sent with the request ( cookies, authorization headers, etc. )
  })
);
app.use(express.json()); // to read the json data from the body of the request
app.use(cookieParser()); // to read the cookies from the request


const authRouter = require("./src/routes/auth");
const profileRouter = require("./src/routes/profile");
const requestRouter = require("./src/routes/request");
const userRouter = require("./src/routes/user");
const paymentRouter = require("./src/routes/payment");
const initialiseSocket = require("./src/utils/socket");
const chatRouter = require("./src/routes/chat");

app.use("/", authRouter); // for all the routes starting with /auth, use the authRouter
app.use("/", profileRouter); // for all the routes starting with /profile, use the profileRouter
app.use("/", requestRouter); // for all the routes starting with /request, use the requestRouter
app.use("/",userRouter); // for all the routes starting with /user, use the userRouter
app.use("/", paymentRouter);
app.use("/", chatRouter);

const server = http.createServer(app);  // this app is the express app and we are creating a server using http module and passing the express app to it

initialiseSocket(server);


connectDb()
  .then(() => {
    console.log("Database Connected");
    server.listen(7777, () => {
      console.log("Server is running on port 7777...");
    });
  })
  .catch((err) => {
    console.log("Error in connecting database", err);
  });
