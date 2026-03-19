import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FolderOpen,
  FileCheck,
  Upload,
  Download,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { Button, Input, Loading, Alert, Table } from '../../components/common';
import { ConfirmModal } from '../../components/common/Modal';
import caseService from '../../services/caseService';
import { formatDate } from '../../utils/formatters';
import { EVIDENCE_STATUS_LABELS, EVIDENCE_STATUS_COLORS } from '../../utils/constants';
import toast from 'react-hot-toast';

/**
 * CaseDetail Page
 * View and manage a specific case with its evidence
 */
const CaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', description: '' });
  const [saving, setSaving] = useState(false);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCase();
  }, [id]);

  const fetchCase = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await caseService.getCaseById(id);
      setCaseData(response.data);
      setEditData({
        title: response.data.title,
        description: response.data.description || ''
      });
    } catch (err) {
      setError(err.error?.message || 'Error al cargar el caso');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!editData.title.trim()) {
      toast.error('El titulo es requerido');
      return;
    }

    setSaving(true);

    try {
      const response = await caseService.updateCase(id, {
        title: editData.title.trim(),
        description: editData.description.trim() || null
      });

      setCaseData((prev) => ({
        ...prev,
        title: response.data.title,
        description: response.data.description
      }));

      setEditing(false);
      toast.success('Caso actualizado exitosamente');
    } catch (err) {
      toast.error(err.error?.message || 'Error al actualizar el caso');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      await caseService.deleteCase(id);
      toast.success('Caso eliminado exitosamente');
      navigate('/cases');
    } catch (err) {
      toast.error(err.error?.message || 'Error al eliminar el caso');
    } finally {
      setDeleting(false);
    }
  };

  const evidenceColumns = [
    {
      key: 'title',
      header: 'Evidencia',
      render: (value, row) => (
        <Link
          to={`/evidence/${row.id}`}
          className="font-medium text-surface-100 hover:text-alina-700"
        >
          {value || 'Sin titulo'}
        </Link>
      )
    },
    {
      key: 'sourceType',
      header: 'Tipo',
      render: (value) => (
        <span className="text-sm text-surface-300">{value}</span>
      )
    },
    {
      key: 'status',
      header: 'Estado',
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${EVIDENCE_STATUS_COLORS[value] || 'bg-surface-900/40 text-surface-300'}`}>
          {EVIDENCE_STATUS_LABELS[value] || value}
        </span>
      )
    },
    {
      key: 'actions',
      header: '',
      render: (_, row) => (
        <Link to={`/evidence/${row.id}`}>
          <Button variant="ghost" size="sm">Ver</Button>
        </Link>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="lg" text="Cargando caso..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link to="/cases">
          <Button variant="ghost" size="sm" icon={ArrowLeft}>
            Volver a Casos
          </Button>
        </Link>
        <Alert type="error" message={error} />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="space-y-6">
        <Link to="/cases">
          <Button variant="ghost" size="sm" icon={ArrowLeft}>
            Volver a Casos
          </Button>
        </Link>
        <Alert type="warning" message="Caso no encontrado" />
      </div>
    );
  }

  const evidence = caseData.evidences || [];
  const hasEvidence = evidence.length > 0;
  const readyForExport = evidence.filter(
    (e) => e.status === 'READY_FOR_EXPORT' || e.status === 'EXPORTED'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/cases">
          <Button variant="ghost" size="sm" icon={ArrowLeft}>
            Volver
          </Button>
        </Link>
      </div>

      {/* Case Info Card */}
      <div className="bg-white/90 rounded-2xl border border-surface-700/35 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-alina-50 rounded-xl flex items-center justify-center">
              <FolderOpen className="w-7 h-7 text-alina-600" />
            </div>
            {!editing ? (
              <div>
                <h1 className="text-2xl font-bold text-surface-50">{caseData.title}</h1>
                {caseData.description && (
                  <p className="text-surface-300 mt-1">{caseData.description}</p>
                )}
              </div>
            ) : (
              <div className="flex-1 max-w-lg space-y-3">
                <Input
                  name="title"
                  value={editData.title}
                  onChange={handleEditChange}
                  placeholder="Titulo del caso"
                  disabled={saving}
                />
                <textarea
                  name="description"
                  value={editData.description}
                  onChange={handleEditChange}
                  placeholder="Descripcion (opcional)"
                  disabled={saving}
                  rows={2}
                  className="block w-full rounded-xl border border-surface-700 bg-white/90 px-4 py-2.5 text-surface-100 placeholder-surface-500 focus:border-alina-500 focus:ring-2 focus:ring-alina-500/20 transition-colors duration-200"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!editing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Edit}
                  onClick={() => setEditing(true)}
                >
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  onClick={() => setDeleteModal(true)}
                  className="text-danger-400 hover:text-danger-400 hover:bg-danger-500/10"
                  disabled={hasEvidence}
                  title={hasEvidence ? 'No puedes eliminar un caso con evidencias' : ''}
                >
                  Eliminar
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Save}
                  onClick={handleSave}
                  loading={saving}
                >
                  Guardar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={X}
                  onClick={() => {
                    setEditing(false);
                    setEditData({
                      title: caseData.title,
                      description: caseData.description || ''
                    });
                  }}
                  disabled={saving}
                >
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-surface-700/35">
          <div>
            <p className="text-sm text-surface-400">Evidencias</p>
            <p className="text-xl font-semibold text-surface-50">{evidence.length}</p>
          </div>
          <div>
            <p className="text-sm text-surface-400">Listas para Exportar</p>
            <p className="text-xl font-semibold text-surface-50">{readyForExport}</p>
          </div>
          <div>
            <p className="text-sm text-surface-400">Fecha Creacion</p>
            <p className="text-sm font-medium text-surface-100">{formatDate(caseData.createdAt)}</p>
          </div>
          <div>
            <Link to={`/exports/create?caseId=${id}`}>
              <Button
                variant="outline"
                size="sm"
                icon={Download}
                disabled={readyForExport === 0}
              >
                Exportar Caso
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Evidence Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-surface-50">Evidencias del Caso</h2>
          <Link to={`/evidence/upload?caseId=${id}`}>
            <Button size="sm" icon={Upload}>
              Agregar Evidencia
            </Button>
          </Link>
        </div>

        {evidence.length === 0 ? (
          <div className="bg-white/90 rounded-2xl border border-surface-700/35 p-12 text-center">
            <FileCheck className="w-12 h-12 text-surface-500 mx-auto mb-4" />
            <h3 className="font-medium text-surface-100 mb-2">Sin evidencias</h3>
            <p className="text-surface-300 mb-6">
              Este caso no tiene evidencias asociadas
            </p>
            <Link to={`/evidence/upload?caseId=${id}`}>
              <Button icon={Upload}>Subir Primera Evidencia</Button>
            </Link>
          </div>
        ) : (
          <Table
            columns={evidenceColumns}
            data={evidence}
            emptyMessage="Sin evidencias en este caso"
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Eliminar Caso"
        message={`Estas seguro de eliminar el caso "${caseData.title}"? Esta accion no se puede deshacer.`}
        confirmText="Eliminar"
        loading={deleting}
      />
    </div>
  );
};

export default CaseDetail;
