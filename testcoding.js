//server.js


import express from "express";

const app = express();
const PORT = process.env.PORT;

app.listen(PORT, async() => {
  console.log("server is running on port:"+ PORT)
  try {
    await connectDB();
    console.log("database connected")
  } catch (error) {
    console.error("error occured:" + error)
  }
})

























import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("connection host:" + conn.connection.host);
  } catch (error) {}
};
