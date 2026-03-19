import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Lock, FolderOpen, FileCheck, AlertCircle, CheckSquare, Square } from 'lucide-react';
import { Button, Input, Alert, Loading } from '../../components/common';
import caseService from '../../services/caseService';
import evidenceService from '../../services/evidenceService';
import exportService from '../../services/exportService';
import { EXPORT_SCOPES, EVIDENCE_STATUS_LABELS } from '../../utils/constants';
import toast from 'react-hot-toast';

/**
 * ExportCreate Page
 * Create forensic ZIP export for evidence or case
 */
const ExportCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedEvidenceId = searchParams.get('evidenceId');
  const preselectedCaseId = searchParams.get('caseId');

  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);

  // Evidences from selected case + which ones are checked
  const [caseEvidences, setCaseEvidences] = useState([]);
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState(new Set());
  const [loadingCaseEvidences, setLoadingCaseEvidences] = useState(false);

  const [formData, setFormData] = useState({
    scope: preselectedCaseId ? 'CASE' : 'SINGLE_EVIDENCE',
    evidenceId: preselectedEvidenceId || '',
    caseId: preselectedCaseId || '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.evidenceId && evidence.length > 0) {
      const found = evidence.find((e) => String(e.id) === String(formData.evidenceId));
      setSelectedEvidence(found || null);
    } else {
      setSelectedEvidence(null);
    }
  }, [formData.evidenceId, evidence]);

  useEffect(() => {
    if (formData.caseId && cases.length > 0) {
      const found = cases.find((c) => String(c.id) === String(formData.caseId));
      setSelectedCase(found || null);
    } else {
      setSelectedCase(null);
    }
  }, [formData.caseId, cases]);

  // Fetch case evidences when a case is selected
  useEffect(() => {
    if (formData.scope === 'CASE' && formData.caseId) {
      fetchCaseEvidences(formData.caseId);
    } else {
      setCaseEvidences([]);
      setSelectedEvidenceIds(new Set());
    }
  }, [formData.caseId, formData.scope]);

  const fetchCaseEvidences = async (caseId) => {
    setLoadingCaseEvidences(true);
    try {
      const caseData = await caseService.getCaseById(caseId);
      const allEvidences = caseData?.data?.evidences || [];
      setCaseEvidences(allEvidences);
      // Select only the ready ones by default
      const readyIds = allEvidences
        .filter((e) => e.status === 'READY_FOR_EXPORT' || e.status === 'EXPORTED')
        .map((e) => e.id);
      setSelectedEvidenceIds(new Set(readyIds));
    } catch (err) {
      console.error('Error loading case evidences:', err);
      setCaseEvidences([]);
      setSelectedEvidenceIds(new Set());
    } finally {
      setLoadingCaseEvidences(false);
    }
  };

  const isEvidenceReady = (ev) =>
    ev.status === 'READY_FOR_EXPORT' || ev.status === 'EXPORTED';

  const toggleEvidence = (evidenceId) => {
    setSelectedEvidenceIds((prev) => {
      const next = new Set(prev);
      if (next.has(evidenceId)) {
        next.delete(evidenceId);
      } else {
        next.add(evidenceId);
      }
      return next;
    });
    if (errors.caseEvidences) {
      setErrors((prev) => ({ ...prev, caseEvidences: null }));
    }
  };

  const readyCaseEvidences = caseEvidences.filter(isEvidenceReady);

  const toggleAllEvidences = () => {
    if (selectedEvidenceIds.size === readyCaseEvidences.length) {
      setSelectedEvidenceIds(new Set());
    } else {
      setSelectedEvidenceIds(new Set(readyCaseEvidences.map((e) => e.id)));
    }
    if (errors.caseEvidences) {
      setErrors((prev) => ({ ...prev, caseEvidences: null }));
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [casesRes, evidenceRes] = await Promise.all([
        caseService.getCases({ limit: 100 }),
        evidenceService.getEvidence({ status: 'READY_FOR_EXPORT', limit: 100 })
      ]);

      // Backend devuelve { success, data: { cases/evidences: [...], pagination } }
      const casesArray = casesRes?.data?.cases || casesRes?.cases || [];
      const evidenceArray = evidenceRes?.data?.evidences || evidenceRes?.evidences || [];
      setCases(casesArray);
      setEvidence(evidenceArray);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    setApiError(null);
  };

  const handleScopeChange = (scope) => {
    setFormData((prev) => ({
      ...prev,
      scope,
      evidenceId: '',
      caseId: ''
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (formData.scope === 'SINGLE_EVIDENCE') {
      if (!formData.evidenceId) {
        newErrors.evidenceId = 'Selecciona una evidencia';
      }
    } else {
      if (!formData.caseId) {
        newErrors.caseId = 'Selecciona un caso';
      } else if (selectedEvidenceIds.size === 0) {
        newErrors.caseEvidences = 'Selecciona al menos una evidencia para exportar';
      }
    }

    if (!formData.password) {
      newErrors.password = 'La contrasena es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contrasena debe tener al menos 8 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contrasenas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    setApiError(null);

    try {
      let evidenceIds = [];

      if (formData.scope === 'SINGLE_EVIDENCE') {
        evidenceIds = [parseInt(formData.evidenceId)];
      } else {
        evidenceIds = Array.from(selectedEvidenceIds).map((id) => parseInt(id));
      }

      const payload = {
        evidenceIds,
        password: formData.password
      };

      await exportService.createExport(payload);

      toast.success('Exportacion iniciada. El ZIP se esta generando.');
      navigate('/exports');
    } catch (err) {
      setApiError(err.error?.message || 'Error al crear la exportacion');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="lg" text="Cargando datos..." />
      </div>
    );
  }

  const readyEvidence = evidence.filter(
    (e) => e.status === 'READY_FOR_EXPORT' || e.status === 'EXPORTED'
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/exports">
          <Button variant="ghost" size="sm" icon={ArrowLeft}>
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Crear Exportacion</h1>
          <p className="text-surface-300 mt-1">
            Genera un paquete ZIP forense cifrado
          </p>
        </div>
      </div>

      {/* Error */}
      {apiError && (
        <Alert
          type="error"
          message={apiError}
          dismissible
          onDismiss={() => setApiError(null)}
        />
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Scope Selection */}
        <div className="bg-white/90 rounded-2xl border border-surface-700/35 p-6">
          <h2 className="text-lg font-semibold text-surface-50 mb-4">Tipo de Exportacion</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleScopeChange('SINGLE_EVIDENCE')}
              className={`
                p-4 rounded-xl border-2 text-left transition-all
                ${formData.scope === 'SINGLE_EVIDENCE'
                  ? 'border-alina-500 bg-alina-50/50'
                  : 'border-surface-700/60 hover:border-surface-500'
                }
              `}
            >
              <FileCheck className={`w-8 h-8 mb-2 ${formData.scope === 'SINGLE_EVIDENCE' ? 'text-alina-600' : 'text-surface-500'}`} />
              <p className="font-medium text-surface-50">Evidencia Individual</p>
              <p className="text-sm text-surface-400 mt-1">Exportar una sola evidencia</p>
            </button>

            <button
              type="button"
              onClick={() => handleScopeChange('CASE')}
              className={`
                p-4 rounded-xl border-2 text-left transition-all
                ${formData.scope === 'CASE'
                  ? 'border-alina-500 bg-alina-50/50'
                  : 'border-surface-700/60 hover:border-surface-500'
                }
              `}
            >
              <FolderOpen className={`w-8 h-8 mb-2 ${formData.scope === 'CASE' ? 'text-alina-600' : 'text-surface-500'}`} />
              <p className="font-medium text-surface-50">Por Caso</p>
              <p className="text-sm text-surface-400 mt-1">Seleccionar evidencias de un caso</p>
            </button>
          </div>
        </div>

        {/* Selection */}
        <div className="bg-white/90 rounded-2xl border border-surface-700/35 p-6">
          <h2 className="text-lg font-semibold text-surface-50 mb-4">
            {formData.scope === 'SINGLE_EVIDENCE' ? 'Seleccionar Evidencia' : 'Seleccionar Caso'}
          </h2>

          {formData.scope === 'SINGLE_EVIDENCE' ? (
            <>
              {readyEvidence.length === 0 ? (
                <div className="p-4 bg-accent-50/50 border border-accent-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-accent-800">Sin evidencias disponibles</p>
                      <p className="text-sm text-accent-700 mt-1">
                        No tienes evidencias listas para exportar. El procesamiento debe completarse primero.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-surface-300">
                    Evidencia <span className="text-danger-400">*</span>
                  </label>
                  <select
                    name="evidenceId"
                    value={formData.evidenceId}
                    onChange={handleChange}
                    className={`
                      block w-full rounded-xl border px-4 py-2.5 text-surface-200 appearance-none bg-white
                      ${errors.evidenceId ? 'border-danger-400' : 'border-surface-700'}
                      focus:border-alina-500 focus:ring-2 focus:ring-alina-500/20
                    `}
                  >
                    <option value="">Selecciona una evidencia</option>
                    {readyEvidence.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title || e.originalFile?.filename || `Evidencia ${e.id}`}
                      </option>
                    ))}
                  </select>
                  {errors.evidenceId && (
                    <p className="text-sm text-danger-400">{errors.evidenceId}</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              {cases.length === 0 ? (
                <div className="p-4 bg-accent-50/50 border border-accent-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-accent-800">Sin casos disponibles</p>
                      <p className="text-sm text-accent-700 mt-1">
                        No tienes casos creados. Crea un caso primero.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-surface-300">
                      Caso <span className="text-danger-400">*</span>
                    </label>
                    <select
                      name="caseId"
                      value={formData.caseId}
                      onChange={handleChange}
                      className={`
                        block w-full rounded-xl border px-4 py-2.5 text-surface-200 appearance-none bg-white
                        ${errors.caseId ? 'border-danger-400' : 'border-surface-700'}
                        focus:border-alina-500 focus:ring-2 focus:ring-alina-500/20
                      `}
                    >
                      <option value="">Selecciona un caso</option>
                      {cases.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title} ({c.evidenceCount || 0} evidencias)
                        </option>
                      ))}
                    </select>
                    {errors.caseId && (
                      <p className="text-sm text-danger-400">{errors.caseId}</p>
                    )}
                  </div>

                  {/* Evidence selection within case */}
                  {formData.caseId && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-surface-300">
                          Evidencias a exportar <span className="text-danger-400">*</span>
                        </label>
                        {readyCaseEvidences.length > 0 && (
                          <button
                            type="button"
                            onClick={toggleAllEvidences}
                            className="text-xs font-medium text-alina-600 hover:text-alina-700 transition-colors"
                          >
                            {selectedEvidenceIds.size === readyCaseEvidences.length
                              ? 'Deseleccionar todo'
                              : 'Seleccionar todo'}
                          </button>
                        )}
                      </div>

                      {loadingCaseEvidences ? (
                        <div className="flex items-center justify-center py-6">
                          <Loading size="sm" text="Cargando evidencias..." />
                        </div>
                      ) : caseEvidences.length === 0 ? (
                        <div className="p-4 bg-accent-50/50 border border-accent-200 rounded-xl">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-accent-800">Sin evidencias</p>
                              <p className="text-sm text-accent-700 mt-1">
                                Este caso no tiene evidencias.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : readyCaseEvidences.length === 0 ? (
                        <div className="p-4 bg-accent-50/50 border border-accent-200 rounded-xl">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-accent-800">Sin evidencias listas</p>
                              <p className="text-sm text-accent-700 mt-1">
                                Este caso tiene {caseEvidences.length} evidencia(s) pero ninguna esta lista para exportar. El procesamiento debe completarse primero.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs text-surface-400">
                            {selectedEvidenceIds.size} de {readyCaseEvidences.length} seleccionadas
                            {caseEvidences.length !== readyCaseEvidences.length && (
                              <span className="text-surface-500">
                                {' '}({caseEvidences.length - readyCaseEvidences.length} no disponible{caseEvidences.length - readyCaseEvidences.length > 1 ? 's' : ''})
                              </span>
                            )}
                          </p>
                          <div className="border border-surface-700/35 rounded-xl overflow-hidden divide-y divide-surface-700/20">
                            {caseEvidences.map((ev) => {
                              const ready = isEvidenceReady(ev);
                              const isSelected = selectedEvidenceIds.has(ev.id);
                              return (
                                <button
                                  key={ev.id}
                                  type="button"
                                  onClick={() => ready && toggleEvidence(ev.id)}
                                  disabled={!ready}
                                  className={`
                                    w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                                    ${!ready
                                      ? 'bg-surface-850/30 cursor-not-allowed opacity-50'
                                      : isSelected
                                        ? 'bg-alina-50/40'
                                        : 'bg-white hover:bg-surface-850/50'
                                    }
                                  `}
                                >
                                  {!ready ? (
                                    <Square className="w-5 h-5 text-surface-600 flex-shrink-0" />
                                  ) : isSelected ? (
                                    <CheckSquare className="w-5 h-5 text-alina-600 flex-shrink-0" />
                                  ) : (
                                    <Square className="w-5 h-5 text-surface-500 flex-shrink-0" />
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className={`text-sm font-medium truncate ${ready ? 'text-surface-100' : 'text-surface-400'}`}>
                                      {ev.title || ev.originalFile?.filename || `Evidencia ${ev.id}`}
                                    </p>
                                    <p className="text-xs text-surface-400 mt-0.5">
                                      {ready
                                        ? (ev.status === 'EXPORTED' ? 'Exportada previamente' : 'Lista para exportar')
                                        : (EVIDENCE_STATUS_LABELS[ev.status] || ev.status) + ' - No disponible'
                                      }
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                          {errors.caseEvidences && (
                            <p className="text-sm text-danger-400">{errors.caseEvidences}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Password */}
        <div className="bg-white/90 rounded-2xl border border-surface-700/35 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-5 h-5 text-surface-500" />
            <h2 className="text-lg font-semibold text-surface-50">Contrasena del ZIP</h2>
          </div>

          <div className="space-y-4">
            <Input
              label="Contrasena"
              name="password"
              type="password"
              placeholder="Minimo 8 caracteres"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              autoComplete="off"
              required
              disabled={submitting}
            />

            <Input
              label="Confirmar Contrasena"
              name="confirmPassword"
              type="password"
              placeholder="Repite la contrasena"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              autoComplete="off"
              required
              disabled={submitting}
            />

            <div className="p-4 bg-accent-50/50 border border-accent-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-accent-800">Importante</p>
                  <p className="text-sm text-accent-700 mt-1">
                    Esta contrasena NO se guarda en el sistema. Si la pierdes, deberas generar
                    una nueva exportacion. Guardala en un lugar seguro.
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
            loading={submitting}
            icon={Download}
            disabled={
              (formData.scope === 'SINGLE_EVIDENCE' && readyEvidence.length === 0) ||
              (formData.scope === 'CASE' && (cases.length === 0 || selectedEvidenceIds.size === 0))
            }
          >
            Crear Exportacion
          </Button>
          <Link to="/exports">
            <Button variant="secondary" disabled={submitting}>
              Cancelar
            </Button>
          </Link>
        </div>
      </form>

      {/* Info */}
      <div className="bg-alina-50/50 rounded-2xl p-6">
        <h3 className="font-medium text-alina-800 mb-2">Contenido del ZIP Forense</h3>
        <p className="text-sm text-alina-700 mb-3">
          El paquete incluira para cada evidencia:
        </p>
        <ul className="text-sm text-alina-700 list-disc list-inside space-y-1">
          <li>Archivo original</li>
          <li>Copia bit-a-bit</li>
          <li>Archivo sellado</li>
          <li>Certificados (PDF y JSON)</li>
          <li>Reportes de metadata e indicios</li>
          <li>Cadena de custodia</li>
          <li>Manifiesto con hashes SHA-256</li>
        </ul>
      </div>
    </div>
  );
};

export default ExportCreate;
