import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  FileCheck,
  Search,
  Filter,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { Button, Input, Table, Loading, Alert } from '../../components/common';
import { ConfirmModal } from '../../components/common/Modal';
import toast from 'react-hot-toast';
import evidenceService from '../../services/evidenceService';
import { formatDate, formatFileSize } from '../../utils/formatters';
import {
  DEFAULT_PAGE_SIZE,
  EVIDENCE_STATUS,
  EVIDENCE_STATUS_LABELS,
  EVIDENCE_STATUS_COLORS,
  SOURCE_TYPES,
  SOURCE_TYPE_LABELS
} from '../../utils/constants';

/**
 * EvidenceList Page
 * List all evidence with filters and pagination
 */
const EvidenceList = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('sourceType') || '');
  const [showFilters, setShowFilters] = useState(false);

  // Estados para eliminar evidencia
  const [deleteModal, setDeleteModal] = useState({ open: false, evidenceId: null, title: '' });
  const [deleting, setDeleting] = useState(false);

  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page')) || 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchEvidence();
  }, [pagination.page, search, statusFilter, typeFilter]);

  const fetchEvidence = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await evidenceService.getEvidence({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        status: statusFilter || undefined,
        sourceType: typeFilter || undefined
      });

      // Backend devuelve { success, data: { evidences: [...], pagination } }
      const evidenceArray = response?.data?.evidences || response?.evidences || [];
      setEvidence(evidenceArray);

      const paginationData = response?.data?.pagination || response?.pagination;
      if (paginationData) {
        setPagination((prev) => ({
          ...prev,
          total: paginationData.total,
          totalPages: paginationData.totalPages
        }));
      }
    } catch (err) {
      setError(err.error?.message || 'Error al cargar las evidencias');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleTypeFilter = (e) => {
    setTypeFilter(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setTypeFilter('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDelete = async () => {
    if (!deleteModal.evidenceId) return;

    setDeleting(true);

    try {
      await evidenceService.deleteEvidence(deleteModal.evidenceId);
      toast.success('Evidencia eliminada exitosamente');
      setDeleteModal({ open: false, evidenceId: null, title: '' });
      fetchEvidence();
    } catch (err) {
      toast.error(err.error?.message || 'Error al eliminar la evidencia');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Evidencia',
      render: (value, row) => (
        <div>
          <Link
            to={`/evidence/${row.id}`}
            className="font-medium text-surface-50 hover:text-alina-700"
          >
            {value || 'Sin titulo'}
          </Link>
          <div className="text-sm text-surface-400 flex items-center gap-2 mt-1">
            <span>{row.originalFile?.filename || '-'}</span>
            <span className="text-surface-500">|</span>
            <span>{formatFileSize(row.originalFile?.size)}</span>
          </div>
        </div>
      )
    },
    {
      key: 'sourceType',
      header: 'Tipo',
      render: (value) => (
        <span className="text-sm text-surface-300">
          {SOURCE_TYPE_LABELS[value] || value}
        </span>
      )
    },
    {
      key: 'caseName',
      header: 'Caso',
      render: (value, row) =>
        row.caseId ? (
          <Link
            to={`/cases/${row.caseId}`}
            className="text-sm text-alina-600 hover:text-alina-700"
          >
            {value || 'Ver caso'}
          </Link>
        ) : (
          <span className="text-sm text-surface-500">Sin caso</span>
        )
    },
    {
      key: 'status',
      header: 'Estado',
      render: (value) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            EVIDENCE_STATUS_COLORS[value] || 'bg-surface-900/40 text-surface-200'
          }`}
        >
          {EVIDENCE_STATUS_LABELS[value] || value}
        </span>
      )
    },
    {
      key: 'createdAt',
      header: 'Fecha',
      render: (value) => (
        <span className="text-sm text-surface-300">{formatDate(value)}</span>
      )
    },
    {
      key: 'actions',
      header: '',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Link to={`/evidence/${row.id}`}>
            <Button variant="ghost" size="sm">
              Ver
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setDeleteModal({ open: true, evidenceId: row.id, title: row.title })
            }
            className="text-danger-400 hover:text-danger-400 hover:bg-danger-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  const hasActiveFilters = search || statusFilter || typeFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Mis Evidencias</h1>
          <p className="text-surface-300 mt-1">Gestiona todas tus evidencias digitales</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={fetchEvidence}
            disabled={loading}
          >
            Actualizar
          </Button>
          <Link to="/evidence/upload">
            <Button icon={Plus}>Subir Evidencia</Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/90 rounded-2xl border border-surface-700/35 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Buscar por titulo o archivo..."
              value={search}
              onChange={handleSearch}
              icon={Search}
            />
          </div>
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            size="sm"
            icon={Filter}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros
            {hasActiveFilters && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-alina-50 text-alina-700 rounded-full text-xs">
                {[search, statusFilter, typeFilter].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-surface-700/35">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-300">Estado</label>
                <select
                  value={statusFilter}
                  onChange={handleStatusFilter}
                  className="block w-full rounded-xl border border-surface-700 bg-white px-4 py-2.5 text-surface-200 focus:border-alina-500 focus:ring-2 focus:ring-alina-500/20 appearance-none"
                >
                  <option value="">Todos los estados</option>
                  {Object.entries(EVIDENCE_STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-300">Tipo</label>
                <select
                  value={typeFilter}
                  onChange={handleTypeFilter}
                  className="block w-full rounded-xl border border-surface-700 bg-white px-4 py-2.5 text-surface-200 focus:border-alina-500 focus:ring-2 focus:ring-alina-500/20 appearance-none"
                >
                  <option value="">Todos los tipos</option>
                  {Object.entries(SOURCE_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              </div>
            </div>
          </div>
        )}
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

      {/* Table */}
      <Table
        columns={columns}
        data={evidence}
        loading={loading}
        emptyMessage="No tienes evidencias. Sube tu primera evidencia para comenzar."
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      {/* Empty State with CTA */}
      {!loading && evidence.length === 0 && !hasActiveFilters && (
        <div className="bg-white/90 rounded-2xl border border-surface-700/35 p-12 text-center">
          <FileCheck className="w-12 h-12 text-surface-500 mx-auto mb-4" />
          <h3 className="font-medium text-surface-50 mb-2">Sin evidencias</h3>
          <p className="text-surface-300 mb-6">
            Sube tu primera evidencia para comenzar a proteger tu informacion digital
          </p>
          <Link to="/evidence/upload">
            <Button icon={Plus}>Subir Primera Evidencia</Button>
          </Link>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, evidenceId: null, title: '' })}
        onConfirm={handleDelete}
        title="Eliminar Evidencia"
        message={`¿Estas seguro de eliminar la evidencia "${deleteModal.title || 'Sin titulo'}"? Dejara de estar disponible en tu listado.`}
        confirmText="Eliminar"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default EvidenceList;
