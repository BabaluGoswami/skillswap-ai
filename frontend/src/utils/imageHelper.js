import { API_BASE_URL } from './config.js';

/**
 * Returns the fully resolved profile image URL with cache-busting.
 * Uses the user's updatedAt timestamp to ensure it only updates when changed.
 * 
 * @param {String} profileImage - Profile image path from database.
 * @param {String|Number} updatedAt - Timestamp representing last profile update.
 * @returns {String|null} - Resolved profile image URL or null.
 */
export const getProfileImageUrl = (profileImage, updatedAt) => {
  if (!profileImage) return null;
  
  // If it's a data URI (local preview), return it directly
  if (profileImage.startsWith('data:')) {
    return profileImage;
  }

  // Prepend backend base URL if it's a relative path (e.g. starting with /uploads/)
  const fullUrl = profileImage.startsWith('http') 
    ? profileImage 
    : `${API_BASE_URL}${profileImage}`;

  // Cache bust using user's update timestamp
  const version = updatedAt ? new Date(updatedAt).getTime() : '';
  return version ? `${fullUrl}?v=${version}` : fullUrl;
};

/**
 * Returns the fully resolved chat attachment URL.
 * 
 * @param {String} attachmentUrl - Attachment relative URL from database.
 * @returns {String|null} - Resolved attachment URL or null.
 */
export const getChatAttachmentUrl = (attachmentUrl) => {
  if (!attachmentUrl) return null;
  if (attachmentUrl.startsWith('data:')) {
    return attachmentUrl;
  }
  return attachmentUrl.startsWith('http')
    ? attachmentUrl
    : `${API_BASE_URL}${attachmentUrl}`;
};
