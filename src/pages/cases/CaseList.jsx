import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, FileCheck, Search, Trash2 } from 'lucide-react';
import { Button, Input, Table, Loading, Alert } from '../../components/common';
import { ConfirmModal } from '../../components/common/Modal';
import caseService from '../../services/caseService';
import { formatDate } from '../../utils/formatters';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';
import toast from 'react-hot-toast';

/**
 * CaseList Page
 * List all cases with search and pagination
 */
const CaseList = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0
  });

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ open: false, caseId: null, title: '' });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCases();
  }, [pagination.page, search]);

  const fetchCases = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await caseService.getCases({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined
      });

      // Backend devuelve { success, data: { cases: [...], pagination } }
      const casesArray = response?.data?.cases || response?.cases || [];
      setCases(casesArray);

      const paginationData = response?.data?.pagination || response?.pagination;
      if (paginationData) {
        setPagination((prev) => ({
          ...prev,
          total: paginationData.total,
          totalPages: paginationData.totalPages
        }));
      }
    } catch (err) {
      setError(err.error?.message || 'Error al cargar los casos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleDelete = async () => {
    if (!deleteModal.caseId) return;

    setDeleting(true);

    try {
      await caseService.deleteCase(deleteModal.caseId);
      toast.success('Caso eliminado exitosamente');
      setDeleteModal({ open: false, caseId: null, title: '' });
      fetchCases();
    } catch (err) {
      toast.error(err.error?.message || 'Error al eliminar el caso');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Titulo',
      render: (value, row) => (
        <div>
          <Link
            to={`/cases/${row.id}`}
            className="font-medium text-surface-100 hover:text-alina-700"
          >
            {value}
          </Link>
          {row.description && (
            <p className="text-sm text-surface-400 truncate max-w-md">
              {row.description}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'evidenceCount',
      header: 'Evidencias',
      render: (value) => (
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-surface-500" />
          <span>{value || 0}</span>
        </div>
      )
    },
    {
      key: 'createdAt',
      header: 'Fecha Creacion',
      render: (value) => formatDate(value)
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Link to={`/cases/${row.id}`}>
            <Button variant="ghost" size="sm">
              Ver
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteModal({ open: true, caseId: row.id, title: row.title })}
            className="text-danger-400 hover:text-danger-400 hover:bg-danger-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Mis Casos</h1>
          <p className="text-surface-300 mt-1">Gestiona tus expedientes y casos</p>
        </div>
        <Link to="/cases/create">
          <Button icon={Plus}>Nuevo Caso</Button>
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white/90 rounded-2xl border border-surface-700/35 p-4">
        <div className="max-w-md">
          <Input
            placeholder="Buscar por titulo..."
            value={search}
            onChange={handleSearch}
            icon={Search}
          />
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

      {/* Table */}
      <Table
        columns={columns}
        data={cases}
        loading={loading}
        emptyMessage="No tienes casos creados. Crea tu primer caso para comenzar."
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      {/* Empty State with CTA */}
      {!loading && cases.length === 0 && !search && (
        <div className="bg-white/90 rounded-2xl border border-surface-700/35 p-12 text-center">
          <FolderOpen className="w-12 h-12 text-surface-500 mx-auto mb-4" />
          <h3 className="font-medium text-surface-100 mb-2">Sin casos</h3>
          <p className="text-surface-300 mb-6">
            Crea tu primer caso para organizar tus evidencias
          </p>
          <Link to="/cases/create">
            <Button icon={Plus}>Crear Primer Caso</Button>
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, caseId: null, title: '' })}
        onConfirm={handleDelete}
        title="Eliminar Caso"
        message={`Estas seguro de eliminar el caso "${deleteModal.title}"? Esta accion no se puede deshacer. Solo puedes eliminar casos sin evidencias.`}
        confirmText="Eliminar"
        loading={deleting}
      />
    </div>
  );
};

export default CaseList;
