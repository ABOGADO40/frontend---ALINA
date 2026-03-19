import apiClient from './apiClient';

/**
 * Custody Service - Handles chain of custody operations
 */
const custodyService = {
  /**
   * Get chain of custody for evidence
   * @param {string|number} evidenceId - Evidence ID
   * @returns {Promise<Object>} Custody chain data
   */
  async getChain(evidenceId) {
    const response = await apiClient.get(`/custody/evidence/${evidenceId}`);
    return response.data;
  },

  /**
   * Export custody chain as file
   * @param {string|number} evidenceId - Evidence ID
   * @param {string} format - Export format ('json' or 'pdf')
   * @returns {Promise<Blob>} File blob
   */
  async exportChain(evidenceId, format = 'json') {
    const response = await apiClient.get(
      `/custody/evidence/${evidenceId}/export?format=${format}`,
      {
        responseType: 'blob',
        timeout: 60000 // 1 minute
      }
    );
    return response.data;
  },

  /**
   * Get download URL for custody export (formato TXT)
   * @param {string|number} evidenceId - Evidence ID
   * @param {string} format - Export format (txt o pdf)
   * @returns {string} Download URL
   */
  getExportUrl(evidenceId, format = 'txt') {
    const token = localStorage.getItem('token');
    return `${apiClient.defaults.baseURL}/custody/evidence/${evidenceId}/export?format=${format}&token=${token}`;
  },

  /**
   * Verify chain integrity
   * @param {Object} chainData - Custody chain data
   * @returns {Object} Integrity verification result
   */
  verifyIntegrity(chainData) {
    if (!chainData?.events || chainData.events.length === 0) {
      return {
        isValid: true,
        message: 'Sin eventos de custodia'
      };
    }

    // Check if chain integrity flag is already computed by backend
    if (chainData.chainIntegrity !== undefined) {
      return {
        isValid: chainData.chainIntegrity,
        message: chainData.chainIntegrity
          ? 'Cadena de custodia integra'
          : 'Se detectaron inconsistencias en la cadena de custodia'
      };
    }

    // Basic client-side validation (hash chain continuity)
    const events = chainData.events;
    let isValid = true;

    for (let i = 1; i < events.length; i++) {
      const currentEvent = events[i];
      const previousEvent = events[i - 1];

      if (currentEvent.prevEventHash !== previousEvent.eventHash) {
        isValid = false;
        break;
      }
    }

    return {
      isValid,
      message: isValid
        ? 'Cadena de custodia integra'
        : 'Se detectaron inconsistencias en la cadena de custodia',
      eventCount: events.length
    };
  },

  /**
   * Format custody event for display
   * @param {Object} event - Custody event
   * @returns {Object} Formatted event
   */
  formatEvent(event) {
    const eventTypeLabels = {
      UPLOAD: 'Archivo Subido',
      SCAN_OK: 'Escaneo Exitoso',
      SCAN_FAILED: 'Escaneo Fallido',
      HASH_COMPUTED: 'Hash Calculado',
      BITCOPY_CREATED: 'Copia Bit-a-Bit Creada',
      SEAL_CREATED: 'Documento Sellado y Certificados',
      CRYPTO_SEAL_CREATED: 'Sello Criptografico (Ed25519)',
      METADATA_CREATED: 'Metadata Extraida',
      RISK_REPORT_CREATED: 'Reporte de Riesgo Generado',
      READY_FOR_EXPORT: 'Listo para Exportar',
      EXPORT_CREATED: 'Exportacion Creada',
      DOWNLOAD: 'Archivo Descargado',
      PUBLIC_VERIFY: 'Verificacion Publica',
      REGENERATE_VERSION: 'Version Regenerada',
      ERROR: 'Error'
    };

    const eventTypeDescriptions = {
      UPLOAD: 'Se recibio el archivo original y se registro su ingreso al sistema',
      SCAN_OK: 'Se verifico que el archivo no contiene malware ni amenazas conocidas',
      SCAN_FAILED: 'El escaneo detecto posibles amenazas en el archivo',
      HASH_COMPUTED: 'Se calculo la huella digital unica (SHA-256) del archivo para garantizar su integridad',
      BITCOPY_CREATED: 'Se genero una copia forense identica bit a bit del archivo original, con storageObjectId independiente',
      SEAL_CREATED: 'Se genero el documento sellado y los certificados PDF/JSON que acreditan la evidencia',
      CRYPTO_SEAL_CREATED: 'Se firmo digitalmente (Ed25519) un manifest completo que certifica todos los hashes de la evidencia',
      METADATA_CREATED: 'Se extrajeron y registraron los metadatos internos del archivo',
      RISK_REPORT_CREATED: 'Se genero un reporte automatico de indicios y riesgos detectados',
      READY_FOR_EXPORT: 'La evidencia fue procesada completamente y esta lista para su exportacion',
      EXPORT_CREATED: 'Se genero un paquete exportable con toda la documentacion de la evidencia',
      DOWNLOAD: 'Un usuario descargo el archivo desde el sistema',
      PUBLIC_VERIFY: 'Se realizo una verificacion publica de la integridad de la evidencia',
      REGENERATE_VERSION: 'Se regenero una nueva version del archivo procesado',
      ERROR: 'Ocurrio un error durante el procesamiento'
    };

    const actorTypeLabels = {
      USER: 'Usuario',
      SYSTEM: 'Sistema',
      PUBLIC: 'Publico'
    };

    const label = eventTypeLabels[event.eventType] || event.eventType;
    const description = eventTypeDescriptions[event.eventType] || '';

    return {
      ...event,
      eventTypeLabel: label,
      eventTypeDescription: description,
      actorTypeLabel: actorTypeLabels[event.actorType] || event.actorType,
      actorName: event.actor?.fullName || (event.actorType === 'SYSTEM' ? 'Sistema' : 'Anonimo'),
      sequence: event.sequence || null,
      eventUuid: event.eventUuid || null,
      hashAlgorithm: event.eventHashAlgorithm || 'LEGACY',
      canonicalization: event.eventCanonicalization || 'LEGACY',
      isCryptographicSeal: event.eventType === 'CRYPTO_SEAL_CREATED'
    };
  }
};

export default custodyService;
