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
import StaffHome from '../pages/staff/StaffHome';
import AdminHome from '../pages/admin/AdminHome';

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
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <HomeRouter />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'profile/password',
        element: <ChangePassword />,
      },
      {
        path: 'staff',
        element: (
          <RequireRole roles={['STAFF']}>
            <StaffHome />
          </RequireRole>
        ),
      },
      {
        path: 'admin',
        element: (
          <RequireRole roles={['ADMIN']}>
            <AdminHome />
          </RequireRole>
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
