import { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../../services/authService';
import { USER_ROLES } from '../../utils/constants';

// Create Auth Context
export const AuthContext = createContext(null);

/**
 * Auth Provider Component
 * Provides authentication state and methods to the application
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from stored data
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = authService.getStoredUser();
        const token = authService.getToken();

        if (storedUser && token) {
          // Validate token with backend
          const isValid = await authService.validateToken();
          if (isValid) {
            setUser(storedUser);
          } else {
            authService.clearAuthData();
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        authService.clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const response = await authService.login(email, password);

      // La respuesta viene en formato { success, data: { token, usuario } }
      const loginData = response.data || response;

      if (loginData.token && loginData.usuario) {
        const userData = {
          id: loginData.usuario.id,
          email: loginData.usuario.correo,
          fullName: loginData.usuario.nombres,
          roleId: loginData.usuario.id_rol,
          role: loginData.usuario.rol,
          permissions: loginData.usuario.permisos || []
        };

        authService.storeAuthData(loginData.token, userData);
        setUser(userData);
        return { success: true, user: userData };
      }

      throw new Error('Respuesta de login invalida');
    } catch (err) {
      const errorMessage = err.error?.message || err.message || 'Error al iniciar sesion';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Register new user
   */
  const register = useCallback(async (userData) => {
    setError(null);
    try {
      const response = await authService.register(userData);

      if (response.success && response.data?.token && response.data?.user) {
        const registeredUser = {
          id: response.data.user.id,
          email: response.data.user.email,
          fullName: response.data.user.fullName,
          role: response.data.user.roles?.[0] || USER_ROLES.CLIENT,
          permissions: []
        };

        authService.storeAuthData(response.data.token, registeredUser);
        setUser(registeredUser);
        return { success: true, user: registeredUser };
      }

      throw new Error('Respuesta de registro invalida');
    } catch (err) {
      const errorMessage = err.error?.message || err.message || 'Error al registrar usuario';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      authService.clearAuthData();
    }
  }, []);

  /**
   * Refresh user data from backend
   */
  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        const userData = {
          id: response.data.id,
          email: response.data.email,
          fullName: response.data.fullName,
          role: response.data.roles?.[0] || USER_ROLES.CLIENT,
          permissions: response.data.permisos || [],
          profile: response.data.profile
        };
        setUser(userData);
        authService.storeAuthData(authService.getToken(), userData);
        return userData;
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
    return null;
  }, []);

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback((role) => {
    if (!user) return false;
    return user.role === role;
  }, [user]);

  /**
   * Check if user is super admin
   */
  const isSuperAdmin = useCallback(() => {
    return hasRole(USER_ROLES.SUPER_ADMIN);
  }, [hasRole]);

  /**
   * Check if user is client
   */
  const isClient = useCallback(() => {
    return hasRole(USER_ROLES.CLIENT);
  }, [hasRole]);

  /**
   * Check if user has specific permission
   */
  const hasPermission = useCallback((permissionCode) => {
    if (!user || !user.permissions) return false;
    return user.permissions.some((p) => p.codigo === permissionCode);
  }, [user]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
    hasRole,
    isSuperAdmin,
    isClient,
    hasPermission,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
