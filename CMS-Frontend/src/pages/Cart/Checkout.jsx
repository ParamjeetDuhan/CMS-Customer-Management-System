import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiLocationMarker, HiCreditCard, HiCheckCircle } from 'react-icons/hi';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import orderService from '../../services/orderService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { PAYMENT_METHODS } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

const STEPS = ['Delivery', 'Payment', 'Confirm'];

const Checkout = () => {
  const { cart, total, count, clearCart } = useCart();
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [step, setStep]   = useState(0);
  const [loading, setLoading] = useState(false);

  const DELIVERY_FEE = total >= 500 ? 0 : 40;
  const TAXES        = Math.round(total * 0.05);
  const GRAND        = total + DELIVERY_FEE + TAXES;

  const [address, setAddress] = useState({
    name:    user?.name  || '',
    phone:   user?.phone || '',
    line1:   '',
    city:    '',
    state:   '',
    pincode: '',
  });
  const [addrErrors, setAddrErrors] = useState({});
  const [payMethod, setPayMethod]   = useState('cod');

  const validateAddress = () => {
    const e = {};
    if (!address.name.trim())    e.name    = 'Required';
    if (!address.phone.trim())   e.phone   = 'Required';
    if (!address.line1.trim())   e.line1   = 'Required';
    if (!address.city.trim())    e.city    = 'Required';
    if (!address.pincode.trim()) e.pincode = 'Required';
    setAddrErrors(e);
    return !Object.keys(e).length;
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderPayload = {
        shopId:  cart.shopId,
        items:   cart.items.map((i) => ({ productId: i.id, quantity: i.quantity, price: i.price })),
        address,
        paymentMethod: payMethod,
        subtotal:      total,
        deliveryFee:   DELIVERY_FEE,
        taxes:         TAXES,
        total:         GRAND,
      };

      const res = await orderService.placeOrder(orderPayload);
      const orderId = res.order?.id || res.orderId;

      clearCart();

      if (payMethod === 'cod') {
        toast.success('Order placed successfully! 🎉');
        navigate(`/orders/${orderId}`);
      } else {
        // Initiate payment
        const payRes = await orderService.initiatePayment(orderId, { method: payMethod });
        toast.success('Redirecting to payment…');
        navigate('/payment', { state: { orderId, paymentData: payRes } });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] py-10">
      <div className="page-container max-w-2xl">

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-mono transition-all ${
                i < step  ? 'bg-green-500 text-white' :
                i === step ? 'bg-primary-500 text-white shadow-glow' :
                             'bg-brand-card border border-brand-border text-brand-muted'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-body hidden sm:block ${i === step ? 'text-white font-semibold' : 'text-brand-muted'}`}>
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`w-8 sm:w-16 h-px ${i < step ? 'bg-green-500' : 'bg-brand-border'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="card p-8">

          {/* Step 0: Address */}
          {step === 0 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <HiLocationMarker className="w-5 h-5 text-primary-400" /> Delivery Address
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Full Name" value={address.name} onChange={(e) => setAddress((p) => ({ ...p, name: e.target.value }))} error={addrErrors.name} required className="col-span-2 sm:col-span-1" />
                <Input label="Phone" value={address.phone} onChange={(e) => setAddress((p) => ({ ...p, phone: e.target.value }))} error={addrErrors.phone} required className="col-span-2 sm:col-span-1" />
                <Input label="Address Line" value={address.line1} onChange={(e) => setAddress((p) => ({ ...p, line1: e.target.value }))} error={addrErrors.line1} required className="col-span-2" />
                <Input label="City" value={address.city} onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))} error={addrErrors.city} required />
                <Input label="State" value={address.state} onChange={(e) => setAddress((p) => ({ ...p, state: e.target.value }))} />
                <Input label="Pincode" value={address.pincode} onChange={(e) => setAddress((p) => ({ ...p, pincode: e.target.value }))} error={addrErrors.pincode} required />
              </div>
              <Button fullWidth onClick={() => { if (validateAddress()) setStep(1); }}>
                Continue to Payment →
              </Button>
            </div>
          )}

          {/* Step 1: Payment method */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <HiCreditCard className="w-5 h-5 text-primary-400" /> Payment Method
              </h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setPayMethod(m.value)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      payMethod === m.value
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-brand-border bg-brand-surface hover:border-brand-muted'
                    }`}
                  >
                    <span className="font-body font-medium text-white text-sm">{m.label}</span>
                    <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                      payMethod === m.value ? 'border-primary-500 bg-primary-500' : 'border-brand-border'
                    }`} />
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(0)}>← Back</Button>
                <Button fullWidth onClick={() => setStep(2)}>Review Order →</Button>
              </div>
            </div>
          )}

          {/* Step 2: Confirm */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <HiCheckCircle className="w-5 h-5 text-primary-400" /> Review & Confirm
              </h2>

              {/* Address summary */}
              <div className="bg-brand-surface rounded-xl p-4 border border-brand-border">
                <p className="text-xs text-brand-muted font-body mb-2">DELIVERING TO</p>
                <p className="text-sm text-white font-body">{address.name} · {address.phone}</p>
                <p className="text-sm text-gray-400 font-body">{address.line1}, {address.city} {address.pincode}</p>
              </div>

              {/* Items summary */}
              <div className="bg-brand-surface rounded-xl p-4 border border-brand-border space-y-2">
                <p className="text-xs text-brand-muted font-body mb-3">ORDER ITEMS</p>
                {cart.items.map((i) => (
                  <div key={i.id} className="flex justify-between text-sm font-body">
                    <span className="text-gray-300">{i.name} × {i.quantity}</span>
                    <span className="text-white font-mono">{formatCurrency(i.price * i.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-brand-border pt-2 mt-2 space-y-1 text-xs text-brand-muted">
                  <div className="flex justify-between"><span>Delivery</span><span>{DELIVERY_FEE === 0 ? 'FREE' : formatCurrency(DELIVERY_FEE)}</span></div>
                  <div className="flex justify-between"><span>Taxes</span><span>{formatCurrency(TAXES)}</span></div>
                </div>
                <div className="flex justify-between font-bold text-sm border-t border-brand-border pt-2">
                  <span className="text-white font-display">Total</span>
                  <span className="text-primary-400 font-mono">{formatCurrency(GRAND)}</span>
                </div>
              </div>

              <p className="text-xs text-brand-muted font-body">
                Payment: <span className="text-white">{PAYMENT_METHODS.find((m) => m.value === payMethod)?.label}</span>
              </p>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(1)}>← Back</Button>
                <Button fullWidth loading={loading} onClick={handlePlaceOrder}>
                  Place Order 🎉
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
