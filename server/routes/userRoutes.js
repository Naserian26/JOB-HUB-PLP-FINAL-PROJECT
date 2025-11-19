import express from "express";
import {
  applyForJob,
  getUserData,
  getUserJobApplications,
  updateUserResume,
  loginOrCreateUser,
} from "../controller/userController.js";
import upload from "../config/multer.js";

const router = express.Router();

router.post("/login", loginOrCreateUser);
router.get("/user", getUserData);
router.get("/applications", getUserJobApplications);
router.post("/apply", applyForJob);
router.post("/update-resume", upload.single("resume"), updateUserResume);

export default router;
