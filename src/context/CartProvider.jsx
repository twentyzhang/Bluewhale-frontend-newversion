import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getCart } from '../api/cart';
import { getAuth, isLoggedIn } from '../utils/auth';
import CartContext from './CartContext.js';

export function CartProvider({ children }) {
  const [itemCount, setItemCount] = useState(0);

  const refreshCart = useCallback(async () => {
    if (!isLoggedIn() || getAuth().role !== 'CUSTOMER') {
      setItemCount(0);
      return;
    }
    try {
      const data = await getCart();
      const count = (data.items || []).reduce(
        (sum, item) => sum + (item.quantity || 0),
        0,
      );
      setItemCount(count);
    } catch {
      setItemCount(0);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const value = useMemo(
    () => ({ itemCount, refreshCart }),
    [itemCount, refreshCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
