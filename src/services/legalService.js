import apiClient from './apiClient';

/**
 * Legal Service - Politicas de Privacidad y Terminos y Condiciones
 * Endpoints publicos para lectura, endpoints protegidos (SUPER_ADMIN) para escritura.
 */
const legalService = {
  /**
   * Obtiene la Politica de Privacidad vigente (publico).
   * @returns {Promise<{ type, content, dateTimeModification, dateTimeRegistration }>}
   */
  async getPrivacyPolicy() {
    const response = await apiClient.get('/legal/privacy');
    return response.data?.data || response.data;
  },

  /**
   * Obtiene los Terminos y Condiciones vigentes (publico).
   * @returns {Promise<{ type, content, dateTimeModification, dateTimeRegistration }>}
   */
  async getTermsAndConditions() {
    const response = await apiClient.get('/legal/terms');
    return response.data?.data || response.data;
  },

  /**
   * Lista ambos documentos legales con metadatos (admin).
   * @returns {Promise<{ privacy, terms }>}
   */
  async getAllLegalDocuments() {
    const response = await apiClient.get('/legal');
    return response.data?.data || response.data;
  },

  /**
   * Actualiza un documento legal (admin).
   * @param {'privacy'|'terms'} type
   * @param {string} content - Texto plano
   * @returns {Promise<Object>}
   */
  async updateLegalDocument(type, content) {
    const response = await apiClient.put(`/legal/${type}`, { content });
    return response.data?.data || response.data;
  }
};

export default legalService;
