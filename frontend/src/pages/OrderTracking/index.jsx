import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, Package, Truck, Check, MapPin, RefreshCw } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { API_ENDPOINTS, SOCKET_URL } from '../../constants/api';
import { storage } from '../../utils/localStorage';
import { io } from 'socket.io-client';

const ORDER_STEPS = [
  { key: 'Placed', label: 'Placed', icon: Clock },
  { key: 'Confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'Shipped', label: 'Shipped', icon: Package },
  { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'Delivered', label: 'Delivered', icon: Check },
];

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { currentTheme, themeObj } = useTheme();
  const isNight = currentTheme === 'midnight';
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [riderPos, setRiderPos] = useState(null);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.ORDER(orderId), {
        headers: { Authorization: `Bearer ${storage.getToken()}` },
      });
      if (!res.ok) throw new Error('Not found');
      setOrder(await res.json());
    } catch {
      const saved = storage.getSimulatedOrders();
      const found = saved.find(o => o.orderId === orderId);
      setOrder(found || null);
    }
    setLoading(false);
  };

  useEffect(() => { fetchOrder(); }, [orderId]);

  useEffect(() => {
    if (!order || order.status !== 'Out for Delivery') return;
    let socket;
    try {
      socket = io(SOCKET_URL);
      socket.emit('join_order_room', orderId);
      socket.on('rider_location_received', ({ latitude, longitude, progress }) => {
        setRiderPos({ lat: latitude, lng: longitude, progress: progress || 50 });
      });
    } catch {}

    // Local simulation fallback
    const interval = setInterval(() => {
      setRiderPos(prev => {
        const cur = prev || { lat: 18.5204, lng: 73.8567, progress: 10 };
        const next = cur.progress >= 95 ? 10 : cur.progress + 5;
        return { lat: 18.5204 + next * 0.0001, lng: 73.8567 + next * 0.0001, progress: next };
      });
    }, 3000);

    return () => { if (socket) socket.disconnect(); clearInterval(interval); };
  }, [order]);

  const currentStepIdx = ORDER_STEPS.findIndex(s => s.key.toLowerCase() === order?.status?.toLowerCase());

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className={`animate-pulse rounded-3xl h-64 ${isNight ? 'bg-neutral-900' : 'bg-neutral-100'}`} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">📦</div>
        <h2 className="text-xl font-bold mb-2">Order not found</h2>
        <p className="text-sm text-neutral-400 mb-6">Order ID: {orderId}</p>
        <button onClick={() => navigate('/orders')} className={`px-6 py-2.5 rounded-full text-white text-sm font-bold ${themeObj.primary}`}>View All Orders</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:px-8">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/orders')} className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </button>
        <button onClick={fetchOrder} className="flex items-center gap-1 text-xs font-bold text-saffron-500 hover:text-saffron-600 cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className={`rounded-[32px] border p-6 shadow-sm ${isNight ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-100'}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 mb-6" style={{ borderColor: isNight ? '#262626' : '#f5f5f5' }}>
          <div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Order ID</p>
            <h2 className="text-lg font-extrabold">{order.orderId}</h2>
            <p className="text-xs text-neutral-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-neutral-400 uppercase">Total</p>
            <p className="text-2xl font-extrabold">₹{order.total}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              order.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
            }`}>{order.paymentStatus}</span>
          </div>
        </div>

        {/* Step Tracker */}
        <div className="py-4 mb-6">
          <div className="relative flex justify-between items-center max-w-xl mx-auto">
            <div className="absolute top-4 left-0 right-0 h-1 bg-neutral-100 dark:bg-neutral-800 rounded -z-0" />
            <div
              className="absolute top-4 left-0 h-1 bg-emerald-500 rounded transition-all duration-700 -z-0"
              style={{ width: `${(Math.max(0, currentStepIdx) / (ORDER_STEPS.length - 1)) * 100}%` }}
            />
            {ORDER_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const done = idx <= currentStepIdx;
              const active = idx === currentStepIdx;
              return (
                <div key={idx} className="flex flex-col items-center relative z-10">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                    done ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' : isNight ? 'bg-neutral-900 border-neutral-700 text-neutral-500' : 'bg-white border-neutral-200 text-neutral-400'
                  } ${active ? 'animate-pulse scale-110' : ''}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[9px] font-bold mt-2 uppercase tracking-wide whitespace-nowrap ${done ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400'}`}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Tracking */}
        {order.status === 'Out for Delivery' && riderPos && (
          <div className={`p-4 rounded-2xl border mb-6 animate-fade-in ${isNight ? 'bg-neutral-950/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'}`}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-red-500" /> Live Rider Tracking</span>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">Active</span>
            </div>
            <div className={`relative h-20 rounded-xl overflow-hidden flex items-center px-8 shadow-inner ${isNight ? 'bg-neutral-900 border border-neutral-800' : 'bg-white border border-neutral-200'}`}>
              <div className="absolute top-1/2 left-8 right-8 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full border-t border-b border-neutral-200 dark:border-neutral-700" />
              <div className="absolute left-6 flex flex-col items-center -translate-x-1/2"><span className="text-xl">🏪</span><span className="text-[8px] font-bold text-neutral-400 mt-0.5">Store</span></div>
              <div className="absolute flex flex-col items-center -translate-x-1/2 z-10 transition-all duration-1000" style={{ left: `calc(1.5rem + ${riderPos.progress * 0.8}%)` }}>
                <span className="text-2xl animate-bounce">🏍️</span><span className="text-[7px] font-bold text-white bg-neutral-900 px-1 rounded shadow">Rider</span>
              </div>
              <div className="absolute right-6 flex flex-col items-center translate-x-1/2"><span className="text-xl">🏠</span><span className="text-[8px] font-bold text-neutral-400 mt-0.5">Home</span></div>
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-extrabold uppercase text-[10px] text-neutral-400 mb-3 tracking-wider">Items Ordered</h4>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-xs text-neutral-600 dark:text-neutral-300">
                  <span>{item.name} <span className="text-neutral-400">({item.quantity}x)</span></span>
                  <span className="font-bold">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={`p-4 rounded-2xl border ${isNight ? 'bg-neutral-950/40 border-neutral-800' : 'bg-neutral-50 border-neutral-100'}`}>
            <h4 className="font-extrabold uppercase text-[10px] text-neutral-400 mb-2 tracking-wider">Delivery Address</h4>
            <p className="font-bold text-sm">{order.deliveryDetails.fullName}</p>
            <p className="text-xs text-neutral-500 mt-1">{order.deliveryDetails.address}</p>
            <p className="text-xs text-neutral-500">PIN: {order.deliveryDetails.pinCode}</p>
            <p className="text-xs text-neutral-500 mt-1 font-semibold">📞 {order.deliveryDetails.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
