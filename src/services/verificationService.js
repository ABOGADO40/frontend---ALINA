import apiClient from './apiClient';

/**
 * Verification Service - Handles public hash verification
 */
const verificationService = {
  /**
   * Verify evidence by SHA-256 hash
   * @param {string} hash - SHA-256 hash (64 hex characters)
   * @returns {Promise<Object>} Verification result
   */
  async verifyByHash(hash) {
    // Validate hash format
    if (!hash || hash.length !== 64 || !/^[a-fA-F0-9]+$/.test(hash)) {
      throw {
        success: false,
        error: {
          code: 'INVALID_HASH',
          message: 'El hash debe ser una cadena hexadecimal de 64 caracteres (SHA-256)'
        }
      };
    }

    const response = await apiClient.get(`/verify/${hash.toLowerCase()}`);
    return response.data;
  },

  /**
   * Validate hash format
   * @param {string} hash - Hash string to validate
   * @returns {boolean} True if valid SHA-256 format
   */
  isValidHashFormat(hash) {
    if (!hash) return false;
    return hash.length === 64 && /^[a-fA-F0-9]+$/.test(hash);
  },

  /**
   * Format verification result for display
   * @param {Object} result - Verification API result
   * @returns {Object} Formatted result for UI
   */
  formatResult(result) {
    if (!result?.data) return null;

    const { found, isPublic, evidence, file, hash, message, contact } = result.data;

    return {
      found,
      isPublic: isPublic || false,
      message: message || '',
      evidence: evidence ? {
        id: evidence.id,
        title: evidence.title,
        sourceType: evidence.sourceType,
        createdAt: evidence.createdAt,
        status: evidence.status
      } : null,
      file: file ? {
        role: file.role,
        mimeType: file.mimeType,
        originalFilename: file.originalFilename,
        sizeBytes: file.sizeBytes
      } : null,
      hash: hash ? {
        algorithm: hash.algorithm,
        value: hash.value,
        registeredAt: hash.registeredAt
      } : null,
      contact: contact ? {
        email: contact.email || null,
        phone: contact.phone || null
      } : null,
      verifiedAt: new Date().toISOString()
    };
  }
};

export default verificationService;
