import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true }, // Clerk ID
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  resume: { type: String, default: "" },
  image: { type: String, default: "" },
});

const User = mongoose.model("User", userSchema);
export default User;
