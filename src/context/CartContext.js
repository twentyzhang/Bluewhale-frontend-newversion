import { createContext } from 'react';

const CartContext = createContext({
  itemCount: 0,
  refreshCart: async () => {},
});

export default CartContext;
