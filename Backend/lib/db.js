import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    //exit with status of failure if (0) then success.
    process.exit(1);
  }
};
