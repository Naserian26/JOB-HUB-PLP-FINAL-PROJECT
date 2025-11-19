import express from "express";
import cors from "cors";
import 'dotenv/config';
import connectDB from "./config/db.js";
import * as Sentry from "@sentry/node";
import connectCloudinary from './config/cloudinary.js';
import companyRoutes from './routes/companyRoutes.js';
import JobRoutes from './routes/jobRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import { clerkWebhooks } from './controller/webhooks.js';

const app = express();

// Connect to DB and Cloudinary
await connectDB();
await connectCloudinary();

// Middleware
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// Routes
app.get("/", (req, res) => res.send("API Working"));
app.use('/api/company', companyRoutes);
app.use('/api/jobs', JobRoutes);
app.use('/api/users', userRoutes);
app.post('/webhooks', clerkWebhooks);

// Sentry
Sentry.setupExpressErrorHandler(app);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
