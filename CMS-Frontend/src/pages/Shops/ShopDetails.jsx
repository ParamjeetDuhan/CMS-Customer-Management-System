import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiLocationMarker, HiStar, HiClock, HiPhone, HiArrowLeft, HiShoppingBag } from 'react-icons/hi';
import shopService from '../../services/shopService';
import { PageLoader } from '../../components/common/Loader';
import { StarRating, EmptyState, ErrorState } from '../../components/common/Badge';
import { formatDateTime, truncate } from '../../utils/helpers';
import ProductCard from '../Products/ProductCard';
import ProductModal from '../Products/ProductModal';

const ShopDetails = () => {
  const { id } = useParams();
  const [shop,     setShop]     = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews,  setReviews]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [tab,      setTab]      = useState('products');
  const [selectedProductId, setSelectedProductId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [shopData,prodData,revData] = await Promise.all([
          shopService.getShopById(id),
          shopService.getShopProducts(id),
          shopService.getShopReviews(id).catch(() => ({ reviews: [] })),
        ]);
        setShop(shopData.shop || shopData);
        setProducts(prodData.products || prodData || []);
        setReviews(revData.reviews || revData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);
  
  if (loading) return <PageLoader />;
  if (error)   return <div className="page-container py-10"><ErrorState message={error} /></div>;
  if (!shop)   return null;
  return (
    <div className="min-h-screen">
      {/* Hero banner */}
      <div className="relative h-64 md:h-80 overflow-hidden bg-brand-surface">
        <img
          src={shop.imageUrl || `https://placehold.co/1200x320/1a1a1a/f97316?text=${encodeURIComponent(shop.name)}`}
          alt={shop.name}
          className="w-full h-full object-cover opacity-60"
          onError={(e) => { e.target.src = `https://placehold.co/1200x320/1a1a1a/f97316?text=${encodeURIComponent(shop.name)}`; }}
        />
        <div className="overlay-gradient absolute inset-0" />
        <div className="absolute top-4 left-4">
          <Link to="/shops" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-sm text-white text-sm hover:bg-black/70 transition-all">
            <HiArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </div>

      <div className="page-container -mt-16 relative z-10 pb-12">
        {/* Shop info card */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-white">{shop.name}</h1>
                {shop.isOpen !== undefined && (
                  <span className={`badge text-xs ${shop.isOpen ? 'badge-success' : 'badge-error'}`}>
                    {shop.isOpen ? '● Open' : '● Closed'}
                  </span>
                )}
              </div>

              {shop.category && (
                <span className="badge-primary text-xs mb-3 inline-block">{shop.category}</span>
              )}

              {shop.description && (
                <p className="text-gray-400 font-body text-sm leading-relaxed mb-4 max-w-xl">
                  {shop.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-brand-muted font-body">
                {shop.address && (
                  <span className="flex items-center gap-1.5">
                    <HiLocationMarker className="w-4 h-4 text-primary-400" />
                    {shop.address}
                  </span>
                )}
                {shop.phone && (
                  <span className="flex items-center gap-1.5">
                    <HiPhone className="w-4 h-4 text-primary-400" />
                    {shop.phone}
                  </span>
                )}
                {shop.hours && (
                  <span className="flex items-center gap-1.5">
                    <HiClock className="w-4 h-4 text-primary-400" />
                    {shop.hours}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end gap-4">
              <div className="text-center md:text-right">
                <div className="font-display text-3xl font-bold text-white">
                  {Number(shop.rating || 0).toFixed(1)}
                </div>
                <StarRating rating={shop.rating || 0} size="sm" />
                <div className="text-xs text-brand-muted mt-1">{shop.reviewCount || reviews.length} reviews</div>
              </div>
              <Link to={`/shops/${id}/products`} className="btn-primary flex items-center gap-2">
                <HiShoppingBag className="w-4 h-4" /> Shop Now
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 bg-brand-surface rounded-xl border border-brand-border w-fit">
          {['products', 'reviews'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold font-body transition-all capitalize ${
                tab === t
                  ? 'bg-primary-500 text-white shadow-glow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t} {t === 'products' ? `(${products.length})` : `(${reviews.length})`}
            </button>
          ))}
        </div>

        {/* Products tab */}
        {tab === 'products' && (
          products.length === 0 ? (
            <EmptyState icon="📦" title="No products yet" description="This shop hasn't added products." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.slice(0, 8).map((p) => (
               <ProductCard key={p.id} product={p} shop={shop} onClick={(id) => setSelectedProductId(id)}/>
              ))}
            </div>
          )
        )}

        {/* Reviews tab */}
        {tab === 'reviews' && (
          reviews.length === 0 ? (
            <EmptyState icon="⭐" title="No reviews yet" description="Be the first to review this shop." />
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-white font-body text-sm">{r.customerName || 'Customer'}</p>
                      <StarRating rating={r.rating} size="sm" />
                      <p className="font-semibold text-white font-body text-sm">{r.reviews || 'Reviews'}</p>
                    </div>
                    <span className="text-xs text-brand-muted font-mono">{formatDateTime(r.createdAt)}</span>
                  </div>
                  {r.comment && <p className="text-gray-400 text-sm font-body leading-relaxed">{r.comment}</p>}
                </div>
              ))}
            </div>
          )
        )}
      </div>
            <ProductModal
  productId={selectedProductId}
  onClose={() => setSelectedProductId(null)}
/>
    </div>
  );
};

export default ShopDetails;
