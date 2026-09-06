import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INVOICES_DIR = path.join(__dirname, '../invoices');

export const generateInvoicePDF = async (order) => {
  if (!fs.existsSync(INVOICES_DIR)) {
    fs.mkdirSync(INVOICES_DIR, { recursive: true });
  }

  const filePath = path.join(INVOICES_DIR, `${order.orderId}.pdf`);

  try {
    const PDFDocument = (await import('pdfkit')).default;
    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Header branding
    doc.fontSize(20).text('Apna Bazar Grocery Store', { align: 'center' });
    doc.fontSize(10).text('Premium Indian Grocery Delivery', { align: 'center' });
    doc.moveDown(1.5);

    // Invoice details
    doc.fontSize(12).text(`Invoice Number: INV-${order.orderId}`, { bold: true });
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.text(`Payment Status: ${order.paymentStatus}`);
    doc.text(`Payment ID: ${order.paymentId || 'N/A'}`);
    doc.moveDown();

    // Delivery details
    doc.text('Delivery Details:', { underline: true });
    doc.text(`Name: ${order.deliveryDetails.fullName}`);
    doc.text(`Phone: ${order.deliveryDetails.phone}`);
    doc.text(`Address: ${order.deliveryDetails.address}, PIN ${order.deliveryDetails.pinCode}`);
    doc.moveDown(1.5);

    // Items
    doc.fontSize(11).text('Items Purchased:', { bold: true });
    doc.moveDown(0.5);
    
    const tableTop = doc.y;
    doc.text('Item Name', 50, tableTop);
    doc.text('Qty', 280, tableTop, { width: 40, align: 'right' });
    doc.text('Rate', 340, tableTop, { width: 60, align: 'right' });
    doc.text('Total', 420, tableTop, { width: 80, align: 'right' });
    doc.moveDown(0.5);

    doc.moveTo(50, doc.y).lineTo(500, doc.y).stroke();
    doc.moveDown(0.5);

    order.items.forEach((item) => {
      const itemY = doc.y;
      doc.text(item.name, 50, itemY, { width: 220 });
      doc.text(item.quantity.toString(), 280, itemY, { width: 40, align: 'right' });
      doc.text(`Rs. ${item.price}`, 340, itemY, { width: 60, align: 'right' });
      doc.text(`Rs. ${item.price * item.quantity}`, 420, itemY, { width: 80, align: 'right' });
      doc.moveDown(0.5);
    });

    doc.moveTo(50, doc.y).lineTo(500, doc.y).stroke();
    doc.moveDown(0.5);

    doc.text(`Subtotal: Rs. ${order.subtotal}`, 340, doc.y, { width: 160, align: 'right' });
    let nextY = doc.y + 15;
    if (order.discountAmount && order.discountAmount > 0) {
      doc.text(`Discount (${order.promoCode}): -Rs. ${order.discountAmount}`, 300, nextY, { width: 200, align: 'right' });
      nextY += 15;
    }
    doc.text(`Shipping: Rs. ${order.shipping}`, 340, nextY, { width: 160, align: 'right' });
    doc.fontSize(13).text(`Grand Total: Rs. ${order.total}`, 320, nextY + 20, { width: 180, align: 'right', bold: true });

    doc.end();

    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => resolve(filePath));
      writeStream.on('error', reject);
    });
  } catch (error) {
    // Elegant fallback formatting if pdfkit is not installed/loaded
    const content = `
=========================================
      APNA BAZAR GROCERY STORE
=========================================
Invoice Number: INV-${order.orderId}
Order Date: ${new Date(order.createdAt).toLocaleDateString()}
Payment Status: ${order.paymentStatus}
Payment ID: ${order.paymentId || 'N/A'}

Delivery Details:
----------------
Name: ${order.deliveryDetails.fullName}
Phone: ${order.deliveryDetails.phone}
Address: ${order.deliveryDetails.address}, PIN ${order.deliveryDetails.pinCode}

Items Purchased:
----------------
${order.items.map(item => `- ${item.name} (${item.quantity}x) @ Rs.${item.price} = Rs.${item.price * item.quantity}`).join('\n')}

Subtotal: Rs. ${order.subtotal}
${order.discountAmount && order.discountAmount > 0 ? `Discount (${order.promoCode}): -Rs. ${order.discountAmount}\n` : ''}Shipping: Rs. ${order.shipping}
-----------------------------------------
Grand Total: Rs. ${order.total}
=========================================
Thank you for shopping at Apna Bazar!
    `;
    fs.writeFileSync(filePath, content, 'utf-8');
    return filePath;
  }
};
