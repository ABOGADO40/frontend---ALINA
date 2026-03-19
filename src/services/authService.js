import apiClient from './apiClient';

/**
 * Auth Service - Handles authentication operations
 */
const authService = {
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login response with token and user data
   */
  async login(email, password) {
    const response = await apiClient.post('/auth/login', {
      email: email,
      password: password
    });
    return response.data;
  },

  /**
   * Register new client user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  async register(userData) {
    const response = await apiClient.post('/auth/register', {
      email: userData.email,
      password: userData.password,
      fullName: userData.fullName,
      dni: userData.dni || null,
      ruc: userData.ruc || null,
      phone: userData.phone || null
    });
    return response.data;
  },

  /**
   * Logout current user
   * @returns {Promise<Object>} Logout response
   */
  async logout() {
    try {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    } finally {
      // Always clear local storage on logout attempt
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Get current authenticated user
   * @returns {Promise<Object>} Current user data with roles and permissions
   */
  async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  /**
   * Validate if token is still valid
   * @returns {Promise<boolean>} True if token is valid
   */
  async validateToken() {
    try {
      await apiClient.get('/auth/me');
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Store auth data in local storage
   * @param {string} token - JWT token
   * @param {Object} user - User data
   */
  storeAuthData(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  /**
   * Get stored token
   * @returns {string|null} Stored token
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Get stored user
   * @returns {Object|null} Stored user data
   */
  getStoredUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Clear stored auth data
   */
  clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user has stored token
   */
  isAuthenticated() {
    return !!this.getToken();
  }
};

export default authService;
