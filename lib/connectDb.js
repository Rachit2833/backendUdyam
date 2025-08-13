// lib/db.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const connectDb = async () => {
  await mongoose.connect(process.env.DATA_BASE);
  console.log("DB Connection Success");
};

module.exports = { connectDb };
