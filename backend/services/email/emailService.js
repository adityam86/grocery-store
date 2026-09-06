import transporter from '../../config/email.js';

export const sendWelcomeEmail = async (to, name) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Apna Bazar" <noreply@apnabazar.com>',
      to,
      subject: 'Welcome to Apna Bazar!',
      text: `Namaste ${name},\n\nWelcome to Apna Bazar! We are excited to have you on board for all your Indian grocery needs.\n\nHappy Shopping!`,
      html: `<h3>Namaste ${name},</h3><p>Welcome to <strong>Apna Bazar</strong>! We are excited to have you on board for all your Indian grocery needs.</p><p>Happy Shopping!</p>`
    };
    
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

export const sendOrderConfirmation = async (to, order) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Apna Bazar" <noreply@apnabazar.com>',
      to,
      subject: `Order Confirmation - ${order.orderId || order._id}`,
      text: `Thank you for your order!\n\nYour order has been successfully placed. Order ID: ${order.orderId || order._id}\nTotal Amount: ₹${order.totalAmount}\n\nWe will notify you once it is dispatched.`,
      html: `<h3>Thank you for your order!</h3><p>Your order has been successfully placed.</p><p><strong>Order ID:</strong> ${order.orderId || order._id}</p><p><strong>Total Amount:</strong> ₹${order.totalAmount}</p><p>We will notify you once it is dispatched.</p>`
    };
    
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

export default { sendWelcomeEmail, sendOrderConfirmation };
