const socket = require("socket.io");
const crypto = require("crypto"); //for hashing roomId
const { Chat } = require("../models/chat");
const ConnectionRequestModel = require("../models/connectionRequest");
const { timeStamp } = require("console");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const initialiseSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: [
        "dev-tinder-pied-seven.vercel.app",
        "http://localhost:5173",
      ],
    },
  });

  io.on("connection", (socket) => {
    //handle events

    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      //create a separate room with a unique id for each user pair (Ankit - Ravi => Ravi - Ankit)
      // const roomId = [userId, targetUserId].sort().join("_"); //we need to sort this to make the roomId same

      const roomId = getSecretRoomId(userId, targetUserId);

      console.log(firstName + " Joined Room :" + roomId);
      socket.join(roomId);
    });

    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetUserId, text }) => {
        //Save messages to the database
        try {
          //Check if userId & targetUserId are friends
          // Check if users are friends (both directions)
          const connection = await ConnectionRequestModel.findOne({
            $or: [
              {
                fromUserId: userId,
                toUserId: targetUserId,
                status: "accepted",
              },
              {
                fromUserId: targetUserId,
                toUserId: userId,
                status: "accepted",
              },
            ],
          });

          if (!connection) {
            throw new Error("Users are not connected. Cannot send message.");
          }

          const roomId = getSecretRoomId(userId, targetUserId);
          console.log(firstName + " " + text);

          //case 1: it can be the first ever message
          //case 2: it can be the message in existing chat
          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] }, //i want to find an entry in db where the participants are userId and targetUserId {this is to make db and code extensible => i can also add third user id in case of forming groups}
          });

          if (!chat) {
            //create new chat if it is not present
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          } 

          chat.messages.push({
            senderId: userId,
            text,
          });

          await chat.save();

          io.to(roomId).emit("messageReceived", { firstName, lastName, text });
        } catch (err) {
          console.log(err.message);
        }
      }
    );

    socket.on("disconnect", () => {});
  });
};

module.exports = initialiseSocket;
