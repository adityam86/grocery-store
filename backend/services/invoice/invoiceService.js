export const generateInvoice = async (order) => {
  try {
    // Generate a mock PDF or string invoice and return a URL/path.
    const mockInvoiceUrl = `/invoices/invoice_${order.orderId || order._id || Date.now()}.pdf`;
    
    const invoiceContent = `
      ===================================
                  APNA BAZAR
      ===================================
      Order ID: ${order.orderId || order._id}
      Date: ${new Date().toLocaleDateString()}
      -----------------------------------
      Total Amount: ₹${order.totalAmount || 0}
      -----------------------------------
      Thank you for shopping with us!
    `;
    
    console.log(`Mock invoice generated: \n${invoiceContent}`);
    
    return mockInvoiceUrl;
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw error;
  }
};

export default { generateInvoice };
