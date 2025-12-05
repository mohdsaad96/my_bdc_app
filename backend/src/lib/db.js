import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB Atlas...");
    const mongoURI = process.env.MONGODB_URI;
    console.log("MONGODB_URI exists:", !!mongoURI);
    if (mongoURI) {
      console.log("Full URI:", mongoURI);
    }
    const conn = await mongoose.connect(mongoURI, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("❌ MongoDB connection error:", error.message);
  }
};
