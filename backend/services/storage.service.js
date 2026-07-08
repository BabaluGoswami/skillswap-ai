import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Validates the file buffer against common image magic number signatures (magic bytes).
 * Supports PNG, JPEG, and WebP.
 * 
 * @param {Buffer} buffer - File buffer.
 * @returns {Boolean} - True if signature is valid.
 */
const isValidImageSignature = (buffer) => {
  if (!buffer || buffer.length < 12) return false;

  // PNG: 89 50 4e 47
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;

  // JPEG: ff d8 ff
  const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;

  // WebP: RIFF (bytes 0-3) and WEBP (bytes 8-11)
  const isWebp = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
                 buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;

  return isPng || isJpeg || isWebp;
};

/**
 * Storage Service.
 * Abstracts local filesystem saving/deletion, now fully integrated with Cloudinary.
 */
class StorageService {
  /**
   * Save file buffer to Cloudinary.
   * 
   * @param {Buffer} buffer - File buffer from multer.
   * @param {String} originalName - Original filename.
   * @returns {Promise<Object>} - Object containing secure_url and public_id.
   */
  async saveFile(buffer, originalName) {
    console.log("Cloudinary saveFile called");
    // 1. Verify byte signature
    if (!isValidImageSignature(buffer)) {
      throw new Error('Invalid file content: The file payload is not a valid PNG, JPEG, or WebP image binary.');
    }

    // 2. Stream buffer upload directly to Cloudinary
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'skillswap-ai/profile-images',
          resource_type: 'image',
          transformation: [
            { width: 500, height: 500, crop: 'fill', gravity: 'face', quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          console.log(error);
          console.log(result);
          if (error) {
            return reject(new Error(`Cloudinary upload failed: ${error.message}`));
          }
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id
          });
        }
      );
      uploadStream.end(buffer);
    });
  }

  /**
   * Delete file from Cloudinary using publicId.
   * 
   * @param {String} publicId - Cloudinary public_id.
   */
  async deleteFile(publicId) {
    if (!publicId) return;

    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error(`Failed to delete Cloudinary file: ${publicId}`, error.message);
    }
  }
}

export default new StorageService();
