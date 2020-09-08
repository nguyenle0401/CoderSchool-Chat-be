const Server = require("../models/server");
const Chat = require("../models/chat");
const Room = require("../models/room");
const user = require("../models/user");
const { login } = require("../models/server");
const { model } = require("mongoose");

module.exports = function (io) {
  io.on("connection", async function (socket) {
    //fetch rooms
    socket.emit("rooms", await Room.find());
    //logins
    socket.on("login", async (name, res) => {
      console.log("Day la ne", name);
      const user = await Server.login(name, socket.id);
      return res(user);
    });

    // join room
    socket.on("joinRoom", async (roomID, res) => {
      try {
        // check user
        const user = await Server.checkUser(socket.id);

        // join room (DB)
        const room = await user.joinRoom(roomID);

        // subscribe user to the room
        socket.join(room._id);

        // send notification message;
        io.to(room._id).emit("message", {
          user: "system",
          message: `Welcome ${user.user.name} to room ${room.room}`,
        });

        const chatHistory = await Chat.find({ room: room._id })
          .populate("user")
          .sort("-createdAt")
          .limit(20);
        console.log(chatHistory);
        // return room info to client
        return res({
          status: "ok",
          data: { room: room, history: chatHistory },
        });
      } catch (err) {
        console.log(err);
        return res({ status: "error", message: err.message });
      }
    });

    // chat
    socket.on("sendMessage", async function (message) {
      const user = await Server.checkUser(socket.id);
      const chat = await user.chat(message);
      console.log(user.user.room);
      io.to(user.user.room._id).emit("message", chat);
    });

    // leave room
    socket.on("leaveRoom", async function (roomID) {
      socket.leave(roomID);
    });

    socket.on("disconnect", function () {
      io.emit("message", { user: "system", message: "someone left" });
    });
  });
};
