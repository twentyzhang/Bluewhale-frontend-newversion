import { Navigate, createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import PublicRoute from '../components/PublicRoute';
import RequireRole from '../components/RequireRole';
import HomeRouter from '../components/HomeRouter';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Profile from '../pages/profile/Profile';
import ChangePassword from '../pages/profile/ChangePassword';
import AddressList from '../pages/profile/AddressList';
import StaffHome from '../pages/staff/StaffHome';
import StaffProductList from '../pages/staff/StaffProductList';
import StaffCategoryList from '../pages/staff/StaffCategoryList';
import StaffOrderList from '../pages/staff/StaffOrderList';
import StaffOrderDetail from '../pages/staff/StaffOrderDetail';
import StaffCouponList from '../pages/staff/StaffCouponList';
import StaffReports from '../pages/staff/StaffReports';
import StaffLayout from '../layouts/StaffLayout';
import AdminHome from '../pages/admin/AdminHome';
import AdminStoreList from '../pages/admin/AdminStoreList';
import AdminCouponList from '../pages/admin/AdminCouponList';
import AdminCategoryList from '../pages/admin/AdminCategoryList';
import AdminReports from '../pages/admin/AdminReports';
import StoreDetail from '../pages/customer/StoreDetail';
import ProductDetail from '../pages/customer/ProductDetail';
import SearchProducts from '../pages/customer/SearchProducts';
import Cart from '../pages/customer/Cart';
import Checkout from '../pages/customer/Checkout';
import OrderList from '../pages/customer/OrderList';
import OrderDetail from '../pages/customer/OrderDetail';
import CouponGroupList from '../pages/customer/CouponGroupList';
import MyCoupons from '../pages/customer/MyCoupons';

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
        path: 'coupons',
        element: <CouponGroupList />,
      },
      {
        path: 'coupons/mine',
        element: (
          <ProtectedRoute>
            <RequireRole roles={['CUSTOMER']}>
              <MyCoupons />
            </RequireRole>
          </ProtectedRoute>
        ),
      },
      {
        path: 'staff',
        element: (
          <ProtectedRoute>
            <RequireRole roles={['STAFF']}>
              <StaffLayout />
            </RequireRole>
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <StaffHome /> },
          { path: 'products', element: <StaffProductList /> },
          { path: 'categories', element: <StaffCategoryList /> },
          { path: 'orders', element: <StaffOrderList /> },
          { path: 'orders/:orderId', element: <StaffOrderDetail /> },
          { path: 'coupons', element: <StaffCouponList /> },
          { path: 'reports', element: <StaffReports /> },
        ],
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute>
            <RequireRole roles={['ADMIN']}>
              <AdminLayout />
            </RequireRole>
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <AdminHome /> },
          { path: 'stores', element: <AdminStoreList /> },
          { path: 'coupons', element: <AdminCouponList /> },
          { path: 'categories', element: <AdminCategoryList /> },
          { path: 'reports', element: <AdminReports /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;
