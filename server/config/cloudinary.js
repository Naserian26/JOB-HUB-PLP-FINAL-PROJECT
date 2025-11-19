import { v2 as cloudinary } from 'cloudinary'

const connectCloudinary = async () => {
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // match .env
        api_key: process.env.CLOUDINARY_API_KEY,       // match .env
        api_secret: process.env.CLOUDINARY_API_SECRET, // match .env
    });
}

export default connectCloudinary
