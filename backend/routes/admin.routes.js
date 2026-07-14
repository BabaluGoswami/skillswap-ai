import express from 'express';
import {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getFeedbacks,
  updateFeedback,
  warnUser
} from '../controllers/admin.controller.js';
import protect from '../middlewares/auth.js';
import adminOnly from '../middlewares/admin.middleware.js';
import { getAdminReports, updateReport } from '../controllers/report.controller.js';

const router = express.Router();

// Apply global authentication & admin role guard to all routes
router.use(protect);
router.use(adminOnly);

// Dashboard routes
router.get('/dashboard', getDashboardStats);

// User management routes
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', updateUserStatus);
router.patch('/users/:id/warn', warnUser);
router.delete('/users/:id', deleteUser);

// Feedback management routes
router.get('/feedback', getFeedbacks);
router.patch('/feedback/:id', updateFeedback);

// Reports management routes
router.get('/reports', getAdminReports);
router.patch('/reports/:id', updateReport);

export default router;
