import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiClipboardList, HiRefresh } from 'react-icons/hi';
import orderService from '../../services/orderService';
import { PageLoader } from '../../components/common/Loader';
import { Badge, EmptyState, ErrorState } from '../../components/common/Badge';
import { formatCurrency, formatDateTime, statusColour } from '../../utils/helpers';
import { ORDER_STATUS } from '../../utils/constants';

const StatusFilter = ({ active, onChange }) => (
  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide mb-6">
    {['All', ...Object.values(ORDER_STATUS)].map((s) => (
      <button
        key={s}
        onClick={() => onChange(s)}
        className={`px-4 py-1.5 rounded-xl text-xs font-semibold border whitespace-nowrap transition-all ${
          active === s
            ? 'bg-primary-500 border-primary-500 text-white'
            : 'border-brand-border text-gray-400 hover:border-brand-muted bg-brand-surface'
        }`}
      >
        {s}
      </button>
    ))}
  </div>
);

const OrderCard = ({ order }) => (
  <Link to={`/orders/${order.id}`}
    className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:-translate-y-0.5 transition-all duration-200">
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <p className="font-display font-semibold text-white text-sm">Order #{order.id?.slice(-8).toUpperCase()}</p>
        <Badge variant={statusColour(order.status)}>{order.status}</Badge>
      </div>
      <p className="text-xs text-brand-muted font-body mb-2">{order.shopName}</p>
      <div className="flex flex-wrap gap-2">
        {order.items?.slice(0, 3).map((i) => (
          <span key={i.productId} className="text-xs text-gray-400 font-body bg-brand-surface px-2 py-0.5 rounded-lg">
            {i.name || `Item ×${i.quantity}`}
          </span>
        ))}
        {order.items?.length > 3 && (
          <span className="text-xs text-brand-muted">+{order.items.length - 3} more</span>
        )}
      </div>
    </div>
    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 flex-shrink-0">
      <p className="font-mono font-bold text-primary-400 text-base">{formatCurrency(order.total)}</p>
      <p className="text-xs text-brand-muted font-body">{formatDateTime(order.createdAt)}</p>
    </div>
  </Link>
);

const Orders = () => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [filter,  setFilter]  = useState('All');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getMyOrders();
      setOrders(res.orders || res || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'All' ? orders : orders.filter((o) => o.status === filter);

  if (loading) return <PageLoader />;

  return (
    <div className="py-8 min-h-screen">
      <div className="page-container">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="section-title flex items-center gap-2">
              <HiClipboardList className="w-7 h-7 text-primary-400" /> My Orders
            </h1>
            <p className="text-brand-muted font-body text-sm mt-1">{orders.length} total orders</p>
          </div>
          <button onClick={load} className="btn-ghost flex items-center gap-1.5 text-sm">
            <HiRefresh className="w-4 h-4" /> Refresh
          </button>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : orders.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No orders yet"
            description="Place your first order from a nearby shop."
            action={<Link to="/shops" className="btn-primary">Explore Shops</Link>}
          />
        ) : (
          <>
            <StatusFilter active={filter} onChange={setFilter} />
            {filtered.length === 0 ? (
              <EmptyState icon="🔍" title={`No ${filter} orders`} description="Try a different status filter." />
            ) : (
              <div className="space-y-4">
                {filtered.map((o) => <OrderCard key={o.id} order={o} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Orders;
