const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aashishk4568@gmail.com',
    pass: process.env.MAIL_SECRET, // from App Passwords (no spaces)
  },
});

const sendConnectionEmail = async (sender, recieverMail, status, sub, body) => {
    if(status === "interested")
    {
     
      const subject = sub
      const html = body
       

      await transporter.sendMail({
        from: `"DevTinder 💘" <aashishk4568@gmail.com>`,
        to: recieverMail,
        subject,
        html,
      });
      // console.log("sent");
    }
  
  };
  
  module.exports = sendConnectionEmail;