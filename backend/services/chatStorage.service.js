import storageService from './storage.service.js';

class ChatStorageService {
  /**
   * Save an uploaded file to Cloudinary.
   * Utilizes the existing storageService Cloudinary configuration.
   */
  async saveAttachment(file) {
    if (!file) throw new Error('No file provided for upload.');

    // Determine Cloudinary resource type based on mimeType
    let resourceType = 'raw'; // Default for documents/files
    if (file.mimetype) {
      if (file.mimetype.startsWith('image/')) {
        resourceType = 'image';
      } else if (file.mimetype.startsWith('video/')) {
        resourceType = 'video';
      }
    }

    // Stream upload directly to Cloudinary
    const uploadResult = await storageService.saveAttachment(file.buffer, file.originalname, resourceType);

    return {
      attachmentUrl: uploadResult.secure_url,
      fileName: file.originalname,
      storedFileName: uploadResult.public_id, // Retain for rollback compatibility
      publicId: uploadResult.public_id,
      resource_type: uploadResult.resource_type,
      fileSize: file.size,
      mimeType: file.mimetype
    };
  }

  /**
   * Delete a stored file from Cloudinary (used for rollback).
   */
  async deleteAttachment(publicId, resourceType) {
    if (!publicId) return;
    try {
      await storageService.deleteFile(publicId, resourceType);
    } catch (error) {
      console.error(`Failed to delete Cloudinary chat file: ${publicId}`, error);
    }
  }
}

export default new ChatStorageService();
