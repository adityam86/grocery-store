import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, MessageSquare, Package } from 'lucide-react';
import { selectAllProducts, selectProducts } from '../../redux/slices/productSlice';
import { useTheme } from '../../hooks/useTheme';

const CATEGORY_EMOJIS = {
  rice: '🍚',
  atta: '🌾',
  flour: '🌾',
  spices: '🌶️',
  masala: '🌶️',
  lentils: '🫘',
  dal: '🫘',
  pulses: '🫘',
  dairy: '🥛',
  paneer: '🧀',
  ghee: '🫙',
  oil: '🫙',
  snacks: '🍿',
  sweets: '🍬',
  mithai: '🍬',
  beverages: '☕',
  tea: '🍵',
  chai: '🍵',
  coffee: '☕',
  frozen: '❄️',
  fresh: '🥬',
  vegetables: '🥦',
  fruits: '🍎',
  pickles: '🥒',
  condiments: '🍯',
  noodles: '🍜',
  pasta: '🍝',
  bakery: '🍞',
  default: '🛒',
};

const getCategoryEmoji = (category) => {
  if (!category) return CATEGORY_EMOJIS.default;
  const lower = category.toLowerCase();
  for (const [key, emoji] of Object.entries(CATEGORY_EMOJIS)) {
    if (lower.includes(key)) return emoji;
  }
  return CATEGORY_EMOJIS.default;
};

const StarRating = ({ rating, size = 'sm' }) => {
  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSize} ${
            star <= Math.round(rating)
              ? 'text-amber-400 fill-amber-400'
              : 'text-neutral-300 dark:text-neutral-600'
          }`}
        />
      ))}
    </div>
  );
};

const ReviewCard = ({ review, isDark }) => (
  <div
    className={`p-4 rounded-2xl border transition-all ${
      isDark
        ? 'bg-neutral-800/60 border-neutral-700/60'
        : 'bg-neutral-50 border-neutral-100'
    }`}
  >
    <div className="flex items-start justify-between gap-3 mb-2">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-saffron-400 to-curry-500 flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0 shadow-sm">
          {(review.userName || review.user || review.name || 'U')[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-neutral-800'}`}>
            {review.userName || review.user || review.name || 'Anonymous'}
          </p>
          {review.createdAt && (
            <p className={`text-[10px] ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
              {new Date(review.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
            </p>
          )}
        </div>
      </div>
      <StarRating rating={review.rating || 0} />
    </div>
    {review.comment && (
      <p className={`text-sm leading-relaxed mt-1 ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
        "{review.comment}"
      </p>
    )}
  </div>
);

const ProductReviewCard = ({ product, isDark, themeObj, currentTheme }) => {
  const reviews = product.reviews || [];
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : 0;

  const categoryEmoji = getCategoryEmoji(product.category);

  return (
    <div
      className={`rounded-3xl border overflow-hidden transition-all hover:shadow-lg ${
        isDark
          ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
          : 'bg-white border-neutral-200 shadow-sm hover:border-saffron-200'
      }`}
    >
      {/* Product header */}
      <div
        className={`px-6 py-5 border-b ${
          isDark ? 'border-neutral-800' : 'border-neutral-100'
        }`}
      >
        <div className="flex items-start gap-4">
          {/* Category icon */}
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
              isDark ? 'bg-neutral-800' : 'bg-gradient-to-br from-saffron-50 to-curry-50 border border-saffron-100'
            }`}
          >
            {product.emoji || categoryEmoji}
          </div>

          {/* Product info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3
                  className={`font-extrabold text-base truncate ${
                    isDark ? 'text-white' : 'text-neutral-800'
                  }`}
                >
                  {product.name}
                </h3>
                {product.hindiName && (
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    {product.hindiName}
                  </p>
                )}
                <p
                  className={`text-xs font-semibold mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                    isDark
                      ? 'bg-neutral-800 border-neutral-700 text-neutral-400'
                      : 'bg-saffron-50 border-saffron-100 text-saffron-700'
                  }`}
                >
                  {categoryEmoji} {product.category}
                </p>
              </div>

              {/* Average rating badge */}
              <div
                className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-2xl border ${
                  isDark
                    ? 'bg-neutral-800 border-neutral-700'
                    : 'bg-amber-50 border-amber-100'
                }`}
              >
                <span className={`text-lg font-extrabold leading-none ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                  {avgRating.toFixed(1)}
                </span>
                <StarRating rating={avgRating} size="sm" />
                <span className={`text-[9px] font-bold uppercase mt-0.5 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews list */}
      <div className="px-6 py-5 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className={`w-3.5 h-3.5 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`} />
          <span
            className={`text-[10px] font-extrabold uppercase tracking-wider ${
              isDark ? 'text-neutral-500' : 'text-neutral-400'
            }`}
          >
            Customer Reviews
          </span>
        </div>
        {reviews.map((review, idx) => (
          <ReviewCard key={review._id || review.id || idx} review={review} isDark={isDark} />
        ))}
      </div>
    </div>
  );
};

const ReviewsPage = () => {
  const { currentTheme, themeObj } = useTheme();
  const isDark = currentTheme === 'midnight';
  const navigate = useNavigate();

  // Prefer allItems (full catalogue) for reviews; fall back to paginated items
  const allProducts = useSelector(selectAllProducts);
  const paginatedProducts = useSelector(selectProducts);
  const products = allProducts.length > 0 ? allProducts : paginatedProducts;

  // Only show products that have at least one review
  const productsWithReviews = useMemo(
    () => products.filter((p) => Array.isArray(p.reviews) && p.reviews.length > 0),
    [products]
  );

  const totalReviews = useMemo(
    () => productsWithReviews.reduce((sum, p) => sum + p.reviews.length, 0),
    [productsWithReviews]
  );

  const overallAvg = useMemo(() => {
    if (totalReviews === 0) return 0;
    const total = productsWithReviews.reduce(
      (sum, p) =>
        sum + p.reviews.reduce((s, r) => s + (r.rating || 0), 0),
      0
    );
    return total / totalReviews;
  }, [productsWithReviews, totalReviews]);

  return (
    <div
      className={`min-h-screen pb-16 ${
        isDark
          ? 'bg-neutral-950'
          : 'bg-gradient-to-br from-saffron-50 via-curry-50/30 to-cardamom-50/40'
      }`}
    >
      {/* ── Header ── */}
      <div
        className={`sticky top-0 z-20 border-b ${
          isDark
            ? 'bg-neutral-950/90 border-neutral-800 backdrop-blur-xl'
            : 'bg-white/90 border-neutral-100 backdrop-blur-xl'
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all hover:scale-105 ${
              isDark
                ? 'border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 bg-neutral-900'
                : 'border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:border-neutral-300 bg-white'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h1
              className={`text-lg font-extrabold ${
                isDark ? 'text-white' : 'text-neutral-800'
              }`}
            >
              Customer Reviews
            </h1>
            <p
              className={`text-xs font-medium ${
                isDark ? 'text-neutral-500' : 'text-neutral-400'
              }`}
            >
              {productsWithReviews.length} products · {totalReviews} total reviews
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── Overall Stats Banner ── */}
        {productsWithReviews.length > 0 && (
          <div
            className={`rounded-3xl p-6 border ${
              isDark
                ? 'bg-gradient-to-r from-neutral-900 via-neutral-850 to-neutral-900 border-neutral-800'
                : 'bg-gradient-to-r from-saffron-500 via-curry-500 to-cardamom-500 border-transparent'
            }`}
          >
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex flex-col items-center">
                <span className={`text-4xl font-extrabold leading-none ${isDark ? 'text-white' : 'text-white'}`}>
                  {overallAvg.toFixed(1)}
                </span>
                <div className="mt-1">
                  <StarRating rating={overallAvg} size="md" />
                </div>
                <span className={`text-[10px] font-bold uppercase mt-1 ${isDark ? 'text-neutral-400' : 'text-white/70'}`}>
                  Overall Rating
                </span>
              </div>
              <div className={`w-px h-12 ${isDark ? 'bg-neutral-800' : 'bg-white/30'}`} />
              <div className="flex gap-6">
                <div className="text-center">
                  <p className={`text-2xl font-extrabold ${isDark ? 'text-curry-400' : 'text-white'}`}>
                    {totalReviews}
                  </p>
                  <p className={`text-[10px] font-bold uppercase ${isDark ? 'text-neutral-500' : 'text-white/70'}`}>
                    Reviews
                  </p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-extrabold ${isDark ? 'text-curry-400' : 'text-white'}`}>
                    {productsWithReviews.length}
                  </p>
                  <p className={`text-[10px] font-bold uppercase ${isDark ? 'text-neutral-500' : 'text-white/70'}`}>
                    Products
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Reviews list or empty state ── */}
        {productsWithReviews.length === 0 ? (
          <div
            className={`rounded-3xl border p-12 text-center ${
              isDark
                ? 'bg-neutral-900 border-neutral-800'
                : 'bg-white border-neutral-200 shadow-sm'
            }`}
          >
            <div className="text-5xl mb-4">⭐</div>
            <Package className={`w-10 h-10 mx-auto mb-4 ${isDark ? 'text-neutral-700' : 'text-neutral-200'}`} />
            <h3
              className={`font-extrabold text-lg mb-2 ${
                isDark ? 'text-white' : 'text-neutral-800'
              }`}
            >
              No Reviews Yet
            </h3>
            <p
              className={`text-sm max-w-xs mx-auto mb-6 ${
                isDark ? 'text-neutral-400' : 'text-neutral-500'
              }`}
            >
              Be the first to leave a review! Purchase a product and share your experience with our community.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 bg-gradient-to-r from-saffron-500 to-curry-500 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {productsWithReviews.map((product) => (
              <ProductReviewCard
                key={product._id || product.id}
                product={product}
                isDark={isDark}
                themeObj={themeObj}
                currentTheme={currentTheme}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;
