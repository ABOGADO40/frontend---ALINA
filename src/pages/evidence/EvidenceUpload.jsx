import { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';
import { Button, Input, Alert, FileUpload } from '../../components/common';
import caseService from '../../services/caseService';
import evidenceService from '../../services/evidenceService';
import { formatFileSize } from '../../utils/formatters';
import { MAX_FILE_SIZE } from '../../utils/constants';
import toast from 'react-hot-toast';
import GoogleDrivePicker from '../../components/evidence/GoogleDrivePicker';

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

  // Google Drive state
  const [sourceMode, setSourceMode] = useState('local'); // 'local' | 'drive'
  const [driveFiles, setDriveFiles] = useState([]);
  const [driveAccessToken, setDriveAccessToken] = useState(null);

  useEffect(() => {
    fetchCases();
  }, []);

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
      // Caso especial import-drive: el backend responde 422 con results por archivo
      // cuando todos los archivos fallaron (token expirado, integridad, etc.).
      // El error real esta en err.data.results, no en err.error.message.
      const driveResults = err?.data?.data?.results;
      if (Array.isArray(driveResults) && driveResults.length > 0) {
        const failed = driveResults.filter(r => !r.success);
        if (failed.length > 0) {
          const detalles = failed
            .map(r => `${r.fileName || r.fileId}: ${r.error || 'Error desconocido'}`)
            .join(' | ');
          setError(`No se pudo importar desde Google Drive. ${detalles}`);
          return;
        }
      }

      const errorData = err.response?.data?.error || err.error;
      let errorMsg = errorData?.message || 'Error al procesar la evidencia';
      // Mostrar detalles de validacion si existen
      if (errorData?.details?.length > 0) {
        const fields = errorData.details.map(d => `${d.field}: ${d.message}`).join('. ');
        errorMsg += ` (${fields})`;
      }
      setError(errorMsg);
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
              onClick={() => { setSourceMode('local'); setDriveFiles([]); setDriveAccessToken(null); }}
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
              onClick={() => { setSourceMode('drive'); setSelectedFile(null); }}
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

          {/* Upload progress (for local uploads) */}
          {uploading && sourceMode === 'local' && (
            <div className="mt-4 p-4 bg-surface-900/40 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-alina-50 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-alina-600 animate-pulse" />
                </div>
                <div>
                  <p className="font-medium text-surface-50">Subiendo archivo...</p>
                  <p className="text-sm text-surface-400">{uploadProgress}% completado</p>
                </div>
              </div>
              <div className="w-full h-2 bg-surface-900/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-alina-500 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Drive import progress */}
          {uploading && sourceMode === 'drive' && (
            <div className="mt-4 p-4 bg-surface-900/40 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-alina-50 rounded-lg flex items-center justify-center">
                  <HardDrive className="w-5 h-5 text-alina-600 animate-pulse" />
                </div>
                <div>
                  <p className="font-medium text-surface-50">Importando desde Google Drive...</p>
                  <p className="text-sm text-surface-400">
                    Descargando y procesando {driveFiles.length} archivo(s)
                  </p>
                </div>
              </div>
            </div>
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
            disabled={sourceMode === 'local' ? !selectedFile : driveFiles.length === 0}
            icon={Upload}
          >
            {sourceMode === 'drive' ? 'Importar Evidencia' : 'Subir Evidencia'}
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
    </div>
  );
};

export default EvidenceUpload;
