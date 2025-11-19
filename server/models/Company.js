// In models/Company.js
import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    // Make image optional or remove it
    image: { type: String, required: false },  // Changed to false
    password: { type: String, required: true },
});

const Company = mongoose.model('Company', companySchema);

export default Company;