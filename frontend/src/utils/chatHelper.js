/**
 * Stable message normalization parser.
 * Maps both REST fetch and Socket.io payload schemas to a unified representation.
 * 
 * @param {Object} msg - Raw message payload.
 * @param {String} currentUserId - The authenticated user ID.
 * @returns {Object} - Normalized message with isMe check and stringified sender ID.
 */
export const normalizeMessage = (msg, currentUserId) => {
  if (!msg) return null;

  const senderId = msg.sender && typeof msg.sender === 'object'
    ? (msg.sender._id || msg.sender.id)
    : msg.sender;

  const senderStr = senderId ? senderId.toString() : '';
  const targetCurrentUserId = currentUserId ? currentUserId.toString() : '';

  return {
    ...msg,
    senderId: senderStr,
    isMe: senderStr === targetCurrentUserId,
    sender: msg.sender && typeof msg.sender === 'object' 
      ? msg.sender 
      : { _id: senderStr, name: msg.senderName || 'Student' }
  };
};
