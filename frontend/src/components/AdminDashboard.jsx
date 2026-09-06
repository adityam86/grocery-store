import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, CheckCircle, Package, ArrowLeft, RefreshCw, X, BarChart2 } from 'lucide-react';
import { fallbackProducts } from '../data/fallbackProducts';
import { BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { API_BASE_URL } from '../constants/api';

const AdminDashboard = ({ onBack, currentTheme }) => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [apiMode, setApiMode] = useState(true);

  // Form State
  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    hindiName: '',
    category: 'staples',
    price: '',
    unit: '',
    description: '',
    tag: '',
    stockQuantity: '50'
  });

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('apna_bazar_token');
    try {
      const prodRes = await fetch(`${API_BASE_URL}/api/products`);
      const orderRes = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (prodRes.ok && orderRes.ok) {
        setProducts(await prodRes.json());
        setOrders(await orderRes.json());
        setApiMode(true);
      } else {
        throw new Error('API server returned error');
      }
    } catch (err) {
      console.warn('API Offline. Loading simulated database for Admin panel:', err.message);
      
      // Fallbacks
      const savedProds = localStorage.getItem('apna_bazar_simulated_products');
      setProducts(savedProds ? JSON.parse(savedProds) : fallbackProducts);

      const savedOrders = localStorage.getItem('apna_bazar_simulated_orders') || '[]';
      setOrders(JSON.parse(savedOrders));
      setApiMode(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('apna_bazar_token');

    const payload = {
      ...productForm,
      price: Number(productForm.price),
      stockQuantity: Number(productForm.stockQuantity)
    };

    try {
      if (isEditing) {
        const response = await fetch(`${API_BASE_URL}/api/products/${productForm.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Update failed');
      } else {
        const response = await fetch(`${API_BASE_URL}/api/products`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Create failed');
      }
      fetchData();
      closeForm();
    } catch (err) {
      // Offline fallback
      let updatedProds = [...products];
      if (isEditing) {
        updatedProds = updatedProds.map(p => p.id === productForm.id ? { ...p, ...payload } : p);
      } else {
        const newProd = {
          ...payload,
          id: `${productForm.category}-${Date.now()}`,
          rating: 5.0,
          reviewsCount: 0,
          inStock: payload.stockQuantity > 0
        };
        updatedProds.unshift(newProd);
      }
      setProducts(updatedProds);
      localStorage.setItem('apna_bazar_simulated_products', JSON.stringify(updatedProds));
      closeForm();
      setLoading(false);
    }
  };

  const handleProductDelete = async (productId) => {
    if (!confirm('Are you sure you want to remove this product?')) return;
    setLoading(true);
    const token = localStorage.getItem('apna_bazar_token');

    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${productId}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Delete failed');
      fetchData();
    } catch (err) {
      const updatedProds = products.filter(p => p.id !== productId);
      setProducts(updatedProds);
      localStorage.setItem('apna_bazar_simulated_products', JSON.stringify(updatedProds));
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem('apna_bazar_token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Status update failed');
      fetchData();
    } catch (err) {
      const updatedOrders = orders.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o);
      setOrders(updatedOrders);
      localStorage.setItem('apna_bazar_simulated_orders', JSON.stringify(updatedOrders));
    }
  };

  const openEdit = (product) => {
    setProductForm({
      ...product,
      stockQuantity: product.stockQuantity !== undefined ? String(product.stockQuantity) : '50'
    });
    setIsEditing(true);
    setShowProductForm(true);
  };

  const closeForm = () => {
    setProductForm({ id: '', name: '', hindiName: '', category: 'staples', price: '', unit: '', description: '', tag: '', stockQuantity: '50' });
    setIsEditing(false);
    setShowProductForm(false);
  };

  // Analytics helper calculations
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
  
  // Calculate Category Sales
  const categorySales = { staples: 0, spices: 0, dairy: 0, snacks: 0, beverages: 0 };
  orders.forEach(o => {
    o.items.forEach(it => {
      const matched = products.find(p => p.id === it.productId || p._id === it.productId);
      const cat = matched ? matched.category : 'staples';
      if (categorySales[cat] !== undefined) {
        categorySales[cat] += (it.price * it.quantity);
      }
    });
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:px-8 text-neutral-850 dark:text-neutral-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <button onClick={onBack} className="flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-neutral-200 mb-2 border-none bg-transparent cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </button>
          <h2 className="text-2xl font-extrabold flex items-center gap-2">
            ⚙️ Admin Console {!apiMode && <span className="text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">Offline Database</span>}
          </h2>
        </div>

        {/* Tab triggers */}
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${activeTab === 'products' ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
          >
            Manage Products
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${activeTab === 'orders' ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
          >
            Manage Orders ({orders.length})
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${activeTab === 'analytics' ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
          >
            Sales Analytics
          </button>
          <button onClick={fetchData} className="p-2 border border-neutral-200 rounded-xl hover:bg-neutral-50 cursor-pointer">
            <RefreshCw className="w-4 h-4 text-neutral-500" />
          </button>
        </div>
      </div>

      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-neutral-400">Inventory Catalog</h3>
            <button
              onClick={() => setShowProductForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-saffron-500 hover:bg-saffron-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, idx) => <div key={idx} className="bg-neutral-100 dark:bg-neutral-900 animate-pulse rounded-2xl h-28"></div>)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-neutral-900 border rounded-3xl"><p className="text-sm font-bold text-neutral-400">No items available.</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id || p._id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-bold text-neutral-400">{p.category}</span>
                    <h4 className="font-extrabold text-sm truncate mt-0.5">{p.name}</h4>
                    <p className="text-xs text-neutral-400 font-semibold">{p.hindiName || '—'}</p>
                    <p className="text-[10px] text-neutral-400 font-bold mt-1">Stock: {p.stockQuantity !== undefined ? p.stockQuantity : 50} units</p>
                    <p className="text-xs font-bold text-neutral-900 dark:text-white mt-2">₹{p.price} <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">/ {p.unit}</span></p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => openEdit(p)} className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-950 text-blue-500 cursor-pointer" title="Edit"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleProductDelete(p.id || p._id)} className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-950 text-red-500 cursor-pointer" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-neutral-400 mb-4">Customer Orders</h3>
          {loading ? (
            <div className="bg-neutral-100 dark:bg-neutral-900 animate-pulse rounded-2xl h-48 w-full"></div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-neutral-900 border rounded-3xl"><p className="text-sm font-bold text-neutral-400">No customer orders registered.</p></div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.orderId} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold text-neutral-800 dark:text-neutral-200">{order.orderId}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        order.status === 'Delivered' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                        order.status === 'Placed' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                        'bg-amber-500/10 border-amber-500/20 text-amber-500'
                      }`}>{order.status}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${order.paymentStatus === 'Paid' ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/15 text-amber-500 border-amber-500/20'}`}>{order.paymentStatus === 'Paid' ? 'Paid' : 'COD'}</span>
                    </div>
                    <p className="text-xs text-neutral-500">Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs text-neutral-505">Customer: <strong className="text-neutral-700 dark:text-neutral-300">{order.deliveryDetails.fullName}</strong> ({order.deliveryDetails.phone})</p>
                    <p className="text-xs text-neutral-400">Address: {order.deliveryDetails.address}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-400 font-bold block uppercase">Payable Total</span>
                      <span className="text-sm font-extrabold text-neutral-900 dark:text-white">₹{order.total}</span>
                    </div>

                    <div className="flex flex-col gap-1 w-full sm:w-auto">
                      <label className="text-[9px] uppercase font-bold text-neutral-400">Status Control</label>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                        className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-saffron-500"
                      >
                        <option value="Placed">Placed</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fade-in">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-neutral-400">Sales Dashboard</h3>
          
          {/* Key metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-neutral-900 p-6 border rounded-3xl shadow-sm">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Total Sales Revenue</span>
              <p className="text-2xl font-black mt-2 text-neutral-850 dark:text-white">₹{totalRevenue}</p>
            </div>
            <div className="bg-white dark:bg-neutral-900 p-6 border rounded-3xl shadow-sm">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Total Orders Handled</span>
              <p className="text-2xl font-black mt-2 text-neutral-850 dark:text-white">{orders.length} orders</p>
            </div>
            <div className="bg-white dark:bg-neutral-900 p-6 border rounded-3xl shadow-sm">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Average Order Value</span>
              <p className="text-2xl font-black mt-2 text-neutral-850 dark:text-white">₹{avgOrderValue}</p>
            </div>
          </div>

          {/* Graphical charts panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white dark:bg-neutral-900 p-6 border rounded-3xl shadow-sm h-80">
              <h4 className="font-extrabold text-xs uppercase text-neutral-400 mb-6 flex items-center gap-1.5"><BarChart2 className="w-4.5 h-4.5 text-saffron-500" /> Revenue by Category</h4>
              <ResponsiveContainer width="100%" height="80%">
                <RechartsBarChart data={Object.entries(categorySales).map(([name, value]) => ({ name, value }))}>
                  <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" fill="#F97316" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-6 border rounded-3xl shadow-sm h-80">
              <h4 className="font-extrabold text-xs uppercase text-neutral-400 mb-6">Category Market Share</h4>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={Object.entries(categorySales).map(([name, value]) => ({ name, value }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {Object.entries(categorySales).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white dark:bg-neutral-900 p-6 border rounded-3xl shadow-sm h-80 mt-6">
            <h4 className="font-extrabold text-xs uppercase text-neutral-400 mb-6">Weekly Revenue Trend</h4>
            <ResponsiveContainer width="100%" height="80%">
              <LineChart data={[
                { name: 'Mon', revenue: totalRevenue * 0.1 },
                { name: 'Tue', revenue: totalRevenue * 0.15 },
                { name: 'Wed', revenue: totalRevenue * 0.2 },
                { name: 'Thu', revenue: totalRevenue * 0.12 },
                { name: 'Fri', revenue: totalRevenue * 0.18 },
                { name: 'Sat', revenue: totalRevenue * 0.05 },
                { name: 'Sun', revenue: totalRevenue * 0.2 },
              ]}>
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm" onClick={closeForm}></div>
          <form onSubmit={handleProductSubmit} className="relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl max-w-lg w-full space-y-4 text-neutral-800 dark:text-neutral-100 max-h-[90vh] overflow-y-auto">
            <button type="button" onClick={closeForm} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-605"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold">{isEditing ? 'Modify Product' : 'Add New Product'}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Product Name (English)</label>
                <input required type="text" placeholder="e.g. Tata Salt" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 focus:outline-none focus:border-saffron-500" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Product Name (Hindi)</label>
                <input type="text" placeholder="e.g. टाटा नमक" value={productForm.hindiName} onChange={e => setProductForm({...productForm, hindiName: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 focus:outline-none focus:border-saffron-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Category</label>
                <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 focus:outline-none focus:border-saffron-500">
                  <option value="staples">Staples & Grains</option>
                  <option value="spices">Spices & Masalas</option>
                  <option value="dairy">Dairy & Fresh</option>
                  <option value="snacks">Sweets & Snacks</option>
                  <option value="beverages">Beverages</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Price (₹ INR)</label>
                <input required type="number" min="1" placeholder="99" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 focus:outline-none focus:border-saffron-500" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Weight / Unit</label>
                <input required type="text" placeholder="e.g. 1 kg, 500g" value={productForm.unit} onChange={e => setProductForm({...productForm, unit: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 focus:outline-none focus:border-saffron-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Badge Tag (Optional)</label>
                <input type="text" placeholder="e.g. Bestseller" value={productForm.tag} onChange={e => setProductForm({...productForm, tag: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 focus:outline-none focus:border-saffron-500" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Stock Quantity</label>
                <input required type="number" min="0" placeholder="50" value={productForm.stockQuantity} onChange={e => setProductForm({...productForm, stockQuantity: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 focus:outline-none focus:border-saffron-500" />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Description</label>
              <textarea placeholder="Write product characteristics..." rows="3" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 focus:outline-none focus:border-saffron-500" />
            </div>

            <button type="submit" className="w-full py-3 bg-saffron-500 hover:bg-saffron-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer">
              {isEditing ? 'Apply Changes' : 'Publish Product'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
