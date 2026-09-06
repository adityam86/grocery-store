import React, { useState } from 'react';
import { X, Star, MessageSquare, Send } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/slices/authSlice';
import { useCart } from '../../context/CartContext';
import { reviewAPI } from '../../services/reviewAPI';

const ProductDetailModal = ({ product, isOpen, onClose, onAddReview }) => {
  const { themeObj, currentTheme } = useTheme();
  const user = useSelector(selectUser);
  const { addToCart } = useCart();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !product) return null;

  const reviews = product.reviews || [];

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { setError('Please log in to post a review.'); return; }
    if (!comment.trim()) { setError('Please enter a review comment.'); return; }
    setLoading(true); setError('');

    try {
      const data = await reviewAPI.addReview(product._id || product.id, { rating, comment });
      onAddReview(data.product);
      setComment(''); setRating(5);
    } catch {
      // Local fallback
      const mockProduct = { ...product, reviews: [...(product.reviews || [])] };
      if (mockProduct.reviews.find(r => r.userId === user.id)) {
        setError('You have already reviewed this product.'); setLoading(false); return;
      }
      mockProduct.reviews.push({ userId: user.id, userName: user.fullName, rating, comment, createdAt: new Date().toISOString() });
      mockProduct.reviewsCount = mockProduct.reviews.length;
      mockProduct.rating = Number((mockProduct.reviews.reduce((s, r) => s + r.rating, 0) / mockProduct.reviews.length).toFixed(1));
      onAddReview(mockProduct);
      setComment(''); setRating(5);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-3xl rounded-[32px] overflow-hidden border shadow-2xl animate-fade-in flex flex-col max-h-[85vh] ${
        currentTheme === 'midnight' ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-100 text-neutral-800'
      }`}>
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-1.5 rounded-full text-neutral-400 hover:bg-neutral-500/10 cursor-pointer border-none bg-transparent">
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-5 flex flex-col items-center">
              <div className={`w-full aspect-square rounded-[24px] flex items-center justify-center text-6xl shadow-inner border ${
                currentTheme === 'midnight' ? 'bg-neutral-950/40 border-neutral-850' : 'bg-neutral-50 border-neutral-100'
              }`}>
                {product.category === 'staples' ? '🌾' : product.category === 'spices' ? '🌶️' : product.category === 'dairy' ? '🥛' : product.category === 'beverages' ? '☕' : '🍪'}
              </div>
              <div className="flex gap-2 mt-4 text-[10px] uppercase font-bold tracking-widest text-neutral-405">
                <span>Category: {product.category}</span>
                <span>•</span>
                <span className={product.stockQuantity > 0 ? 'text-emerald-500' : 'text-red-500'}>
                  {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity})` : 'Out of Stock'}
                </span>
              </div>
            </div>

            <div className="md:col-span-7 space-y-4">
              <div>
                <h2 className="text-xl font-black">{product.name}</h2>
                {product.hindiName && <p className="text-sm font-bold text-neutral-400 mt-0.5">{product.hindiName}</p>}
              </div>
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating || 5) ? 'fill-amber-450 text-amber-450' : 'text-neutral-300'}`} />
                ))}
                <span className="text-xs font-black">{product.rating || 5.0}</span>
                <span className="text-xs text-neutral-400 font-semibold">({product.reviewsCount || 0})</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed font-semibold">{product.description || 'No description provided.'}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black">₹{product.price}</span>
                <span className="text-[10px] text-neutral-450 font-bold uppercase tracking-wider">/ {product.unit}</span>
              </div>
              <button
                onClick={() => addToCart(product)}
                disabled={product.stockQuantity <= 0}
                className={`w-full py-3 rounded-full font-bold text-xs text-white transition-all cursor-pointer border-none shadow active:scale-95 ${
                  product.stockQuantity <= 0 ? 'bg-neutral-300 cursor-not-allowed text-neutral-405 shadow-none' : themeObj.primary
                }`}
              >
                🛒 {product.stockQuantity <= 0 ? 'Out of Stock' : 'Add to Tokree (Cart)'}
              </button>
            </div>
          </div>

          <hr className={`${currentTheme === 'midnight' ? 'border-neutral-800/60' : 'border-neutral-100'}`} />

          {/* Reviews */}
          <div className="space-y-6">
            <h3 className={`font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5`}>
              <MessageSquare className={`w-4 h-4 ${themeObj.text}`} /> Customer Reviews
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {reviews.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No reviews yet. Be the first!</p>
              ) : (
                reviews.map((r, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl border text-xs space-y-2 ${currentTheme === 'midnight' ? 'bg-neutral-950/40 border-neutral-800' : 'bg-neutral-50 border-neutral-100'}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-neutral-600 flex items-center justify-center text-[10px] font-black text-white">
                          {r.userName ? r.userName[0].toUpperCase() : 'U'}
                        </div>
                        <span className="font-bold">{r.userName || 'Anonymous'}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-450 text-amber-450' : 'text-neutral-300'}`} />
                      ))}
                    </div>
                    <p className="text-neutral-400 leading-relaxed font-semibold">{r.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Write a Review */}
            <div className={`p-4 rounded-2xl border ${currentTheme === 'midnight' ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-100'}`}>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-3">Write a Review</h4>
              {user ? (
                <form onSubmit={handleSubmitReview} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400 font-bold">Your Rating:</span>
                    <div className="flex cursor-pointer">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} onClick={() => setRating(star)}
                          className={`w-5 h-5 transition-colors ${star <= rating ? 'text-amber-450 fill-current' : 'text-neutral-400 hover:text-amber-300'}`} />
                      ))}
                    </div>
                  </div>
                  <textarea required placeholder="Share your experience..." value={comment} onChange={e => setComment(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:ring-1 resize-none ${
                      currentTheme === 'midnight' ? 'border-neutral-800 bg-neutral-950/20 text-white focus:border-curry-500' : 'border-neutral-200 text-neutral-800 focus:border-saffron-500 bg-white'
                    }`} rows="2" />
                  {error && <p className="text-[10px] text-red-500 font-bold">{error}</p>}
                  <button type="submit" disabled={loading}
                    className={`px-4 py-2 rounded-full text-white text-[10px] font-bold tracking-wider hover:opacity-95 transition-all flex items-center gap-1 cursor-pointer border-none ${themeObj.primary}`}>
                    {loading ? 'Submitting...' : 'Post Review'} <Send className="w-3 h-3" />
                  </button>
                </form>
              ) : (
                <p className="text-xs text-neutral-400 italic">Please log in to submit a review.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
