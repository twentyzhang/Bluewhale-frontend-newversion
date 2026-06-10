import { Navigate } from 'react-router-dom';
import ProductFeed from '../pages/customer/ProductFeed';
import CustomerHome from '../pages/customer/CustomerHome';
import { getAuth, isLoggedIn } from '../utils/auth';

function HomeRouter() {
  if (isLoggedIn()) {
    const { role } = getAuth();
    if (role === 'STAFF') {
      return <Navigate to="/staff" replace />;
    }
    if (role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    }
    if (role === 'CUSTOMER') {
      return <CustomerHome />;
    }
  }
  return <ProductFeed showStore />;
}

export default HomeRouter;
