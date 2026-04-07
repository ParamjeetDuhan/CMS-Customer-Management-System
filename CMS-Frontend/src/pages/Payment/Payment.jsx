import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  HiCreditCard, HiCheckCircle, HiXCircle, HiClock, HiArrowRight,
  HiRefresh, HiShieldCheck,
} from 'react-icons/hi';
import orderService from '../../services/orderService';
import Button from '../../components/common/Button';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

/* ── Simulated payment status polling ── */
const POLL_INTERVAL = 3000;
const MAX_POLLS     = 10;

const StatusIcon = ({ status }) => {
  const map = {
    pending:   { icon: <HiClock     className="w-16 h-16 text-amber-400" />, bg: 'bg-amber-500/10 border-amber-500/20' },
    Paid:      { icon: <HiCheckCircle className="w-16 h-16 text-green-400" />, bg: 'bg-green-500/10 border-green-500/20' },
    success:   { icon: <HiCheckCircle className="w-16 h-16 text-green-400" />, bg: 'bg-green-500/10 border-green-500/20' },
    Failed:    { icon: <HiXCircle    className="w-16 h-16 text-red-400" />,   bg: 'bg-red-500/10 border-red-500/20' },
    failed:    { icon: <HiXCircle    className="w-16 h-16 text-red-400" />,   bg: 'bg-red-500/10 border-red-500/20' },
    processing:{ icon: <HiRefresh    className="w-16 h-16 text-primary-400 animate-spin" />, bg: 'bg-primary-500/10 border-primary-500/20' },
  };
  const entry = map[status] || map.processing;
  return (
    <div className={`w-28 h-28 rounded-full border-2 flex items-center justify-center mx-auto mb-6 ${entry.bg}`}>
      {entry.icon}
    </div>
  );
};

const UpiForm = ({ onPay, loading }) => {
  const [upiId, setUpiId] = useState('');
  return (
    <div className="space-y-4">
      <div>
        <label className="label">UPI ID</label>
        <input
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          placeholder="yourname@upi"
          className="input-field"
        />
        <p className="text-xs text-brand-muted font-body mt-1">e.g. name@okaxis, name@paytm</p>
      </div>
      <Button fullWidth loading={loading} onClick={() => onPay({ upiId })} disabled={!upiId.trim()}>
        Pay Now
      </Button>
    </div>
  );
};

const CardForm = ({ onPay, loading }) => {
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const set = (k) => (e) => setCard((p) => ({ ...p, [k]: e.target.value }));

  const formatCard = (v) => v.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  const formatExpiry = (v) => {
    const clean = v.replace(/\D/g, '').slice(0, 4);
    return clean.length > 2 ? `${clean.slice(0, 2)}/${clean.slice(2)}` : clean;
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Card Number</label>
        <input value={card.number} onChange={(e) => setCard((p) => ({ ...p, number: formatCard(e.target.value) }))}
          placeholder="1234 5678 9012 3456" className="input-field font-mono" maxLength={19} />
      </div>
      <div>
        <label className="label">Cardholder Name</label>
        <input value={card.name} onChange={set('name')} placeholder="As on card" className="input-field" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Expiry</label>
          <input value={card.expiry} onChange={(e) => setCard((p) => ({ ...p, expiry: formatExpiry(e.target.value) }))}
            placeholder="MM/YY" className="input-field font-mono" maxLength={5} />
        </div>
        <div>
          <label className="label">CVV</label>
          <input value={card.cvv} onChange={set('cvv')} placeholder="•••" className="input-field font-mono" maxLength={4} type="password" />
        </div>
      </div>
      <Button fullWidth loading={loading}
        disabled={!card.number || !card.name || !card.expiry || !card.cvv}
        onClick={() => onPay({ card })}>
        Pay Securely
      </Button>
    </div>
  );
};

const Payment = () => {
  const location = useLocation();
  const navigate  = useNavigate();

  const { orderId, paymentData, total, method } = location.state || {};

  const [status,   setStatus]   = useState('pending'); // pending | processing | Paid | Failed
  const [pollCount, setPollCount] = useState(0);
  const [loading,  setLoading]  = useState(false);

  /* ── Poll payment status after pay action ── */
  useEffect(() => {
    if (status !== 'processing' || !orderId) return;
    if (pollCount >= MAX_POLLS) { setStatus('Failed'); return; }

    const timer = setTimeout(async () => {
      try {
        const res = await orderService.getPaymentStatus(orderId);
        const s   = res.paymentStatus || res.status;
        if (s === 'Paid' || s === 'success') {
          setStatus('Paid');
          toast.success('Payment successful! 🎉');
        } else if (s === 'Failed' || s === 'failed') {
          setStatus('Failed');
          toast.error('Payment failed');
        } else {
          setPollCount((p) => p + 1);
        }
      } catch {
        setPollCount((p) => p + 1);
      }
    }, POLL_INTERVAL);

    return () => clearTimeout(timer);
  }, [status, pollCount, orderId]);

  const handlePay = async (payInfo) => {
    setLoading(true);
    try {
      await orderService.verifyPayment({ orderId, ...payInfo, ...paymentData });
      setStatus('processing');
      setPollCount(0);
    } catch (err) {
      toast.error(err.message || 'Payment initiation failed');
    } finally {
      setLoading(false);
    }
  };

  /* ── No state — redirect ── */
  if (!orderId) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-brand-muted font-body mb-4">No active payment session.</p>
          <Button onClick={() => navigate('/orders')}>Go to Orders</Button>
        </div>
      </div>
    );
  }

  const isPaid   = status === 'Paid'   || status === 'success';
  const isFailed = status === 'Failed' || status === 'failed';
  const isProcessing = status === 'processing';

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md animate-scale-in">

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 mb-6 text-xs text-brand-muted font-body">
          <HiShieldCheck className="w-4 h-4 text-green-400" />
          256-bit SSL encrypted · Secure Payment
        </div>

        <div className="card p-8">

          {/* ── Pending: show payment form ── */}
          {status === 'pending' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center">
                  <HiCreditCard className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-white">Complete Payment</h2>
                  {total && (
                    <p className="text-sm text-brand-muted font-body">
                      Amount: <span className="text-primary-400 font-mono font-bold">{formatCurrency(total)}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="text-xs text-brand-muted font-mono bg-brand-surface rounded-lg px-3 py-2 border border-brand-border">
                Order ID: #{orderId?.slice(-10).toUpperCase()}
              </div>

              {/* Method-specific forms */}
              {method === 'upi' && <UpiForm onPay={handlePay} loading={loading} />}
              {method === 'card' && <CardForm onPay={handlePay} loading={loading} />}
              {(!method || method === 'wallet') && (
                <Button fullWidth loading={loading} onClick={() => handlePay({})}>
                  Confirm Payment <HiArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}

          {/* ── Processing ── */}
          {isProcessing && (
            <div className="text-center py-8 animate-fade-in">
              <StatusIcon status="processing" />
              <h2 className="font-display text-2xl font-bold text-white mb-2">Processing…</h2>
              <p className="text-brand-muted font-body text-sm">
                Please wait while we confirm your payment. Do not close this page.
              </p>
              <div className="flex justify-center gap-1.5 mt-6">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* ── Success ── */}
          {isPaid && (
            <div className="text-center py-6 animate-scale-in">
              <StatusIcon status="Paid" />
              <h2 className="font-display text-2xl font-bold text-white mb-2">Payment Successful!</h2>
              <p className="text-brand-muted font-body text-sm mb-8">
                Your order has been confirmed and is being prepared. 🎉
              </p>
              <div className="space-y-3">
                <Button fullWidth onClick={() => navigate(`/orders/${orderId}`)}>
                  Track Your Order <HiArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="secondary" fullWidth onClick={() => navigate('/orders')}>
                  All Orders
                </Button>
              </div>
            </div>
          )}

          {/* ── Failed ── */}
          {isFailed && (
            <div className="text-center py-6 animate-scale-in">
              <StatusIcon status="Failed" />
              <h2 className="font-display text-2xl font-bold text-white mb-2">Payment Failed</h2>
              <p className="text-brand-muted font-body text-sm mb-8">
                Something went wrong. Your order is still saved — you can retry payment.
              </p>
              <div className="space-y-3">
                <Button fullWidth onClick={() => setStatus('pending')}>
                  <HiRefresh className="w-4 h-4" /> Retry Payment
                </Button>
                <Button variant="secondary" fullWidth onClick={() => navigate(`/orders/${orderId}`)}>
                  View Order
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;
