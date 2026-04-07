import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CART_KEY } from '../utils/constants';
import { calcCartTotal, calcCartCount } from '../utils/helpers';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

const loadCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : { shopId: null, shopName: '', items: [] };
  } catch {
    return { shopId: null, shopName: '', items: [] };
  }
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(loadCart);

  /* ── Persist to localStorage ── */
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const addItem = useCallback((product, shop) => {
    setCart((prev) => {
      // Different shop → ask user (handled via toast, clear cart)
      if (prev.shopId && prev.shopId !== shop.id && prev.items.length > 0) {
        // In production show a confirm modal; here we auto-clear
        toast('Cart cleared – new shop selected', { icon: '🛒' });
        return {
          shopId:   shop.id,
          shopName: shop.name,
          items:    [{ ...product, quantity: 1 }],
        };
      }

      const existing = prev.items.find((i) => i.id === product.id);
      if (existing) {
        return {
          ...prev,
          items: prev.items.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return {
        shopId:   shop.id,
        shopName: shop.name,
        items:    [...prev.items, { ...product, quantity: 1 }],
      };
    });
    toast.success(`${product.name} added to cart`);
  }, []);

  const removeItem = useCallback((productId) => {
    setCart((prev) => {
      const items = prev.items.filter((i) => i.id !== productId);
      return { ...prev, items, shopId: items.length ? prev.shopId : null, shopName: items.length ? prev.shopName : '' };
    });
  }, []);

  const updateQuantity = useCallback((productId, qty) => {
    if (qty < 1) return;
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.id === productId ? { ...i, quantity: qty } : i
      ),
    }));
  }, []);

  const clearCart = useCallback(() => {
    setCart({ shopId: null, shopName: '', items: [] });
  }, []);

  const isInCart = useCallback(
    (productId) => cart.items.some((i) => i.id === productId),
    [cart.items]
  );

  const getItemQty = useCallback(
    (productId) => cart.items.find((i) => i.id === productId)?.quantity || 0,
    [cart.items]
  );

  const total = calcCartTotal(cart.items);
  const count = calcCartCount(cart.items);

  return (
    <CartContext.Provider
      value={{ cart, total, count, addItem, removeItem, updateQuantity, clearCart, isInCart, getItemQty }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be used within CartProvider');
  return ctx;
};

export default CartContext;
