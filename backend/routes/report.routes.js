import express from 'express';
import { 
  createReport, 
  getMyReports, 
  getUserNotifications,
  clearUserNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../controllers/report.controller.js';
import protect from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

// General User Report Operations
router.post('/', protect, upload.single('screenshot'), createReport);
router.get('/my', protect, getMyReports);

// Notification Operations
router.get('/notifications', protect, getUserNotifications);
router.delete('/notifications', protect, clearUserNotifications);
router.patch('/notifications/:id', protect, markNotificationRead);
router.patch('/notifications', protect, markAllNotificationsRead);

export default router;
