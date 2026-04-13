import { useEffect, useState } from "react";
import shopService from "../../services/shopService";
import { formatCurrency, formatDate } from "../../utils/helpers";

function ProductModal({ productId, onClose }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      setProduct(null);
      try {
        const res = await shopService.getProductById(productId);
        setProduct(res.product || res);
      } catch (err) {
        console.error(err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  /* Close on backdrop click */
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!productId) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-brand-card w-full max-w-md rounded-2xl relative animate-scale-in shadow-2xl border border-brand-border overflow-hidden">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-gray-400 hover:text-white hover:bg-black/60 transition-all"
        >
          ✕
        </button>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <span className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mb-3" />
            <p className="text-sm text-brand-muted font-body">Loading product...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <p className="text-3xl mb-3">⚠️</p>
            <p className="text-sm text-red-400 font-body">{error}</p>
            <button
              onClick={onClose}
              className="mt-4 text-xs text-brand-muted hover:text-white font-body underline"
            >
              Close
            </button>
          </div>
        )}

        {/* Product detail */}
        {product && !loading && (
          <>
            {/* Image / Placeholder */}
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 flex items-center justify-center bg-gray-800/60 text-5xl">
                📦
              </div>
            )}

            {/* Content */}
            <div className="p-5 space-y-3">

              {/* Category badge */}
              {product.category && (
                <span className="inline-block text-xs font-semibold font-body px-2.5 py-0.5 rounded-full bg-primary-500/15 text-primary-400 border border-primary-500/20">
                  {product.category}
                </span>
              )}

              {/* Name */}
              <h2 className="text-xl font-bold text-white font-display leading-tight">
                {product.name}
              </h2>

              {/* Description */}
              <p className="text-sm text-gray-400 font-body leading-relaxed">
                {product.description || "No description available."}
              </p>

              {/* Price row */}
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary-400 font-display">
                  {formatCurrency(product.price)}
                </span>
                {product.mrp > product.price && (
                  <span className="text-sm text-gray-500 line-through font-body">
                    {formatCurrency(product.mrp)}
                  </span>
                )}
              </div>

              {/* Meta row */}
              <div className="flex items-center justify-between text-xs text-gray-500 font-body pt-1 border-t border-brand-border">
                <span>
                  Stock:{" "}
                  <span className={product.stock > 0 ? "text-green-400" : "text-red-400"}>
                    {product.stock > 0 ? `${product.stock} left` : "Out of stock"}
                  </span>
                </span>
                <span>Unit: {product.unit}</span>
                {product.createdAt && (
                  <span>Added: {formatDate(product.createdAt)}</span>
                )}
              </div>

              {/* Availability pill */}
              <div className={`text-xs font-semibold font-body text-center py-1.5 rounded-lg ${
                product.available
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}>
                {product.available ? "✓ Available" : "✗ Unavailable"}
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ProductModal;