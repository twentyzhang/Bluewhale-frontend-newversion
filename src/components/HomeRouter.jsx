import { Navigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import { getAuth } from '../utils/auth';

function HomeRouter() {
  const { role } = getAuth();
  if (role === 'STAFF') {
    return <Navigate to="/staff" replace />;
  }
  if (role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }
  return <Dashboard />;
}

export default HomeRouter;
