import express from 'express';
import { 
  requestSwap, getSentRequests, getReceivedRequests, 
  acceptSwap, rejectSwap, cancelSwap,
  requestCompletion, acceptCompletion, rejectCompletion
} from '../controllers/swap.controller.js';
import protect from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { requestSwapSchema, swapIdSchema } from '../validations/swap.validation.js';

const router = express.Router();

// Apply protect middleware to all routes in this router
router.use(protect);

router.post('/request', validate(requestSwapSchema), requestSwap);
router.get('/sent', getSentRequests);
router.get('/received', getReceivedRequests);

router.patch('/:id/accept', validate(swapIdSchema), acceptSwap);
router.patch('/:id/reject', validate(swapIdSchema), rejectSwap);
router.delete('/:id/cancel', validate(swapIdSchema), cancelSwap);

router.patch('/:id/request-completion', validate(swapIdSchema), requestCompletion);
router.patch('/:id/accept-completion', validate(swapIdSchema), acceptCompletion);
router.patch('/:id/reject-completion', validate(swapIdSchema), rejectCompletion);

export default router;
