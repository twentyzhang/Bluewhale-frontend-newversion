import { Navigate } from 'react-router-dom';
import { getAuth, getHomePathByRole, isLoggedIn } from '../utils/auth';

function PublicRoute({ children }) {
  if (isLoggedIn()) {
    const { role } = getAuth();
    return <Navigate to={getHomePathByRole(role)} replace />;
  }
  return children;
}

export default PublicRoute;
