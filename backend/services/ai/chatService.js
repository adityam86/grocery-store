// Mocking OpenAI for the Indian grocery store AI assistant
// import OpenAI from 'openai'; // Uncomment if OpenAI is configured

export const sendMessage = async (message, history = []) => {
  try {
    const systemPrompt = "You are a friendly and helpful AI assistant for Apna Bazar, an Indian grocery store. You help customers find Indian spices, lentils, snacks, and daily essentials.";
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock response
    if (message.toLowerCase().includes('recipe') || message.toLowerCase().includes('cook')) {
      return `Namaste! I can definitely help you with that recipe. Here are the ingredients you need:\n\n\`\`\`json\n{"recipe": true, "ingredients": [{"id": "p1", "name": "Daal", "quantity": 1}, {"id": "p12", "name": "Rice", "quantity": 1}, {"id": "p4", "name": "Ghee", "quantity": 1}]}\n\`\`\``;
    }
    return `Namaste! As Apna Bazar's assistant, I'd be happy to help you with your query: "${message}". We have a wide range of Indian groceries available for you.`;
  } catch (error) {
    console.error('Error in chat service:', error);
    throw new Error('Failed to send message to AI');
  }
};

export default { sendMessage };
