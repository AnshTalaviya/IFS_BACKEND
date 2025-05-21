const mongoose = require("mongoose")
require("dotenv").config()

mongoose.connect(process.env.MONGO_URI)

const db = mongoose.connection;

db.on('connected',()=>{
    console.log("database is connected")
})

module.exports = db
