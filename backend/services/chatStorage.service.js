import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.resolve(__dirname, '../uploads/chat');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

class ChatStorageService {
  /**
   * Save an uploaded file to backend/uploads/chat.
   * Generates a unique filename using timestamp and random string.
   */
  async saveAttachment(file) {
    if (!file) throw new Error('No file provided for upload.');

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalExt = path.extname(file.originalname);
    const cleanBaseName = path.basename(file.originalname, originalExt).replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${cleanBaseName}-${uniqueSuffix}${originalExt}`;
    const destinationPath = path.join(UPLOAD_DIR, fileName);

    // Save Multer memory buffer to file (in case of memory storage) or rename file (if using disk storage)
    if (file.buffer) {
      await fs.promises.writeFile(destinationPath, file.buffer);
    } else if (file.path) {
      await fs.promises.rename(file.path, destinationPath);
    } else {
      throw new Error('Unsupported file upload structure.');
    }

    const attachmentUrl = `/uploads/chat/${fileName}`;

    return {
      attachmentUrl,
      fileName: file.originalname,
      storedFileName: fileName,
      fileSize: file.size,
      mimeType: file.mimetype
    };
  }

  /**
   * Delete a stored file from storage. Used for rollbacks and deletions.
   */
  async deleteAttachment(storedFileName) {
    if (!storedFileName) return;
    const targetPath = path.join(UPLOAD_DIR, storedFileName);
    try {
      if (fs.existsSync(targetPath)) {
        await fs.promises.unlink(targetPath);
      }
    } catch (error) {
      console.error(`Failed to delete attachment file: ${storedFileName}`, error);
    }
  }
}

export default new ChatStorageService();
