import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  HiLocationMarker,
  HiSearch,
  HiStar,
  HiFilter,
  HiX,
  HiRefresh,
} from "react-icons/hi";
import shopService from "../../services/shopService";
import { getUserLocation, formatDistance } from "../../utils/helpers";
import { SHOP_CATEGORIES, SORT_OPTIONS } from "../../utils/constants";
import { SkeletonCard } from "../../components/common/Loader";
import { EmptyState, ErrorState } from "../../components/common/Badge";
import toast from "react-hot-toast";

const ShopCard = ({ shop }) => (
  <Link
    to={`/shops/${shop.id}`}
    className="card overflow-hidden group flex flex-col hover:-translate-y-1 transition-all duration-300"
  >
    <div className="relative h-44 overflow-hidden bg-brand-surface">
      <img
        src={
          shop.imageUrl ||
          `https://placehold.co/400x176/1a1a1a/f97316?text=${encodeURIComponent(shop.name)}`
        }
        alt={shop.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        onError={(e) => {
          e.target.src = `https://placehold.co/400x176/1a1a1a/f97316?text=${encodeURIComponent(shop.name)}`;
        }}
      />
      <div className="overlay-gradient absolute inset-0" />
      {shop.category && (
        <span className="absolute top-3 left-3 badge-primary text-[11px]">
          {shop.category}
        </span>
      )}
      {shop.isOpen !== undefined && (
        <span
          className={`absolute top-3 right-3 badge text-[11px] ${shop.isOpen ? "badge-success" : "badge-error"}`}
        >
          {shop.isOpen ? "Open" : "Closed"}
        </span>
      )}
    </div>

    <div className="p-4 flex-1 flex flex-col">
      <h3 className="font-display font-semibold text-white mb-1 group-hover:text-primary-400 transition-colors line-clamp-1">
        {shop.name}
      </h3>
      {shop.address && (
        <p className="text-xs text-brand-muted font-body mb-3 line-clamp-1 flex items-center gap-1">
          <HiLocationMarker className="w-3 h-3 flex-shrink-0 text-primary-500" />
          {shop.address}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-brand-border">
        <div className="flex items-center gap-1">
          <HiStar className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-sm font-medium text-white">
            {Number(shop.rating || 0).toFixed(1)}
          </span>
          {shop.reviewCount && (
            <span className="text-xs text-brand-muted">
              ({shop.reviewCount})
            </span>
          )}
        </div>
        {shop.distance != null && (
          <span className="text-xs font-medium text-primary-400 font-mono">
            {formatDistance(shop.distance)}
          </span>
        )}
      </div>
    </div>
  </Link>
);

const NearbyShops = () => {
  const [params, setParams] = useSearchParams();
  const [city, setCity] = useState(() => localStorage.getItem("city") || "");
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [search, setSearch] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || "All");
  const [sort, setSort] = useState("distance");
  const [locating, setLocating] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const fetchShops = useCallback(
    async (loc) => {
      setLoading(true);
      setError(null);

      try {
        let data;

        if (loc) {
          // ✅ Nearby shops
          data = await shopService.getNearbyShops({
            lat: loc.lat,
            lng: loc.lng,
            category,
            sort,
            q: search,
          });
          localStorage.removeItem('city');
        } else  {
          data = await shopService.getAllShops({
            lat : localStorage.getItem('lat'),
            lng : localStorage.getItem('lng'),
            city : city.trim(),
            category: category !== "All" ? category : undefined,
            sort,
            q: search,
          });
          localStorage.removeItem('city');
        } 
        setShops(data.shops || data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [category, sort, search, city],
  );

/* Auto-detect location on mount if params present */
useEffect(() => {
  const lat = params.get('lat');
  const lng = params.get('lng');
  if (lat && lng) {
    const loc = { lat: parseFloat(lat), lng: parseFloat(lng) };
    setLocation(loc);
    fetchShops(loc);
  }
  else {
    fetchShops(null);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [category, sort]);

  const detectLocation = async () => {
    setLocating(true);
    try {
      const loc = await getUserLocation();
      setLocation(loc);
      setParams({ lat: loc.lat, lng: loc.lng });
      await fetchShops(loc);
      toast.success("Location detected!");
    } catch {
      toast.error("Could not access location");
    } finally {
      setLocating(false);
    }
  };

const handleSearch = (e) => {
  e.preventDefault();

  const finalCity = city.trim();

  localStorage.setItem("city", finalCity); // ✅ SAVE HERE
  fetchShops(null);
};

  const clearFilters = () => {
    setCategory("All");
    setSort("distance");
    setSearch("");
    setParams({});
    fetchShops(null);
  };

  return (
    <div className="py-8 min-h-screen">
      <div className="page-container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title mb-2">
            {location ? "Shops Near You" : "All Shops"}
          </h1>
          <p className="text-brand-muted font-body text-sm">
            {shops.length > 0
              ? `${shops.length} shops found`
              : "Discover local shops"}
          </p>
        </div>

        {/* Search + filter bar */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                }}
                placeholder="Enter city (e.g. Delhi)"
                className="input-field pl-10"
              />
            </div>
            <div className="flex-1 relative">
              <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search shops By Name"
                className="input-field pl-10"
              />
            </div>
            <button type="submit" className="btn-primary px-5 py-3 text-sm">
              Search
            </button>
          </form>

          <div className="flex gap-2">
            <button
              onClick={detectLocation}
              disabled={locating}
              className="btn-secondary flex items-center gap-2 text-sm px-4 py-3"
            >
              <HiLocationMarker
                className={`w-4 h-4 text-primary-400 ${locating ? "animate-pulse" : ""}`}
              />
              {locating ? "Detecting…" : "Near Me"}
            </button>
            <button
              onClick={() => setFilterOpen((p) => !p)}
              className="btn-secondary flex items-center gap-2 text-sm px-4 py-3"
            >
              <HiFilter className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {filterOpen && (
          <div className="card p-5 mb-6 animate-slide-down">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label">Category</label>
                <div className="flex flex-wrap gap-2">
                  {SHOP_CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        category === c
                          ? "bg-primary-500/20 border-primary-500/50 text-primary-400"
                          : "bg-brand-surface border-brand-border text-gray-400 hover:border-brand-muted"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Sort By</label>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => setSort(o.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        sort === o.value
                          ? "bg-primary-500/20 border-primary-500/50 text-primary-400"
                          : "bg-brand-surface border-brand-border text-gray-400 hover:border-brand-muted"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={clearFilters}
                className="btn-ghost text-sm flex items-center gap-1"
              >
                <HiX className="w-3.5 h-3.5" /> Clear
              </button>
              <button
                onClick={() => {
                  fetchShops(location);
                  setFilterOpen(false);
                }}
                className="btn-primary text-sm px-5 py-2"
              >
                Apply
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchShops(location)} />
        ) : shops.length === 0 ? (
          <EmptyState
            icon="🏪"
            title="No shops found"
            description="Try adjusting your filters or search in a different area."
            action={
              <button
                onClick={clearFilters}
                className="btn-secondary flex items-center gap-2"
              >
                <HiRefresh className="w-4 h-4" /> Reset Filters
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyShops;
