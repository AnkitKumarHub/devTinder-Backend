const express = require("express");
// const { userAuth } = require("../middlewares/Auth");

const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/payment");
const { membershipAmount } = require("../utils/constants");
const { validateWebhookSignature } = require("razorpay/dist/utils/razorpay-utils");
const User = require("../models/user");
const { userAuth } = require("../middleware/Auth");

paymentRouter.post("/payment/create", userAuth, async(req, res) => {
    try{
        const {membershipType} = req.body;
        const {firstName, lastName, emailId} = req.user;

        const order = await razorpayInstance.orders.create({
            "amount" : membershipAmount[membershipType] * 100, //in paisa
            "currency" : "INR",
            "receipt": "receipt1",
            "partial_payment" : false,
            "notes" : {
                firstName,
                lastName,
                emailId,
                membershipType : membershipType,
            },
        });

        //SAVE IT IN MY DATABASE
        console.log(order);

        const payment = new Payment({
            userId: req.user._id,
            orderId: order.id,
            status: order.status,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
            notes: order.notes,
        });

        const savedPayment = await payment.save();

        //Return back my order details to frontend
        res.json({...savedPayment.toJSON(), keyId: process.env.TEST_KEY_ID});

    } catch (err)
    {
        return res.status(500).json({msg : err.message});
    }

});

// dont write the userAuth because razorpay will call this route
paymentRouter.post("/payment/webhook", async(req,res)=> {
    try {
        const webhookSignature = req.get("X-Razorpay-Signature");
        console.log("webhook Signature: ", webhookSignature);
        const isWebhookValid = validateWebhookSignature(
            JSON.stringify(req.body),
            webhookSignature,
            process.env.RAZORPAY_WEBHOOK_SECRET
        );

        if(!isWebhookValid)
        {
            return res.status(400).json({msg : "Webhook signature is valid"});
        }


        //update my payment status in DB
        const paymentDetails = req.body.payload.payment.entity;
        
        const payment = await Payment.findOne({
            orderId: paymentDetails.order_id,
        })

        payment.status = paymentDetails.status;
        await payment.save();

        //update the user as premium
        const user = await User.findOne({_id: payment.userId});
        user.isPremium = true;
        user.membershipType = payment.notes.membershipType;
        await user.save();
        // console.log(user);

        //return success requests to razorpay otherwise it will keep calling again and again
        // if(req.body.event == 'payment.captured')
        // {
        //     //success transaction
        // }
        // if(req.body.event == 'payment.failed')
        // {
        //     //success transaction
        // }

        return res.status(200).json({msg: "Webhook recieved successfully"})

    } catch(err) {

        return res.status(500).json({msg : err.message});

    };
});

paymentRouter.get("/premium/verify", userAuth, async(req, res) => {

    const user = req.user.toJSON();
    if(user.isPremium)
    {
        return res.json({...user });
    }
    return res.json({...user });
});

module.exports = paymentRouter;