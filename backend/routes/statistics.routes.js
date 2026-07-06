import express from 'express';
import { getPlatformStatistics } from '../controllers/statistics.controller.js';

const router = express.Router();

// Public route for landing page statistics
router.get('/', getPlatformStatistics);

export default router;
