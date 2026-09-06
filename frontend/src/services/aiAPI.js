import { API_BASE_URL } from '../constants/api';
import { storage } from '../utils/localStorage';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${storage.getToken()}`,
});

export const aiAPI = {
  sendMessage: async (message, history = []) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ message, history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'AI request failed');
      return data;
    } catch {
      // Rule-based fallback response
      return { reply: generateRuleBasedResponse(message) };
    }
  },
};

// Simple rule-based fallback when AI backend isn't available
function generateRuleBasedResponse(message) {
  const msg = message.toLowerCase();
  if (msg.includes('atta') || msg.includes('flour')) {
    return "We carry premium Aashirvaad and Shakti Bhog Atta in 5kg and 10kg packs. Our whole wheat atta is stone-ground for authentic taste! 🌾";
  }
  if (msg.includes('rice') || msg.includes('basmati')) {
    return "Our Basmati rice selection includes India Gate Classic, Kohinoor, and Dawat aged varieties. Perfect for biryani and pulao! 🍚";
  }
  if (msg.includes('spice') || msg.includes('masala')) {
    return "Our spice collection features hand-selected Kashmiri chillies, turmeric from Erode, and MDH blended masalas. Fresh and aromatic! 🌶️";
  }
  if (msg.includes('delivery') || msg.includes('shipping')) {
    return "We offer same-day dispatch for orders placed before 2 PM. Free delivery on orders above ₹500! 🚀";
  }
  if (msg.includes('return') || msg.includes('refund')) {
    return "We offer a 100% quality guarantee. If any product doesn't meet your expectations, we'll issue a full refund within 48 hours. 💚";
  }
  if (msg.includes('paneer') || msg.includes('dairy')) {
    return "Our fresh paneer, dahi (curd), and pure cow ghee are sourced daily from trusted dairy farms. Chilled and delivered fresh! 🥛";
  }
  if (msg.includes('chai') || msg.includes('tea') || msg.includes('coffee')) {
    return "Try our premium Darjeeling first flush tea, Assam CTC, or Kerala cardamom coffee blends. Perfect for your morning ritual! ☕";
  }
  if (msg.includes('discount') || msg.includes('offer') || msg.includes('coupon')) {
    return "Use code WELCOME10 for 10% off your first order! We also run weekly deals on featured products. 🎉";
  }
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('namaste')) {
    return "Namaste! 🙏 Welcome to Apna Bazar. I'm your grocery assistant. Ask me about products, delivery, or anything else I can help with!";
  }
  return "I'm here to help you find the best Indian groceries! Ask me about specific products, delivery info, or recommendations for any dish you're planning to cook. 🍛";
}
