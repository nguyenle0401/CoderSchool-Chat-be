var express = require("express");
var router = express.Router();
const Room = require("../models/room");
//Get homepage
router.get("/rooms", async function (req, res, next) {
  let rooms = [
    { room: "Catalina", members: [] },
    { room: "Mojave", members: [] },
    { room: "Safari", members: [] },
    { room: "Sierra", members: [] },
  ];
  console.log("day la room", rooms);
  let result = await Room.insertMany(rooms);
  console.log(result);
  res.send(result);
});
module.exports = router;
