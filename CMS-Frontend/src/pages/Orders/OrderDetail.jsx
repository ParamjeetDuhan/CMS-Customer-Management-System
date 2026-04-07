import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  HiArrowLeft, HiCheckCircle, HiClock, HiX, HiStar, HiRefresh,
} from 'react-icons/hi';
import orderService from '../../services/orderService';
import { PageLoader } from '../../components/common/Loader';
import { Badge, ErrorState, StarInput } from '../../components/common/Badge';
import { ConfirmModal } from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { formatCurrency, formatDateTime, statusColour } from '../../utils/helpers';
import { ORDER_STATUS } from '../../utils/constants';
import toast from 'react-hot-toast';

const TRACKING_STEPS = [
  { status: 'Pending',   icon: '🕐', label: 'Order Placed' },
  { status: 'Confirmed', icon: '✅', label: 'Confirmed' },
  { status: 'Preparing', icon: '👨‍🍳', label: 'Preparing' },
  { status: 'Shipped',   icon: '🚚', label: 'On the Way' },
  { status: 'Delivered', icon: '🎉', label: 'Delivered' },
];

const OrderDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Feedback
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState('');
  const [fbLoading, setFbLoading] = useState(false);
  const [fbDone,    setFbDone]    = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await orderService.getOrderById(id);
      setOrder(res.order || res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await orderService.cancelOrder(id);
      toast.success('Order cancelled');
      setCancelOpen(false);
      load();
    } catch (err) {
      toast.error(err.message || 'Could not cancel');
    } finally {
      setCancelling(false);
    }
  };

  const handleFeedback = async () => {
    if (!rating) { toast.error('Please select a rating'); return; }
    setFbLoading(true);
    try {
      await orderService.submitFeedback(id, { rating, comment });
      toast.success('Feedback submitted. Thank you!');
      setFbDone(true);
    } catch (err) {
      toast.error(err.message || 'Could not submit feedback');
    } finally {
      setFbLoading(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error)   return <div className="page-container py-10"><ErrorState message={error} onRetry={load} /></div>;
  if (!order)  return null;

  const currentStep = TRACKING_STEPS.findIndex((s) => s.status === order.status);
  const isCancellable = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED].includes(order.status);
  const isDelivered   = order.status === ORDER_STATUS.DELIVERED;

  return (
    <div className="py-8 min-h-screen">
      <div className="page-container max-w-3xl">
        {/* Back */}
        <Link to="/orders" className="flex items-center gap-2 text-sm text-brand-muted hover:text-white mb-6 transition-colors w-fit">
          <HiArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>

        {/* Header */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs text-brand-muted font-body mb-1">ORDER ID</p>
              <h1 className="font-display text-2xl font-bold text-white">#{order.id?.slice(-8).toUpperCase()}</h1>
              <p className="text-sm text-brand-muted font-body mt-1">{formatDateTime(order.createdAt)}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={statusColour(order.status)} className="text-sm px-3 py-1">
                {order.status}
              </Badge>
              {isCancellable && (
                <Button variant="danger" size="sm" onClick={() => setCancelOpen(true)}>
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tracking */}
        {order.status !== ORDER_STATUS.CANCELLED && (
          <div className="card p-6 mb-6">
            <h2 className="font-display font-bold text-white mb-6">Order Tracking</h2>
            <div className="flex items-center justify-between">
              {TRACKING_STEPS.map((s, i) => {
                const done   = i <= currentStep;
                const active = i === currentStep;
                return (
                  <div key={s.status} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                        done ? 'bg-primary-500/20 border-2 border-primary-500' : 'bg-brand-surface border-2 border-brand-border'
                      } ${active ? 'shadow-glow' : ''}`}>
                        {done ? <HiCheckCircle className="w-5 h-5 text-primary-400" /> : <HiClock className="w-5 h-5 text-brand-muted" />}
                      </div>
                      <p className={`text-[10px] mt-1.5 font-body text-center max-w-[60px] ${done ? 'text-primary-400' : 'text-brand-muted'}`}>
                        {s.label}
                      </p>
                    </div>
                    {i < TRACKING_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 mb-5 ${i < currentStep ? 'bg-primary-500' : 'bg-brand-border'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="card p-6 mb-6">
          <h2 className="font-display font-bold text-white mb-4">Items Ordered</h2>
          <div className="space-y-3">
            {order.items?.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-brand-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-surface flex items-center justify-center text-lg opacity-50">
                    📦
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white font-body">{item.name || `Product`}</p>
                    <p className="text-xs text-brand-muted font-body">{formatCurrency(item.price)} each</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-brand-muted">×{item.quantity}</p>
                  <p className="text-sm font-mono font-bold text-white">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="pt-4 space-y-2 text-sm font-body">
            <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>{formatCurrency(order.subtotal || 0)}</span></div>
            <div className="flex justify-between text-gray-400"><span>Delivery</span><span>{formatCurrency(order.deliveryFee || 0)}</span></div>
            <div className="flex justify-between text-gray-400"><span>Taxes</span><span>{formatCurrency(order.taxes || 0)}</span></div>
            <div className="flex justify-between font-bold border-t border-brand-border pt-2">
              <span className="text-white font-display">Total</span>
              <span className="text-primary-400 font-mono text-base">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        {order.address && (
          <div className="card p-6 mb-6">
            <h2 className="font-display font-bold text-white mb-3">Delivery Address</h2>
            <p className="text-sm text-white font-body">{order.address.name} · {order.address.phone}</p>
            <p className="text-sm text-gray-400 font-body">
              {order.address.line1}, {order.address.city} {order.address.pincode}
            </p>
          </div>
        )}

        {/* Feedback */}
        {isDelivered && !fbDone && (
          <div className="card p-6 mb-6">
            <h2 className="font-display font-bold text-white mb-4 flex items-center gap-2">
              <HiStar className="w-5 h-5 text-amber-400" /> Rate Your Experience
            </h2>
            <StarInput value={rating} onChange={setRating} />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience (optional)…"
              rows={3}
              className="input-field mt-4 resize-none"
            />
            <Button className="mt-4" loading={fbLoading} onClick={handleFeedback}>
              Submit Feedback
            </Button>
          </div>
        )}

        {fbDone && (
          <div className="card p-5 mb-6 flex items-center gap-3 border-green-500/30">
            <HiCheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-400 font-body">Thank you for your feedback!</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/shops')} className="flex-1">
            Continue Shopping
          </Button>
          <Button variant="ghost" onClick={load} className="flex items-center gap-1.5">
            <HiRefresh className="w-4 h-4" /> Refresh
          </Button>
        </div>
      </div>

      <ConfirmModal
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmLabel={cancelling ? 'Cancelling…' : 'Yes, Cancel'}
        danger
      />
    </div>
  );
};

export default OrderDetail;
