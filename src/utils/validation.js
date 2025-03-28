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

module.exports = {
  validateSignUpData,
};
