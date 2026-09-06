import express from 'express';
import { getProductReviews, addReview } from '../controllers/reviewController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/:productId')
  .get(getProductReviews)
  .post(verifyToken, addReview);

export default router;
