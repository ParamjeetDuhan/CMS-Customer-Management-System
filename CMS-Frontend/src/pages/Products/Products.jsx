import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiArrowLeft, HiSearch, HiShoppingCart } from 'react-icons/hi';
import shopService from '../../services/shopService';
import { PageLoader, SkeletonCard } from '../../components/common/Loader';
import { EmptyState, ErrorState } from '../../components/common/Badge';
import { useCart } from '../../hooks/useCart';
import ProductCard from './ProductCard';
import { formatCurrency } from '../../utils/helpers';
import ProductModal from '../Products/ProductModal';

const Products = () => {
  const { id: shopId } = useParams();
  const { count, total } = useCart();
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [shop,       setShop]       = useState(null);
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState('');
  const [activecat,  setActiveCat]  = useState('All');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [shopData,prodData] = await Promise.all([
          shopService.getShopById(shopId),
          shopService.getShopProducts(shopId),
        ]);
        const s = shopData.shop || shopData;
        const p = prodData.products || prodData || [];
        setShop(s);
        setProducts(p);

        // derive categories
        const cats = ['All', ...new Set(p.map((x) => x.category).filter(Boolean))];
        setCategories(cats);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [shopId]);

  if (loading) return <PageLoader />;
  if (error)   return <div className="page-container py-10"><ErrorState message={error} /></div>;

  const filtered = products.filter((p) => {
    const matchCat  = activecat === 'All' || p.category === activecat;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="sticky top-16 z-30 bg-brand-bg/95 backdrop-blur-md border-b border-brand-border">
        <div className="page-container py-4">
          <div className="flex items-center gap-3 mb-3">
            <Link to={`/shops/${shopId}`} className="p-2 rounded-xl hover:bg-brand-card text-gray-400 hover:text-white transition-all">
              <HiArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-display font-bold text-white text-lg leading-tight">{shop?.name}</h1>
              <p className="text-xs text-brand-muted font-body">{products.length} products</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="input-field pl-10 py-2.5 text-sm"
            />
          </div>

          {/* Category pills */}
          {categories.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCat(c)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border whitespace-nowrap transition-all ${
                    activecat === c
                      ? 'bg-primary-500 border-primary-500 text-white'
                      : 'bg-brand-surface border-brand-border text-gray-400 hover:border-brand-muted'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="page-container py-6">
        {filtered.length === 0 ? (
          <EmptyState icon="🔍" title="No products found" description="Try a different search or category." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((p) => (
             <ProductCard key={p.id} product={p} shop={shop} onClick={(id) => setSelectedProductId(id)}/>
            ))}
          </div>
        )}
      </div>

      {/* Cart sticky bar */}
      {count > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <Link to="/cart"
            className="flex items-center gap-4 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3.5 rounded-2xl shadow-glow-lg transition-all">
            <div className="flex items-center gap-2">
              <HiShoppingCart className="w-5 h-5" />
              <span className="w-5 h-5 bg-white/20 rounded-full text-xs font-bold flex items-center justify-center">
                {count}
              </span>
            </div>
            <span className="font-semibold font-body">View Cart</span>
            <span className="font-mono font-bold">{formatCurrency(total)}</span>
          </Link>
        </div>
      )}
      <ProductModal
  productId={selectedProductId}
  onClose={() => setSelectedProductId(null)}
/>
    </div>
  );
};

export default Products;
