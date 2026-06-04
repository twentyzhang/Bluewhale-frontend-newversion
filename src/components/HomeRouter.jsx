import { Navigate } from 'react-router-dom';
import StoreList from '../pages/customer/StoreList';
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
  }
  return <StoreList />;
}

export default HomeRouter;
