import { RouterProvider } from 'react-router-dom';
import { CartProvider } from './context/CartProvider';
import router from './router';

function App() {
  return (
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  );
}

export default App;
