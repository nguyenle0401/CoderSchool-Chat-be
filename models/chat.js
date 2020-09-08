const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    chat: String,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    room: {
      type: mongoose.Schema.ObjectId,
      ref: "Room",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Chat", Schema);
