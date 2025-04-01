const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// this user schema bascially defines the user model and its properties

// so i can attach few methods onto this schema which is applicable for all the users => what are these method => these are helper method which are very closely related to the user
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First Name is required"],
    },
    lastName: {
      type: String,
      required: [true, "Last Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validator(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid !!" + value);
        }
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    age: {
      type: Number,
      min: [18, "You must be 18 or older"],
      max: [80, "You must be 100 or younger"],
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "others"].includes(value.toLowerCase())) {
          throw new Error("gender data is invalid !!");
        }
      },
    },
    photoUrl: {
      type: String,
    },
    about: {
      type: String,
      default: "Hey there! I am Using DevDinder",
    },
    skills: {
      type: [String],
    },
  },
  { timestamps: true }
);

//always use normal function instead of arrow function because arrow function does not have this keyword
userSchema.methods.getJWT = async function () {
  const user = this; // this refers to the user object

  const token = await jwt.sign({ _id: user._id }, "DEV@Dinder", {
    expiresIn: "1Day",
  });
  return token; 
};

userSchema.methods.validatePassword = async function (passwordInputByUser){
  const user = this;
  const passwordHash = user.password; // password from the user object

  const isPasswordVaid = await bcrypt.compare(passwordInputByUser, passwordHash);

  return isPasswordVaid;
}

module.exports = mongoose.model("User", userSchema);
