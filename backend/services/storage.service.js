import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root uploads folder path
const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Ensure uploads folder exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Validates the file buffer against common image magic number signatures (magic bytes).
 * Supports PNG and JPEG.
 * 
 * @param {Buffer} buffer - File buffer.
 * @returns {Boolean} - True if signature is valid.
 */
const isValidImageSignature = (buffer) => {
  if (!buffer || buffer.length < 4) return false;

  // PNG: 89 50 4e 47
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;

  // JPEG: ff d8 ff
  const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;

  return isPng || isJpeg;
};

/**
 * Storage Service.
 * Abstracts local filesystem saving/deletion.
 * Simplifies shifting storage to AWS S3, Cloudinary or other cloud providers later.
 */
class StorageService {
  /**
   * Save file buffer to local disk.
   * 
   * @param {Buffer} buffer - File buffer from multer.
   * @param {String} originalName - Original filename.
   * @returns {Promise<String>} - Public relative static URL.
   */
  async saveFile(buffer, originalName) {
    // 1. Verify byte signature
    if (!isValidImageSignature(buffer)) {
      throw new Error('Invalid file content: The file payload is not a valid PNG or JPEG image binary.');
    }

    // 2. Generate unique name
    const hash = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(originalName).toLowerCase() || '.jpg';
    const filename = `${hash}${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    // 3. Write file
    await fs.promises.writeFile(filePath, buffer);

    // 4. Return relative static URL
    return `/uploads/${filename}`;
  }

  /**
   * Delete file from local disk.
   * 
   * @param {String} relativePath - Relative static URL (e.g. /uploads/filename.jpg).
   */
  async deleteFile(relativePath) {
    if (!relativePath || !relativePath.startsWith('/uploads/')) return;

    const filename = relativePath.replace('/uploads/', '');
    const filePath = path.join(UPLOADS_DIR, filename);

    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      console.error(`Failed to delete storage file: ${filePath}`, error.message);
    }
  }
}

export default new StorageService();
