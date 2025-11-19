import express from "express";
import { getJobById, getJobs } from "../controller/jobController.js";

const router = express.Router();

// Get all jobs
router.get("/", getJobs);

// Get a single job by ID
router.get("/:id", getJobById);

export default router;
