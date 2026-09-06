import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, Zap, Sparkles, Heart, HelpCircle } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { useWishlist } from '../../hooks/useWishlist';
import { useTheme } from '../../hooks/useTheme';
import { setSelectedProduct } from '../../redux/slices/productSlice';
import ProductCard from '../../components/cards/ProductCard';
import SkeletonLoader from '../../components/loaders/SkeletonLoader';
import ProductDetailModal from '../../components/modals/ProductDetailModal';
import { updateProductInList, selectSelectedProduct } from '../../redux/slices/productSlice';
import { useSelector } from 'react-redux';
import { CATEGORY_GROUPS, CATEGORIES_LIST as CATS } from '../../constants/categories';
import { Wheat, Flame, Milk, Coffee, Cookie } from 'lucide-react';

const StoreHero = ({ currentTheme, themeObj }) => (
  <section className="px-4 pt-6 pb-12 md:px-8 max-w-7xl mx-auto animate-fade-in">
    <div className={`relative rounded-[32px] overflow-hidden p-8 md:p-12 lg:p-16 flex flex-col md:flex-row md:items-center justify-between gap-8 border transition-all duration-500 bg-gradient-to-r ${themeObj.gradient}`}>
      <div className="absolute -left-12 -top-12 w-48 h-48 rounded-full bg-saffron-100/30 blur-3xl" />
      <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-cardamom-100/30 blur-3xl" />
      <div className="relative max-w-xl z-10">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-6 shadow-sm ${
          currentTheme === 'midnight' ? 'bg-neutral-800 text-curry-400 border border-neutral-700' : 'bg-white text-saffron-700 border border-neutral-100'
        }`}>
          <Sparkles className="w-3.5 h-3.5" /> Direct Delivery From India
        </div>
        <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4 transition-colors duration-500 ${
          currentTheme === 'midnight' ? 'text-white' : 'text-neutral-900'
        }`}>
          Bring the Authentic <span className={themeObj.accentText}>Flavours of India</span> to Your Kitchen
        </h1>
        <p className={`text-sm sm:text-base mb-8 max-w-md font-medium transition-colors duration-500 ${
          currentTheme === 'midnight' ? 'text-neutral-400' : 'text-neutral-600'
        }`}>
          From daily-essential Basmati rice and fresh stone-ground Atta to premium Kashmiri red chillies and soft curd. Hand-picked and fresh.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: ShieldCheck, title: '100% Quality Sealed', sub: 'Pure ingredients & authentic brands' },
            { icon: Zap, title: 'Same-Day Despatch', sub: 'Free delivery on orders above ₹500' },
          ].map(({ icon: Icon, title, sub }) => (
            <div key={title} className={`flex items-center gap-3 border p-3 rounded-2xl shadow-sm transition-colors duration-500 ${
              currentTheme === 'midnight' ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white/70 border-white/40'
            }`}>
              <Icon className={`w-5 h-5 ${currentTheme === 'midnight' ? 'text-curry-500' : 'text-saffron-500'}`} />
              <div>
                <h4 className="text-xs font-bold">{title}</h4>
                <p className="text-[10px] text-neutral-400">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full md:w-5/12 max-w-md relative flex items-center justify-center">
        <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-saffron-200/30 to-cardamom-200/30 absolute blur-2xl" />
        <div className={`relative border p-6 rounded-[32px] shadow-lg w-full z-10 flex flex-col items-center justify-center text-center transition-colors duration-500 ${
          currentTheme === 'midnight' ? 'bg-neutral-900 border-neutral-800 text-white' : 'glass-card border-white bg-white/60'
        }`}>
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 flex items-center justify-center text-white font-extrabold text-xl shadow-md mb-4 rotate-3">🌾</div>
          <h3 className="font-extrabold text-lg mb-1">Weekly Special Bag</h3>
          <p className="text-xs text-neutral-400 mb-4 max-w-xs">Get classic staples, spices, and fresh lassi packaged with love and care.</p>
          <span className={`text-xs font-bold text-white px-4 py-1.5 rounded-full shadow-sm cursor-pointer ${themeObj.primary}`}>Explore Fresh Arrivals</span>
        </div>
      </div>
    </div>
  </section>
);

const HomePage = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { products, loading, selectedCategory, setCategory, setSearch } = useProducts();
  const { toggle } = useWishlist();
  const { currentTheme, themeObj } = useTheme();
  const selectedProduct = useSelector(selectSelectedProduct);
  const isNight = currentTheme === 'midnight';

  // Respect URL ?category= param
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setCategory(cat);
  }, [searchParams]);

  const recommendedItems = products.filter(p => p.tag === 'Bestseller' || p.tag === 'Organic' || p.tag === 'Must Buy').slice(0, 4);

  return (
    <>
      <StoreHero currentTheme={currentTheme} themeObj={themeObj} />

      {/* Categories & Catalog */}
      <section className="max-w-7xl mx-auto px-4 pb-16 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Shop by Category</h2>
            <p className="text-xs text-neutral-400 mt-1 font-medium">Select a section or search products below</p>
          </div>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {/* All Products */}
          <button onClick={() => setCategory('all')}
            className={`flex flex-col justify-center items-center text-center p-5 rounded-[24px] border transition-all cursor-pointer active:scale-95 shadow-sm ${
              selectedCategory === 'all'
                ? isNight ? 'bg-curry-500 border-curry-500 text-neutral-950 shadow-md' : 'bg-neutral-900 border-neutral-900 text-white shadow-md'
                : isNight ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}>
            <Sparkles className={`w-8 h-8 mb-2 ${selectedCategory === 'all' ? (isNight ? 'text-neutral-950' : 'text-saffron-400') : 'text-neutral-400'}`} />
            <span className="text-xs font-bold uppercase tracking-wider">All Products</span>
            <span className="text-[9px] text-neutral-400 font-medium mt-1">पूरे उत्पाद • Catalog View</span>
          </button>

          {CATEGORY_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className={`col-span-1 border rounded-[24px] p-4 flex flex-col gap-3 transition-colors duration-500 ${isNight ? 'bg-neutral-900/40 border-neutral-800' : 'bg-neutral-50/50 border-neutral-200'}`}>
              <div className="flex justify-between items-baseline border-b border-neutral-200/40 dark:border-neutral-800/60 pb-1.5 px-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">{group.groupName}</span>
                <span className="text-[9px] font-bold text-neutral-400">{group.hindiGroup}</span>
              </div>
              <div className="grid grid-cols-1 gap-2 flex-grow">
                {group.categories.map((cat) => {
                  const IconComp = cat.icon;
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button key={cat.id} onClick={() => setCategory(cat.id)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left cursor-pointer transition-all active:scale-97 ${
                        isActive
                          ? isNight ? 'bg-curry-500 border-curry-500 text-neutral-950 font-black shadow' : 'bg-neutral-900 border-neutral-900 text-white font-black shadow'
                          : isNight ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                      }`}>
                      <IconComp className={`w-4 h-4 shrink-0 ${isActive ? (isNight ? 'text-neutral-950' : 'text-saffron-400') : 'text-neutral-400'}`} />
                      <div className="min-w-0">
                        <span className="text-xs font-bold block truncate">{cat.name}</span>
                        <span className="text-[8px] text-neutral-400 font-medium block truncate mt-0.5">{cat.subtitle}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Products Grid */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-sm uppercase tracking-wider">
              {selectedCategory === 'all' ? 'All Items' : CATS.find(c => c.id === selectedCategory)?.name}
            </h3>
            <span className="text-xs font-semibold text-neutral-400">Showing {products.length} products</span>
          </div>

          {loading ? (
            <SkeletonLoader />
          ) : products.length === 0 ? (
            <div className={`text-center py-16 rounded-3xl border p-8 max-w-md mx-auto ${isNight ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-100'}`}>
              <HelpCircle className="w-12 h-12 text-neutral-500 mx-auto mb-4" />
              <h3 className="font-bold mb-1">No products found</h3>
              <p className="text-xs text-neutral-400">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
              {products.map((product) => (
                <div key={product._id || product.id} className={`transition-colors duration-500 rounded-3xl ${isNight ? 'bg-neutral-900 border border-neutral-800 text-white' : 'bg-white'}`}>
                  <ProductCard
                    product={product}
                    onToggleWishlist={toggle}
                    onSelectProduct={(p) => dispatch(setSelectedProduct(p))}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommendations */}
        {recommendedItems.length > 0 && selectedCategory === 'all' && (
          <div className="mt-16 border-t border-neutral-200 dark:border-neutral-800/80 pt-12">
            <h3 className="text-lg font-extrabold tracking-tight mb-2 flex items-center gap-1.5">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" /> Recommended For You
            </h3>
            <p className="text-xs text-neutral-400 mb-6 font-medium">Hand-picked fresh products in high demand</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {recommendedItems.map(p => (
                <div key={`rec-${p._id || p.id}`} className={`transition-colors duration-500 rounded-3xl ${isNight ? 'bg-neutral-900 border border-neutral-800 text-white' : 'bg-white'}`}>
                  <ProductCard product={p} onToggleWishlist={toggle} onSelectProduct={(p) => dispatch(setSelectedProduct(p))} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => dispatch(setSelectedProduct(null))}
        onAddReview={(updatedProd) => dispatch(updateProductInList(updatedProd))}
      />
    </>
  );
};

export default HomePage;
