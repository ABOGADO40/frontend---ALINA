import apiClient from './apiClient';

/**
 * Case Service - Handles case/expedient operations
 */
const caseService = {
  /**
   * Get list of cases (paginated)
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search term
   * @returns {Promise<Object>} Paginated case list
   */
  async getCases(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);

    const response = await apiClient.get(`/cases?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Get case by ID with its evidence
   * @param {string|number} caseId - Case ID
   * @returns {Promise<Object>} Case data with evidence
   */
  async getCaseById(caseId) {
    const response = await apiClient.get(`/cases/${caseId}`);
    return response.data;
  },

  /**
   * Create new case
   * @param {Object} caseData - Case data
   * @param {string} caseData.title - Case title (required)
   * @param {string} caseData.description - Case description (optional)
   * @returns {Promise<Object>} Created case data
   */
  async createCase(caseData) {
    const response = await apiClient.post('/cases', {
      title: caseData.title,
      description: caseData.description || null
    });
    return response.data;
  },

  /**
   * Update case
   * @param {string|number} caseId - Case ID
   * @param {Object} caseData - Case data to update
   * @returns {Promise<Object>} Updated case data
   */
  async updateCase(caseId, caseData) {
    const response = await apiClient.put(`/cases/${caseId}`, caseData);
    return response.data;
  },

  /**
   * Delete case (only if no evidence attached)
   * @param {string|number} caseId - Case ID
   * @returns {Promise<Object>} Delete response
   */
  async deleteCase(caseId) {
    const response = await apiClient.delete(`/cases/${caseId}`);
    return response.data;
  },

  /**
   * Get case statistics
   * @param {string|number} caseId - Case ID
   * @returns {Promise<Object>} Case statistics
   */
  async getCaseStats(caseId) {
    const caseData = await this.getCaseById(caseId);
    const evidences = caseData.data?.evidences || [];

    const stats = {
      totalEvidence: evidences.length,
      byStatus: {},
      bySourceType: {},
      readyForExport: 0
    };

    evidences.forEach((e) => {
      // Count by status
      stats.byStatus[e.status] = (stats.byStatus[e.status] || 0) + 1;
      // Count by source type
      stats.bySourceType[e.sourceType] = (stats.bySourceType[e.sourceType] || 0) + 1;
      // Count ready for export
      if (e.status === 'READY_FOR_EXPORT' || e.status === 'EXPORTED') {
        stats.readyForExport++;
      }
    });

    return stats;
  }
};

export default caseService;
