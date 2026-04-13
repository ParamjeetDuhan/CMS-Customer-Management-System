import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HiLocationMarker, HiPlus, HiPencil, HiTrash,
  HiCheckCircle, HiHome, HiBriefcase, HiOfficeBuilding,
  HiX, HiSave, HiStar, HiArrowLeft,
} from 'react-icons/hi';
import { useAddress } from '../../hooks/useAddress';
import { useAuth }    from '../../hooks/useAuth';
import Input          from '../../components/common/Input';
import Button         from '../../components/common/Button';
import { ConfirmModal } from '../../components/common/Modal';
import { getUserLocation } from '../../utils/helpers';
import toast from 'react-hot-toast';

/* ── Label options ─────────────────────────────────── */
const LABELS = [
  { value: 'Home',  icon: <HiHome        className="w-4 h-4" /> },
  { value: 'Work',  icon: <HiBriefcase   className="w-4 h-4" /> },
  { value: 'Other', icon: <HiOfficeBuilding className="w-4 h-4" /> },
];

const labelIcon = (label) =>
  LABELS.find((l) => l.value === label)?.icon || <HiLocationMarker className="w-4 h-4" />;

/* ── Empty form shape ──────────────────────────────── */
const EMPTY_FORM = {
  label:   'Home',
  name:    '',
  phone:   '',
  line1:   '',
  city:    '',
  state:   '',
  pincode: '',
  isDefault: false,
};

/* ── Geocode coords → readable address via browser API ── */
const reverseGeocode = async (lat, lng) => {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
  const res  = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  const data = await res.json();
  const addr = data.address || {};
  return {
    line1:   [addr.road, addr.neighbourhood, addr.suburb].filter(Boolean).join(', '),
    city:    addr.city || addr.town || addr.village || '',
    state:   addr.state || '',
    pincode: addr.postcode || '',
  };
};

/* ══════════════════════════════════════════════════
   ADDRESS FORM (used for both Add & Edit)
══════════════════════════════════════════════════ */
const AddressForm = ({ initial = EMPTY_FORM, onSave, onCancel, saving }) => {
  const [form,   setForm]   = useState(initial);
  const [errors, setErrors] = useState({});
  const [locating, setLocating] = useState(false);

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Required';
    if (!form.phone.trim())   e.phone   = 'Required';
    if (!form.line1.trim())   e.line1   = 'Required';
    if (!form.city.trim())    e.city    = 'Required';
    if (!form.pincode.trim()) e.pincode = 'Required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleUseLocation = async () => {
    setLocating(true);
    try {
      const { lat, lng } = await getUserLocation();
      const geo = await reverseGeocode(lat, lng);
      setForm((p) => ({ ...p, ...geo }));
      toast.success('Location detected!');
    } catch {
      toast.error('Could not get location. Please enter manually.');
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Label picker */}
      <div>
        <p className="label mb-2">Address Type</p>
        <div className="flex gap-2">
          {LABELS.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => setForm((p) => ({ ...p, label: l.value }))}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold font-body border transition-all ${
                form.label === l.value
                  ? 'border-primary-500 bg-primary-500/15 text-primary-400'
                  : 'border-brand-border bg-brand-surface text-gray-400 hover:border-brand-muted'
              }`}
            >
              {l.icon} {l.value}
            </button>
          ))}
        </div>
      </div>

      {/* Detect location button */}
      <button
        type="button"
        onClick={handleUseLocation}
        disabled={locating}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-primary-500/40 text-primary-400 hover:bg-primary-500/10 text-sm font-body font-medium transition-all disabled:opacity-50"
      >
        {locating
          ? <span className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          : <HiLocationMarker className="w-4 h-4" />
        }
        {locating ? 'Detecting location…' : 'Use My Current Location'}
      </button>

      {/* Fields */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Full Name" placeholder="Rahul Sharma"
          value={form.name} onChange={set('name')} error={errors.name}
          required className="col-span-2 sm:col-span-1"
        />
        <Input
          label="Phone" placeholder="9876543210"
          value={form.phone} onChange={set('phone')} error={errors.phone}
          required className="col-span-2 sm:col-span-1"
        />
        <Input
          label="Address Line" placeholder="Flat 4B, Green Park Apartments"
          value={form.line1} onChange={set('line1')} error={errors.line1}
          required className="col-span-2"
        />
        <Input
          label="City" placeholder="Delhi"
          value={form.city} onChange={set('city')} error={errors.city}
          required
        />
        <Input
          label="State" placeholder="Delhi"
          value={form.state} onChange={set('state')}
        />
        <Input
          label="Pincode" placeholder="110001"
          value={form.pincode} onChange={set('pincode')} error={errors.pincode}
          required className="col-span-2 sm:col-span-1"
        />
      </div>

      {/* Set as default */}
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))}
          className="w-4 h-4 accent-primary-500 rounded"
        />
        <span className="text-sm text-gray-300 font-body">Set as default address</span>
      </label>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-shrink-0">
          <HiX className="w-4 h-4" /> Cancel
        </Button>
        <Button type="submit" fullWidth loading={saving} leftIcon={<HiSave className="w-4 h-4" />}>
          Save Address
        </Button>
      </div>
    </form>
  );
};

/* ══════════════════════════════════════════════════
   ADDRESS CARD
══════════════════════════════════════════════════ */
const AddressCard = ({ address, onEdit, onDelete, onSetDefault, actionLoading }) => (
  <div className={`relative rounded-2xl border p-5 transition-all ${
    address.isDefault
      ? 'border-primary-500/50 bg-primary-500/5'
      : 'border-brand-border bg-brand-surface hover:border-brand-muted'
  }`}>

    {/* Default badge */}
    {address.isDefault && (
      <span className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-bold font-body text-primary-400 bg-primary-500/15 border border-primary-500/30 px-2 py-0.5 rounded-full">
        <HiStar className="w-3 h-3" /> DEFAULT
      </span>
    )}

    {/* Label + icon */}
    <div className="flex items-center gap-2 mb-3">
      <span className={`p-1.5 rounded-lg ${address.isDefault ? 'bg-primary-500/20 text-primary-400' : 'bg-brand-card text-gray-400'}`}>
        {labelIcon(address.label)}
      </span>
      <span className="text-sm font-bold font-body text-white">{address.label}</span>
    </div>

    {/* Address detail */}
    <p className="text-sm font-semibold text-white font-body mb-0.5">{address.name}</p>
    <p className="text-sm text-gray-400 font-body mb-0.5">{address.phone}</p>
    <p className="text-sm text-gray-400 font-body leading-relaxed">
      {address.line1},{' '}
      {address.city}{address.state ? `, ${address.state}` : ''} — {address.pincode}
    </p>

    {/* Actions */}
    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-brand-border">
      {!address.isDefault && (
        <button
          onClick={() => onSetDefault(address.id)}
          disabled={actionLoading}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-400 font-body font-medium transition-colors disabled:opacity-50"
        >
          <HiCheckCircle className="w-3.5 h-3.5" /> Set Default
        </button>
      )}
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={() => onEdit(address)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold font-body text-gray-300 bg-brand-card hover:bg-brand-border border border-brand-border transition-all"
        >
          <HiPencil className="w-3.5 h-3.5" /> Edit
        </button>
        <button
          onClick={() => onDelete(address)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold font-body text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all"
        >
          <HiTrash className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
const AddressBook = () => {
  const { user }      = useAuth();
  const navigate      = useNavigate();
  const location      = useLocation();
  const returnTo      = location.state?.returnTo || null;   // e.g. '/checkout'
  const {
    addresses, loading,
    addAddress, editAddress, removeAddress, makeDefault,
  } = useAddress();

  /* Panel state: null | 'add' | { ...addressToEdit } */
  const [panel,        setPanel]       = useState(null);
  const [saving,       setSaving]      = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actLoading,   setActLoading]  = useState(false);

  /* ── Add ── */
  const handleAdd = async (form) => {
    setSaving(true);
    try {
      await addAddress({ ...form, name: form.name || user?.name || '' });
      toast.success('Address saved!');
      setPanel(null);
      if (returnTo) { navigate(returnTo); return; }
    } catch (err) {
      toast.error(err.message || 'Could not save address');
    } finally {
      setSaving(false);
    }
  };

  /* ── Edit ── */
  const handleEdit = async (form) => {
    setSaving(true);
    try {
      await editAddress(panel.id, form);
      toast.success('Address updated!');
      setPanel(null);
    } catch (err) {
      toast.error(err.message || 'Could not update address');
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDeleteConfirm = async () => {
    setActLoading(true);
    try {
      await removeAddress(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.message || 'Could not delete address');
    } finally {
      setActLoading(false);
    }
  };

  /* ── Set default ── */
  const handleSetDefault = async (id) => {
    setActLoading(true);
    try {
      await makeDefault(id);
    } catch (err) {
      toast.error(err.message || 'Could not update default');
    } finally {
      setActLoading(false);
    }
  };

  const isEditing  = panel && panel !== 'add';
  const initialForm = isEditing
    ? { label: panel.label, name: panel.name, phone: panel.phone,
        line1: panel.line1, city: panel.city, state: panel.state,
        pincode: panel.pincode, isDefault: panel.isDefault }
    : EMPTY_FORM;

  return (
    <div className="py-8 min-h-screen">
      <div className="page-container max-w-2xl">

        {/* Back-to-checkout banner */}
        {returnTo && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl">
            <HiLocationMarker className="w-4 h-4 text-primary-400 flex-shrink-0" />
            <p className="text-sm text-primary-300 font-body flex-1">
              Add an address to continue with your checkout
            </p>
            <button
              onClick={() => navigate(returnTo)}
              className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 font-body font-medium transition-colors"
            >
              <HiArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          </div>
        )}

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
              <HiLocationMarker className="w-6 h-6 text-primary-400" />
              Saved Addresses
            </h1>
            <p className="text-brand-muted font-body text-sm mt-1">
              Manage your delivery addresses
            </p>
          </div>
          {!panel && (
            <Button
              size="sm"
              leftIcon={<HiPlus className="w-4 h-4" />}
              onClick={() => setPanel('add')}
            >
              Add New
            </Button>
          )}
        </div>

        {/* Add / Edit form panel */}
        {panel && (
          <div className="card p-6 mb-6 animate-scale-in">
            <h2 className="font-display font-bold text-white mb-5 flex items-center gap-2">
              {isEditing
                ? <><HiPencil className="w-5 h-5 text-primary-400" /> Edit Address</>
                : <><HiPlus   className="w-5 h-5 text-primary-400" /> Add New Address</>
              }
            </h2>
            <AddressForm
              initial={initialForm}
              onSave={isEditing ? handleEdit : handleAdd}
              onCancel={() => setPanel(null)}
              saving={saving}
            />
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="card p-5 animate-pulse space-y-3">
                <div className="h-4 w-24 bg-brand-border rounded-lg" />
                <div className="h-3 w-40 bg-brand-border rounded-lg" />
                <div className="h-3 w-56 bg-brand-border rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && addresses.length === 0 && !panel && (
          <div className="card p-12 text-center animate-fade-in">
            <div className="w-16 h-16 bg-primary-500/10 border border-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HiLocationMarker className="w-8 h-8 text-primary-400/50" />
            </div>
            <h3 className="font-display font-bold text-white mb-2">No addresses yet</h3>
            <p className="text-brand-muted font-body text-sm mb-6">
              Add your first delivery address to speed up checkout
            </p>
            <Button leftIcon={<HiPlus className="w-4 h-4" />} onClick={() => setPanel('add')}>
              Add Address
            </Button>
          </div>
        )}

        {/* Address cards */}
        {!loading && addresses.length > 0 && (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <AddressCard
                key={addr.id}
                address={addr}
                onEdit={(a) => setPanel(a)}
                onDelete={(a) => setDeleteTarget(a)}
                onSetDefault={handleSetDefault}
                actionLoading={actLoading}
              />
            ))}

            {/* Add another */}
            {!panel && (
              <button
                onClick={() => setPanel('add')}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-dashed border-brand-border text-gray-400 hover:border-primary-500/40 hover:text-primary-400 font-body text-sm font-medium transition-all"
              >
                <HiPlus className="w-4 h-4" /> Add Another Address
              </button>
            )}
          </div>
        )}

        {/* Delete confirm modal */}
        <ConfirmModal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Address"
          message={`Remove "${deleteTarget?.label}" at ${deleteTarget?.line1}, ${deleteTarget?.city}? This cannot be undone.`}
          confirmLabel={actLoading ? 'Deleting…' : 'Delete'}
          danger
        />

      </div>
    </div>
  );
};

export default AddressBook;