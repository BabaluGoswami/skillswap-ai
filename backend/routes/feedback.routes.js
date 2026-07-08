import express from 'express';
import { createFeedback, getMyFeedback } from '../controllers/feedback.controller.js';
import protect from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import upload from '../middlewares/multer.js';
import { createFeedbackSchema } from '../validations/feedback.validation.js';

const router = express.Router();

// Submit new feedback (supports optional screenshot file upload)
router.post(
  '/',
  protect,
  upload.single('screenshot'),
  (req, res, next) => {
    // Parse JSON-like fields so Zod can validate them correctly
    next();
  },
  validate(createFeedbackSchema),
  createFeedback
);

// Get current user's paginated feedback submissions
router.get('/my', protect, getMyFeedback);

export default router;
