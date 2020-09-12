const Server = require("../models/server");
const Chat = require("../models/chat");
const Room = require("../models/room");
const User = require("../models/user");
const { login } = require("../models/server");
const { model } = require("mongoose");
const room = require("../models/room");

module.exports = function (io) {
  io.on("connection", async function (socket) {
    //fetch rooms
    let rooms = await Room.find().populate("members");

    // await Promise.all(promises);
    socket.emit("rooms", rooms);
    //fecth users
    socket.emit("users", await User.find().sort({ updatedAt: -1 }));

    //logins
    socket.on("login", async (name, res) => {
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

        const rooms = await Room.find().populate("members");
        io.emit("rooms", rooms);
        // send notification message;
        io.to(room._id).emit("message", {
          user: {
            name: "System",
          },
          chat: `Welcome ${user.user.name} to room ${room.room}`,
        });
        const chatHistory = await Chat.find({ room: room._id })
          .populate("user")
          .sort("-createdAt")
          .limit(20);
        chatHistory.unshift({
          user: {
            name: "System",
          },
          chat: `You have joined room: ${room.room}.`,
        });
        socket.emit("chatHistory", chatHistory);
        // return room info to client
        return res({ status: "ok", data: { room: room } });
      } catch (err) {
        return res({ status: "error", message: err.message });
      }
    });
    // chat
    socket.on("sendMessage", async function (message) {
      const user = await Server.checkUser(socket.id);
      const chat = await user.chat(message);
      io.to(user.user.room._id).emit("message", chat);
    });
    // leave room
    socket.on("leaveRoom", async function (roomID) {
      socket.leave(roomID);
    });

    //disconnect
    socket.on("disconnect", async function () {
      const user = await Server.checkUser(socket.id);
      socket.to(user.user.room._id).broadcast.emit("message", {
        user: {
          name: "system",
        },
        chat: `${user.user.name} left`,
      });
      user.user.room = null;
      await user.user.save();
      socket.leave(user.user.room);
      const rooms = await Room.find().populate("members");
      io.emit("rooms", rooms);
    });
  });
};
