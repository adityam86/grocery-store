import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw, ShoppingCart, Plus } from 'lucide-react';
import { aiAPI } from '../../services/aiAPI';
import { useTheme } from '../../hooks/useTheme';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';

const QUICK_QUESTIONS = [
  'What Basmati rice do you have?',
  'Tell me about your spice collection',
  'How does delivery work?',
  'Best chai brands?',
  'Do you have organic products?',
  'Any current offers or discounts?',
];

const AIAssistantPage = () => {
  const { currentTheme, themeObj } = useTheme();
  const isNight = currentTheme === 'midnight';
  const dispatch = useDispatch();
  
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Namaste! 🙏 I\'m your Apna Bazar AI grocery assistant. Ask me anything about our products, delivery, or get personalized recommendations for your Indian cooking needs!'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;
    const userMsg = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const data = await aiAPI.sendMessage(text.trim(), history);
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'I\'m having trouble connecting. Please try again! 🌟' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(inputMessage); }
  };

  const parseMessage = (content) => {
    if (!content) return { textContent: '', recipeData: null };
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      try {
        const recipeData = JSON.parse(jsonMatch[1]);
        const textContent = content.replace(/```json\n[\s\S]*?\n```/, '').trim();
        return { textContent, recipeData };
      } catch (e) {
        return { textContent: content, recipeData: null };
      }
    }
    return { textContent: content, recipeData: null };
  };

  const addRecipeToCart = (recipeData) => {
    if (!recipeData || !recipeData.ingredients) return;
    recipeData.ingredients.forEach(item => {
      dispatch(addToCart({
        id: item.id,
        name: item.name,
        price: 50, // Mock price for missing items
        quantity: item.quantity || 1,
        image: 'https://images.unsplash.com/photo-1596647181657-37c223cbac67?w=500&q=80',
        unit: 'unit'
      }));
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:px-8">
      {/* Page Header */}
      <div className={`relative rounded-[28px] overflow-hidden p-6 mb-6 bg-gradient-to-r ${themeObj.gradient} border ${isNight ? 'border-neutral-800' : 'border-neutral-200/50'}`}>
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-saffron-500/10 rounded-full blur-2xl" />
        <div className="relative z-10 flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${isNight ? 'bg-neutral-800' : 'bg-white'}`}>🤖</div>
          <div>
            <h1 className={`text-xl font-extrabold ${isNight ? 'text-white' : 'text-neutral-900'}`}>AI Grocery Assistant</h1>
            <p className="text-xs text-neutral-400 font-medium mt-0.5">Powered by intelligent grocery knowledge • Ask me anything!</p>
          </div>
          <div className="ml-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
            </span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className={`rounded-[28px] border overflow-hidden shadow-sm ${isNight ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-100'}`}>
        {/* Messages */}
        <div className="h-[480px] overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => {
            const { textContent, recipeData } = parseMessage(msg.content);
            return (
            <div key={idx} className={`flex items-start gap-3 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm font-bold ${
                msg.role === 'user'
                  ? `text-white ${themeObj.primary.split(' ')[0]}`
                  : isNight ? 'bg-neutral-700 text-neutral-200' : 'bg-neutral-100 text-neutral-600'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : '🤖'}
              </div>
              
              <div className={`max-w-[75%] flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? `text-white rounded-tr-sm ${themeObj.primary.split(' ')[0]}`
                    : isNight ? 'bg-neutral-800 text-neutral-100 rounded-tl-sm' : 'bg-neutral-50 text-neutral-800 rounded-tl-sm border border-neutral-100'
                }`}>
                  {textContent}
                </div>

                {recipeData && recipeData.recipe && (
                  <div className={`mt-1 p-4 rounded-xl border ${isNight ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'} shadow-sm max-w-sm w-full`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-saffron-500" />
                      <h4 className={`text-sm font-bold ${isNight ? 'text-white' : 'text-neutral-900'}`}>Recipe Ingredients</h4>
                    </div>
                    <ul className="space-y-2 mb-4">
                      {recipeData.ingredients.map((ing, i) => (
                        <li key={i} className="flex justify-between items-center text-xs">
                          <span className={isNight ? 'text-neutral-300' : 'text-neutral-600'}>{ing.name}</span>
                          <span className={`px-2 py-0.5 rounded font-medium ${isNight ? 'bg-neutral-700 text-neutral-300' : 'bg-neutral-100 text-neutral-600'}`}>x{ing.quantity}</span>
                        </li>
                      ))}
                    </ul>
                    <button 
                      onClick={() => addRecipeToCart(recipeData)}
                      className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold text-white transition-all active:scale-95 ${themeObj.primary.split(' ').slice(0,2).join(' ')} hover:opacity-90`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Add All to Cart
                    </button>
                  </div>
                )}
              </div>
            </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-3 animate-fade-in">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${isNight ? 'bg-neutral-700' : 'bg-neutral-100'}`}>🤖</div>
              <div className={`px-4 py-3 rounded-2xl rounded-tl-sm ${isNight ? 'bg-neutral-800' : 'bg-neutral-50 border border-neutral-100'}`}>
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        <div className={`px-6 pb-2 flex flex-wrap gap-2 border-t ${isNight ? 'border-neutral-800' : 'border-neutral-100'} pt-4`}>
          {QUICK_QUESTIONS.map((q) => (
            <button key={q} onClick={() => sendMessage(q)}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer hover:scale-105 ${
                isNight ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}>
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className={`p-4 border-t ${isNight ? 'border-neutral-800' : 'border-neutral-100'}`}>
          <div className="flex gap-3 items-end">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me about products, recipes, delivery..."
              rows={1}
              className={`flex-1 px-4 py-3 border rounded-2xl text-sm focus:outline-none focus:ring-1 resize-none ${
                isNight
                  ? 'bg-neutral-800 border-neutral-700 text-white focus:border-curry-500 focus:ring-curry-500'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-800 focus:border-saffron-500 focus:ring-saffron-500'
              }`}
            />
            <button
              onClick={() => sendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isLoading}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md ${themeObj.primary.split(' ').slice(0,2).join(' ')}`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[10px] text-neutral-400 text-center mt-2">Press Enter to send • Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;
