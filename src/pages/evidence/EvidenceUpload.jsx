import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  FolderOpen,
  FileSignature,
  User,
  MapPin,
  Building,
  FileText,
  Calendar,
  Phone,
  Mail,
  Home,
  HardDrive,
  ImagePlus,
  X,
  AlertTriangle,
  WifiOff,
  ServerCrash
} from 'lucide-react';
import { Button, Input, Alert, FileUpload } from '../../components/common';
import caseService from '../../services/caseService';
import evidenceService from '../../services/evidenceService';
import { formatFileSize } from '../../utils/formatters';
import { MAX_FILE_SIZE } from '../../utils/constants';
import toast from 'react-hot-toast';
import GoogleDrivePicker from '../../components/evidence/GoogleDrivePicker';
import GooglePhotosPicker from '../../components/evidence/GooglePhotosPicker';

/**
 * EvidenceUpload Page
 * Upload new evidence with optional case association
 */
const EvidenceUpload = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCaseId = searchParams.get('caseId');

  const [cases, setCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    caseId: preselectedCaseId || ''
  });

  // Estado para datos del aportante (Acta) - OBLIGATORIO
  const [contributorData, setContributorData] = useState({
    actaLugar: '',
    actaEntidadInterviniente: '',
    usuarioEntidad: '',
    aportanteNombreCompleto: '',
    aportanteDocumentoTipo: 'DNI',
    aportanteDocumentoNumero: '',
    aportanteCondicion: 'TESTIGO',
    aportanteCondicionOtro: '',
    aportanteDomicilio: '',
    aportanteTelefono: '',
    aportanteCorreo: '',
    dispositivoOrigen: '',
    fechaObtencionArchivo: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [errorModal, setErrorModal] = useState(null); // { title, message, type, technicalDetails }

  // Google Drive state
  const [sourceMode, setSourceMode] = useState('local'); // 'local' | 'drive' | 'photos'
  const [driveFiles, setDriveFiles] = useState([]);
  const [driveAccessToken, setDriveAccessToken] = useState(null);

  // Google Photos state
  const [photosItems, setPhotosItems] = useState([]);
  const [photosSessionId, setPhotosSessionId] = useState(null);
  const [photosAccessToken, setPhotosAccessToken] = useState(null);

  useEffect(() => {
    fetchCases();
  }, []);

  // Bloquear cierre/recarga de pestaña mientras se sube archivo + bloquear scroll del body
  useEffect(() => {
    if (!uploading) return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      // Chrome requiere returnValue (string ignorado por navegadores modernos)
      e.returnValue = 'La carga de la evidencia esta en curso. Si sale ahora, la subida se cancelara y debera iniciarla nuevamente.';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Bloquear scroll del body mientras el modal esta visible
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.body.style.overflow = previousOverflow;
    };
  }, [uploading]);

  const fetchCases = async () => {
    setLoadingCases(true);
    try {
      const response = await caseService.getCases({ limit: 100 });
      // Backend devuelve { success, data: { cases: [...], pagination } }
      const casesArray = response?.data?.cases || response?.cases || [];
      setCases(casesArray);
    } catch (err) {
      console.error('Error loading cases:', err);
    } finally {
      setLoadingCases(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContributorChange = (e) => {
    const { name, value } = e.target;
    setContributorData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    // Auto-fill title from filename if empty
    if (!formData.title && file) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setFormData((prev) => ({ ...prev, title: nameWithoutExt }));
    }
  };

  const handleDriveFilesSelected = ({ files, accessToken }) => {
    setDriveFiles(files);
    setDriveAccessToken(accessToken);
    // Auto-fill title from first file if empty
    if (!formData.title && files.length === 1) {
      const nameWithoutExt = files[0].name.replace(/\.[^/.]+$/, '');
      setFormData((prev) => ({ ...prev, title: nameWithoutExt }));
    }
  };

  const removeDriveFile = (fileId) => {
    setDriveFiles((prev) => prev.filter(f => f.id !== fileId));
  };

  const handlePhotosSelected = ({ mediaItems, sessionId, accessToken }) => {
    setPhotosItems(mediaItems);
    setPhotosSessionId(sessionId);
    setPhotosAccessToken(accessToken);
    if (!formData.title && mediaItems.length === 1) {
      const nameWithoutExt = (mediaItems[0].filename || '').replace(/\.[^/.]+$/, '');
      setFormData((prev) => ({ ...prev, title: nameWithoutExt }));
    }
  };

  const removePhotosItem = (itemId) => {
    setPhotosItems((prev) => prev.filter(it => it.id !== itemId));
  };

  // Validar datos del aportante (OBLIGATORIO)
  const validateContributorData = () => {
    const { actaLugar, actaEntidadInterviniente, aportanteNombreCompleto,
            aportanteDocumentoNumero, aportanteCondicion, aportanteCondicionOtro } = contributorData;

    // Verificar campos requeridos
    if (!actaLugar.trim()) {
      return { valid: false, error: 'El lugar del acta es requerido' };
    }
    if (!actaEntidadInterviniente.trim()) {
      return { valid: false, error: 'La entidad interviniente es requerida' };
    }
    if (!aportanteNombreCompleto.trim()) {
      return { valid: false, error: 'El nombre del aportante es requerido' };
    }
    if (!aportanteDocumentoNumero.trim()) {
      return { valid: false, error: 'El numero de documento del aportante es requerido' };
    }
    if (aportanteCondicion === 'OTRO' && !aportanteCondicionOtro.trim()) {
      return { valid: false, error: 'Especifique la condicion del aportante' };
    }

    // Validar email si se proporciona
    if (contributorData.aportanteCorreo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contributorData.aportanteCorreo)) {
      return { valid: false, error: 'El correo electronico del aportante es invalido' };
    }

    // Limpiar datos vacios
    const cleanData = {};
    Object.entries(contributorData).forEach(([key, value]) => {
      if (value && value.trim && value.trim()) {
        cleanData[key] = value.trim();
      } else if (value && !value.trim) {
        cleanData[key] = value;
      }
    });

    return { valid: true, data: cleanData };
  };

  // Analiza un error de upload y devuelve { title, message, type, technicalDetails }
  // que se renderizara en el modal de error
  const classifyUploadError = (err) => {
    // 1. Error de validacion del servidor con details (campo:mensaje)
    const errorData = err?.response?.data?.error || err?.error;
    const httpStatus = err?.response?.status || err?.status;
    const technicalDetails = err?.message || err?.response?.statusText || '';

    // 2. Error de red (sin response): CORS, server down, timeout, sin internet
    if (!err?.response && (err?.code === 'ERR_NETWORK' || /network\s*error/i.test(err?.message || ''))) {
      return {
        title: 'Sin conexion con el servidor',
        message: 'No se pudo establecer comunicacion con el servidor. Esto puede deberse a: (1) tu conexion a internet, (2) el servidor esta temporalmente fuera de servicio, o (3) el archivo es demasiado grande y la conexion se interrumpio.',
        type: 'network',
        technicalDetails: `${err?.code || 'Network Error'}: ${technicalDetails}`,
        canRetry: true
      };
    }

    // 3. Timeout
    if (err?.code === 'ECONNABORTED' || /timeout/i.test(err?.message || '')) {
      return {
        title: 'Tiempo de espera agotado',
        message: 'La subida tomo demasiado tiempo. Para archivos grandes, intenta con una conexion mas estable o sube el archivo por partes.',
        type: 'timeout',
        technicalDetails,
        canRetry: true
      };
    }

    // 4. Errores HTTP con codigo
    if (httpStatus === 502 || httpStatus === 503 || httpStatus === 504) {
      return {
        title: 'Servidor no disponible',
        message: `El servidor no esta respondiendo correctamente (codigo ${httpStatus}). Probablemente esta reiniciandose o saturado. Por favor, intenta nuevamente en unos minutos.`,
        type: 'server',
        technicalDetails: `HTTP ${httpStatus} ${err?.response?.statusText || ''}`,
        canRetry: true
      };
    }
    if (httpStatus === 413) {
      return {
        title: 'Archivo demasiado grande',
        message: 'El archivo excede el tamano maximo permitido (2 GB). Por favor, comprime el archivo o suba uno mas pequeno.',
        type: 'size',
        technicalDetails: `HTTP 413 Payload Too Large`,
        canRetry: false
      };
    }
    if (httpStatus === 401 || httpStatus === 403) {
      return {
        title: 'Sesion expirada o sin permisos',
        message: 'Tu sesion pudo haber expirado. Por favor, cierra sesion y vuelve a ingresar.',
        type: 'auth',
        technicalDetails: `HTTP ${httpStatus}`,
        canRetry: false
      };
    }
    if (httpStatus === 422) {
      // Errores de validacion
      let msg = errorData?.message || 'Datos invalidos.';
      if (errorData?.details?.length > 0) {
        const fields = errorData.details.map(d => `${d.field}: ${d.message}`).join(', ');
        msg += ` Campos: ${fields}.`;
      }
      return {
        title: 'Datos invalidos',
        message: msg,
        type: 'validation',
        technicalDetails: `HTTP 422`,
        canRetry: false
      };
    }
    if (httpStatus === 409) {
      return {
        title: 'Conflicto en la carga',
        message: errorData?.message || 'Hubo un conflicto al subir el archivo. Es posible que ya exista o este siendo procesado.',
        type: 'conflict',
        technicalDetails: `HTTP 409 ${errorData?.code || ''}`,
        canRetry: false
      };
    }
    if (httpStatus >= 500) {
      return {
        title: 'Error del servidor',
        message: errorData?.message || `El servidor encontro un error al procesar tu carga (codigo ${httpStatus}).`,
        type: 'server',
        technicalDetails: `HTTP ${httpStatus} ${errorData?.details || ''}`,
        canRetry: true
      };
    }

    // 5. Default: error del backend o desconocido
    return {
      title: 'Error al subir la evidencia',
      message: errorData?.message || err?.message || 'Ocurrio un error inesperado al subir la evidencia.',
      type: 'unknown',
      technicalDetails: httpStatus ? `HTTP ${httpStatus}` : technicalDetails,
      canRetry: true
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que hay archivo(s)
    if (sourceMode === 'local' && !selectedFile) {
      setError('Selecciona un archivo para subir');
      return;
    }
    if (sourceMode === 'drive' && driveFiles.length === 0) {
      setError('Selecciona al menos un archivo de Google Drive');
      return;
    }
    if (sourceMode === 'photos' && photosItems.length === 0) {
      setError('Selecciona al menos una foto/video de Google Photos');
      return;
    }

    // Validar datos del aportante
    const contributorValidation = validateContributorData();
    if (!contributorValidation.valid) {
      setError(contributorValidation.error);
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      if (sourceMode === 'drive') {
        // Importar desde Google Drive
        const response = await evidenceService.importFromDrive(
          driveFiles.map(f => f.id),
          driveAccessToken,
          {
            title: formData.title.trim() || null,
            description: formData.description.trim() || null,
            caseId: formData.caseId || null
          },
          contributorValidation.data
        );

        const { results, summary } = response.data;
        const firstSuccess = results.find(r => r.success);

        if (summary.failed > 0) {
          const failedNames = results.filter(r => !r.success).map(r => r.fileName || r.fileId).join(', ');
          toast.error(`${summary.failed} archivo(s) con errores: ${failedNames}`);
        }

        if (firstSuccess) {
          toast.success(
            `${summary.success} evidencia(s) importada(s) exitosamente desde Google Drive`
          );
          navigate(`/evidence/${firstSuccess.evidenceId}`);
        } else {
          setError('Ningun archivo pudo ser importado. Revise los errores.');
        }
      } else if (sourceMode === 'photos') {
        // Importar desde Google Photos
        const response = await evidenceService.importFromPhotos(
          photosItems,
          photosSessionId,
          photosAccessToken,
          {
            title: formData.title.trim() || null,
            description: formData.description.trim() || null,
            caseId: formData.caseId || null
          },
          contributorValidation.data
        );

        const { results, summary } = response.data;
        const firstSuccess = results.find(r => r.success);

        if (summary.failed > 0) {
          const failedNames = results
            .filter(r => !r.success)
            .map(r => r.fileName || r.mediaItemId)
            .join(', ');
          toast.error(`${summary.failed} archivo(s) con errores: ${failedNames}`);
        }

        if (firstSuccess) {
          toast.success(
            `${summary.success} evidencia(s) importada(s) exitosamente desde Google Photos`
          );
          navigate(`/evidence/${firstSuccess.evidenceId}`);
        } else {
          setError('Ninguna foto pudo ser importada. Revise los errores.');
        }
      } else {
        // Upload local (flujo existente sin cambios)
        const response = await evidenceService.uploadEvidence(
          selectedFile,
          {
            title: formData.title.trim() || null,
            description: formData.description.trim() || null,
            caseId: formData.caseId || null
          },
          contributorValidation.data,
          (progress) => {
            setUploadProgress(progress);
          }
        );

        // Si el backend detecto una carga duplicada (idempotencia por hash), informarlo
        if (response.data.isDuplicate) {
          toast.success(response.data.message || 'Esta evidencia ya existia. Se muestra la existente.', { duration: 7000 });
        } else {
          toast.success(`Evidencia subida y Acta ${response.data.acta?.actaNumero || ''} generada exitosamente.`);
        }
        navigate(`/evidence/${response.data.id}`);
      }
    } catch (err) {
      // Caso especial import-drive/import-photos: el backend responde 422 con
      // results por archivo cuando todos los archivos fallaron (token expirado,
      // integridad, sesion expirada, etc.). Soportamos ambos formatos de id.
      const remoteResults = err?.data?.data?.results || err?.response?.data?.data?.results;
      if (Array.isArray(remoteResults) && remoteResults.length > 0) {
        const failed = remoteResults.filter(r => !r.success);
        if (failed.length > 0) {
          const detalles = failed
            .map(r => `${r.fileName || r.fileId || r.mediaItemId || 'item'}: ${r.error || 'Error desconocido'}`)
            .join(' | ');
          const sourceLabel = sourceMode === 'photos' ? 'Google Photos' : 'Google Drive';
          setErrorModal({
            title: `No se pudo importar desde ${sourceLabel}`,
            message: detalles,
            type: sourceMode === 'photos' ? 'photos' : 'drive',
            technicalDetails: '',
            canRetry: true
          });
          return;
        }
      }

      // Clasificar y mostrar el error en el modal popup
      const classified = classifyUploadError(err);
      setErrorModal(classified);
      // Mantener tambien el Alert inline por compatibilidad
      setError(classified.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/evidence">
          <Button variant="ghost" size="sm" icon={ArrowLeft}>
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Subir Evidencia</h1>
          <p className="text-surface-300 mt-1">
            Sube un archivo para incorporarlo al sistema de prueba digital
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert
          type="error"
          message={error}
          dismissible
          onDismiss={() => setError(null)}
        />
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <div className="bg-white/90 rounded-2xl border border-surface-700/35 p-6">
          <h2 className="text-lg font-semibold text-surface-50 mb-4">Archivo</h2>

          {/* Source mode toggle */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => {
                setSourceMode('local');
                setDriveFiles([]);
                setDriveAccessToken(null);
                setPhotosItems([]);
                setPhotosSessionId(null);
                setPhotosAccessToken(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                sourceMode === 'local'
                  ? 'bg-alina-50 text-alina-700 border-2 border-alina-500'
                  : 'bg-surface-900/30 text-surface-400 border-2 border-transparent hover:border-surface-700'
              }`}
              disabled={uploading}
            >
              <Upload className="w-4 h-4" />
              Archivo Local
            </button>
            <button
              type="button"
              onClick={() => {
                setSourceMode('drive');
                setSelectedFile(null);
                setPhotosItems([]);
                setPhotosSessionId(null);
                setPhotosAccessToken(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                sourceMode === 'drive'
                  ? 'bg-alina-50 text-alina-700 border-2 border-alina-500'
                  : 'bg-surface-900/30 text-surface-400 border-2 border-transparent hover:border-surface-700'
              }`}
              disabled={uploading}
            >
              <HardDrive className="w-4 h-4" />
              Google Drive
            </button>
            <button
              type="button"
              onClick={() => {
                setSourceMode('photos');
                setSelectedFile(null);
                setDriveFiles([]);
                setDriveAccessToken(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                sourceMode === 'photos'
                  ? 'bg-alina-50 text-alina-700 border-2 border-alina-500'
                  : 'bg-surface-900/30 text-surface-400 border-2 border-transparent hover:border-surface-700'
              }`}
              disabled={uploading}
            >
              <ImagePlus className="w-4 h-4" />
              Google Photos
            </button>
          </div>

          {/* Local file upload */}
          {sourceMode === 'local' && (
            <>
              <FileUpload
                onFileSelect={handleFileSelect}
                accept="*"
                maxSize={MAX_FILE_SIZE}
                disabled={uploading}
              />

              {selectedFile && !uploading && (
                <div className="mt-4 p-4 bg-surface-900/40 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-alina-50 rounded-lg flex items-center justify-center">
                      <Upload className="w-5 h-5 text-alina-600" />
                    </div>
                    <div>
                      <p className="font-medium text-surface-50">{selectedFile.name}</p>
                      <p className="text-sm text-surface-400">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Google Drive picker */}
          {sourceMode === 'drive' && (
            <>
              <GoogleDrivePicker
                onFilesSelected={handleDriveFilesSelected}
                disabled={uploading}
              />

              {driveFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-surface-300">
                    {driveFiles.length} archivo(s) seleccionado(s)
                  </p>
                  {driveFiles.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 p-3 bg-surface-900/40 rounded-lg">
                      <div className="w-8 h-8 bg-alina-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <HardDrive className="w-4 h-4 text-alina-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-surface-50 truncate">{file.name}</p>
                        <p className="text-xs text-surface-400">{file.sizeBytes ? formatFileSize(file.sizeBytes) : 'Tamano desconocido'}</p>
                      </div>
                      {!uploading && (
                        <button
                          type="button"
                          onClick={() => removeDriveFile(file.id)}
                          className="p-1 text-surface-400 hover:text-danger-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Google Photos picker */}
          {sourceMode === 'photos' && (
            <>
              <GooglePhotosPicker
                onMediaItemsSelected={handlePhotosSelected}
                disabled={uploading}
              />

              {photosItems.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-surface-300">
                    {photosItems.length} elemento(s) seleccionado(s)
                  </p>
                  {photosItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-surface-900/40 rounded-lg">
                      <div className="w-8 h-8 bg-alina-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ImagePlus className="w-4 h-4 text-alina-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-surface-50 truncate">{item.filename}</p>
                        <p className="text-xs text-surface-400">{item.type || 'Media'} {item.mimeType ? `- ${item.mimeType}` : ''}</p>
                      </div>
                      {!uploading && (
                        <button
                          type="button"
                          onClick={() => removePhotosItem(item.id)}
                          className="p-1 text-surface-400 hover:text-danger-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-900">
                      <strong>Nota forense:</strong> Google Photos no expone hashes de origen.
                      La verificacion de integridad sera unicamente local (SHA-256 calculado durante la descarga),
                      a diferencia de Google Drive.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Metadata */}
        <div className="bg-white/90 rounded-2xl border border-surface-700/35 p-6">
          <h2 className="text-lg font-semibold text-surface-50 mb-4">Informacion</h2>

          <div className="space-y-4">
            <Input
              label="Titulo"
              name="title"
              placeholder="Nombre descriptivo de la evidencia"
              value={formData.title}
              onChange={handleChange}
              helperText="Opcional - Se usara el nombre del archivo si no se proporciona"
              disabled={uploading}
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-300">
                Descripcion <span className="text-surface-500">(opcional)</span>
              </label>
              <textarea
                name="description"
                placeholder="Describe el contenido o contexto de la evidencia..."
                value={formData.description}
                onChange={handleChange}
                disabled={uploading}
                rows={3}
                className="block w-full rounded-xl border border-surface-700 bg-white px-4 py-2.5 text-surface-200 placeholder-surface-500 focus:border-alina-500 focus:ring-2 focus:ring-alina-500/20 transition-colors duration-200 disabled:bg-surface-900/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-300">
                Asociar a Caso <span className="text-surface-500">(opcional)</span>
              </label>
              <div className="relative">
                <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                <select
                  name="caseId"
                  value={formData.caseId}
                  onChange={handleChange}
                  disabled={uploading || loadingCases}
                  className="block w-full rounded-xl border border-surface-700 bg-white pl-11 pr-4 py-2.5 text-surface-200 focus:border-alina-500 focus:ring-2 focus:ring-alina-500/20 transition-colors duration-200 disabled:bg-surface-900/40 appearance-none"
                >
                  <option value="">Sin asociar a caso</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-surface-400">
                Puedes asociar esta evidencia a un caso existente o dejarla suelta
              </p>
            </div>
          </div>
        </div>

        {/* Seccion Aportante - Acta (OBLIGATORIO) */}
        <div className="bg-white/90 rounded-2xl border border-surface-700/35 overflow-hidden">
          <div className="p-6 border-b border-surface-700/25">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-50 rounded-lg flex items-center justify-center">
                <FileSignature className="w-5 h-5 text-accent-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-surface-50">
                  Datos del Aportante (Acta) <span className="text-danger-400">*</span>
                </h2>
                <p className="text-sm text-surface-400">
                  Complete los datos para generar el Acta de Obtencion de Evidencia Digital
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 space-y-6 pt-4">
              {/* Seccion 1: Datos del Acta */}
              <div>
                <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-alina-600" />
                  Datos Generales del Acta
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-1">
                      Lugar del Acta <span className="text-danger-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="actaLugar"
                      value={contributorData.actaLugar}
                      onChange={handleContributorChange}
                      placeholder="Ej: Lima, Fiscalia Provincial"
                      disabled={uploading}
                      className="w-full px-3 py-2 border border-surface-700 bg-white text-surface-200 placeholder-surface-500 rounded-xl focus:ring-2 focus:ring-alina-500/20 focus:border-alina-500 disabled:bg-surface-900/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-1">
                      Entidad Interviniente <span className="text-danger-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="actaEntidadInterviniente"
                      value={contributorData.actaEntidadInterviniente}
                      onChange={handleContributorChange}
                      placeholder="Ej: Ministerio Publico - Distrito Fiscal de Lima"
                      disabled={uploading}
                      className="w-full px-3 py-2 border border-surface-700 bg-white text-surface-200 placeholder-surface-500 rounded-xl focus:ring-2 focus:ring-alina-500/20 focus:border-alina-500 disabled:bg-surface-900/40"
                    />
                  </div>
                </div>
              </div>

              {/* Seccion 2: Usuario ALINA */}
              <div>
                <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Building className="w-4 h-4 text-alina-600" />
                  Datos del Usuario ALINA (opcional)
                </h3>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1">
                    Entidad del Usuario
                  </label>
                  <input
                    type="text"
                    name="usuarioEntidad"
                    value={contributorData.usuarioEntidad}
                    onChange={handleContributorChange}
                    placeholder="Ej: Fiscalia Provincial Corporativa Especializada"
                    disabled={uploading}
                    className="w-full px-3 py-2 border border-surface-700 bg-white text-surface-200 placeholder-surface-500 rounded-xl focus:ring-2 focus:ring-alina-500/20 focus:border-alina-500 disabled:bg-surface-900/40"
                  />
                  <p className="mt-1 text-xs text-surface-400">
                    Si no se especifica, se usara la entidad del perfil del usuario
                  </p>
                </div>
              </div>

              {/* Seccion 3: Identificacion del Aportante */}
              <div>
                <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-alina-600" />
                  Identificacion del Aportante
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-1">
                      Nombre Completo <span className="text-danger-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="aportanteNombreCompleto"
                      value={contributorData.aportanteNombreCompleto}
                      onChange={handleContributorChange}
                      placeholder="Nombres y apellidos completos"
                      disabled={uploading}
                      className="w-full px-3 py-2 border border-surface-700 bg-white text-surface-200 placeholder-surface-500 rounded-xl focus:ring-2 focus:ring-alina-500/20 focus:border-alina-500 disabled:bg-surface-900/40"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-1">
                        Tipo de Documento <span className="text-danger-400">*</span>
                      </label>
                      <select
                        name="aportanteDocumentoTipo"
                        value={contributorData.aportanteDocumentoTipo}
                        onChange={handleContributorChange}
                        disabled={uploading}
                        className="w-full px-3 py-2 border border-surface-700 bg-white text-surface-200 rounded-xl focus:ring-2 focus:ring-alina-500/20 focus:border-alina-500 disabled:bg-surface-900/40"
                      >
                        <option value="DNI">DNI</option>
                        <option value="CE">Carnet de Extranjeria</option>
                        <option value="PASAPORTE">Pasaporte</option>
                        <option value="RUC">RUC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-1">
                        Numero de Documento <span className="text-danger-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="aportanteDocumentoNumero"
                        value={contributorData.aportanteDocumentoNumero}
                        onChange={handleContributorChange}
                        placeholder="Ej: 12345678"
                        disabled={uploading}
                        className="w-full px-3 py-2 border border-surface-700 bg-white text-surface-200 placeholder-surface-500 rounded-xl focus:ring-2 focus:ring-alina-500/20 focus:border-alina-500 disabled:bg-surface-900/40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-1">
                        Condicion <span className="text-danger-400">*</span>
                      </label>
                      <select
                        name="aportanteCondicion"
                        value={contributorData.aportanteCondicion}
                        onChange={handleContributorChange}
                        disabled={uploading}
                        className="w-full px-3 py-2 border border-surface-700 bg-white text-surface-200 rounded-xl focus:ring-2 focus:ring-alina-500/20 focus:border-alina-500 disabled:bg-surface-900/40"
                      >
                        <option value="TESTIGO">Testigo</option>
                        <option value="AGRAVIADO">Agraviado</option>
                        <option value="DENUNCIANTE">Denunciante</option>
                        <option value="TERCERO">Tercero</option>
                        <option value="OTRO">Otro</option>
                      </select>
                    </div>
                    {contributorData.aportanteCondicion === 'OTRO' && (
                      <div>
                        <label className="block text-sm font-medium text-surface-300 mb-1">
                          Especificar Condicion <span className="text-danger-400">*</span>
                        </label>
                        <input
                          type="text"
                          name="aportanteCondicionOtro"
                          value={contributorData.aportanteCondicionOtro}
                          onChange={handleContributorChange}
                          placeholder="Especifique la condicion"
                          disabled={uploading}
                          className="w-full px-3 py-2 border border-surface-700 bg-white text-surface-200 placeholder-surface-500 rounded-xl focus:ring-2 focus:ring-alina-500/20 focus:border-alina-500 disabled:bg-surface-900/40"
                        />
                      </div>
                    )}
                  </div>

                  {/* Campos opcionales de contacto */}
                  <div className="pt-2">
                    <p className="text-xs text-surface-400 mb-3">Datos de contacto (opcional)</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-surface-300 mb-1">
                          <Home className="w-3 h-3 inline mr-1" />
                          Domicilio
                        </label>
                        <input
                          type="text"
                          name="aportanteDomicilio"
                          value={contributorData.aportanteDomicilio}
                          onChange={handleContributorChange}
                          placeholder="Direccion"
                          disabled={uploading}
                          className="w-full px-3 py-2 border border-surface-700 bg-white text-surface-200 placeholder-surface-500 rounded-xl focus:ring-2 focus:ring-alina-500/20 focus:border-alina-500 disabled:bg-surface-900/40"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-300 mb-1">
                          <Phone className="w-3 h-3 inline mr-1" />
                          Telefono
                        </label>
                        <input
                          type="text"
                          name="aportanteTelefono"
                          value={contributorData.aportanteTelefono}
                          onChange={handleContributorChange}
                          placeholder="Numero de telefono"
                          disabled={uploading}
                          className="w-full px-3 py-2 border border-surface-700 bg-white text-surface-200 placeholder-surface-500 rounded-xl focus:ring-2 focus:ring-alina-500/20 focus:border-alina-500 disabled:bg-surface-900/40"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-300 mb-1">
                          <Mail className="w-3 h-3 inline mr-1" />
                          Correo
                        </label>
                        <input
                          type="email"
                          name="aportanteCorreo"
                          value={contributorData.aportanteCorreo}
                          onChange={handleContributorChange}
                          placeholder="correo@ejemplo.com"
                          disabled={uploading}
                          className="w-full px-3 py-2 border border-surface-700 bg-white text-surface-200 placeholder-surface-500 rounded-xl focus:ring-2 focus:ring-alina-500/20 focus:border-alina-500 disabled:bg-surface-900/40"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seccion 4: Informacion Adicional de la Evidencia */}
              <div>
                <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-alina-600" />
                  Informacion Adicional de la Evidencia (opcional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-1">
                      Dispositivo o Medio de Origen
                    </label>
                    <input
                      type="text"
                      name="dispositivoOrigen"
                      value={contributorData.dispositivoOrigen}
                      onChange={handleContributorChange}
                      placeholder="Ej: Celular iPhone 12, Laptop Dell, USB Kingston"
                      disabled={uploading}
                      className="w-full px-3 py-2 border border-surface-700 bg-white text-surface-200 placeholder-surface-500 rounded-xl focus:ring-2 focus:ring-alina-500/20 focus:border-alina-500 disabled:bg-surface-900/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-1">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Fecha Aproximada de Obtencion
                    </label>
                    <input
                      type="date"
                      name="fechaObtencionArchivo"
                      value={contributorData.fechaObtencionArchivo}
                      onChange={handleContributorChange}
                      disabled={uploading}
                      className="w-full px-3 py-2 border border-surface-700 bg-white text-surface-200 rounded-xl focus:ring-2 focus:ring-alina-500/20 focus:border-alina-500 disabled:bg-surface-900/40"
                    />
                  </div>
                </div>
              </div>

              {/* Nota informativa */}
              <div className="bg-accent-50/50 border border-accent-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FileSignature className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-accent-800">
                      Se generara automaticamente el Acta de Obtencion de Evidencia Digital
                    </p>
                    <p className="text-sm text-accent-700 mt-1">
                      El acta incluye la declaracion jurada del aportante y estara disponible
                      para descarga en el detalle de la evidencia, en la seccion "Actas".
                    </p>
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            loading={uploading}
            disabled={
              sourceMode === 'local' ? !selectedFile :
              sourceMode === 'drive' ? driveFiles.length === 0 :
              photosItems.length === 0
            }
            icon={Upload}
          >
            {sourceMode === 'drive' ? 'Importar desde Drive' :
             sourceMode === 'photos' ? 'Importar desde Photos' :
             'Subir Evidencia'}
          </Button>
          <Link to="/evidence">
            <Button variant="secondary" disabled={uploading}>
              Cancelar
            </Button>
          </Link>
        </div>
      </form>

      {/* Info */}
      <div className="bg-alina-50/50 rounded-2xl p-6">
        <h3 className="font-medium text-alina-800 mb-2">Proceso Automatico</h3>
        <p className="text-sm text-alina-700 mb-3">
          Una vez subido el archivo, el sistema iniciara automaticamente el pipeline de procesamiento:
        </p>
        <ol className="text-sm text-alina-700 list-decimal list-inside space-y-1">
          <li>Escaneo de seguridad (antivirus)</li>
          <li>Calculo de hash SHA-256</li>
          <li>Creacion de copia bit-a-bit</li>
          <li>Generacion de archivo sellado</li>
          <li>Extraccion de metadata y analisis de indicios</li>
          <li>Preparacion para exportacion</li>
        </ol>
      </div>

      {/* ============================================================ */}
      {/* MODAL BLOQUEANTE DE CARGA - portal a document.body          */}
      {/* Se renderiza en el body para escapar de cualquier ancestor   */}
      {/* con transform/filter que rompa position:fixed                */}
      {/* ============================================================ */}
      {uploading && createPortal(
        <div
          className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/75 backdrop-blur-sm"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-modal-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 border-2 border-gray-300">
            {/* Icono animado */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-alina-100 rounded-full flex items-center justify-center">
                {sourceMode === 'drive' ? (
                  <HardDrive className="w-8 h-8 text-alina-700 animate-pulse" />
                ) : sourceMode === 'photos' ? (
                  <ImagePlus className="w-8 h-8 text-alina-700 animate-pulse" />
                ) : (
                  <Upload className="w-8 h-8 text-alina-700 animate-pulse" />
                )}
              </div>
            </div>

            {/* Titulo - alto contraste */}
            <h3 id="upload-modal-title" className="text-xl font-bold text-gray-900 text-center mb-3" style={{ color: '#111827' }}>
              {sourceMode === 'drive'
                ? 'Importando desde Google Drive...'
                : sourceMode === 'photos'
                ? 'Importando desde Google Photos...'
                : (uploadProgress < 100 ? 'Subiendo archivo...' : 'Procesando en el servidor...')}
            </h3>

            {/* Advertencia clara - alto contraste */}
            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-900 text-center font-bold" style={{ color: '#78350f' }}>
                Por favor, no cierre ni recargue esta pagina
              </p>
              <p className="text-xs text-amber-800 text-center mt-1" style={{ color: '#92400e' }}>
                El archivo se esta cargando. Si sale ahora, debera iniciar la carga nuevamente.
              </p>
            </div>

            {/* Barra de progreso */}
            {sourceMode === 'local' && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-800 font-medium" style={{ color: '#1f2937' }}>
                    {selectedFile?.name ? (selectedFile.name.length > 40 ? selectedFile.name.substring(0, 37) + '...' : selectedFile.name) : 'Archivo'}
                  </span>
                  <span className="text-sm font-bold text-alina-700" style={{ color: '#0e7490' }}>
                    {uploadProgress}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                  <div
                    className="h-full bg-gradient-to-r from-alina-500 to-alina-600 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-700 text-center mt-3 font-medium" style={{ color: '#374151' }}>
                  {uploadProgress < 100
                    ? (selectedFile?.size ? `${formatFileSize(Math.floor((selectedFile.size * uploadProgress) / 100))} de ${formatFileSize(selectedFile.size)}` : '')
                    : 'Calculando hash, sellando y registrando en almacenamiento...'}
                </p>
              </>
            )}

            {/* Para Google Drive: solo spinner sin barra (no hay progreso medible) */}
            {sourceMode === 'drive' && (
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-4 border-alina-200 border-t-alina-700 rounded-full animate-spin mb-3"></div>
                <p className="text-sm text-gray-800 font-medium" style={{ color: '#1f2937' }}>
                  Descargando {driveFiles.length} archivo(s) desde Google Drive
                </p>
                <p className="text-xs text-gray-700 mt-1" style={{ color: '#374151' }}>
                  Esto puede tardar varios minutos para archivos grandes
                </p>
              </div>
            )}

            {/* Para Google Photos: spinner sin barra (no hay progreso medible) */}
            {sourceMode === 'photos' && (
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-4 border-alina-200 border-t-alina-700 rounded-full animate-spin mb-3"></div>
                <p className="text-sm text-gray-800 font-medium" style={{ color: '#1f2937' }}>
                  Descargando {photosItems.length} elemento(s) desde Google Photos
                </p>
                <p className="text-xs text-gray-700 mt-1" style={{ color: '#374151' }}>
                  Esto puede tardar varios minutos para videos
                </p>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* ============================================================ */}
      {/* MODAL DE ERROR - portal a document.body                      */}
      {/* Se muestra cuando ocurre cualquier error durante el upload   */}
      {/* ============================================================ */}
      {errorModal && createPortal(
        <div
          className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="error-modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) setErrorModal(null); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-gray-300 animate-in fade-in zoom-in duration-200">
            {/* Icono segun tipo */}
            <div className="flex justify-center mb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                errorModal.type === 'network' ? 'bg-orange-100' :
                errorModal.type === 'server' ? 'bg-red-100' :
                errorModal.type === 'timeout' ? 'bg-amber-100' :
                errorModal.type === 'validation' || errorModal.type === 'size' || errorModal.type === 'conflict' ? 'bg-yellow-100' :
                errorModal.type === 'auth' ? 'bg-blue-100' :
                'bg-red-100'
              }`}>
                {errorModal.type === 'network' ? (
                  <WifiOff className="w-8 h-8 text-orange-700" />
                ) : errorModal.type === 'server' || errorModal.type === 'timeout' ? (
                  <ServerCrash className="w-8 h-8 text-red-700" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-red-700" />
                )}
              </div>
            </div>

            {/* Titulo - contraste alto */}
            <h3 id="error-modal-title" className="text-xl font-bold text-gray-900 text-center mb-3" style={{ color: '#111827' }}>
              {errorModal.title}
            </h3>

            {/* Mensaje principal - contraste alto */}
            <p className="text-sm text-gray-800 text-center mb-4 leading-relaxed" style={{ color: '#1f2937' }}>
              {errorModal.message}
            </p>

            {/* Detalles tecnicos colapsables (solo si hay) */}
            {errorModal.technicalDetails && (
              <details className="mb-4">
                <summary className="text-xs text-gray-700 cursor-pointer hover:text-gray-900 select-none font-medium" style={{ color: '#374151' }}>
                  Detalles tecnicos
                </summary>
                <div className="mt-2 p-2 bg-gray-100 rounded font-mono text-xs text-gray-800 break-all border border-gray-200" style={{ color: '#1f2937' }}>
                  {errorModal.technicalDetails}
                </div>
              </details>
            )}

            {/* Sugerencias segun tipo */}
            {errorModal.type === 'network' && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-900 border border-blue-200" style={{ color: '#1e3a8a' }}>
                <p className="font-bold mb-1">Sugerencias:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Verifica tu conexion a internet</li>
                  <li>Espera unos minutos y vuelve a intentar</li>
                  <li>Si el problema persiste, contacta al administrador</li>
                </ul>
              </div>
            )}
            {errorModal.type === 'server' && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-900 border border-blue-200" style={{ color: '#1e3a8a' }}>
                <p className="font-bold mb-1">Sugerencias:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>El servidor pudo estar reiniciandose</li>
                  <li>Espera 1-2 minutos y vuelve a intentar</li>
                  <li>Si el problema persiste, reporta el incidente</li>
                </ul>
              </div>
            )}
            {errorModal.type === 'size' && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-900 border border-blue-200" style={{ color: '#1e3a8a' }}>
                <p className="font-bold mb-1">Sugerencias:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Comprime el archivo (ZIP) antes de subirlo</li>
                  <li>Reduce la calidad del video si aplica</li>
                  <li>Divide el archivo en partes mas pequenas</li>
                </ul>
              </div>
            )}

            {/* Botones de accion */}
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => setErrorModal(null)}
                className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-semibold text-sm transition-colors border border-gray-300"
                style={{ color: '#111827' }}
              >
                Cerrar
              </button>
              {errorModal.canRetry && (
                <button
                  type="button"
                  onClick={() => {
                    setErrorModal(null);
                    setError(null);
                    // Disparar submit programaticamente
                    handleSubmit({ preventDefault: () => {} });
                  }}
                  className="flex-1 px-4 py-2.5 bg-alina-600 hover:bg-alina-700 text-white rounded-lg font-semibold text-sm transition-colors shadow"
                  style={{ color: '#ffffff' }}
                >
                  Reintentar
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default EvidenceUpload;
