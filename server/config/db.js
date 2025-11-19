import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`Database Connected: ${conn.connection.name}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });
};

export default connectDB;
