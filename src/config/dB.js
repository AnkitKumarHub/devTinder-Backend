const mongoose = require('mongoose');


const connectDb = async()=>{
    await mongoose.connect('mongodb+srv://velocityimmo:sqY3QVfEJfVd3d3L@users.pjcvm.mongodb.net/devTinder');
};

module.exports = connectDb;
