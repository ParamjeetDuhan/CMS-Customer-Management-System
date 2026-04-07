import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiLocationMarker, HiSearch, HiArrowRight, HiStar, HiShoppingBag, HiLightningBolt, HiShieldCheck } from 'react-icons/hi';
import { useAuth } from '../../hooks/useAuth';
import { getUserLocation } from '../../utils/helpers';
import { SHOP_CATEGORIES } from '../../utils/constants';
import toast from 'react-hot-toast';

const FeatureCard = ({ icon, title, desc }) => (
  <div className="card p-6 text-center hover:-translate-y-1 transition-transform duration-300">
    <div className="w-12 h-12 rounded-2xl bg-primary-500/15 border border-primary-500/20 flex items-center justify-center mx-auto mb-4">
      {icon}
    </div>
    <h3 className="font-display font-semibold text-white mb-2">{title}</h3>
    <p className="text-brand-muted text-sm font-body leading-relaxed">{desc}</p>
  </div>
);

const CategoryPill = ({ label, emoji, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-card hover:bg-primary-500/15 border border-brand-border hover:border-primary-500/40 text-sm font-medium text-gray-300 hover:text-primary-400 transition-all duration-200 whitespace-nowrap"
  >
    <span>{emoji}</span> {label}
  </button>
);

const CATEGORY_EMOJIS = {
  All: '🌐', Grocery: '🛒', Electronics: '⚡', Fashion: '👗',
  'Food & Beverages': '🍔', Pharmacy: '💊', Bakery: '🥐',
  Stationery: '📚', Hardware: '🔧', Other: '📦',
};

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [locating, setLocating] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/shops?q=${encodeURIComponent(search)}`);
    else navigate('/shops');
  };

  const handleNearbyShops = async () => {
    setLocating(true);
    try {
      const loc = await getUserLocation();
      navigate(`/shops?lat=${loc.lat}&lng=${loc.lng}`);
    } catch {
      toast.error('Location access denied. Showing all shops.');
      navigate('/shops');
    } finally {
      setLocating(false);
    }
  };

  return (
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-noise opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary-600/6 rounded-full blur-3xl" />

        <div className="page-container relative z-10 py-20">
          <div className="max-w-3xl">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6 animate-fade-in">
              <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-primary-400 font-body">Discover Local Shops Near You</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 animate-slide-up">
              Shop Local,<br />
              <span className="text-gradient">Live Better</span>
            </h1>

            <p className="text-gray-400 font-body text-lg md:text-xl leading-relaxed mb-10 max-w-xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Browse shops in your neighbourhood, order fresh products, and get them delivered to your door. Fast, simple, local.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch}
              className="flex gap-3 p-2 bg-brand-surface border border-brand-border rounded-2xl shadow-card mb-6 animate-slide-up"
              style={{ animationDelay: '0.2s' }}>
              <div className="flex-1 flex items-center gap-3 px-3">
                <HiSearch className="w-5 h-5 text-brand-muted flex-shrink-0" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search shops or products…"
                  className="flex-1 bg-transparent text-white placeholder-brand-muted outline-none font-body"
                />
              </div>
              <button type="submit"
                className="btn-primary rounded-xl px-6 py-3 text-sm">
                Search
              </button>
            </form>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <button
                onClick={handleNearbyShops}
                disabled={locating}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-card hover:bg-brand-border border border-brand-border text-white font-semibold text-sm transition-all"
              >
                <HiLocationMarker className={`w-4 h-4 text-primary-400 ${locating ? 'animate-pulse' : ''}`} />
                {locating ? 'Detecting…' : 'Shops Near Me'}
              </button>

              {!isAuthenticated && (
                <Link to="/signup"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-primary-500/40 text-primary-400 hover:bg-primary-500/10 font-semibold text-sm transition-all">
                  Get Started Free <HiArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-16 border-t border-brand-border">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">Browse Categories</h2>
            <Link to="/shops" className="btn-ghost text-sm">View all →</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {SHOP_CATEGORIES.map((cat) => (
              <CategoryPill
                key={cat}
                label={cat}
                emoji={CATEGORY_EMOJIS[cat] || '🏪'}
                onClick={() => navigate(`/shops?category=${cat}`)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Why ShopNear ── */}
      <section className="py-16 bg-brand-surface border-t border-brand-border">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">Why Choose ShopNear?</h2>
            <p className="text-brand-muted font-body max-w-md mx-auto">
              We connect you to the best local shops with a seamless ordering experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<HiLocationMarker className="w-6 h-6 text-primary-400" />}
              title="Hyperlocal Discovery"
              desc="Find shops within your neighbourhood using precise geolocation technology."
            />
            <FeatureCard
              icon={<HiLightningBolt className="w-6 h-6 text-primary-400" />}
              title="Fast Ordering"
              desc="Add products to cart and place orders in seconds. Real-time order tracking included."
            />
            <FeatureCard
              icon={<HiShieldCheck className="w-6 h-6 text-primary-400" />}
              title="Secure Payments"
              desc="Pay safely with UPI, cards, wallets, or cash on delivery. Your data stays private."
            />
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      {!isAuthenticated && (
        <section className="py-20">
          <div className="page-container">
            <div className="relative card p-10 md:p-16 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/8 to-transparent" />
              <div className="relative z-10">
                <HiShoppingBag className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                <h2 className="section-title mb-4">Ready to start shopping locally?</h2>
                <p className="text-brand-muted font-body mb-8 max-w-md mx-auto">
                  Create your free account in 30 seconds and discover amazing local shops near you.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link to="/signup" className="btn-primary">Create Free Account</Link>
                  <Link to="/login"  className="btn-secondary">Sign In</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
