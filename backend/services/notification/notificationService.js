import Notification from '../../models/Notification.js';

export const createNotification = async (userId, title, message, type) => {
  try {
    const notification = new Notification({
      user: userId,
      title,
      message,
      type: type || 'info'
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export default { createNotification };
