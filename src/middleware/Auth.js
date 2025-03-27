const adminAuth = (req, res, next) => {
  const token = "xyz";
  const isAdminAuthorized = token === "xyz";
  if (!isAdminAuthorized) {
    res.status(401).send("Not Authorized");
  }
  next();
};

const userAuth = (req, res, next) => {
  const token = "xyz";
  const isUserAuthorized = token === "xyz";
  if (!isUserAuthorized) {
    res.status(401).send("Not Authorized");
  }
  next();
};

module.exports = { adminAuth, userAuth };
