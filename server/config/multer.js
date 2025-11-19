// backend/config/multer.js

import multer from 'multer';

// This configuration tells multer to store uploaded files in memory (as a buffer)
// instead of writing them to the server's disk. This is more efficient and secure.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Optional: Limit file size to 5MB
  },
});

export default upload;