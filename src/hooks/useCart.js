import { useContext } from 'react';
import CartContext from '../context/CartContext.js';

export function useCart() {
  return useContext(CartContext);
}
