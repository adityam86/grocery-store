import express from 'express';
import Stripe from 'stripe';
import Order from '../models/Order.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Initialize Stripe SDK if credentials are set
const stripeKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeKey ? new Stripe(stripeKey) : null;

// Create payment intent
router.post('/create-intent', verifyToken, async (req, res) => {
  try {
    const { amount } = req.body; // Amount in rupees

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    if (stripe) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // convert to paise / cents
        currency: 'inr',
        metadata: { userId: req.userId }
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        stripeActive: true
      });
    } else {
      // Mock gateway response for local sandbox environment
      res.json({
        clientSecret: `mock_secret_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        stripeActive: false,
        message: 'Stripe credentials not configured. Switched to mock sandbox checkout gateway.'
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error creating payment intent', error: error.message });
  }
});

// Update order payment status manually or via webhook check
router.post('/confirm', verifyToken, async (req, res) => {
  try {
    const { orderId, paymentId } = req.body;
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentStatus = 'Paid';
    order.paymentId = paymentId;
    await order.save();

    res.json({
      success: true,
      message: 'Payment confirmed and registered!',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Error confirming payment', error: error.message });
  }
});

export default router;
