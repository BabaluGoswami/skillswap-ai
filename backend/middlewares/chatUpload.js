import multer from 'multer';

// Use memory storage so we can validate and write file atomically inside service/controller
const storage = multer.memoryStorage();

const chatUpload = multer({
  storage,
  limits: {
    // Upper bound corresponding to the maximum video size limit (25 MB)
    fileSize: 25 * 1024 * 1024
  }
});

export default chatUpload;
