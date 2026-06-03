import { Navigate } from 'react-router-dom';
import { getAuth, getHomePathByRole } from '../utils/auth';

function RequireRole({ roles, children }) {
  const { role } = getAuth();
  if (!roles.includes(role)) {
    return <Navigate to={getHomePathByRole(role)} replace />;
  }
  return children;
}

export default RequireRole;
