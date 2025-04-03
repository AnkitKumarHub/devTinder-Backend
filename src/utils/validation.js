const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    throw new Error("All fields are required !!");
  }
  if (!validator.isEmail(email)) {
    throw new Error("Email is invalid !!");
  }
  if (!validator.isStrongPassword(password)) {
    throw new Error("Password is weak !!");
  }
};

const validateEditProfileData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "email",
    "age",
    "gender",
    "photoUrl",
    "about",
    "skills",
  ];
  // i will loop through the keys of the request body and check if they are in the allowedEditFields array
  const isEditAllowed = Object.keys(req.body).every((key) =>
    allowedEditFields.includes(key)
  );
  return isEditAllowed;
};

module.exports = {
  validateSignUpData,
  validateEditProfileData,
};
