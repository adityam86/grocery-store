import express from 'express';
import { getDashboardStats } from '../controllers/analyticsController.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', verifyToken, verifyAdmin, getDashboardStats);

export default router;
