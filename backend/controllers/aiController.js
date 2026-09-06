import { sendMessage as chatServiceSendMessage } from '../services/ai/chatService.js';

export const sendMessage = async (req, res) => {
  try {
    const { message, history } = req.body;
    const reply = await chatServiceSendMessage(message, history);
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
