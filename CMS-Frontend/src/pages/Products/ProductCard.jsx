import { useState } from 'react';
import { HiPlus, HiMinus, HiShoppingCart } from 'react-icons/hi';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/helpers';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProductCard = ({ product,shop, onClick  }) => {
  const { addItem, removeItem, updateQuantity, isInCart, getItemQty } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [imgErr, setImgErr] = useState(false);

  const inCart = isInCart(product.id);
  const qty    = getItemQty(product.id);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Sign in to add items'); navigate('/login'); return; }
    addItem(product, shop);
  };

  const handleInc = (e) => { e.stopPropagation(); e.preventDefault(); updateQuantity(product.id, qty + 1); };
  const handleDec = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (qty <= 1) removeItem(product.id);
    else          updateQuantity(product.id, qty - 1);
  };

  return (
    <div 
    onClick={() => onClick && onClick(product.id)}
    className="card overflow-hidden group flex flex-col hover:-translate-y-1 transition-all duration-300">
      {/* Image */}
      <div className="relative h-40 bg-brand-surface overflow-hidden">
        {!imgErr ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={() => setImgErr(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">📦</div>
        )}
        {product.discount > 0 && (
          <span className="absolute top-2 left-2 badge-error text-[10px]">-{product.discount}%</span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-400">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-display font-semibold text-white text-sm leading-tight mb-1 line-clamp-2 group-hover:text-primary-400 transition-colors">
          {product.name}
        </h3>
        {product.unit && (
          <p className="text-xs text-brand-muted font-body mb-2">{product.unit}</p>
        )}

        <div className="flex items-center justify-between mt-auto pt-3">
          <div>
            <div className="font-display font-bold text-white text-base">
              {formatCurrency(product.price)}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-xs text-brand-muted line-through font-body">
                {formatCurrency(product.originalPrice)}
              </div>
            )}
          </div>

          {product.inStock === false ? null : inCart ? (
            <div className="flex items-center gap-1.5 bg-brand-surface border border-primary-500/40 rounded-xl p-1">
              <button onClick={handleDec}
                className="w-6 h-6 rounded-lg bg-primary-500/20 hover:bg-primary-500/40 text-primary-400 flex items-center justify-center transition-all">
                <HiMinus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center text-sm font-bold text-white font-mono">{qty}</span>
              <button onClick={handleInc}
                className="w-6 h-6 rounded-lg bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition-all">
                <HiPlus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button onClick={handleAdd}
              className="w-8 h-8 rounded-xl bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center shadow-glow hover:shadow-glow-lg transition-all active:scale-95">
              <HiPlus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
