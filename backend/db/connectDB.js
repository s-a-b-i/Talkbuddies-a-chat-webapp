import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const DB_NAME = process.env.DB_NAME;

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}` // Corrected the template literal usage
    );
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process with a failure
  }
};

export default connectDB;
