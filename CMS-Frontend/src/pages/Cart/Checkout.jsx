import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import {
  HiLocationMarker, HiCreditCard, HiCheckCircle,
  HiHome, HiBriefcase, HiOfficeBuilding, HiStar,
  HiPencil, HiPlus,
} from 'react-icons/hi';
import { useCart }         from '../../hooks/useCart';
import { useAuth }         from '../../hooks/useAuth';
import { useAddress }      from '../../hooks/useAddress';
import orderService        from '../../services/orderService';
import Button              from '../../components/common/Button';
import { PAYMENT_METHODS } from '../../utils/constants';
import { formatCurrency }  from '../../utils/helpers';
import toast from 'react-hot-toast';

/* ── Step labels ─────────────────────────────────── */
const STEPS = ['Delivery', 'Payment', 'Confirm'];

/* ── Label → icon map ────────────────────────────── */
const LABEL_ICON = {
  Home:  <HiHome           className="w-4 h-4" />,
  Work:  <HiBriefcase      className="w-4 h-4" />,
  Other: <HiOfficeBuilding className="w-4 h-4" />,
};
const labelIcon = (label) =>
  LABEL_ICON[label] || <HiLocationMarker className="w-4 h-4" />;

/* ══════════════════════════════════════════════════
   ADDRESS PICKER (Step 0)
══════════════════════════════════════════════════ */
const AddressPicker = ({
  addresses, loading, selected,
  onSelect, onNext, onGoToAddressBook,
}) => {

  /* Skeleton while loading */
  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
          <HiLocationMarker className="w-5 h-5 text-primary-400" /> Delivery Address
        </h2>
        {[1, 2].map((n) => (
          <div key={n} className="rounded-2xl border border-brand-border p-5 animate-pulse space-y-2.5">
            <div className="h-3 w-20 bg-brand-border rounded-lg" />
            <div className="h-3 w-44 bg-brand-border rounded-lg" />
            <div className="h-3 w-60 bg-brand-border rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  /* Empty — nudge to AddressBook */
  if (addresses.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
          <HiLocationMarker className="w-5 h-5 text-primary-400" /> Delivery Address
        </h2>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-16 h-16 bg-primary-500/10 border border-primary-500/20 rounded-2xl flex items-center justify-center mb-4">
            <HiLocationMarker className="w-8 h-8 text-primary-400/40" />
          </div>
          <h3 className="font-display font-bold text-white mb-2">No saved addresses</h3>
          <p className="text-brand-muted font-body text-sm mb-6 max-w-xs leading-relaxed">
            You don't have any saved delivery addresses yet.
            Add one to continue with checkout.
          </p>
          <Button leftIcon={<HiPlus className="w-4 h-4" />} onClick={onGoToAddressBook}>
            Add Delivery Address
          </Button>
        </div>
      </div>
    );
  }

  /* Has addresses — show radio cards */
  return (
    <div className="space-y-4 animate-fade-in">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
          <HiLocationMarker className="w-5 h-5 text-primary-400" /> Select Address
        </h2>
        <button
          onClick={onGoToAddressBook}
          className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 font-body font-medium transition-colors"
        >
          <HiPencil className="w-3.5 h-3.5" /> Manage
        </button>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {addresses.map((addr) => {
          const isSelected = selected?.id === addr.id;
          return (
            <button
              key={addr.id}
              onClick={() => onSelect(addr)}
              className={`w-full text-left rounded-2xl border p-4 transition-all duration-200 ${
                isSelected
                  ? 'border-primary-500 bg-primary-500/8 ring-1 ring-primary-500/20'
                  : 'border-brand-border bg-brand-surface hover:border-brand-muted'
              }`}
            >
              <div className="flex items-start gap-3">

                {/* Radio dot */}
                <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                  isSelected ? 'border-primary-500' : 'border-brand-border'
                }`}>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-primary-500" />
                  )}
                </div>

                {/* Address detail */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`flex items-center gap-1 text-xs font-bold font-body ${
                      isSelected ? 'text-primary-400' : 'text-gray-300'
                    }`}>
                      {labelIcon(addr.label)} {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold font-body text-primary-400 bg-primary-500/15 border border-primary-500/25 px-1.5 py-0.5 rounded-full">
                        <HiStar className="w-2.5 h-2.5" /> DEFAULT
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-white font-body">{addr.name}</p>
                  <p className="text-xs text-gray-400 font-body">{addr.phone}</p>
                  <p className="text-xs text-gray-400 font-body mt-0.5 leading-relaxed">
                    {addr.line1}, {addr.city}
                    {addr.state ? `, ${addr.state}` : ''} — {addr.pincode}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Add another */}
      <button
        onClick={onGoToAddressBook}
        className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl border border-dashed border-brand-border text-gray-400 hover:border-primary-500/40 hover:text-primary-400 font-body text-xs font-medium transition-all"
      >
        <HiPlus className="w-3.5 h-3.5" /> Add or manage addresses
      </button>

      <Button fullWidth disabled={!selected} onClick={onNext}>
        Continue to Payment →
      </Button>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   MAIN CHECKOUT
══════════════════════════════════════════════════ */
const Checkout = () => {
  const { cart, total, clearCart }                          = useCart();
  const { user }                                            = useAuth();
  const { addresses, loading: addrLoading, defaultAddress } = useAddress();
  const navigate = useNavigate();

  const [step,      setStep]      = useState(0);
  const [loading,   setLoading]   = useState(false);
  const [selected,  setSelected]  = useState(null);
  const [payMethod, setPayMethod] = useState('cod');

  const DELIVERY_FEE = total >= 100 ? 0 : 10;
  const TAXES        = Math.round(total * 0.05);
  const GRAND        = total + DELIVERY_FEE + TAXES;

  /* Auto-select default address once loaded */
  useEffect(() => {
    if (!addrLoading && defaultAddress && !selected) {
      setSelected(defaultAddress);
    }
  }, [addrLoading, defaultAddress]);

  /* Go to AddressBook, return to checkout afterwards */
  const goToAddressBook = () =>
    navigate('/addresses', { state: { returnTo: '/checkout' } });

  /* Place order */
  const handlePlaceOrder = async () => {
    if (!selected) { toast.error('Please select a delivery address'); return; }
    setLoading(true);
    try {
      const orderPayload = {
        AccountId:       user.id,
        ShopId:          cart.shopId,
        OrderDate:       new Date().toISOString().split('T')[0],
        TotalAmount:     GRAND,
        DeliveryAddress: selected,
        ProductList:     cart.items.map((i) => ({
          ProductId: i.id,
          Quantity:  i.quantity,
          Price:     i.price,
        })),
        paymentMethod: payMethod,
        subtotal:      total,
        deliveryFee:   DELIVERY_FEE,
        taxes:         TAXES,
      };

      const res     = await orderService.placeOrder(orderPayload);
      const orderId = res.order?.id || res.orderId;
      clearCart();

      if (payMethod === 'cod') {
        toast.success('Order placed successfully! 🎉');
        navigate(`/orders/${orderId}`);
      } else {
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
                i < step   ? 'bg-green-500 text-white' :
                i === step ? 'bg-primary-500 text-white shadow-glow' :
                             'bg-brand-card border border-brand-border text-brand-muted'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-body hidden sm:block ${
                i === step ? 'text-white font-semibold' : 'text-brand-muted'
              }`}>
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`w-8 sm:w-16 h-px ${i < step ? 'bg-green-500' : 'bg-brand-border'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="card p-8">

          {/* ── Step 0: Address picker ── */}
          {step === 0 && (
            <AddressPicker
              addresses={addresses}
              loading={addrLoading}
              selected={selected}
              onSelect={setSelected}
              onNext={() => setStep(1)}
              onGoToAddressBook={goToAddressBook}
            />
          )}

          {/* ── Step 1: Payment method ── */}
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
                      payMethod === m.value
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-brand-border'
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

          {/* ── Step 2: Review & Confirm ── */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <HiCheckCircle className="w-5 h-5 text-primary-400" /> Review & Confirm
              </h2>

              {/* Address summary */}
              <div className="bg-brand-surface rounded-xl p-4 border border-brand-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-brand-muted font-body uppercase tracking-wide">
                    Delivering To
                  </p>
                  <button
                    onClick={() => setStep(0)}
                    className="text-xs text-primary-400 hover:text-primary-300 font-body flex items-center gap-1 transition-colors"
                  >
                    <HiPencil className="w-3 h-3" /> Change
                  </button>
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs font-bold font-body text-primary-400 flex items-center gap-1">
                    {labelIcon(selected?.label)} {selected?.label}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white font-body">
                  {selected?.name} · {selected?.phone}
                </p>
                <p className="text-sm text-gray-400 font-body">
                  {selected?.line1}, {selected?.city}
                  {selected?.state ? `, ${selected.state}` : ''} — {selected?.pincode}
                </p>
              </div>

              {/* Order items */}
              <div className="bg-brand-surface rounded-xl p-4 border border-brand-border space-y-2">
                <p className="text-xs text-brand-muted font-body uppercase tracking-wide mb-3">
                  Order Items
                </p>
                {cart.items.map((i) => (
                  <div key={i.id} className="flex justify-between text-sm font-body">
                    <span className="text-gray-300">{i.name} × {i.quantity}</span>
                    <span className="text-white font-mono">{formatCurrency(i.price * i.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-brand-border pt-2 mt-2 space-y-1 text-xs text-brand-muted">
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>{DELIVERY_FEE === 0 ? '🎉 FREE' : formatCurrency(DELIVERY_FEE)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes (5%)</span>
                    <span>{formatCurrency(TAXES)}</span>
                  </div>
                </div>
                <div className="flex justify-between font-bold text-sm border-t border-brand-border pt-2">
                  <span className="text-white font-display">Total</span>
                  <span className="text-primary-400 font-mono">{formatCurrency(GRAND)}</span>
                </div>
              </div>

              <p className="text-xs text-brand-muted font-body">
                Payment:{' '}
                <span className="text-white font-medium">
                  {PAYMENT_METHODS.find((m) => m.value === payMethod)?.label}
                </span>
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