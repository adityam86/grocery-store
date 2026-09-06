import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Read configuration from environment variables
const emailUser = process.env.EMAIL_USER || '';
const emailPass = process.env.EMAIL_PASS || '';
const twilioSid = process.env.TWILIO_ACCOUNT_SID || '';
const twilioAuth = process.env.TWILIO_AUTH_TOKEN || '';
const twilioNumber = process.env.TWILIO_PHONE_NUMBER || '';

let mailTransporter = null;
if (emailUser && emailPass) {
  mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
}

let twilioClient = null;
if (twilioSid && twilioAuth) {
  twilioClient = twilio(twilioSid, twilioAuth);
}

export const sendOrderStatusNotification = async (order, userEmail, userPhone) => {
  const statusMsg = `Namaste ${order.deliveryDetails.fullName}, your order ${order.orderId} status has changed to: ${order.status}. Thank you for shopping with Apna Bazar!`;

  // Log notification to server console for auditing
  console.log(`[Notification Broadcast]: ${statusMsg}`);

  // Send Email alert
  if (mailTransporter && userEmail) {
    try {
      await mailTransporter.sendMail({
        from: `"Apna Bazar" <${emailUser}>`,
        to: userEmail,
        subject: `Apna Bazar Order Status Update: ${order.orderId}`,
        text: statusMsg,
        html: `<p><strong>Namaste ${order.deliveryDetails.fullName}</strong>,</p>
               <p>Your order <strong>${order.orderId}</strong> status has been updated to: <strong>${order.status}</strong>.</p>
               <p>We are dispatching it with premium care.</p>
               <p>Dhanyavaad,<br/>Apna Bazar Team</p>`
      });
      console.log(`Email notification sent to ${userEmail}`);
    } catch (err) {
      console.error(`Email delivery error: ${err.message}`);
    }
  }

  // Send SMS alert
  if (twilioClient && twilioNumber && userPhone) {
    try {
      await twilioClient.messages.create({
        body: statusMsg,
        from: twilioNumber,
        to: userPhone
      });
      console.log(`SMS notification sent to ${userPhone}`);
    } catch (err) {
      console.error(`SMS delivery error: ${err.message}`);
    }
  }
};
