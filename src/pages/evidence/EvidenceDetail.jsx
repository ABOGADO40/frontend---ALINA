import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileCheck,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Shield,
  Loader2,
  FileSignature,
  Calendar,
  User,
  Award,
  Link2,
  FileSearch,
  Mail,
  Phone,
  X
} from 'lucide-react';
import { Button, Loading, Alert } from '../../components/common';
import evidenceService from '../../services/evidenceService';
import custodyService from '../../services/custodyService';
import actaService from '../../services/actaService';
import { formatDate, formatDateTime, formatFileSize, formatHash } from '../../utils/formatters';
import {
  EVIDENCE_STATUS_LABELS,
  EVIDENCE_STATUS_COLORS,
  FILE_ROLE_LABELS,
  CUSTODY_EVENT_LABELS
} from '../../utils/constants';
import toast from 'react-hot-toast';

// Estados finales que no requieren polling
const FINAL_STATUSES = ['READY_FOR_EXPORT', 'EXPORTED', 'ERROR'];
// Intervalo de polling en ms
const POLLING_INTERVAL = 3000;

/**
 * EvidenceDetail Page
 * View evidence details, files, hashes, and custody chain
 */
const EvidenceDetail = () => {
  const { id } = useParams();
  const [evidence, setEvidence] = useState(null);
  const [custody, setCustody] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('files');
  const [regenerating, setRegenerating] = useState(false);
  const [togglingPublic, setTogglingPublic] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  // Estados para Actas
  const [contributors, setContributors] = useState([]);

  // Estados para modal de contacto (al hacer privada)
  const [showPrivateModal, setShowPrivateModal] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactError, setContactError] = useState(null);

  const pollingRef = useRef(null);

  // Función para obtener evidencia (sin loading para polling)
  const fetchEvidence = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
      setError(null);
    }

    try {
      const response = await evidenceService.getEvidenceById(id);
      setEvidence(response.data);
      return response.data;
    } catch (err) {
      if (showLoading) {
        setError(err.error?.message || 'Error al cargar la evidencia');
      }
      return null;
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [id]);

  // Función para obtener cadena de custodia
  const fetchCustody = useCallback(async () => {
    try {
      const response = await custodyService.getChain(id);
      setCustody(response.data);
    } catch (err) {
      console.error('Error loading custody:', err);
    }
  }, [id]);

  // Función para obtener registros de aportantes
  const fetchContributors = useCallback(async () => {
    try {
      const response = await actaService.getContributorRecords(id);
      setContributors(response.data?.contributors || []);
    } catch (err) {
      console.error('Error loading contributors:', err);
    }
  }, [id]);

  // Carga inicial
  useEffect(() => {
    fetchEvidence();
    fetchCustody();
    fetchContributors();
  }, [id, fetchEvidence, fetchCustody, fetchContributors]);

  // Polling mientras se procesa
  useEffect(() => {
    // Determinar si necesita polling
    const needsPolling = evidence && !FINAL_STATUSES.includes(evidence.status);

    if (needsPolling) {
      setIsPolling(true);

      // Iniciar polling
      pollingRef.current = setInterval(async () => {
        const updatedEvidence = await fetchEvidence(false);

        if (updatedEvidence) {
          // También actualizar custodia
          fetchCustody();

          // Si llegó a estado final, detener polling
          if (FINAL_STATUSES.includes(updatedEvidence.status)) {
            clearInterval(pollingRef.current);
            setIsPolling(false);

            if (updatedEvidence.status === 'READY_FOR_EXPORT') {
              toast.success('Procesamiento completado. Todos los archivos estan listos.');
            } else if (updatedEvidence.status === 'ERROR') {
              toast.error('Error durante el procesamiento de la evidencia.');
            }
          }
        }
      }, POLLING_INTERVAL);
    } else {
      setIsPolling(false);
    }

    // Cleanup
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [evidence?.status, fetchEvidence, fetchCustody]);

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await evidenceService.regenerate(id);
      toast.success('Regeneracion iniciada. Los derivados se estan procesando.');
      fetchEvidence();
      fetchCustody();
    } catch (err) {
      const errorCode = err.error?.code;
      const errorMessage = err.error?.message;

      // Casos especificos: archivo no recuperable, debe re-subirse
      if (errorCode === 'UPLOAD_INCOMPLETE' || errorCode === 'FILE_NOT_IN_STORAGE' || errorCode === 'NO_ORIGINAL_FILE') {
        toast.error(
          errorMessage || 'El archivo original no esta disponible. Debe subir la evidencia nuevamente.',
          { duration: 8000 }
        );
      } else if (errorCode === 'PIPELINE_ACTIVE') {
        toast.error(
          errorMessage || 'La evidencia esta siendo procesada. Espere unos minutos.',
          { duration: 6000 }
        );
      } else {
        toast.error(errorMessage || 'Error al regenerar');
      }
    } finally {
      setRegenerating(false);
    }
  };

  const handleTogglePublic = async () => {
    if (!evidence) return;

    // Si es publica y se quiere hacer privada -> mostrar modal de contacto
    if (evidence.isPublic) {
      setContactEmail('');
      setContactPhone('');
      setContactError(null);
      setShowPrivateModal(true);
      return;
    }

    // Si es privada y se quiere hacer publica -> ejecutar directo
    setTogglingPublic(true);
    try {
      const response = await evidenceService.togglePublic(id);
      const newValue = response.data.isPublic;
      setEvidence((prev) => ({ ...prev, isPublic: newValue, contactEmail: null, contactPhone: null }));
      toast.success('Verificacion publica activada');
      fetchCustody();
    } catch (err) {
      toast.error(err.error?.message || 'Error al cambiar visibilidad');
    } finally {
      setTogglingPublic(false);
    }
  };

  const handleConfirmPrivate = async () => {
    const hasEmail = contactEmail.trim().length > 0;
    const hasPhone = contactPhone.trim().length > 0;

    if (!hasEmail && !hasPhone) {
      setContactError('Debe proporcionar al menos un dato de contacto (correo o telefono)');
      return;
    }

    if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      setContactError('El correo electronico no es valido');
      return;
    }

    setContactError(null);
    setTogglingPublic(true);
    try {
      const response = await evidenceService.togglePublic(id, {
        contactEmail: contactEmail.trim() || null,
        contactPhone: contactPhone.trim() || null
      });
      const newValue = response.data.isPublic;
      setEvidence((prev) => ({
        ...prev,
        isPublic: newValue,
        contactEmail: contactEmail.trim() || null,
        contactPhone: contactPhone.trim() || null
      }));
      toast.success('Evidencia marcada como privada');
      setShowPrivateModal(false);
      fetchCustody();
    } catch (err) {
      setContactError(err.error?.message || 'Error al cambiar visibilidad');
    } finally {
      setTogglingPublic(false);
    }
  };

  const handleDownload = async (fileRole, filename) => {
    try {
      const blob = await evidenceService.downloadFile(id, fileRole);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Descarga iniciada');
      fetchCustody(); // Refresh custody to show download event
    } catch (err) {
      toast.error(err.error?.message || 'Error al descargar');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  // Función para descargar acta PDF
  const handleDownloadActa = async (actaId, actaNumero) => {
    try {
      const blob = await actaService.downloadActa(actaId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${actaNumero}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Descarga iniciada');
    } catch (err) {
      toast.error(err.error?.message || 'Error al descargar acta');
    }
  };

  const tabs = [
    { id: 'files', label: 'Archivos', icon: FileText },
    { id: 'custody', label: 'Cadena de Custodia', icon: Shield },
    { id: 'actas', label: 'Documentos', icon: FileSignature }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="lg" text="Cargando evidencia..." />
      </div>
    );
  }

  if (error || !evidence) {
    return (
      <div className="space-y-6">
        <Link to="/evidence">
          <Button variant="ghost" size="sm" icon={ArrowLeft}>
            Volver a Evidencias
          </Button>
        </Link>
        <Alert type="error" message={error || 'Evidencia no encontrada'} />
      </div>
    );
  }

  const files = evidence.files || [];
  const custodyEvents = custody?.events || evidence.custodyEvents || [];
  const isReady = evidence.status === 'READY_FOR_EXPORT' || evidence.status === 'EXPORTED';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/evidence">
          <Button variant="ghost" size="sm" icon={ArrowLeft}>
            Volver
          </Button>
        </Link>
      </div>

      {/* Processing Banner */}
      {isPolling && (
        <div className="bg-alina-50/50 border border-alina-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-alina-50 rounded-lg flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-alina-600 animate-spin" />
            </div>
            <div>
              <p className="font-medium text-alina-800">Procesando evidencia...</p>
              <p className="text-sm text-alina-700">
                Generando archivos derivados, hashes y certificados. Esta pagina se actualizara automaticamente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Info Card */}
      <div className="bg-white/90 rounded-2xl border border-surface-700/35 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-alina-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileCheck className="w-7 h-7 text-alina-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-surface-50">
                {evidence.title || 'Sin titulo'}
              </h1>
              {evidence.description && (
                <p className="text-surface-300 mt-1">{evidence.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    EVIDENCE_STATUS_COLORS[evidence.status] || 'bg-surface-900/40 text-surface-200'
                  }`}
                >
                  {isPolling && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {EVIDENCE_STATUS_LABELS[evidence.status] || evidence.status}
                </span>
                {evidence.isPublic && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-success-400">
                    <Eye className="w-4 h-4" />
                    Verificacion Publica
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={evidence.isPublic ? EyeOff : Eye}
              onClick={handleTogglePublic}
              loading={togglingPublic}
            >
              {evidence.isPublic ? 'Hacer Privado' : 'Hacer Publico'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={handleRegenerate}
              loading={regenerating}
            >
              Regenerar
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={FileText}
              onClick={async () => {
                try {
                  const blob = await evidenceService.downloadMetadata(id);
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `metadata_evidencia_${id}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                  toast.success('Metadata exportada correctamente');
                } catch (err) {
                  toast.error(err.error?.message || 'Error al exportar metadata');
                }
              }}
            >
              Exportar Metadata
            </Button>
            {isReady && (
              <Link to={`/exports/create?evidenceId=${id}`}>
                <Button size="sm" icon={Download}>
                  Exportar
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 mt-6 border-t border-surface-700/35">
          <div>
            <p className="text-sm text-surface-400">Tipo</p>
            <p className="font-medium text-surface-50">{evidence.sourceType}</p>
          </div>
          <div>
            <p className="text-sm text-surface-400">Caso</p>
            {evidence.case ? (
              <Link
                to={`/cases/${evidence.case.id}`}
                className="font-medium text-alina-600 hover:text-alina-700"
              >
                {evidence.case.title}
              </Link>
            ) : (
              <p className="text-surface-500">Sin caso</p>
            )}
          </div>
          <div>
            <p className="text-sm text-surface-400">Archivos Generados</p>
            <p className="font-medium text-surface-50">{files.length}</p>
          </div>
          <div>
            <p className="text-sm text-surface-400">Fecha Creacion</p>
            <p className="font-medium text-surface-50">{formatDate(evidence.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/90 rounded-2xl border border-surface-700/35 overflow-hidden">
        <div className="border-b border-surface-700/35">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-alina-500 text-alina-600'
                    : 'border-transparent text-surface-400 hover:text-surface-200 hover:border-surface-500'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Files Tab */}
          {activeTab === 'files' && (
            <div className="space-y-4">
              {files.length === 0 ? (
                <p className="text-surface-400 text-center py-8">
                  No hay archivos disponibles
                </p>
              ) : (
                files.map((file) => (
                  <div
                    key={file.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-surface-900/40 rounded-xl"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-white/90 rounded-lg flex items-center justify-center border border-surface-700/35">
                        <FileText className="w-5 h-5 text-surface-500" />
                      </div>
                      <div>
                        <p className="font-medium text-surface-50">
                          {FILE_ROLE_LABELS[file.fileRole] || file.fileRole}
                        </p>
                        <p className="text-sm text-surface-400">
                          {file.originalFilename} - {formatFileSize(file.sizeBytes)}
                        </p>
                        {file.hash && (
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-xs text-surface-400 font-mono">
                              {formatHash(file.hash.hashHex, 10)}
                            </code>
                            <button
                              onClick={() => copyToClipboard(file.hash.hashHex)}
                              className="p-1 text-surface-500 hover:text-surface-300 rounded"
                              title="Copiar hash completo"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-surface-500">v{file.version}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Download}
                        onClick={() => handleDownload(file.fileRole, file.originalFilename)}
                      >
                        Descargar
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Custody Tab */}
          {activeTab === 'custody' && (
            <div>
              {/* Integrity Status */}
              {custody && (
                <div
                  className={`flex items-center gap-3 p-4 rounded-lg mb-6 ${
                    custody.chainIntegrity
                      ? 'bg-success-500/10 text-success-700'
                      : 'bg-danger-500/10 text-danger-700'
                  }`}
                >
                  {custody.chainIntegrity ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Cadena de custodia integra</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">Se detectaron inconsistencias</span>
                    </>
                  )}
                </div>
              )}

              {/* Timeline */}
              {custodyEvents.length === 0 ? (
                <p className="text-surface-400 text-center py-8">
                  No hay eventos de custodia
                </p>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-surface-700/60" />
                  <div className="space-y-4">
                    {custodyEvents.map((event, index) => {
                      const formattedEvent = custodyService.formatEvent(event);
                      return (
                        <div key={event.id} className="relative flex gap-4">
                          <div
                            className={`
                            w-8 h-8 rounded-full flex items-center justify-center z-10 flex-shrink-0
                            ${event.eventType === 'ERROR'
                              ? 'bg-danger-50 text-danger-400'
                              : 'bg-alina-50 text-alina-600'
                            }
                          `}
                          >
                            {event.actorType === 'SYSTEM' ? (
                              <Shield className="w-4 h-4" />
                            ) : (
                              <Clock className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 bg-surface-900/40 rounded-xl p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="flex items-center gap-2">
                                {formattedEvent.sequence && (
                                  <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-alina-700 bg-alina-50 rounded-full">
                                    {formattedEvent.sequence}
                                  </span>
                                )}
                                <p className="font-medium text-surface-50">
                                  {formattedEvent.eventTypeLabel}
                                </p>
                                {formattedEvent.isCryptographicSeal && (
                                  <span className="text-xs bg-success-50 text-success-700 px-1.5 py-0.5 rounded font-medium">
                                    Ed25519
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-surface-400">
                                {formatDateTime(event.eventAt)}
                              </p>
                            </div>
                            {formattedEvent.eventTypeDescription && (
                              <p className="text-sm text-surface-400 mt-0.5 italic">
                                {formattedEvent.eventTypeDescription}
                              </p>
                            )}
                            <p className="text-sm text-surface-300 mt-1">
                              Por: {formattedEvent.actorName} ({formattedEvent.actorTypeLabel})
                            </p>
                            {event.details && Object.keys(event.details).length > 0 && (
                              <div className="mt-2 text-xs text-surface-400">
                                <pre className="bg-surface-900/50 text-surface-300 p-2 rounded overflow-x-auto">
                                  {JSON.stringify(event.details, null, 2)}
                                </pre>
                              </div>
                            )}
                            {event.eventHash && (
                              <div className="mt-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <code className="text-xs text-surface-500 font-mono break-all">
                                    Hash: {event.eventHash}
                                  </code>
                                </div>
                                {formattedEvent.hashAlgorithm && formattedEvent.hashAlgorithm !== 'LEGACY' && (
                                  <p className="text-xs text-surface-500 mt-0.5">
                                    {formattedEvent.hashAlgorithm} | {formattedEvent.canonicalization}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Export Custody */}
              {custodyEvents.length > 0 && (
                <div className="mt-6 pt-6 border-t border-surface-700/35">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Download}
                      onClick={() =>
                        window.open(custodyService.getExportUrl(id, 'txt'), '_blank')
                      }
                    >
                      Exportar TXT
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Download}
                      onClick={() =>
                        window.open(custodyService.getExportUrl(id, 'pdf'), '_blank')
                      }
                    >
                      Exportar PDF
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actas Tab */}
          {activeTab === 'actas' && (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h3 className="text-lg font-semibold text-surface-50">
                  Documentos de la Evidencia
                </h3>
                <p className="text-sm text-surface-400 mt-1">
                  Documentos oficiales generados para esta evidencia digital
                </p>
              </div>

              {/* Documentos del Sistema */}
              <div className="grid gap-4">
                {/* Certificado de Evidencia Digital */}
                <div className="bg-success-50/50 rounded-xl p-5 border border-success-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-success-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-success-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-surface-50">
                          Certificado de Evidencia Digital
                        </h4>
                        <p className="text-sm text-surface-300 mt-1">
                          Documento oficial que certifica la incorporacion de la evidencia al sistema,
                          incluyendo hashes SHA-256, datos del archivo original, copia bit-a-bit y documento sellado.
                        </p>
                        <p className="text-xs text-success-400 mt-2">
                          CERT-{new Date(evidence.createdAt).getFullYear()}-{String(evidence.id).padStart(6, '0')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Download}
                      onClick={async () => {
                        try {
                          const blob = await actaService.downloadCertificado(id);
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `certificado_CERT-${new Date(evidence.createdAt).getFullYear()}-${String(evidence.id).padStart(6, '0')}.pdf`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                          toast.success('Certificado descargado');
                        } catch (err) {
                          toast.error(err.error?.message || 'Error al descargar certificado');
                        }
                      }}
                    >
                      Descargar PDF
                    </Button>
                  </div>
                </div>

                {/* Reporte de Cadena de Custodia */}
                <div className="bg-alina-50/50 rounded-xl p-5 border border-alina-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-alina-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Link2 className="w-6 h-6 text-alina-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-surface-50">
                          Reporte de Cadena de Custodia Digital
                        </h4>
                        <p className="text-sm text-surface-300 mt-1">
                          Registro cronologico de todos los eventos de custodia con encadenamiento
                          criptografico SHA-256 y firmas Ed25519.
                        </p>
                        <p className="text-xs text-alina-600 mt-2">
                          CUSTODIA-{new Date(evidence.createdAt).getFullYear()}-{String(evidence.id).padStart(6, '0')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Download}
                      onClick={async () => {
                        try {
                          const blob = await actaService.downloadCadenaCustodia(id);
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `cadena_custodia_CUSTODIA-${new Date(evidence.createdAt).getFullYear()}-${String(evidence.id).padStart(6, '0')}.pdf`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                          toast.success('Reporte de custodia descargado');
                        } catch (err) {
                          toast.error(err.error?.message || 'Error al descargar reporte');
                        }
                      }}
                    >
                      Descargar PDF
                    </Button>
                  </div>
                </div>

                {/* Reporte de Metadatos */}
                <div className="bg-purple-50/50 rounded-xl p-5 border border-purple-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileSearch className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-surface-50">
                          Reporte de Metadatos de Evidencia Digital
                        </h4>
                        <p className="text-sm text-surface-300 mt-1">
                          Informacion tecnica extraida del archivo: propiedades del documento,
                          autor, fechas de creacion/modificacion, datos EXIF y mas.
                        </p>
                        <p className="text-xs text-purple-400 mt-2">
                          METADATA-{new Date(evidence.createdAt).getFullYear()}-{String(evidence.id).padStart(6, '0')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Download}
                      onClick={async () => {
                        try {
                          const blob = await actaService.downloadMetadatos(id);
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `metadatos_METADATA-${new Date(evidence.createdAt).getFullYear()}-${String(evidence.id).padStart(6, '0')}.pdf`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                          toast.success('Reporte de metadatos descargado');
                        } catch (err) {
                          toast.error(err.error?.message || 'Error al descargar reporte');
                        }
                      }}
                    >
                      Descargar PDF
                    </Button>
                  </div>
                </div>
              </div>

              {/* Separador */}
              <div className="border-t border-surface-700/35 pt-6">
                <h4 className="text-md font-semibold text-surface-50 mb-4">
                  Acta de Obtencion de Evidencia Digital
                </h4>
                <p className="text-sm text-surface-400 mb-4">
                  Declaracion jurada del aportante generada al momento de subir la evidencia
                </p>

                {/* Lista de actas */}
                {contributors.length === 0 ? (
                  <div className="text-center py-8 bg-surface-900/40 rounded-xl">
                    <FileSignature className="w-10 h-10 text-surface-500 mx-auto mb-3" />
                    <p className="text-surface-400 text-sm">
                      No hay actas de aportante registradas
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contributors.map((contributor) => (
                      <div
                        key={contributor.id}
                        className="bg-accent-50/50 rounded-xl p-5 border border-accent-200"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-accent-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <User className="w-6 h-6 text-accent-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-surface-50">
                                {contributor.aportanteNombreCompleto}
                              </h4>
                              <p className="text-sm text-surface-400">
                                {contributor.aportanteDocumentoTipo}: {contributor.aportanteDocumentoNumero}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-surface-400">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent-50 text-accent-700 rounded">
                                  {contributor.aportanteCondicion === 'OTRO' && contributor.aportanteCondicionOtro
                                    ? contributor.aportanteCondicionOtro
                                    : contributor.aportanteCondicion}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {new Date(contributor.createdAt).toLocaleDateString('es-PE')}
                                </span>
                              </div>
                              {contributor.actaLugar && (
                                <p className="text-sm text-surface-400 mt-1">
                                  Lugar: {contributor.actaLugar}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {contributor.acta ? (
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <p className="text-sm font-medium text-accent-400">
                                    {contributor.acta.numero}
                                  </p>
                                  <p className="text-xs text-surface-400">
                                    {new Date(contributor.acta.generatedAt).toLocaleString('es-PE')}
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  icon={Download}
                                  onClick={() => handleDownloadActa(contributor.acta.id, contributor.acta.numero)}
                                >
                                  Descargar PDF
                                </Button>
                              </div>
                            ) : (
                              <span className="text-sm text-accent-400 bg-accent-50 px-3 py-1 rounded">
                                Acta pendiente de generacion
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Datos de contacto al hacer privada */}
      {showPrivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-100/25">
          <div className="bg-white rounded-2xl shadow-2xl border border-surface-700/35 w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-50 rounded-lg flex items-center justify-center">
                  <EyeOff className="w-5 h-5 text-accent-400" />
                </div>
                <h3 className="text-lg font-semibold text-surface-100">Hacer Evidencia Privada</h3>
              </div>
              <button
                onClick={() => setShowPrivateModal(false)}
                className="p-1 text-surface-500 hover:text-surface-300 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-surface-300 mb-4">
              Cuando alguien busque el hash de esta evidencia, vera que existe pero es privada.
              Proporcione al menos un dato de contacto para que puedan comunicarse con usted.
            </p>

            {contactError && (
              <div className="mb-4 p-3 bg-danger-500/10 border border-danger-500/30 rounded-lg text-sm text-danger-700">
                {contactError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    Correo electronico
                  </span>
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full px-3 py-2 border border-surface-700 bg-white rounded-xl text-sm text-surface-200 focus:ring-2 focus:ring-alina-500/20 focus:border-alina-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4" />
                    Telefono
                  </span>
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+51 999 999 999"
                  className="w-full px-3 py-2 border border-surface-700 bg-white rounded-xl text-sm text-surface-200 focus:ring-2 focus:ring-alina-500/20 focus:border-alina-500 outline-none"
                />
              </div>

              <p className="text-xs text-surface-400">
                Debe completar al menos uno de los dos campos.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-surface-700/35">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowPrivateModal(false)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                icon={EyeOff}
                onClick={handleConfirmPrivate}
                loading={togglingPublic}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Risk Report */}
      {evidence.riskReport && (
        <div className="bg-white/90 rounded-2xl border border-surface-700/35 p-6">
          <h2 className="text-lg font-semibold text-surface-50 mb-4">Reporte de Indicios</h2>

          {evidence.riskReport.rulesTriggered?.length > 0 ? (
            <div className="space-y-4">
              <div className="p-4 bg-accent-50/50 border border-accent-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-accent-800">Se detectaron indicios</p>
                    <p className="text-sm text-accent-700 mt-1">
                      {evidence.riskReport.summary}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-surface-300 mb-2">Reglas activadas:</p>
                <ul className="list-disc list-inside text-sm text-surface-300 space-y-1">
                  {evidence.riskReport.rulesTriggered.map((rule, idx) => (
                    <li key={idx}>{typeof rule === 'string' ? rule : JSON.stringify(rule)}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-success-50/50 rounded-xl">
              <CheckCircle className="w-5 h-5 text-success-400" />
              <p className="text-success-700">
                No se detectaron indicios de posible manipulacion
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EvidenceDetail;
