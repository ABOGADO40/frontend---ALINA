import apiClient from './apiClient';

/**
 * Export Service - Handles forensic ZIP export operations
 */
const exportService = {
  /**
   * Get list of exports (paginated)
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.status - Filter by status
   * @returns {Promise<Object>} Paginated export list
   */
  async getExports(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);

    const response = await apiClient.get(`/exports?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Get export by ID
   * @param {string|number} exportId - Export ID
   * @returns {Promise<Object>} Export data with details
   */
  async getExportById(exportId) {
    const response = await apiClient.get(`/exports/${exportId}`);
    return response.data;
  },

  /**
   * Create new forensic export
   * @param {Object} exportData - Export configuration
   * @param {Array<number>} exportData.evidenceIds - Array of evidence IDs to export
   * @param {string} exportData.password - ZIP password (min 8 chars)
   * @returns {Promise<Object>} Created export data
   */
  async createExport(exportData) {
    const payload = {
      evidenceIds: exportData.evidenceIds.map(id => parseInt(id)),
      password: exportData.password
    };

    const response = await apiClient.post('/exports', payload);
    return response.data;
  },

  /**
   * Download export ZIP file
   * @param {string|number} exportId - Export ID
   * @returns {Promise<Blob>} ZIP file blob
   */
  async downloadExport(exportId) {
    const response = await apiClient.get(`/exports/${exportId}/download`, {
      responseType: 'blob',
      timeout: 300000 // 5 minutes for large exports
    });
    return response.data;
  },

  /**
   * Get download URL for export
   * @param {string|number} exportId - Export ID
   * @returns {string} Download URL
   */
  getDownloadUrl(exportId) {
    const token = localStorage.getItem('token');
    return `${apiClient.defaults.baseURL}/exports/${exportId}/download?token=${token}`;
  },

  /**
   * Check export status
   * @param {string|number} exportId - Export ID
   * @returns {Promise<Object>} Export status
   */
  async checkStatus(exportId) {
    const response = await apiClient.get(`/exports/${exportId}`);
    return {
      id: response.data.data.id,
      status: response.data.data.status,
      isReady: response.data.data.status === 'READY'
    };
  }
};

export default exportService;
