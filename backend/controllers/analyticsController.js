import User from '../models/User.js';
import Order from '../models/Order.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    const orders = await Order.find({ paymentStatus: 'Paid' });
    const revenue = orders.reduce((acc, order) => acc + order.total, 0);

    res.json({
      totalUsers,
      totalOrders,
      revenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
