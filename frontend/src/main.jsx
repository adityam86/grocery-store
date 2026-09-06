import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { CartProvider } from './context/CartContext';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      {/* CartContext kept for backward compat with legacy components (CartModal, ProductCard, CheckoutForm) */}
      <CartProvider>
        <App />
      </CartProvider>
    </Provider>
  </React.StrictMode>
);
