import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';
import { generateInvoicePDF } from '../utils/invoiceGenerator.js';
import { sendOrderStatusNotification } from '../utils/notifications.js';

const router = express.Router();

// Place a new order
router.post('/', verifyToken, async (req, res) => {
  try {
    const { items, deliveryDetails, subtotal, shipping, total, paymentStatus, paymentId, discountAmount, promoCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cannot place an empty order' });
    }

    if (!deliveryDetails || !deliveryDetails.fullName || !deliveryDetails.phone || !deliveryDetails.address || !deliveryDetails.pinCode) {
      return res.status(400).json({ message: 'Delivery details are incomplete' });
    }

    // Verify stock levels first before saving
    for (const item of items) {
      const product = await Product.findById(item.productId || item.id);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}` });
      }
    }

    // Decrement stock levels
    for (const item of items) {
      const product = await Product.findById(item.productId || item.id);
      product.stockQuantity -= item.quantity;
      if (product.stockQuantity <= 0) {
        product.stockQuantity = 0;
        product.inStock = false;
      }
      await product.save();
    }

    const orderId = `AB-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder = new Order({
      orderId,
      userId: req.userId,
      items: items.map(i => ({
        productId: i.productId || i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        unit: i.unit
      })),
      deliveryDetails,
      subtotal,
      shipping,
      discountAmount: discountAmount || 0,
      promoCode: promoCode || '',
      total,
      paymentStatus: paymentStatus || 'Pending',
      paymentId: paymentId || '',
      status: 'Placed'
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: newOrder
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while placing order', error: error.message });
  }
});

// Retrieve orders (verifyAdmin views all, Users view theirs)
router.get('/', verifyToken, async (req, res) => {
  try {
    let query = {};
    if (req.userRole !== 'admin') {
      query.userId = req.userId;
    } else {
      const { userId } = req.query;
      if (userId) {
        query.userId = userId;
      }
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving orders', error: error.message });
  }
});

// verifyAdmin Route: Update order status
router.put('/:orderId/status', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOne({ orderId: req.params.orderId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    // Trigger email/SMS notification to customer
    try {
      const customer = await User.findById(order.userId);
      if (customer) {
        sendOrderStatusNotification(order, customer.email, order.deliveryDetails.phone);
        if (status === 'Shipped' || status === 'Out for Delivery' || status === 'Delivered') {
          const { sendOrderStatusSMS } = await import('../services/notification/twilioService.js');
          sendOrderStatusSMS(order.deliveryDetails.phone, order.orderId, status);
        }
      }
    } catch (notifyErr) {
      console.error(`Failed dispatching update alert: ${notifyErr.message}`);
    }

    res.json({
      success: true,
      message: 'Order status updated successfully!',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
});

// Get Invoice receipt document
router.get('/:orderId/invoice', verifyToken, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.userRole !== 'admin' && order.userId !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized invoice access' });
    }

    const filePath = await generateInvoicePDF(order);
    res.download(filePath, `invoice-${order.orderId}.pdf`);
  } catch (error) {
    res.status(500).json({ message: 'Error generating invoice', error: error.message });
  }
});

// Get single order details (for tracking)
router.get('/:orderId', verifyToken, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.userRole !== 'admin' && order.userId !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized order tracking access' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving order status', error: error.message });
  }
});

export default router;
