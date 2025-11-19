import User from "../models/User.js";
import JobApplication from "../models/JobApplication.js";
import Job from "../models/Job.js";
import { getAuth, clerkClient } from "@clerk/express";
import { v2 as cloudinary } from "cloudinary";

// Ensure Cloudinary is configured in your server entry point (e.g., app.js)
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });

/*************** User Authentication & Management ***************/

// Login or create user in MongoDB
export const loginOrCreateUser = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId);
      user = new User({
        clerkId: userId,
        name: `${clerkUser.firstName} ${clerkUser.lastName}`,
        email: clerkUser.emailAddresses[0].emailAddress,
        image: clerkUser.profileImageUrl || "",
      });
      await user.save();
      console.log("New user created:", user);
    }

    res.json({ success: true, message: "Login successful", user });
  } catch (err) {
    console.error("loginOrCreateUser error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get logged-in user data
export const getUserData = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const user = await User.findOne({ clerkId: userId });
    res.json({ success: true, user: user || null });
  } catch (err) {
    console.error("getUserData error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/*************** Job Applications ***************/

// Get user's job applications
export const getUserJobApplications = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const user = await User.findOne({ clerkId: userId });
    if (!user) return res.json({ success: true, applications: [] });

    const applications = await JobApplication.find({ userId: user._id })
      .populate("companyId", "name email image")
      .populate("jobId", "title description location level salary");

    res.json({ success: true, applications });
  } catch (err) {
    console.error("getUserJobApplications error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Apply for a job
export const applyForJob = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const user = await User.findOne({ clerkId: userId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ success: false, message: "Job ID is required" });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    if (!job.companyId) return res.status(400).json({ success: false, message: "Job does not have a companyId" });

    const alreadyApplied = await JobApplication.findOne({ userId: user._id, jobId });
    if (alreadyApplied) return res.status(400).json({ success: false, message: "Already applied" });

    const application = new JobApplication({
      userId: user._id,
      jobId,
      companyId: job.companyId,
      date: Date.now(),
      status: "pending",
    });

    await application.save();
    res.json({ success: true, message: "Job applied successfully", application });
  } catch (err) {
    console.error("applyForJob error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/*************** Resume Upload with Cloudinary (CORRECTED) ***************/

// Update resume

/*************** Resume Upload with Cloudinary (DEBUG VERSION) ***************/

// In backend/controller/userController.js

// In backend/controller/userController.js

// In backend/controller/userController.js

// In backend/controller/userController.js

// Update resume
export const updateUserResume = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const user = await User.findOne({ clerkId: userId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    // 1. Upload the file to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "resumes",
          resource_type: "raw",
          public_id: `${user.clerkId}_resume.pdf`, // Give it a .pdf name
        },
        (error, uploadResult) => {
          if (error) return reject(error);
          resolve(uploadResult);
        }
      ).end(req.file.buffer);
    });

    // 2. Build the URL using the most explicit SDK parameters
    const { utils } = cloudinary;

    const viewableUrl = utils.api.url(result.public_id, {
      resource_type: 'raw',
      format: 'pdf',             // This explicitly sets the Content-Type to application/pdf
      secure: true,
      disposition: 'inline'        // This explicitly sets the Content-Disposition to inline
    });

    // 3. Save the new, correct URL to the database
    user.resume = viewableUrl;
    user.updatedAt = Date.now();
    await user.save();

    console.log("Database updated with the FINAL correct URL:", viewableUrl);

    res.json({ success: true, message: "Resume updated successfully", resume: user.resume });
  } catch (err) {
    console.error("updateUserResume error:", err);
    res.status(500).json({ success: false, message: "Server error during resume upload." });
  }
};