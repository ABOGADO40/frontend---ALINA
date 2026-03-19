import apiClient from './apiClient';

/**
 * User Service - Handles user management operations (SUPER_ADMIN)
 */
const userService = {
  /**
   * Get list of users (paginated)
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search term
   * @param {string} params.role - Filter by role
   * @param {boolean} params.isActive - Filter by active status
   * @returns {Promise<Object>} Paginated user list
   */
  async getUsers(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);

    const response = await apiClient.get(`/users?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Get user by ID
   * @param {string|number} userId - User ID
   * @returns {Promise<Object>} User data
   */
  async getUserById(userId) {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  /**
   * Update user data
   * @param {string|number} userId - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Updated user data
   */
  async updateUser(userId, userData) {
    const response = await apiClient.put(`/users/${userId}`, userData);
    return response.data;
  },

  /**
   * Change user password
   * @param {string|number} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Update response
   */
  async changePassword(userId, currentPassword, newPassword) {
    const response = await apiClient.put(`/users/${userId}/password`, {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  /**
   * Toggle user active status
   * @param {string|number} userId - User ID
   * @param {boolean} isActive - New active status
   * @returns {Promise<Object>} Updated user data
   */
  async toggleUserStatus(userId, isActive) {
    const response = await apiClient.put(`/users/${userId}`, { isActive });
    return response.data;
  }
};

export default userService;
