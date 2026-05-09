import apiClient, { uploadClient } from './apiClient';

/**
 * Evidence Service - Handles evidence operations
 */
const evidenceService = {
  /**
   * Get list of evidence (paginated)
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {number} params.caseId - Filter by case ID
   * @param {string} params.status - Filter by status
   * @param {string} params.sourceType - Filter by source type
   * @param {string} params.search - Search term
   * @returns {Promise<Object>} Paginated evidence list
   */
  async getEvidence(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.caseId) queryParams.append('caseId', params.caseId);
    if (params.status) queryParams.append('status', params.status);
    if (params.sourceType) queryParams.append('sourceType', params.sourceType);
    if (params.search) queryParams.append('search', params.search);

    const response = await apiClient.get(`/evidence?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Get evidence by ID with full details
   * @param {string|number} evidenceId - Evidence ID
   * @returns {Promise<Object>} Evidence data with files, hashes, custody
   */
  async getEvidenceById(evidenceId) {
    const response = await apiClient.get(`/evidence/${evidenceId}`);
    return response.data;
  },

  /**
   * Upload new evidence file
   * @param {File} file - File to upload
   * @param {Object} metadata - Evidence metadata
   * @param {string} metadata.title - Evidence title
   * @param {string} metadata.description - Evidence description
   * @param {number} metadata.caseId - Associated case ID
   * @param {Object} contributorData - Contributor data for Acta (optional)
   * @param {Function} onProgress - Progress callback (percentage)
   * @returns {Promise<Object>} Created evidence data
   */
  async uploadEvidence(file, metadata = {}, contributorData = null, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    if (metadata.title) formData.append('title', metadata.title);
    if (metadata.description) formData.append('description', metadata.description);
    if (metadata.caseId) formData.append('caseId', metadata.caseId);

    // Enviar fecha de modificacion del archivo desde el filesystem del cliente
    // (el navegador NO transmite esto en el body multipart por defecto)
    if (file && typeof file.lastModified === 'number' && !Number.isNaN(file.lastModified)) {
      formData.append('fileLastModified', String(file.lastModified));
      formData.append('fileLastModifiedIso', new Date(file.lastModified).toISOString());
    }

    // Agregar datos del aportante si se proporcionan
    if (contributorData) {
      if (contributorData.actaLugar) formData.append('actaLugar', contributorData.actaLugar);
      if (contributorData.actaEntidadInterviniente) formData.append('actaEntidadInterviniente', contributorData.actaEntidadInterviniente);
      if (contributorData.usuarioEntidad) formData.append('usuarioEntidad', contributorData.usuarioEntidad);
      if (contributorData.aportanteNombreCompleto) formData.append('aportanteNombreCompleto', contributorData.aportanteNombreCompleto);
      if (contributorData.aportanteDocumentoTipo) formData.append('aportanteDocumentoTipo', contributorData.aportanteDocumentoTipo);
      if (contributorData.aportanteDocumentoNumero) formData.append('aportanteDocumentoNumero', contributorData.aportanteDocumentoNumero);
      if (contributorData.aportanteCondicion) formData.append('aportanteCondicion', contributorData.aportanteCondicion);
      if (contributorData.aportanteCondicionOtro) formData.append('aportanteCondicionOtro', contributorData.aportanteCondicionOtro);
      if (contributorData.aportanteDomicilio) formData.append('aportanteDomicilio', contributorData.aportanteDomicilio);
      if (contributorData.aportanteTelefono) formData.append('aportanteTelefono', contributorData.aportanteTelefono);
      if (contributorData.aportanteCorreo) formData.append('aportanteCorreo', contributorData.aportanteCorreo);
      if (contributorData.dispositivoOrigen) formData.append('dispositivoOrigen', contributorData.dispositivoOrigen);
      if (contributorData.fechaObtencionArchivo) formData.append('fechaObtencionArchivo', contributorData.fechaObtencionArchivo);
    }

    const response = await uploadClient.post('/evidence/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentage);
        }
      }
    });

    return response.data;
  },

  /**
   * Update evidence metadata
   * @param {string|number} evidenceId - Evidence ID
   * @param {Object} data - Data to update
   * @returns {Promise<Object>} Updated evidence data
   */
  async updateEvidence(evidenceId, data) {
    const response = await apiClient.put(`/evidence/${evidenceId}`, data);
    return response.data;
  },

  /**
   * Toggle evidence public verification status
   * @param {string|number} evidenceId - Evidence ID
   * @param {Object} contactData - Contact data (required when making private)
   * @param {string} contactData.contactEmail - Contact email
   * @param {string} contactData.contactPhone - Contact phone
   * @returns {Promise<Object>} Updated evidence data
   */
  async togglePublic(evidenceId, contactData = {}) {
    const response = await apiClient.patch(`/evidence/${evidenceId}/toggle-public`, contactData);
    return response.data;
  },

  /**
   * Regenerate evidence derivatives (creates new version)
   * @param {string|number} evidenceId - Evidence ID
   * @returns {Promise<Object>} Regeneration response
   */
  async regenerate(evidenceId) {
    const response = await apiClient.post(`/evidence/${evidenceId}/regenerate`);
    return response.data;
  },

  /**
   * Get evidence pipeline status
   * @param {string|number} evidenceId - Evidence ID
   * @returns {Promise<Object>} Pipeline status
   */
  async getStatus(evidenceId) {
    const response = await apiClient.get(`/evidence/${evidenceId}/status`);
    return response.data;
  },

  /**
   * Download evidence file
   * @param {string|number} evidenceId - Evidence ID
   * @param {string} fileRole - File role (ORIGINAL, BITCOPY, SEALED, CERT_PDF, CERT_JSON)
   * @returns {Promise<Blob>} File blob
   */
  async downloadFile(evidenceId, fileRole) {
    const response = await apiClient.get(`/evidence/${evidenceId}/download/${fileRole}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Get file preview (for images/PDFs)
   * @param {string|number} evidenceId - Evidence ID
   * @param {string} fileRole - File role
   * @returns {Promise<Blob>} Preview blob
   */
  async getFilePreview(evidenceId, fileRole) {
    const response = await apiClient.get(`/evidence/${evidenceId}/preview/${fileRole}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Get download URL for file
   * @param {string|number} evidenceId - Evidence ID
   * @param {string} fileRole - File role (ORIGINAL, BITCOPY, SEALED, CERT_PDF, CERT_JSON)
   * @returns {string} Download URL
   */
  getDownloadUrl(evidenceId, fileRole) {
    const token = localStorage.getItem('token');
    return `${apiClient.defaults.baseURL}/evidence/${evidenceId}/download/${fileRole}?token=${token}`;
  },

  /**
   * Download metadata report as PDF
   * @param {string|number} evidenceId - Evidence ID
   * @returns {Promise<Blob>} PDF blob
   */
  async downloadMetadata(evidenceId) {
    const response = await apiClient.get(`/evidence/${evidenceId}/metadata/export`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Import evidence from Google Drive
   * @param {string[]} fileIds - Google Drive file IDs
   * @param {string} accessToken - Google OAuth access token
   * @param {Object} metadata - Evidence metadata (title, description, caseId)
   * @param {Object} contributorData - Contributor data for Acta
   * @returns {Promise<Object>} Import results
   */
  async importFromDrive(fileIds, accessToken, metadata = {}, contributorData = null) {
    const payload = {
      fileIds,
      accessToken
    };

    if (metadata.title) payload.title = metadata.title;
    if (metadata.description) payload.description = metadata.description;
    if (metadata.caseId) payload.caseId = metadata.caseId;

    // Agregar datos del aportante
    if (contributorData) {
      Object.entries(contributorData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          payload[key] = value;
        }
      });
    }

    const response = await apiClient.post('/evidence/import-drive', payload);
    return response.data;
  }
};

export default evidenceService;
