import { Navigate, createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import PublicRoute from '../components/PublicRoute';
import RequireRole from '../components/RequireRole';
import HomeRouter from '../components/HomeRouter';
import MainLayout from '../layouts/MainLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Profile from '../pages/profile/Profile';
import ChangePassword from '../pages/profile/ChangePassword';
import AddressList from '../pages/profile/AddressList';
import StaffHome from '../pages/staff/StaffHome';
import AdminHome from '../pages/admin/AdminHome';
import StoreDetail from '../pages/customer/StoreDetail';
import ProductDetail from '../pages/customer/ProductDetail';
import SearchProducts from '../pages/customer/SearchProducts';
import Cart from '../pages/customer/Cart';
import Checkout from '../pages/customer/Checkout';
import OrderList from '../pages/customer/OrderList';
import OrderDetail from '../pages/customer/OrderDetail';

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomeRouter />,
      },
      {
        path: 'search',
        element: <SearchProducts />,
      },
      {
        path: 'stores/:storeId',
        element: <StoreDetail />,
      },
      {
        path: 'products/:productId',
        element: <ProductDetail />,
      },
      {
        path: 'cart',
        element: (
          <ProtectedRoute>
            <RequireRole roles={['CUSTOMER']}>
              <Cart />
            </RequireRole>
          </ProtectedRoute>
        ),
      },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <RequireRole roles={['CUSTOMER']}>
              <Checkout />
            </RequireRole>
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile/password',
        element: (
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile/addresses',
        element: (
          <ProtectedRoute>
            <RequireRole roles={['CUSTOMER']}>
              <AddressList />
            </RequireRole>
          </ProtectedRoute>
        ),
      },
      {
        path: 'addresses',
        element: <Navigate to="/profile/addresses" replace />,
      },
      {
        path: 'orders',
        element: (
          <ProtectedRoute>
            <RequireRole roles={['CUSTOMER']}>
              <OrderList />
            </RequireRole>
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders/:orderId',
        element: (
          <ProtectedRoute>
            <RequireRole roles={['CUSTOMER']}>
              <OrderDetail />
            </RequireRole>
          </ProtectedRoute>
        ),
      },
      {
        path: 'staff',
        element: (
          <ProtectedRoute>
            <RequireRole roles={['STAFF']}>
              <StaffHome />
            </RequireRole>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute>
            <RequireRole roles={['ADMIN']}>
              <AdminHome />
            </RequireRole>
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;
