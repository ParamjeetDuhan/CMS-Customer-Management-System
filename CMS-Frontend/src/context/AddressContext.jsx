import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import addressService from '../services/addressService';
import { useAuthContext } from './AuthContext';
import toast from 'react-hot-toast';

const AddressContext = createContext(null);

export const AddressProvider = ({ children }) => {
  const { isAuthenticated, registerAddressSeed } = useAuthContext();
  const [addresses, setAddresses] = useState([]);
  const [loading,   setLoading]   = useState(false);

  /* ── Fetch all addresses from backend (used on bootstrap / after mutations) ── */
  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await addressService.getAddresses();
      const list = res.addresses || [];
      list.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
      setAddresses(list);
    } catch {
      /* silent — addresses are non-critical */
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * Register a seed fn with AuthContext so that when the user logs in,
   * the addresses already in the login response are used directly
   * instead of making a second API call to /api/addresses.
   *
   * Flow:
   *   1. User logs in  →  backend returns { token, user, addresses }
   *   2. AuthContext.login() calls onAddressesReceived.current(addresses)
   *   3. That calls seedAddresses() here  →  sets addresses immediately
   *   4. The useEffect below sees isAuthenticated=true but addresses
   *      are already populated so fetchAddresses is skipped.
   */
  const seedAddresses = useCallback((list = []) => {
    if (!list.length) return;
    const sorted = [...list].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
    setAddresses(sorted);
  }, []);

  /* Register the seed fn once on mount */
  useEffect(() => {
    registerAddressSeed(seedAddresses);
  }, [registerAddressSeed, seedAddresses]);

  /*
   * Fallback: if the user was already logged in (page reload / bootstrap),
   * the login event never fires so we fetch addresses directly.
   * We only fetch if addresses are still empty after auth is confirmed.
   */
  useEffect(() => {
    if (!isAuthenticated) {
      setAddresses([]);
      return;
    }
    /* Give seedAddresses a tick to populate from login response first */
    const timer = setTimeout(() => {
      setAddresses((prev) => {
        if (prev.length === 0) {
          fetchAddresses();   // only fetch if not already seeded
        }
        return prev;
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, fetchAddresses]);

  /* ── CRUD ── */
  const addAddress = useCallback(async (data) => {
    const res = await addressService.createAddress(data);
    await fetchAddresses();
    return res.address;
  }, [fetchAddresses]);

  const editAddress = useCallback(async (id, data) => {
    const res = await addressService.updateAddress(id, data);
    await fetchAddresses();
    return res.address;
  }, [fetchAddresses]);

  const removeAddress = useCallback(async (id) => {
    await addressService.deleteAddress(id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success('Address removed');
  }, []);

  const makeDefault = useCallback(async (id) => {
    await addressService.setDefault(id);
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
    toast.success('Default address updated');
  }, []);

  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0] || null;

  return (
    <AddressContext.Provider value={{
      addresses, loading, defaultAddress,
      fetchAddresses, addAddress, editAddress, removeAddress, makeDefault, seedAddresses,
    }}>
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => {
  const ctx = useContext(AddressContext);
  if (!ctx) throw new Error('useAddress must be used within AddressProvider');
  return ctx;
};

export default AddressContext;