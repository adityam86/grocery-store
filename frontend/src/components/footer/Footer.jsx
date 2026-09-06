import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';

const Footer = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const isNight = currentTheme === 'midnight';

  return (
    <footer className={`w-full py-12 px-4 md:px-8 border-t transition-colors duration-500 ${isNight ? 'bg-neutral-950 text-neutral-400 border-neutral-900' : 'bg-neutral-900 text-neutral-400 border-neutral-800'}`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-neutral-800/60">
        <div className="space-y-4">
          <h3 className="font-extrabold text-white text-lg">Apna Bazar</h3>
          <p className="text-xs text-neutral-500 leading-relaxed font-medium">
            Bringing premium quality, fresh, and hand-selected products direct from the farms and brands of India to your home.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-white text-sm mb-4">Categories</h4>
          <ul className="space-y-2 text-xs">
            {[
              { label: 'Staples & Grains', cat: 'staples' },
              { label: 'Spices & Masalas', cat: 'spices' },
              { label: 'Dairy & Fresh', cat: 'dairy' },
              { label: 'Teas & Beverages', cat: 'beverages' },
            ].map(({ label, cat }) => (
              <li key={cat}>
                <button onClick={() => navigate(`/?category=${cat}`)} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none text-neutral-400 text-xs">
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white text-sm mb-4">Customer Care</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="#" className="hover:text-white transition-colors">Help Centre</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Shipping & Returns</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Refund Policies</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white text-sm mb-4">Our Commitment</h4>
          <p className="text-xs text-neutral-500 leading-relaxed font-medium">
            We stand by our purity guarantee. If you are not satisfied with the quality of any product, enjoy a full refund — no questions asked.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-600 gap-4">
        <span>&copy; {new Date().getFullYear()} Apna Bazar Groceries. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-neutral-500">Terms of Service</a>
          <a href="#" className="hover:text-neutral-400">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
