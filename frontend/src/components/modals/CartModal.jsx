import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCart } from '../../context/CartContext';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { selectCartItems, selectCartTotal, updateQuantity, clearCart, removeFromCart } from '../../redux/slices/cartSlice';

const CartModal = ({ isOpen, onClose, onCheckout }) => {
  const dispatch = useDispatch();
  const cart = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);

  if (!isOpen) return null;

  const shipping = cartTotal >= 500 ? 0 : 49;
  const grandTotal = cartTotal + shipping;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-modal="true" role="dialog">
      <div className="absolute inset-0 overflow-hidden">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

        {/* Panel */}
        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="pointer-events-auto w-screen max-w-md animate-fade-in">
            <div className="flex h-full flex-col bg-white shadow-2xl rounded-l-3xl border-l border-neutral-100">

              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-saffron-500" />
                  <h2 className="text-lg font-bold text-neutral-900">Your Tokree (Cart)</h2>
                </div>
                <button onClick={onClose} className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                      <ShoppingBag className="w-8 h-8 text-saffron-400" />
                    </div>
                    <h3 className="font-bold text-neutral-800 mb-1">Your cart is empty</h3>
                    <p className="text-xs text-neutral-500 max-w-xs mb-6">Looks like you haven't added any premium Indian groceries yet.</p>
                    <button onClick={onClose} className="px-6 py-2.5 rounded-full bg-saffron-500 text-white font-semibold text-sm hover:bg-saffron-600 shadow-md active:scale-95 transition-all cursor-pointer">
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-neutral-50">
                      <span className="text-xs font-semibold text-neutral-500">{cart.length} unique items</span>
                      <button onClick={() => dispatch(clearCart())} className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" /> Clear All
                      </button>
                    </div>
                    {cart.map((item) => {
                      const pid = item.product._id || item.product.id;
                      return (
                        <div key={pid} className="flex gap-4 p-3 bg-neutral-50 rounded-2xl border border-neutral-100/60 items-center">
                          <div className="w-14 h-14 rounded-xl bg-white border border-neutral-100 flex items-center justify-center shrink-0">
                            <ShoppingBag className="w-6 h-6 text-neutral-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-xs text-neutral-800 truncate">{item.product.name}</h4>
                            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">{item.product.unit}</span>
                            <span className="text-xs font-bold text-neutral-900">₹{item.product.price}</span>
                          </div>
                          <div className="flex items-center bg-white rounded-full border border-neutral-200 p-1 shrink-0">
                            <button onClick={() => dispatch(updateQuantity({ productId: pid, quantity: item.quantity - 1 }))} className="p-1 rounded-full text-neutral-500 hover:bg-neutral-50 active:scale-90 cursor-pointer">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-neutral-800 px-2 min-w-[20px] text-center">{item.quantity}</span>
                            <button onClick={() => dispatch(updateQuantity({ productId: pid, quantity: item.quantity + 1 }))} className="p-1 rounded-full text-neutral-500 hover:bg-neutral-50 active:scale-90 cursor-pointer">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {cart.length > 0 && (
                <div className="border-t border-neutral-100 bg-neutral-50 px-6 py-6 rounded-t-3xl">
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>Subtotal</span><span>₹{cartTotal}</span>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? <span className="text-cardamom-500 font-semibold">FREE</span> : `₹${shipping}`}</span>
                    </div>
                    {shipping > 0 && (
                      <p className="text-[10px] text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100/50">
                        💡 Add <strong>₹{500 - cartTotal}</strong> more for <strong>FREE SHIPPING</strong>!
                      </p>
                    )}
                    <div className="border-t border-neutral-200/80 my-2 pt-2 flex justify-between text-sm font-bold text-neutral-900">
                      <span>Total Amount</span><span>₹{grandTotal}</span>
                    </div>
                  </div>
                  <button
                    onClick={onCheckout}
                    className="w-full py-3.5 rounded-full bg-saffron-500 hover:bg-saffron-600 active:scale-[0.98] text-white font-bold text-sm tracking-wide shadow-lg shadow-saffron-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartModal;
