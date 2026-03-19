import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { ProtectedRoute } from '../features/auth';
import { MainLayout } from '../components/layout';
import { USER_ROLES } from '../utils/constants';

// Pages
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';

// Case pages
import { CaseList, CaseCreate, CaseDetail } from '../pages/cases';

// Evidence pages
import { EvidenceUpload, EvidenceList, EvidenceDetail } from '../pages/evidence';

// Export pages
import { ExportCreate, ExportList } from '../pages/exports';

// Admin pages
import { UserList, AuditLog } from '../pages/admin';

// Verification pages
import { PublicVerification } from '../pages/verification';

/**
 * Application Routes
 * Defines all routes with authentication and role protection
 */
const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show nothing while loading auth state
  if (loading) {
    return null;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
        }
      />

      {/* Protected Routes - Main Layout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Cases */}
        <Route path="/cases" element={<CaseList />} />
        <Route path="/cases/create" element={<CaseCreate />} />
        <Route path="/cases/:id" element={<CaseDetail />} />

        {/* Evidence */}
        <Route path="/evidence" element={<EvidenceList />} />
        <Route path="/evidence/upload" element={<EvidenceUpload />} />
        <Route path="/evidence/:id" element={<EvidenceDetail />} />

        {/* Exports */}
        <Route path="/exports" element={<ExportList />} />
        <Route path="/exports/create" element={<ExportCreate />} />

        {/* Verification */}
        <Route path="/verify" element={<PublicVerification />} />

        {/* Admin Routes - SUPER_ADMIN only */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={USER_ROLES.SUPER_ADMIN}>
              <UserList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit"
          element={
            <ProtectedRoute roles={USER_ROLES.SUPER_ADMIN}>
              <AuditLog />
            </ProtectedRoute>
          }
        />

        {/* Profile - placeholder for now */}
        <Route path="/profile" element={<Dashboard />} />
      </Route>

      {/* Catch all - redirect to dashboard or landing */}
      <Route
        path="*"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
};

export default AppRoutes;
