import apiClient from './apiClient';

/**
 * Audit Service - Handles audit log operations (SUPER_ADMIN only)
 */
const auditService = {
  /**
   * Get audit logs (paginated)
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {number} params.userId - Filter by user ID
   * @param {string} params.action - Filter by action
   * @param {string} params.entityType - Filter by entity type
   * @param {string} params.from - Start date (ISO string)
   * @param {string} params.to - End date (ISO string)
   * @returns {Promise<Object>} Paginated audit log list
   */
  async getAuditLogs(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.userId) queryParams.append('userId', params.userId);
    if (params.action) queryParams.append('action', params.action);
    if (params.entityType) queryParams.append('entityType', params.entityType);
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);

    const response = await apiClient.get(`/audit?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Get available actions for filtering
   * @returns {Array<string>} List of action types
   */
  getActionTypes() {
    return [
      'LOGIN',
      'LOGOUT',
      'REGISTER',
      'CASE_CREATE',
      'CASE_UPDATE',
      'CASE_DELETE',
      'EVIDENCE_UPLOAD',
      'EVIDENCE_UPDATE',
      'EVIDENCE_DOWNLOAD',
      'EVIDENCE_PUBLIC_TOGGLE',
      'EVIDENCE_REGENERATE',
      'EXPORT_CREATE',
      'EXPORT_DOWNLOAD',
      'USER_UPDATE',
      'PASSWORD_CHANGE'
    ];
  },

  /**
   * Get available entity types for filtering
   * @returns {Array<string>} List of entity types
   */
  getEntityTypes() {
    return [
      'users',
      'cases',
      'evidence',
      'evidence_files',
      'exports',
      'custody_events'
    ];
  },

  /**
   * Format action for display
   * @param {string} action - Action code
   * @returns {string} Human readable action
   */
  formatAction(action) {
    const actionLabels = {
      LOGIN: 'Inicio de Sesion',
      LOGOUT: 'Cierre de Sesion',
      REGISTER: 'Registro',
      CASE_CREATE: 'Crear Caso',
      CASE_UPDATE: 'Actualizar Caso',
      CASE_DELETE: 'Eliminar Caso',
      EVIDENCE_UPLOAD: 'Subir Evidencia',
      EVIDENCE_UPDATE: 'Actualizar Evidencia',
      EVIDENCE_DOWNLOAD: 'Descargar Evidencia',
      EVIDENCE_PUBLIC_TOGGLE: 'Cambiar Visibilidad',
      EVIDENCE_REGENERATE: 'Regenerar Derivados',
      EXPORT_CREATE: 'Crear Exportacion',
      EXPORT_DOWNLOAD: 'Descargar Exportacion',
      USER_UPDATE: 'Actualizar Usuario',
      PASSWORD_CHANGE: 'Cambiar Contrasena'
    };
    return actionLabels[action] || action;
  },

  /**
   * Format entity type for display
   * @param {string} entityType - Entity type
   * @returns {string} Human readable entity type
   */
  formatEntityType(entityType) {
    const entityLabels = {
      users: 'Usuarios',
      cases: 'Casos',
      evidence: 'Evidencias',
      evidence_files: 'Archivos',
      exports: 'Exportaciones',
      custody_events: 'Eventos de Custodia'
    };
    return entityLabels[entityType] || entityType;
  }
};

export default auditService;
