import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import Loading from '../../components/common/Loading';

/**
 * Protected Route Component
 * Wraps routes that require authentication and/or specific roles
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string|string[]} props.roles - Required role(s) to access the route
 * @param {string} props.permission - Required permission code
 * @param {string} props.redirectTo - Redirect path if unauthorized
 */
const ProtectedRoute = ({
  children,
  roles = null,
  permission = null,
  redirectTo = '/login'
}) => {
  const { user, loading, isAuthenticated, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Verificando sesion..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role requirement
  if (roles) {
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    const hasRequiredRole = requiredRoles.some((role) => hasRole(role));

    if (!hasRequiredRole) {
      // Redirect to dashboard if authenticated but wrong role
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Check permission requirement
  if (permission && !hasPermission(permission)) {
    // Redirect to dashboard if authenticated but missing permission
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
