const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    room: {
        type: String,
        required:true,
        unique: true,
        trim:true
    }
})




module.exports = mongoose.model("Room", Schema)