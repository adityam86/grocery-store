import crypto from 'crypto';
import razorpayInstance from '../../config/razorpay.js';

export const createOrder = async (amount, receiptId) => {
  try {
    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: "INR",
      receipt: receiptId
    };
    
    const order = await razorpayInstance.orders.create(options);
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

export const verifyPayment = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      throw new Error("Razorpay secret not configured");
    }
    
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");
      
    return expectedSignature === razorpay_signature;
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    throw error;
  }
};

export default { createOrder, verifyPayment };
