import React from 'react';
import { useSelector } from 'react-redux';
import { useCart } from '../../context/CartContext';
import { Star, Wheat, Flame, Milk, Coffee, Cookie, Plus, Heart } from 'lucide-react';
import { selectWishlistItems } from '../../redux/slices/wishlistSlice';

const categoryGraphics = {
  staples: {
    bg: 'from-amber-100/80 to-amber-200/50',
    icon: Wheat,
    iconColor: 'text-amber-700',
    labelColor: 'text-amber-800',
    labelBg: 'bg-amber-200/30',
    label: 'Staples & Grains',
  },
  spices: {
    bg: 'from-orange-100/80 to-red-100/50',
    icon: Flame,
    iconColor: 'text-orange-600',
    labelColor: 'text-orange-800',
    labelBg: 'bg-orange-200/30',
    label: 'Spices & Masalas',
  },
  dairy: {
    bg: 'from-emerald-100/80 to-teal-50/50',
    icon: Milk,
    iconColor: 'text-emerald-700',
    labelColor: 'text-emerald-800',
    labelBg: 'bg-emerald-200/30',
    label: 'Fresh & Dairy',
  },
  beverages: {
    bg: 'from-teal-100/80 to-sky-100/50',
    icon: Coffee,
    iconColor: 'text-teal-700',
    labelColor: 'text-teal-800',
    labelBg: 'bg-teal-200/30',
    label: 'Beverages & Chai',
  },
  snacks: {
    bg: 'from-rose-100/80 to-orange-50/50',
    icon: Cookie,
    iconColor: 'text-rose-600',
    labelColor: 'text-rose-800',
    labelBg: 'bg-rose-200/30',
    label: 'Sweets & Snacks',
  },
};

const ProductCard = ({ product, onToggleWishlist, onSelectProduct }) => {
  const { addToCart } = useCart();
  const wishlistItems = useSelector(selectWishlistItems);
  const productId = product._id || product.id;
  const isWishlisted = wishlistItems.includes(productId);

  const graphic = categoryGraphics[product.category] || categoryGraphics.snacks;
  const IconComp = graphic.icon;

  const handleCardClick = (e) => {
    if (e.target.closest('button')) return;
    if (onSelectProduct) onSelectProduct(product);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer bg-inherit text-inherit rounded-3xl p-4 shadow-sm border border-neutral-200/50 hover:shadow-md hover:border-neutral-300/50 transition-all duration-300 flex flex-col relative h-full"
    >
      {/* Badge */}
      {product.tag && (
        <span className="absolute top-6 left-6 z-10 text-[10px] font-bold uppercase tracking-widest text-white bg-neutral-900 px-2.5 py-1 rounded-lg shadow-sm">
          {product.tag}
        </span>
      )}

      {/* Wishlist Heart */}
      {onToggleWishlist && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(productId); }}
          className="absolute top-6 right-6 z-10 p-1.5 rounded-full bg-white/80 dark:bg-neutral-800/80 hover:scale-105 active:scale-95 transition-all shadow cursor-pointer border-none"
          title="Toggle Wishlist"
        >
          <Heart
            className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-neutral-450 dark:text-neutral-300'}`}
          />
        </button>
      )}

      {/* Category Graphic */}
      <div className="overflow-hidden rounded-2xl mb-4">
        <div className={`w-full h-48 bg-gradient-to-br ${graphic.bg} rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-xl transform translate-x-4 -translate-y-4" />
          <IconComp className={`w-16 h-16 ${graphic.iconColor} drop-shadow-sm mb-2`} />
          <span className={`text-xs font-semibold tracking-wider ${graphic.labelColor} uppercase ${graphic.labelBg} px-3 py-1 rounded-full backdrop-blur-sm`}>
            {graphic.label}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-grow flex flex-col">
        <div className="flex items-center gap-1 mb-1">
          <Star className="w-4 h-4 fill-amber-450 text-amber-450" />
          <span className="text-xs font-semibold">{product.rating || 5.0}</span>
          <span className="text-xs text-neutral-450 font-semibold">({product.reviewsCount || 0})</span>
        </div>
        <h3 className="font-bold text-sm tracking-tight group-hover:opacity-85 transition-opacity line-clamp-1">{product.name}</h3>
        <p className="text-xs font-medium text-neutral-400 mb-2">{product.hindiName}</p>
        <p className="text-xs text-neutral-400 line-clamp-2 mb-4 flex-grow">{product.description}</p>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-neutral-100/10">
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xs font-bold">₹</span>
              <span className="text-lg font-extrabold">{product.price}</span>
            </div>
            <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">{product.unit}</span>
          </div>
          <button
            onClick={() => addToCart(product)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-saffron-500 text-white hover:opacity-90 active:scale-95 shadow-sm transition-all cursor-pointer bg-gradient-to-tr from-saffron-500 to-orange-500"
            title="Add to Cart"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
