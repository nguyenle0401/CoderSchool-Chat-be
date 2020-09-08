const User = require("./user");
const Room = require("./room");
const Chat = require("./chat");

class Server {
  constructor(user) {
    this.user = user;
  }

  async joinRoom(roomID) {
    const room = await Room.findOne({ _id: roomID });
    if (!room) {
      throw new Error("Wrong room ID");
    }
    this.user.room = room;
    await this.user.save();
    return room;
  }

  async chat(message) {
    // insert a doc to Chat model;
    let chat = await Chat.create({
      chat: message,
      user: this.user._id,
      room: this.user.room._id,
    });
    chat = await Chat.findById(chat._id).populate("user");
    return chat;
  }

  static async checkUser(sid) {
    let user = await User.findOne({ token: sid }).populate("room");
    if (!user) throw new Error("User not found");
    return new Server(user);
  }

  static async login(name, sID) {
    //sID == token
    let user = await User.findOne({ name });
    if (!user) {
      user = await User.create({ name });
    }
    user.token = sID;
    await user.save();

    return user;
  }
}

module.exports = Server;
