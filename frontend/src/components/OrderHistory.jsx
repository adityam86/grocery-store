import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowLeft, RefreshCw, CheckCircle, Truck, Package, Clock, Check, Download, MapPin } from 'lucide-react';
import { io } from 'socket.io-client';

const ORDER_STATUS_STEPS = [
  { key: 'Placed', label: 'Placed', icon: Clock },
  { key: 'Confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'Shipped', label: 'Shipped', icon: Package },
  { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'Delivered', label: 'Delivered', icon: Check }
];

const OrderHistory = ({ user, onBack }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Real-time tracking positions for out-of-delivery orders
  const [riderPositions, setRiderPositions] = useState({}); // orderId -> { lat, lng, progress }

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('apna_bazar_token');

    try {
      const response = await fetch(`http://localhost:5000/api/orders?userId=${user.id || user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (err) {
      console.warn('Orders API offline, loading mock order database history:', err.message);
      const savedOrders = JSON.parse(localStorage.getItem('apna_bazar_simulated_orders') || '[]');
      const userOrders = savedOrders.filter(o => o.userId === (user.id || user._id));
      setOrders(userOrders);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [user.id, user._id]);

  // Connect to Sockets for active tracking
  useEffect(() => {
    let socket;
    try {
      socket = io('http://localhost:5000');
      
      orders.forEach(order => {
        if (order.status === 'Out for Delivery') {
          socket.emit('join_order_room', order.orderId);
        }
      });

      socket.on('rider_location_received', (data) => {
        const { orderId, latitude, longitude, progress } = data;
        setRiderPositions(prev => ({
          ...prev,
          [orderId]: { lat: latitude, lng: longitude, progress: progress || 50 }
        }));
      });
    } catch (err) {
      console.warn('Socket server not reachable for real-time tracking:', err.message);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [orders]);

  // Simulate local progress if socket is unavailable/offline
  useEffect(() => {
    const interval = setInterval(() => {
      orders.forEach(order => {
        if (order.status === 'Out for Delivery' && !riderPositions[order.orderId]) {
          // Increment mock tracking progress
          setRiderPositions(prev => {
            const cur = prev[order.orderId] || { lat: 18.5204, lng: 73.8567, progress: 10 };
            const nextProgress = cur.progress >= 95 ? 10 : cur.progress + 5;
            return {
              ...prev,
              [order.orderId]: { lat: 18.5204 + (nextProgress * 0.0001), lng: 73.8567 + (nextProgress * 0.0001), progress: nextProgress }
            };
          });
        }
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [orders, riderPositions]);

  const getStepIndex = (status) => {
    return ORDER_STATUS_STEPS.findIndex(step => step.key.toLowerCase() === status.toLowerCase());
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const token = localStorage.getItem('apna_bazar_token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/invoice`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Invoice download failed. Please check backend server.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-neutral-850 dark:text-neutral-100">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-850 dark:hover:text-neutral-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </button>
        <button 
          onClick={fetchOrders}
          className="flex items-center gap-1 text-xs font-bold text-saffron-500 hover:text-saffron-600 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </button>
      </div>

      <h2 className="text-2xl font-extrabold mb-6">My Purchases</h2>

      {loading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="bg-neutral-100 dark:bg-neutral-900/60 animate-pulse rounded-3xl h-48 w-full"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 max-w-md mx-auto">
          <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="font-bold mb-1">No orders found</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            You haven't placed any orders yet. Go add some items to your cart!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStepIdx = getStepIndex(order.status);
            const position = riderPositions[order.orderId];

            return (
              <div 
                key={order.orderId}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm flex flex-col gap-6 animate-fade-in"
              >
                {/* Info Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 dark:border-neutral-800/60 pb-4 gap-2">
                  <div className="flex items-center gap-4 text-xs font-semibold text-neutral-500">
                    <div>
                      <span>ORDER ID:</span>
                      <p className="font-extrabold text-neutral-800 dark:text-neutral-100 text-sm mt-0.5">{order.orderId}</p>
                    </div>
                    <div>
                      <span>DATE PLACED:</span>
                      <p className="font-bold text-neutral-700 dark:text-neutral-300 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400">Total Price</span>
                      <p className="text-base font-extrabold text-neutral-900 dark:text-white mt-0.5">₹{order.total}</p>
                    </div>
                    <button
                      onClick={() => handleDownloadInvoice(order.orderId)}
                      className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-850 cursor-pointer"
                      title="Download PDF Invoice"
                    >
                      <Download className="w-4 h-4 text-neutral-500 hover:text-saffron-500" />
                    </button>
                  </div>
                </div>

                {/* Progress Tracker Timeline */}
                <div className="py-4">
                  <div className="relative flex justify-between items-center max-w-xl mx-auto">
                    <div className="absolute top-4 left-0 right-0 h-1 bg-neutral-100 dark:bg-neutral-800 rounded -z-0"></div>
                    <div 
                      className="absolute top-4 left-0 h-1 bg-cardamom-500 dark:bg-curry-500 rounded transition-all duration-500 -z-0"
                      style={{ width: `${(Math.max(0, currentStepIdx) / (ORDER_STATUS_STEPS.length - 1)) * 100}%` }}
                    ></div>

                    {ORDER_STATUS_STEPS.map((step, idx) => {
                      const StepIcon = step.icon;
                      const isCompleted = idx <= currentStepIdx;
                      const isActive = idx === currentStepIdx;

                      return (
                        <div key={idx} className="flex flex-col items-center relative z-10">
                          <div 
                            className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                              isCompleted 
                                ? 'bg-cardamom-500 border-cardamom-500 text-white dark:bg-curry-500 dark:border-curry-500 dark:text-neutral-950 shadow-md' 
                                : 'bg-white border-neutral-200 text-neutral-400 dark:bg-neutral-900 dark:border-neutral-800'
                            } ${isActive ? 'animate-pulse scale-110' : ''}`}
                          >
                            <StepIcon className="w-4 h-4" />
                          </div>
                          <span className={`text-[9px] font-bold mt-2 uppercase tracking-wide whitespace-nowrap ${
                            isCompleted ? 'text-cardamom-600 dark:text-curry-400 font-extrabold' : 'text-neutral-400'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Real-time Map tracking when Out for Delivery */}
                {order.status === 'Out for Delivery' && position && (
                  <div className="bg-neutral-50 dark:bg-neutral-950/60 p-4 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/80 animate-fade-in">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-red-500" /> Live Rider Coordinates</span>
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">Active tracking</span>
                    </div>

                    {/* Styled road/progress track map */}
                    <div className="relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 h-20 rounded-xl overflow-hidden flex items-center px-8 shadow-inner">
                      <div className="absolute top-1/2 left-8 right-8 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full border-t border-b border-neutral-200 dark:border-neutral-700"></div>
                      
                      {/* Starting point Store */}
                      <div className="absolute left-6 flex flex-col items-center -translate-x-1/2">
                        <span className="text-xl">🏪</span>
                        <span className="text-[8px] font-bold text-neutral-400 uppercase mt-0.5">Apna Store</span>
                      </div>

                      {/* Moving rider marker */}
                      <div 
                        className="absolute flex flex-col items-center -translate-x-1/2 z-10 transition-all duration-1000 ease-out"
                        style={{ left: `calc(1.5rem + ${position.progress * 0.8}%` }}
                      >
                        <span className="text-2xl animate-bounce">🏍️</span>
                        <span className="text-[7px] font-bold text-white bg-neutral-900 px-1 rounded shadow">Rider</span>
                      </div>

                      {/* Destination point Home */}
                      <div className="absolute right-6 flex flex-col items-center translate-x-1/2">
                        <span className="text-xl">🏠</span>
                        <span className="text-[8px] font-bold text-neutral-400 uppercase mt-0.5">Home</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Items & Delivery Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-100 dark:border-neutral-800/60 text-xs">
                  <div>
                    <h4 className="font-extrabold uppercase text-[10px] text-neutral-400 mb-3 tracking-wider">Purchase Summary</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-neutral-600 dark:text-neutral-300">
                          <span>{item.name} <span className="text-neutral-400">({item.quantity} x {item.unit})</span></span>
                          <span className="font-bold text-neutral-800 dark:text-neutral-100">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-neutral-50 dark:bg-neutral-950/40 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800/60">
                    <h4 className="font-extrabold uppercase text-[10px] text-neutral-400 mb-2 tracking-wider">Shipping Address</h4>
                    <p className="font-bold text-neutral-800 dark:text-neutral-200">{order.deliveryDetails.fullName}</p>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1 leading-normal">{order.deliveryDetails.address}</p>
                    <p className="text-neutral-500 dark:text-neutral-400">PIN: {order.deliveryDetails.pinCode}</p>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1 font-semibold">Phone: {order.deliveryDetails.phone}</p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
