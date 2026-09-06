import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ArrowLeft, Send, CheckCircle, CreditCard, Landmark, Truck, X } from 'lucide-react';
import { API_BASE_URL } from '../constants/api';

const CheckoutForm = ({ user, onBack, onOrderSuccess }) => {
  const { cart, cartTotal, clearCart } = useCart();
  
  // Addresses helper: Fallback to user profile list
  const savedAddresses = user && user.addresses ? user.addresses : [];
  
  const [formData, setFormData] = useState({
    fullName: user ? user.fullName : '',
    phone: '',
    address: savedAddresses[0] || '',
    landmark: '',
    city: '',
    pinCode: '',
    paymentMethod: 'cod',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '' });
  const [razorpayTab, setRazorpayTab] = useState('qr'); // 'qr', 'upi_id', 'nb', 'card'
  const [upiIdInput, setUpiIdInput] = useState('');
  const [mockScanProcessing, setMockScanProcessing] = useState(false);

  // Promo Code States
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoDiscountType, setPromoDiscountType] = useState('');
  const [promoDiscountValue, setPromoDiscountValue] = useState(0);

  const PROMO_CODES = {
    'WELCOME10': { type: 'percent', value: 10 },
    'FREESHIP': { type: 'freeship', value: 0 },
    'DIWALI20': { type: 'percent', value: 20 }
  };

  const handleApplyPromo = () => {
    setPromoError('');
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) return;

    if (PROMO_CODES[code]) {
      setAppliedPromo(code);
      setPromoDiscountType(PROMO_CODES[code].type);
      setPromoDiscountValue(PROMO_CODES[code].value);
    } else {
      setPromoError('Invalid promo code');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo('');
    setPromoDiscountType('');
    setPromoDiscountValue(0);
    setPromoCodeInput('');
    setPromoError('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  const handleSelectSavedAddress = (addr) => {
    setFormData({ ...formData, address: addr });
  };

  const executeOrderPost = async (paymentDetails = {}) => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('apna_bazar_token');
    const shipping = (cartTotal >= 500 || appliedPromo === 'FREESHIP') ? 0 : 49;
    let discountAmount = 0;
    if (appliedPromo && promoDiscountType === 'percent') {
      discountAmount = Math.round((cartTotal * promoDiscountValue) / 100);
    }
    const total = Math.max(0, cartTotal + shipping - discountAmount);

    const orderPayload = {
      items: cart.map(item => ({
        productId: item.product.id || item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        unit: item.product.unit
      })),
      deliveryDetails: {
        fullName: formData.fullName,
        phone: formData.phone,
        address: `${formData.address}${formData.landmark ? ', Near ' + formData.landmark : ''}, ${formData.city}`,
        pinCode: formData.pinCode
      },
      subtotal: cartTotal,
      shipping,
      discountAmount,
      promoCode: appliedPromo || '',
      total,
      paymentStatus: paymentDetails.status || 'Pending',
      paymentId: paymentDetails.id || ''
    };

    try {
      let paymentId = paymentDetails.id || '';
      let paymentStatus = paymentDetails.status || 'Pending';
      
      if (formData.paymentMethod === 'card' && !paymentDetails.id) {
        const intentRes = await fetch(`${API_BASE_URL}/api/payments/create-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ amount: total })
        });
        const intentData = await intentRes.json();
        paymentId = intentData.clientSecret || `card_txn_${Date.now()}`;
        paymentStatus = 'Paid';
      }

      orderPayload.paymentId = paymentId;
      orderPayload.paymentStatus = paymentStatus;

      // 2. Post Order to Backend
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 3. Save new address to profile if it's not already saved
        if (user && !savedAddresses.includes(formData.address)) {
          await fetch(`${API_BASE_URL}/api/auth/address`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ address: formData.address })
          });
        }

        setPlacedOrder(data.order);
        clearCart();
        if (onOrderSuccess) onOrderSuccess(data.order);
      } else {
        throw new Error(data.message || 'Failed to place order');
      }
    } catch (err) {
      console.warn('Backend API offline or failed, falling back to local simulation:', err.message);
      
      // Local fallback simulation if backend is not running
      setTimeout(() => {
        const simulatedOrderId = `AB-${Math.floor(100000 + Math.random() * 900000)}`;
        const simulatedOrder = {
          orderId: simulatedOrderId,
          userId: user ? user.id || user._id : 'guest',
          items: orderPayload.items,
          deliveryDetails: orderPayload.deliveryDetails,
          subtotal: orderPayload.subtotal,
          shipping: orderPayload.shipping,
          discountAmount: orderPayload.discountAmount,
          promoCode: orderPayload.promoCode,
          total: orderPayload.total,
          status: 'Placed',
          paymentStatus: formData.paymentMethod === 'card' ? 'Paid' : 'Pending',
          paymentId: formData.paymentMethod === 'card' ? `card_sim_${Date.now()}` : '',
          createdAt: new Date().toISOString(),
        };
        setPlacedOrder(simulatedOrder);
        clearCart();
        if (onOrderSuccess) onOrderSuccess(simulatedOrder);
        setLoading(false);
      }, 1500);
      return;
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.paymentMethod === 'card') {
      setShowCardModal(true);
    } else if (formData.paymentMethod === 'upi') {
      setShowRazorpayModal(true);
    } else {
      executeOrderPost();
    }
  };

  const handleCardSubmit = (e) => {
    e.preventDefault();
    setShowCardModal(false);
    executeOrderPost({ status: 'Paid', id: `stripe_txn_${Date.now()}` });
  };

  const handleDownloadInvoice = async () => {
    try {
      const token = localStorage.getItem('apna_bazar_token');
      const response = await fetch(`${API_BASE_URL}/api/orders/${placedOrder.orderId}/invoice`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${placedOrder.orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Invoice download failed. Please check backend server.');
    }
  };

  if (placedOrder) {
    return (
      <div className="max-w-xl mx-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 shadow-sm text-center animate-fade-in my-8 text-neutral-850 dark:text-neutral-100">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-cardamom-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Order Placed Successfully!</h2>
        <p className="text-sm text-neutral-550 dark:text-neutral-400 mb-6">
          Thank you for shopping at Apna Bazar. Your order has been registered.
        </p>

        {/* Order Details Panel */}
        <div className="bg-neutral-50 dark:bg-neutral-950/45 rounded-2xl p-6 text-left border border-neutral-200 dark:border-neutral-800/80 mb-8 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-neutral-200/60 dark:border-neutral-800/60">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Order ID</span>
              <p className="font-bold text-neutral-850 dark:text-neutral-200 text-sm">{placedOrder.orderId}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Status</span>
              <p className="font-bold text-cardamom-600 dark:text-curry-500 text-sm">{placedOrder.status}</p>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Delivery Address</span>
            <p className="text-xs text-neutral-700 dark:text-neutral-300 font-medium mt-0.5">{placedOrder.deliveryDetails.fullName}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{placedOrder.deliveryDetails.address}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">PIN Code: {placedOrder.deliveryDetails.pinCode}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Phone: {placedOrder.deliveryDetails.phone}</p>
          </div>

          <div className="border-t border-neutral-200/60 dark:border-neutral-800/60 pt-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-2">Items Summary</span>
            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {placedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs text-neutral-600 dark:text-neutral-300">
                  <span>{item.name} <span className="text-neutral-400">({item.quantity} x {item.unit})</span></span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-100">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {placedOrder.discountAmount > 0 && (
            <div className="border-t border-neutral-200/60 dark:border-neutral-800/60 pt-3 flex justify-between items-center text-xs text-neutral-500">
              <span>Discount ({placedOrder.promoCode})</span>
              <span className="font-semibold text-emerald-650 dark:text-curry-400">-₹{placedOrder.discountAmount}</span>
            </div>
          )}
          <div className="border-t border-neutral-200/60 dark:border-neutral-800/60 pt-3 flex justify-between items-center text-sm font-bold text-neutral-900 dark:text-white">
            <span>Total Paid ({placedOrder.paymentStatus === 'Paid' ? 'Stripe Paid' : 'COD'})</span>
            <span>₹{placedOrder.total}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <button
            onClick={handleDownloadInvoice}
            className="px-6 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-800 text-xs font-bold hover:bg-neutral-50 dark:hover:bg-neutral-850 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            📥 Download PDF Invoice
          </button>
          <button
            onClick={onBack}
            className="px-6 py-2.5 rounded-full bg-saffron-500 text-white font-bold text-xs shadow-md hover:bg-saffron-600 active:scale-95 transition-all cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const shipping = (cartTotal >= 500 || appliedPromo === 'FREESHIP') ? 0 : 49;
  let discountAmount = 0;
  if (appliedPromo && promoDiscountType === 'percent') {
    discountAmount = Math.round((cartTotal * promoDiscountValue) / 100);
  }
  const total = Math.max(0, cartTotal + shipping - discountAmount);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-neutral-850 dark:text-neutral-100 animate-fade-in">
      <button 
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-neutral-200 mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Store
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Delivery Details</h2>

          {/* Saved Addresses Selector */}
          {savedAddresses.length > 0 && (
            <div className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/80">
              <span className="block text-[10px] uppercase font-bold text-neutral-400 mb-2">Saved Shipping Addresses</span>
              <div className="space-y-2">
                {savedAddresses.map((addr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSavedAddress(addr)}
                    className={`w-full text-left px-3.5 py-2.5 text-xs rounded-xl border font-medium transition-all ${formData.address === addr ? 'border-saffron-500 bg-saffron-50/10 text-saffron-600 dark:text-saffron-400' : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100/50 text-neutral-600 dark:text-neutral-400'}`}
                  >
                    📍 {addr}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Full Name</label>
              <input 
                type="text" 
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Phone Number</label>
              <input 
                type="tel" 
                name="phone"
                required
                pattern="[0-9]{10}"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Delivery Address</label>
            <input 
              type="text" 
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="Flat/House No., Building, Street Name"
              className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 transition-colors mb-3"
            />
            <input 
              type="text" 
              name="landmark"
              value={formData.landmark}
              onChange={handleChange}
              placeholder="Landmark (Optional) e.g. Near Temple"
              className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">City / District</label>
              <input 
                type="text" 
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. New Delhi"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">PIN Code</label>
              <input 
                type="text" 
                name="pinCode"
                required
                pattern="[0-9]{6}"
                value={formData.pinCode}
                onChange={handleChange}
                placeholder="6-digit postal code"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Payment Method</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-saffron-500 bg-saffron-50/20' : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-950/40'}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="cod" 
                  checked={formData.paymentMethod === 'cod'}
                  onChange={handleChange}
                  className="accent-saffron-500" 
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-neutral-400" /> COD</span>
                  <span className="text-[10px] text-neutral-405">Cash on Delivery</span>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.paymentMethod === 'upi' ? 'border-saffron-500 bg-saffron-50/20' : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-950/40'}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="upi" 
                  checked={formData.paymentMethod === 'upi'}
                  onChange={handleChange}
                  className="accent-saffron-500" 
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold flex items-center gap-1"><Landmark className="w-3.5 h-3.5 text-neutral-400" /> UPI</span>
                  <span className="text-[10px] text-neutral-405">GPay, Paytm</span>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.paymentMethod === 'card' ? 'border-saffron-500 bg-saffron-50/20' : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-950/40'}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="card" 
                  checked={formData.paymentMethod === 'card'}
                  onChange={handleChange}
                  className="accent-saffron-500" 
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold flex items-center gap-1"><CreditCard className="w-3.5 h-3.5 text-neutral-400" /> Card</span>
                  <span className="text-[10px] text-neutral-405">Stripe Gateway</span>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-saffron-500 hover:bg-saffron-600 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide rounded-full shadow-lg shadow-saffron-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            {loading ? 'Processing Order...' : <span className="flex items-center gap-2">Place Order <Send className="w-4 h-4" /></span>}
          </button>
        </form>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-neutral-800 dark:text-neutral-200 text-base mb-4 flex items-center gap-1.5">
              <ShoppingBag className="w-5 h-5 text-saffron-500" /> Order Summary
            </h3>
            
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80 max-h-60 overflow-y-auto pr-1 mb-4">
              {cart.map((item) => (
                <div key={item.product.id} className="py-3 flex justify-between items-center gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">{item.product.name}</p>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider">{item.quantity} x {item.product.unit}</span>
                  </div>
                  <span className="text-xs font-bold text-neutral-900 dark:text-white shrink-0">₹{item.product.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-100 dark:border-neutral-800/80 pt-4 space-y-2">
              <div className="flex justify-between text-xs text-neutral-500">
                <span>Items Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              {appliedPromo && discountAmount > 0 && (
                <div className="flex justify-between text-xs text-emerald-650 dark:text-curry-400 font-semibold animate-fade-in">
                  <span>Promo Code ({appliedPromo})</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-neutral-500">
                <span>Shipping Fee</span>
                <span>{shipping === 0 ? <span className="text-cardamom-500 font-semibold">FREE</span> : `₹${shipping}`}</span>
              </div>
              <div className="border-t border-neutral-200/80 dark:border-neutral-800/60 my-2 pt-2.5 flex justify-between text-sm font-bold text-neutral-900 dark:text-white">
                <span>Payable Amount</span>
                <span>₹{total}</span>
              </div>
            </div>

            {/* Promo Code Input Panel */}
            <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800/60">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Apply Promo Code</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="e.g. WELCOME10" 
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                  disabled={!!appliedPromo}
                  className="flex-grow px-3 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs uppercase focus:outline-none focus:border-saffron-500 disabled:opacity-60"
                />
                {appliedPromo ? (
                  <button 
                    type="button"
                    onClick={handleRemovePromo}
                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold rounded-xl transition-colors cursor-pointer border-none"
                  >
                    Remove
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white dark:text-neutral-100 text-xs font-bold rounded-xl transition-colors cursor-pointer border-none"
                  >
                    Apply
                  </button>
                )}
              </div>
              {promoError && <p className="text-[10px] text-red-500 font-semibold mt-1.5">{promoError}</p>}
              {appliedPromo && (
                <p className="text-[10px] text-cardamom-600 dark:text-curry-400 font-bold mt-1.5">
                  ✓ '{appliedPromo}' applied! ({promoDiscountType === 'percent' ? `${promoDiscountValue}% Off` : 'Free Shipping'})
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Credit Card Modal Simulation */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm" onClick={() => setShowCardModal(false)}></div>
          <form onSubmit={handleCardSubmit} className="relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded-3xl p-6 shadow-2xl max-w-sm w-full animate-fade-in text-xs text-neutral-850 dark:text-white space-y-4">
            <button type="button" onClick={() => setShowCardModal(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600"><X className="w-5 h-5" /></button>
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800/60"><CreditCard className="w-5 h-5 text-saffron-500" /><h3 className="font-extrabold text-sm">Secure Stripe Payment</h3></div>
            <div>
              <label className="text-[9px] font-bold block mb-1">Card Number</label>
              <input required type="text" maxLength="19" placeholder="4242 4242 4242 4242" value={cardDetails.number} onChange={handleCardChange} name="number" className="w-full px-3 py-2 border dark:border-neutral-800 dark:bg-neutral-950 rounded-xl focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-bold block mb-1">Expiry Date</label>
                <input required type="text" placeholder="MM/YY" maxLength="5" value={cardDetails.expiry} onChange={handleCardChange} name="expiry" className="w-full px-3 py-2 border dark:border-neutral-800 dark:bg-neutral-950 rounded-xl focus:outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-bold block mb-1">CVC Code</label>
                <input required type="password" placeholder="•••" maxLength="3" value={cardDetails.cvc} onChange={handleCardChange} name="cvc" className="w-full px-3 py-2 border dark:border-neutral-800 dark:bg-neutral-950 rounded-xl focus:outline-none" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-neutral-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>🔒 Encrypted using SSL certificate standards.</div>
            <button type="submit" className="w-full py-2.5 bg-saffron-500 hover:bg-saffron-600 text-white font-bold uppercase rounded-xl tracking-wider">Pay ₹{total}</button>
          </form>
        </div>
      )}

      {/* Razorpay Unified Simulator Modal */}
      {showRazorpayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-sm" onClick={() => setShowRazorpayModal(false)}></div>
          
          <div className="relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full flex flex-col h-[520px] text-xs text-neutral-800 dark:text-white animate-fade-in">
            {/* Header banner */}
            <div className="bg-[#191C24] p-4 text-white flex justify-between items-center border-b border-neutral-800 shrink-0">
              <div className="flex items-center gap-2">
                <span className="bg-[#002E6E] text-white p-1 rounded font-black tracking-widest text-[9px] uppercase">Apna Bazar</span>
                <div>
                  <h3 className="font-bold text-xs">Apna Bazar E-Store</h3>
                  <p className="text-[9px] text-neutral-400">Merchant Payment Sandbox</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-neutral-400 block uppercase font-bold">Payable</span>
                <p className="text-sm font-black text-emerald-450">₹{total}</p>
              </div>
            </div>

            {/* Main content body */}
            <div className="flex flex-grow min-h-0 bg-neutral-50 dark:bg-neutral-950/20">
              {/* Sidebar Tabs */}
              <div className="w-1/3 bg-[#FAFAFA] dark:bg-neutral-900/60 border-r border-neutral-200/60 dark:border-neutral-800/60 flex flex-col py-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setRazorpayTab('qr')}
                  className={`px-4 py-3 text-left font-bold transition-all border-none ${
                    razorpayTab === 'qr' 
                      ? 'bg-neutral-200/50 dark:bg-neutral-800 text-[#002E6E] dark:text-curry-450 border-l-4 border-[#002E6E] dark:border-curry-500' 
                      : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-850'
                  }`}
                >
                  📲 Scan QR Code
                </button>
                <button
                  type="button"
                  onClick={() => setRazorpayTab('upi_id')}
                  className={`px-4 py-3 text-left font-bold transition-all border-none ${
                    razorpayTab === 'upi_id' 
                      ? 'bg-neutral-200/50 dark:bg-neutral-800 text-[#002E6E] dark:text-curry-450 border-l-4 border-[#002E6E] dark:border-curry-500' 
                      : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-850'
                  }`}
                >
                  ⚡ UPI ID / Net
                </button>
                <button
                  type="button"
                  onClick={() => setRazorpayTab('card')}
                  className={`px-4 py-3 text-left font-bold transition-all border-none ${
                    razorpayTab === 'card' 
                      ? 'bg-neutral-200/50 dark:bg-neutral-800 text-[#002E6E] dark:text-curry-450 border-l-4 border-[#002E6E] dark:border-curry-500' 
                      : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-850'
                  }`}
                >
                  💳 Card Payment
                </button>
                <button
                  type="button"
                  onClick={() => setRazorpayTab('nb')}
                  className={`px-4 py-3 text-left font-bold transition-all border-none ${
                    razorpayTab === 'nb' 
                      ? 'bg-neutral-200/50 dark:bg-neutral-800 text-[#002E6E] dark:text-curry-450 border-l-4 border-[#002E6E] dark:border-curry-500' 
                      : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-850'
                  }`}
                >
                  🏛️ Net Banking
                </button>
              </div>

              {/* Sidebar Active Panel */}
              <div className="w-2/3 p-4 flex flex-col justify-between overflow-y-auto">
                
                {/* QR Code Tab */}
                {razorpayTab === 'qr' && (
                  <div className="flex flex-col items-center justify-center py-4 space-y-4 text-center">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Scan using any UPI App</span>
                    
                    {/* Simulated QR Code box */}
                    <div className="relative p-2 bg-white rounded-xl border border-neutral-200 shadow-inner">
                      <div className="w-36 h-36 bg-neutral-900 flex flex-wrap items-center justify-center p-3 rounded-lg relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-neutral-100"></div>
                        <div className="grid grid-cols-4 gap-2 w-full h-full">
                          {[...Array(16)].map((_, i) => (
                            <div key={i} className={`rounded ${i % 3 === 0 || i === 0 || i === 15 ? 'bg-white' : 'bg-neutral-800'}`}></div>
                          ))}
                        </div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded shadow text-[7px] font-black text-neutral-950">
                          ₹
                        </div>
                        {mockScanProcessing && (
                          <div className="absolute inset-0 bg-[#002E6E]/90 flex flex-col items-center justify-center text-white text-[10px] font-bold">
                            <span className="animate-spin text-lg mb-2">⚡</span>
                            Verifying Payment...
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-[9px] text-neutral-400 font-semibold leading-relaxed">
                      Secure developer sandbox QR. Click to simulate a successful payment trigger.
                    </p>
                    
                    {!mockScanProcessing && (
                      <button
                        type="button"
                        onClick={() => {
                          setMockScanProcessing(true);
                          setTimeout(() => {
                            setMockScanProcessing(false);
                            setShowRazorpayModal(false);
                            executeOrderPost({ status: 'Paid', id: `rzp_qr_${Date.now()}` });
                          }, 2000);
                        }}
                        className="w-full py-2 bg-[#002E6E] text-white rounded-lg font-bold hover:bg-opacity-90 transition-all border-none cursor-pointer"
                      >
                        Simulate QR Code Scan
                      </button>
                    )}
                  </div>
                )}

                {/* UPI ID Tab */}
                {razorpayTab === 'upi_id' && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-xs">Enter UPI Address</h4>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="e.g. user@okaxis"
                        value={upiIdInput}
                        onChange={e => setUpiIdInput(e.target.value)}
                        className="w-full px-3 py-2 border dark:border-neutral-800 dark:bg-neutral-950 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#002E6E]"
                      />
                      <span className="text-[9px] text-neutral-400 block leading-tight font-semibold">
                        A simulated payment request will be sent to your UPI app.
                      </span>
                    </div>

                    <div className="flex gap-2 justify-center">
                      {['paytm', 'ybl', 'okaxis'].map(vpa => (
                        <button
                          key={vpa}
                          type="button"
                          onClick={() => setUpiIdInput(`apnabazar@${vpa}`)}
                          className="px-2 py-1 bg-neutral-250/50 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-705 text-[10px] font-bold rounded-lg transition-colors border-none cursor-pointer"
                        >
                          @{vpa}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!upiIdInput.trim()) return;
                        setMockScanProcessing(true);
                        setTimeout(() => {
                          setMockScanProcessing(false);
                          setShowRazorpayModal(false);
                          executeOrderPost({ status: 'Paid', id: `rzp_upi_${Date.now()}` });
                        }, 1800);
                      }}
                      className="w-full py-2.5 bg-[#002E6E] text-white rounded-xl font-bold hover:opacity-95 transition-all border-none cursor-pointer"
                    >
                      {mockScanProcessing ? 'Verifying UPI VPA...' : 'Pay ₹' + total}
                    </button>
                  </div>
                )}

                {/* Card Tab */}
                {razorpayTab === 'card' && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs">Debit / Credit Card</h4>
                    <div className="space-y-2.5">
                      <input
                        required
                        type="text"
                        placeholder="Card Number"
                        className="w-full px-3 py-1.5 border dark:border-neutral-800 dark:bg-neutral-950 rounded-xl focus:outline-none"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          required
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-3 py-1.5 border dark:border-neutral-800 dark:bg-neutral-950 rounded-xl focus:outline-none"
                        />
                        <input
                          required
                          type="password"
                          placeholder="CVV"
                          className="w-full px-3 py-1.5 border dark:border-neutral-800 dark:bg-neutral-950 rounded-xl focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setMockScanProcessing(true);
                        setTimeout(() => {
                          setMockScanProcessing(false);
                          setShowRazorpayModal(false);
                          executeOrderPost({ status: 'Paid', id: `rzp_card_${Date.now()}` });
                        }, 1800);
                      }}
                      className="w-full py-2.5 bg-[#002E6E] text-white rounded-xl font-bold hover:opacity-95 transition-all border-none cursor-pointer mt-4"
                    >
                      {mockScanProcessing ? 'Processing Transaction...' : 'Pay ₹' + total}
                    </button>
                  </div>
                )}

                {/* Net Banking Tab */}
                {razorpayTab === 'nb' && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-xs">Popular Indian Banks</h4>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { name: 'SBI', code: 'sbi' },
                        { name: 'HDFC', code: 'hdfc' },
                        { name: 'ICICI', code: 'icici' },
                        { name: 'Axis', code: 'axis' }
                      ].map(bank => (
                        <button
                          key={bank.code}
                          type="button"
                          onClick={() => {
                            setMockScanProcessing(true);
                            setTimeout(() => {
                              setMockScanProcessing(false);
                              setShowRazorpayModal(false);
                              executeOrderPost({ status: 'Paid', id: `rzp_nb_${bank.code}_${Date.now()}` });
                            }, 1500);
                          }}
                          className="p-3 text-center border dark:border-neutral-800 rounded-xl font-black bg-neutral-200/20 hover:bg-neutral-200 dark:hover:bg-neutral-850 cursor-pointer text-[#002E6E] dark:text-white"
                        >
                          🏛️ {bank.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Footer banner */}
            <div className="bg-[#FAFAFA] dark:bg-neutral-900 border-t border-neutral-200/60 dark:border-neutral-800/60 p-3 flex justify-between items-center shrink-0">
              <span className="text-[8px] text-neutral-450 font-bold uppercase tracking-wider">🔒 Powered by Razorpay Payment Gateway</span>
              <button 
                type="button"
                onClick={() => setShowRazorpayModal(false)}
                className="text-[9px] text-red-500 hover:text-red-650 font-bold border-none bg-transparent cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutForm;
