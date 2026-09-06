import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, LogIn } from 'lucide-react';
import { selectWishlistItems } from '../../redux/slices/wishlistSlice';
import { selectAllProducts, selectProducts } from '../../redux/slices/productSlice';
import { selectUser } from '../../redux/slices/authSlice';
import { useTheme } from '../../hooks/useTheme';
import { useWishlist } from '../../hooks/useWishlist';
import ProductCard from '../../components/cards/ProductCard';

const WishlistPage = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const { currentTheme, themeObj } = useTheme();
  const { toggle } = useWishlist();

  const wishlistItems = useSelector(selectWishlistItems);

  // Use allItems (from fetchAllProducts) and fall back to items if needed
  const allProducts = useSelector(selectAllProducts);
  const products = useSelector(selectProducts);
  const productPool = allProducts.length > 0 ? allProducts : products;

  const isDark = currentTheme === 'midnight';

  // Filter product pool to only wishlisted items
  const wishlisted = productPool.filter((p) =>
    wishlistItems.includes(p._id || p.id)
  );

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center px-4 ${
          isDark
            ? 'bg-neutral-950 text-neutral-100'
            : 'bg-neutral-50 text-neutral-800'
        }`}
      >
        <div
          className={`rounded-3xl p-10 shadow-xl border flex flex-col items-center gap-6 max-w-sm w-full text-center ${
            isDark
              ? 'bg-neutral-900 border-neutral-800'
              : 'bg-white border-neutral-200'
          }`}
        >
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-inner ${
              isDark ? 'bg-neutral-800' : 'bg-rose-50'
            }`}
          >
            🤍
          </div>

          <div>
            <h2 className="text-xl font-extrabold tracking-tight mb-2">
              Save Your Favourites
            </h2>
            <p
              className={`text-sm leading-relaxed ${
                isDark ? 'text-neutral-400' : 'text-neutral-500'
              }`}
            >
              Please log in to see your wishlist and save items for later.
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider text-white shadow-md transition-all active:scale-95 ${themeObj.primary}`}
          >
            <LogIn className="w-4 h-4" />
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ── Logged in ──────────────────────────────────────────────────────────────
  return (
    <div
      className={`min-h-screen ${
        isDark
          ? 'bg-neutral-950 text-neutral-100'
          : 'bg-neutral-50 text-neutral-800'
      }`}
    >
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div
        className={`w-full border-b ${
          isDark
            ? 'bg-neutral-900 border-neutral-800'
            : 'bg-white border-neutral-200'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                isDark ? 'bg-neutral-800' : 'bg-rose-50'
              }`}
            >
              <Heart className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                Your Wishlist
              </h1>
              <p
                className={`text-xs font-medium mt-0.5 ${
                  isDark ? 'text-neutral-400' : 'text-neutral-500'
                }`}
              >
                {wishlisted.length > 0
                  ? `${wishlisted.length} item${wishlisted.length !== 1 ? 's' : ''} saved for later`
                  : 'Your saved items will appear here'}
              </p>
            </div>
          </div>

          {wishlisted.length > 0 && (
            <button
              onClick={() => navigate('/')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all active:scale-95 ${
                isDark
                  ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                  : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Browse More
            </button>
          )}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {wishlisted.length === 0 ? (
          /* ── Empty State ──────────────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
            <div
              className={`w-28 h-28 rounded-full flex items-center justify-center text-5xl shadow-inner ${
                isDark ? 'bg-neutral-900' : 'bg-rose-50'
              }`}
            >
              🤍
            </div>

            <div>
              <h2 className="text-2xl font-extrabold tracking-tight mb-3">
                Nothing saved yet
              </h2>
              <p
                className={`text-sm max-w-xs leading-relaxed mx-auto ${
                  isDark ? 'text-neutral-400' : 'text-neutral-500'
                }`}
              >
                Tap the{' '}
                <Heart className="w-3.5 h-3.5 inline text-rose-400" /> on any
                product to add it to your wishlist.
              </p>
            </div>

            <button
              onClick={() => navigate('/')}
              className={`flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm uppercase tracking-wider text-white shadow-lg transition-all active:scale-95 ${themeObj.primary}`}
            >
              <ShoppingBag className="w-4 h-4" />
              Browse Store
            </button>
          </div>
        ) : (
          /* ── Product Grid ─────────────────────────────────────────────────── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {wishlisted.map((product) => (
              <div
                key={product._id || product.id}
                className={`rounded-3xl border ${
                  isDark
                    ? 'bg-neutral-900 border-neutral-800'
                    : 'bg-white border-neutral-200/60'
                }`}
              >
                <ProductCard
                  product={product}
                  onToggleWishlist={toggle}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
