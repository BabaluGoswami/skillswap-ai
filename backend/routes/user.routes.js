import express from 'express';
import { getProfile, updateProfile, addSkillToTeach, getMatches } from '../controllers/user.controller.js';
import protect from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import upload from '../middlewares/multer.js';
import { addSkillSchema, updateProfileSchema } from '../validations/user.validation.js';

const router = express.Router();

// GET matches endpoint
router.get('/matches', protect, getMatches);

// GET profile endpoint
router.get('/profile', protect, getProfile);

// PUT profile update endpoint (supporting multipart form-data for profileImage)
router.put(
  '/profile', 
  protect, 
  upload.single('profileImage'), 
  (req, res, next) => {
    console.log("PUT /api/users/profile route matched");
    // Parse body parameters so Zod validation middleware can inspect them
    // (since multer doesn't feed form-data fields into JSON format directly before validation)
    next();
  }, 
  validate(updateProfileSchema), 
  updateProfile
);

// PUT add skill to teach endpoint
router.put('/skills/teach', protect, validate(addSkillSchema), addSkillToTeach);

export default router;
