// ============================================================================
// API Base URL - CONFIGURACION HIBRIDA LOCAL / RAILWAY
// ============================================================================
// [LOCAL]   VITE_API_URL = "/api" (definido en frontend/.env)
//           El proxy de Vite (vite.config.js) redirige /api/* a localhost:3000
//           Ejemplo: fetch("/api/auth/login") -> http://localhost:3000/api/auth/login
//
// [RAILWAY] VITE_API_URL = URL completa del backend desplegado
//           (configurado en las variables de entorno de Railway)
//           Ejemplo: "https://backend-production-xxxx.up.railway.app/api"
//
// Si no hay variable definida, usa "/api" por defecto (modo LOCAL)
// ============================================================================
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Evidence Status
export const EVIDENCE_STATUS = {
  RECEIVED: 'RECEIVED',
  SCANNED_OK: 'SCANNED_OK',
  HASHED: 'HASHED',
  CLONED_BITCOPY: 'CLONED_BITCOPY',
  SEALED: 'SEALED',
  ANALYZED: 'ANALYZED',
  READY_FOR_EXPORT: 'READY_FOR_EXPORT',
  EXPORTED: 'EXPORTED',
  ERROR: 'ERROR'
};

// Evidence Status Labels
export const EVIDENCE_STATUS_LABELS = {
  RECEIVED: 'Recibido',
  SCANNED_OK: 'Escaneado',
  HASHED: 'Hash Calculado',
  CLONED_BITCOPY: 'Copia Bit-a-Bit',
  SEALED: 'Sellado',
  ANALYZED: 'Analizado',
  READY_FOR_EXPORT: 'Listo para Exportar',
  EXPORTED: 'Exportado',
  ERROR: 'Error'
};

// Evidence Status Colors (Dark Forensic Theme)
export const EVIDENCE_STATUS_COLORS = {
  RECEIVED: 'bg-alina-50 text-alina-700 border border-alina-200',
  SCANNED_OK: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
  HASHED: 'bg-alina-50 text-alina-700 border border-alina-200',
  CLONED_BITCOPY: 'bg-success-50 text-success-700 border border-success-200',
  SEALED: 'bg-accent-50 text-accent-700 border border-accent-200',
  ANALYZED: 'bg-accent-50 text-accent-700 border border-accent-200',
  READY_FOR_EXPORT: 'bg-success-50 text-success-700 border border-success-200',
  EXPORTED: 'bg-alina-50 text-alina-700 border border-alina-200',
  ERROR: 'bg-danger-50 text-danger-700 border border-danger-200'
};

// Status Icon Colors (for decorative purposes)
export const EVIDENCE_STATUS_ICON_COLORS = {
  RECEIVED: 'text-alina-600',
  SCANNED_OK: 'text-cyan-600',
  HASHED: 'text-alina-600',
  CLONED_BITCOPY: 'text-success-600',
  SEALED: 'text-accent-600',
  ANALYZED: 'text-accent-600',
  READY_FOR_EXPORT: 'text-success-600',
  EXPORTED: 'text-alina-600',
  ERROR: 'text-danger-600'
};

// Status Gradients (for cards and headers)
export const EVIDENCE_STATUS_GRADIENTS = {
  RECEIVED: 'from-alina-50/60 to-cyan-50/40',
  SCANNED_OK: 'from-cyan-50/60 to-alina-50/40',
  HASHED: 'from-alina-50/60 to-success-50/40',
  CLONED_BITCOPY: 'from-success-50/60 to-success-50/40',
  SEALED: 'from-accent-50/60 to-accent-50/40',
  ANALYZED: 'from-accent-50/60 to-accent-50/40',
  READY_FOR_EXPORT: 'from-success-50/60 to-alina-50/40',
  EXPORTED: 'from-alina-50/60 to-alina-50/40',
  ERROR: 'from-danger-50/60 to-danger-50/40'
};

// Source Types
export const SOURCE_TYPES = {
  PDF: 'PDF',
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
  CHAT: 'CHAT',
  ZIP: 'ZIP',
  OTHER: 'OTHER'
};

// Source Type Labels
export const SOURCE_TYPE_LABELS = {
  PDF: 'PDF',
  IMAGE: 'Imagen',
  VIDEO: 'Video',
  AUDIO: 'Audio',
  CHAT: 'Chat',
  ZIP: 'ZIP',
  OTHER: 'Otro'
};

// Source Type Colors (Dark Forensic Theme)
export const SOURCE_TYPE_COLORS = {
  PDF: 'bg-danger-50 text-danger-700 border border-danger-200',
  IMAGE: 'bg-success-50 text-success-700 border border-success-200',
  VIDEO: 'bg-accent-50 text-accent-700 border border-accent-200',
  AUDIO: 'bg-accent-50 text-accent-700 border border-accent-200',
  CHAT: 'bg-alina-50 text-alina-700 border border-alina-200',
  ZIP: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
  OTHER: 'bg-surface-600/30 text-surface-300 border border-surface-600/50'
};

// File Roles
export const FILE_ROLES = {
  ORIGINAL: 'ORIGINAL',
  BITCOPY: 'BITCOPY',
  WORKING_COPY: 'WORKING_COPY',
  SEALED: 'SEALED',
  CERT_PDF: 'CERT_PDF',
  CERT_TXT: 'CERT_TXT',
  METADATA_REPORT: 'METADATA_REPORT',
  RISK_REPORT: 'RISK_REPORT',
  EXPORT_ZIP: 'EXPORT_ZIP',
  EVENTLOG: 'EVENTLOG'
};

// File Role Labels
export const FILE_ROLE_LABELS = {
  ORIGINAL: 'Archivo Original',
  BITCOPY: 'Copia Bit-a-Bit',
  WORKING_COPY: 'Copia de Trabajo',
  SEALED: 'Archivo Sellado',
  CERT_PDF: 'Certificado PDF',
  CERT_TXT: 'Certificado TXT',
  CERT_JSON: 'Certificado TXT',  // Compatibilidad con datos legacy
  METADATA_REPORT: 'Reporte de Metadata',
  RISK_REPORT: 'Reporte de Riesgo',
  EXPORT_ZIP: 'Exportacion ZIP',
  EVENTLOG: 'Registro de Eventos'
};

// File Role Colors (Dark Forensic Theme)
export const FILE_ROLE_COLORS = {
  ORIGINAL: 'bg-alina-50 text-alina-700',
  BITCOPY: 'bg-cyan-50 text-cyan-700',
  WORKING_COPY: 'bg-cyan-50 text-cyan-700',
  SEALED: 'bg-accent-50 text-accent-700',
  CERT_PDF: 'bg-danger-50 text-danger-700',
  CERT_TXT: 'bg-accent-50 text-accent-700',
  CERT_JSON: 'bg-accent-50 text-accent-700',  // Compatibilidad con datos legacy
  METADATA_REPORT: 'bg-success-50 text-success-700',
  RISK_REPORT: 'bg-danger-50 text-danger-700',
  EXPORT_ZIP: 'bg-alina-50 text-alina-700',
  EVENTLOG: 'bg-cyan-50 text-cyan-700'
};

// Export Scopes
export const EXPORT_SCOPES = {
  SINGLE_EVIDENCE: 'SINGLE_EVIDENCE',
  CASE: 'CASE'
};

// Export Status
export const EXPORT_STATUS = {
  CREATING: 'CREATING',
  READY: 'READY',
  ERROR: 'ERROR'
};

// Export Status Labels
export const EXPORT_STATUS_LABELS = {
  CREATING: 'Creando',
  READY: 'Listo',
  ERROR: 'Error'
};

// Export Status Colors (Dark Forensic Theme)
export const EXPORT_STATUS_COLORS = {
  CREATING: 'bg-accent-50 text-accent-700 border border-accent-200',
  READY: 'bg-success-50 text-success-700 border border-success-200',
  ERROR: 'bg-danger-50 text-danger-700 border border-danger-200'
};

// Custody Event Types
export const CUSTODY_EVENT_TYPES = {
  UPLOAD: 'UPLOAD',
  SCAN_OK: 'SCAN_OK',
  SCAN_FAILED: 'SCAN_FAILED',
  HASH_COMPUTED: 'HASH_COMPUTED',
  BITCOPY_CREATED: 'BITCOPY_CREATED',
  SEAL_CREATED: 'SEAL_CREATED',
  CRYPTO_SEAL_CREATED: 'CRYPTO_SEAL_CREATED',
  METADATA_CREATED: 'METADATA_CREATED',
  RISK_REPORT_CREATED: 'RISK_REPORT_CREATED',
  READY_FOR_EXPORT: 'READY_FOR_EXPORT',
  EXPORT_CREATED: 'EXPORT_CREATED',
  DOWNLOAD: 'DOWNLOAD',
  PUBLIC_VERIFY: 'PUBLIC_VERIFY',
  REGENERATE_VERSION: 'REGENERATE_VERSION',
  ERROR: 'ERROR'
};

// Custody Event Labels
export const CUSTODY_EVENT_LABELS = {
  UPLOAD: 'Archivo Subido',
  SCAN_OK: 'Escaneo Exitoso',
  SCAN_FAILED: 'Escaneo Fallido',
  HASH_COMPUTED: 'Hash Calculado',
  BITCOPY_CREATED: 'Copia Bit-a-Bit Creada',
  SEAL_CREATED: 'Documento Sellado y Certificados',
  CRYPTO_SEAL_CREATED: 'Sello Criptografico (Ed25519)',
  METADATA_CREATED: 'Metadata Extraida',
  RISK_REPORT_CREATED: 'Reporte de Riesgo Creado',
  READY_FOR_EXPORT: 'Listo para Exportar',
  EXPORT_CREATED: 'Exportacion Creada',
  DOWNLOAD: 'Archivo Descargado',
  PUBLIC_VERIFY: 'Verificacion Publica',
  REGENERATE_VERSION: 'Version Regenerada',
  ERROR: 'Error'
};

// Custody Event Colors (Dark Forensic Theme)
export const CUSTODY_EVENT_COLORS = {
  UPLOAD: 'bg-alina-50 text-alina-700',
  SCAN_OK: 'bg-success-50 text-success-700',
  SCAN_FAILED: 'bg-danger-50 text-danger-700',
  HASH_COMPUTED: 'bg-cyan-50 text-cyan-700',
  BITCOPY_CREATED: 'bg-success-50 text-success-700',
  SEAL_CREATED: 'bg-accent-50 text-accent-700',
  CRYPTO_SEAL_CREATED: 'bg-alina-50 text-alina-700',
  METADATA_CREATED: 'bg-cyan-50 text-cyan-700',
  RISK_REPORT_CREATED: 'bg-accent-50 text-accent-700',
  READY_FOR_EXPORT: 'bg-success-50 text-success-700',
  EXPORT_CREATED: 'bg-alina-50 text-alina-700',
  DOWNLOAD: 'bg-cyan-50 text-cyan-700',
  PUBLIC_VERIFY: 'bg-accent-50 text-accent-700',
  REGENERATE_VERSION: 'bg-cyan-50 text-cyan-700',
  ERROR: 'bg-danger-50 text-danger-700'
};

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  CLIENT: 'CLIENT'
};

// Max file size (2GB in bytes)
export const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
