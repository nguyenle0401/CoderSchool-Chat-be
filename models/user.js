const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    toLower: true,
    required: true,
    unique: true,
  },
  token: String,
  room: {
    type: mongoose.Schema.ObjectId,
    ref: "Room",
  },
});

module.exports = mongoose.model("User", Schema);
