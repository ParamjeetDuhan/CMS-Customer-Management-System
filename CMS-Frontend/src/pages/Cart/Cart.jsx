import { Link, useNavigate } from 'react-router-dom';
import { HiTrash, HiPlus, HiMinus, HiShoppingBag, HiArrowRight, HiTag } from 'react-icons/hi';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/helpers';
import { EmptyState } from '../../components/common/Badge';
import Button from '../../components/common/Button';

const CartItem = ({ item, onInc, onDec, onRemove }) => (
  <div className="card p-4 flex items-center gap-4 group">
    {/* Image */}
    <div className="w-16 h-16 rounded-xl overflow-hidden bg-brand-surface flex-shrink-0">
      {item.imageUrl ? (
        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">📦</div>
      )}
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <p className="font-display font-semibold text-white text-sm leading-tight line-clamp-2">{item.name}</p>
      {item.unit && <p className="text-xs text-brand-muted font-body mt-0.5">{item.unit}</p>}
      <p className="text-primary-400 font-bold font-mono text-sm mt-1">{formatCurrency(item.price)}</p>
    </div>

    {/* Qty controls */}
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <button onClick={onDec}
        className="w-7 h-7 rounded-lg bg-brand-surface border border-brand-border hover:border-primary-500/50 text-gray-400 hover:text-white flex items-center justify-center transition-all">
        <HiMinus className="w-3 h-3" />
      </button>
      <span className="w-8 text-center font-bold font-mono text-white text-sm">{item.quantity}</span>
      <button onClick={onInc}
        className="w-7 h-7 rounded-lg bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition-all">
        <HiPlus className="w-3 h-3" />
      </button>
    </div>

    {/* Subtotal */}
    <div className="text-right flex-shrink-0 hidden sm:block">
      <p className="font-bold font-mono text-white">{formatCurrency(item.price * item.quantity)}</p>
    </div>

    {/* Delete */}
    <button onClick={onRemove}
      className="p-1.5 rounded-lg text-brand-muted hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
      <HiTrash className="w-4 h-4" />
    </button>
  </div>
);

const Cart = () => {
  const { cart, total, count, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  const DELIVERY_FEE = total >= 500 ? 0 : 40;
  const TAXES        = Math.round(total * 0.05);
  const GRAND_TOTAL  = total + DELIVERY_FEE + TAXES;

  if (count === 0) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12">
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          description="Add products from your favourite local shops to get started."
          action={
            <Link to="/shops" className="btn-primary flex items-center gap-2">
              <HiShoppingBag className="w-4 h-4" /> Browse Shops
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="py-8 min-h-screen">
      <div className="page-container">
        <div className="flex items-center justify-between mb-6">
          <h1 className="section-title">My Cart <span className="text-primary-400">({count})</span></h1>
          <button onClick={clearCart} className="btn-ghost text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10">
            Clear All
          </button>
        </div>

        {/* Shop info */}
        {cart.shopName && (
          <div className="flex items-center gap-2 mb-5 text-sm text-brand-muted font-body">
            <HiTag className="w-4 h-4 text-primary-400" />
            Ordering from <span className="text-white font-medium ml-1">{cart.shopName}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {cart.items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onInc={() => updateQuantity(item.id, item.quantity + 1)}
                onDec={() => {
                  if (item.quantity <= 1) removeItem(item.id);
                  else updateQuantity(item.id, item.quantity - 1);
                }}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="font-display font-bold text-white text-lg mb-5">Order Summary</h3>

              <div className="space-y-3 text-sm font-body">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal ({count} items)</span>
                  <span className="text-white">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Delivery Fee</span>
                  <span className={DELIVERY_FEE === 0 ? 'text-green-400 font-medium' : 'text-white'}>
                    {DELIVERY_FEE === 0 ? 'FREE' : formatCurrency(DELIVERY_FEE)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Taxes (5%)</span>
                  <span className="text-white">{formatCurrency(TAXES)}</span>
                </div>

                {DELIVERY_FEE > 0 && (
                  <p className="text-xs text-primary-400 bg-primary-500/10 px-3 py-2 rounded-lg">
                    Add {formatCurrency(500 - total)} more for free delivery!
                  </p>
                )}

                <div className="border-t border-brand-border pt-3 flex justify-between font-bold">
                  <span className="text-white font-display">Total</span>
                  <span className="text-primary-400 font-mono text-lg">{formatCurrency(GRAND_TOTAL)}</span>
                </div>
              </div>

              <Button
                fullWidth
                size="lg"
                className="mt-6"
                rightIcon={<HiArrowRight className="w-4 h-4" />}
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </Button>

              <Link to="/shops" className="block text-center mt-3 text-xs text-brand-muted hover:text-primary-400 font-body transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
