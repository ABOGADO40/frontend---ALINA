import apiClient from './apiClient';

/**
 * Acta Service - Handles Acta de Obtencion de Evidencia Digital operations
 */
const actaService = {
  /**
   * Create a contributor record for an evidence
   * @param {number} evidenceId - Evidence ID
   * @param {Object} data - Contributor data
   * @returns {Promise<Object>} Created contributor record
   */
  async createContributorRecord(evidenceId, data) {
    const response = await apiClient.post(`/evidence/${evidenceId}/contributor`, data);
    return response.data;
  },

  /**
   * Get all contributor records for an evidence
   * @param {number} evidenceId - Evidence ID
   * @returns {Promise<Object>} List of contributor records
   */
  async getContributorRecords(evidenceId) {
    const response = await apiClient.get(`/evidence/${evidenceId}/contributors`);
    return response.data;
  },

  /**
   * Generate Acta PDF for a contributor record
   * @param {number} evidenceId - Evidence ID
   * @param {number} contributorRecordId - Contributor record ID
   * @returns {Promise<Object>} Generated acta data
   */
  async generateActaPdf(evidenceId, contributorRecordId) {
    const response = await apiClient.post(`/evidence/${evidenceId}/actas/generate`, {
      contributorRecordId
    });
    return response.data;
  },

  /**
   * Get all generated actas for an evidence
   * @param {number} evidenceId - Evidence ID
   * @returns {Promise<Object>} List of generated actas
   */
  async getGeneratedActas(evidenceId) {
    const response = await apiClient.get(`/evidence/${evidenceId}/actas`);
    return response.data;
  },

  /**
   * Download acta PDF
   * @param {number} actaId - Acta ID
   * @returns {Promise<Blob>} PDF blob
   */
  async downloadActa(actaId) {
    const response = await apiClient.get(`/evidence/actas/${actaId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Get download URL for acta
   * @param {number} actaId - Acta ID
   * @returns {string} Download URL
   */
  getDownloadUrl(actaId) {
    const token = localStorage.getItem('token');
    return `${apiClient.defaults.baseURL}/evidence/actas/${actaId}/download?token=${token}`;
  },

  /**
   * Get all documents for an evidence
   * @param {number} evidenceId - Evidence ID
   * @returns {Promise<Object>} Documents data
   */
  async getAllDocuments(evidenceId) {
    const response = await apiClient.get(`/evidence/${evidenceId}/documents`);
    return response.data;
  },

  /**
   * Download Certificado de Evidencia Digital PDF
   * @param {number} evidenceId - Evidence ID
   * @returns {Promise<Blob>} PDF blob
   */
  async downloadCertificado(evidenceId) {
    const response = await apiClient.get(`/evidence/${evidenceId}/documents/certificado/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Download Reporte de Cadena de Custodia PDF
   * @param {number} evidenceId - Evidence ID
   * @returns {Promise<Blob>} PDF blob
   */
  async downloadCadenaCustodia(evidenceId) {
    const response = await apiClient.get(`/evidence/${evidenceId}/documents/cadena-custodia/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Download Reporte de Metadatos PDF
   * @param {number} evidenceId - Evidence ID
   * @returns {Promise<Blob>} PDF blob
   */
  async downloadMetadatos(evidenceId) {
    const response = await apiClient.get(`/evidence/${evidenceId}/documents/metadatos/download`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default actaService;
