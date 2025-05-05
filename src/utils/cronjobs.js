const cron = require('node-cron');
const ConnectionRequestModel = require('../models/connectionRequest');

const { subDays, startOfDay, endOfDay } = require('date-fns'); //subDays => subtract day
const sendConnectionEmail = require('./mailer');

//this job will run at 8 am every morning
cron.schedule('00 08 * * *', async () => {
  // Send emails to all people who got requests the previous day

  try {
    const yesterday = subDays(new Date(), 1);
    // const today = new Date();

    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);
    // console.log(yesterdayEnd);

    const pendingRequests = await ConnectionRequestModel.find({
      status: 'interested',
      createdAt: {
        $gte: yesterdayStart, //greater than
        $lt: yesterdayEnd, //less than
      },
    }).populate('fromUserId toUserId');

    // console.log(pendingRequests);

    // Group requests by recipient
    const requestsByUser = {};
    pendingRequests.forEach(req => {
      const email = req.toUserId?.emailId;
      if (!email) return;

      if (!requestsByUser[email]) {
        requestsByUser[email] = [];
      }
      requestsByUser[email].push(req.fromUserId.firstName);
    });

    for (const [email, senders] of Object.entries(requestsByUser)) {
      const capitalizedSenders = [...new Set(senders)].map(name => {
        const first = name.split(' ')[0];
        return first.charAt(0).toUpperCase() + first.slice(1);
      });

      const namesString = capitalizedSenders.join(', ');

      const subject = '⏳ You Have Pending Connection Requests!';

      const body = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fff0f5; padding: 30px; border-radius: 12px; border: 1px solid #f3d1e4; max-width: 600px; margin: auto;">
          <h1 style="text-align: center; color: #d63384;">💖 Reminder: Pending Requests</h1>
          <p style="font-size: 18px; color: #333; text-align: center;">
            ${namesString} showed interest in you yesterday on <strong>DevTinder</strong>!
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://dev-tinder-delta-one.vercel.app/" style="background-color: #d63384; color: white; text-decoration: none; padding: 12px 25px; border-radius: 25px; font-size: 16px;">
              Check Now 💌
            </a>
          </div>

          <p style="font-size: 16px; color: #555; text-align: center;">
            Let the sparks fly! 🔥 Don’t miss the chance to respond.
          </p>

          <hr style="margin: 40px 0; border: none; border-top: 1px solid #f3d1e4;" />

          <p style="font-size: 14px; color: #999; text-align: center;">
            This reminder was sent automatically by <strong>DevTinder</strong>. Need help? Reach out at
            <a href="mailto:support@devtinder.com" style="color: #d63384;">support@devtinder.com</a>
          </p>
        </div>
      `;

      await sendConnectionEmail(
        'DevTinder',
         email,
        'interested',
        subject,
        body
      );
    }

    console.log('Daily reminder emails sent.');
  } catch (err) {
    console.error('Error sending daily reminder emails:', err.message);
  }
});