import express from 'express';
import { getWishlist, toggleWishlist } from '../controllers/wishlistController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(verifyToken, getWishlist);

router.route('/toggle')
  .post(verifyToken, toggleWishlist);

export default router;
