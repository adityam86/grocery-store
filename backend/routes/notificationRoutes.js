import express from 'express';
import { getNotifications, markAsRead } from '../controllers/notificationController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(verifyToken, getNotifications);

router.route('/:id/read')
  .put(verifyToken, markAsRead);

export default router;
