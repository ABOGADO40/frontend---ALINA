import { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  User,
  Activity
} from 'lucide-react';
import { Button, Input, Table, Loading, Alert } from '../../components/common';
import auditService from '../../services/auditService';
import { formatDateTime } from '../../utils/formatters';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

/**
 * AuditLog Page (Admin)
 * View system audit logs
 */
const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    from: '',
    to: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await auditService.getAuditLogs({
        page: pagination.page,
        limit: pagination.limit,
        action: filters.action || undefined,
        entityType: filters.entityType || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined
      });

      // Backend devuelve { success, data: { logs: [...], pagination } }
      const logsArray = response?.data?.logs || response?.logs || [];
      setLogs(logsArray);

      const paginationData = response?.data?.pagination || response?.pagination;
      if (paginationData) {
        setPagination((prev) => ({
          ...prev,
          total: paginationData.total,
          totalPages: paginationData.totalPages
        }));
      }
    } catch (err) {
      setError(err.error?.message || 'Error al cargar los logs de auditoria');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      entityType: '',
      from: '',
      to: ''
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const actionTypes = auditService.getActionTypes();
  const entityTypes = auditService.getEntityTypes();
  const hasActiveFilters = Object.values(filters).some(Boolean);

  const columns = [
    {
      key: 'performedAt',
      header: 'Fecha/Hora',
      render: (value) => (
        <span className="text-sm text-surface-300 whitespace-nowrap">
          {formatDateTime(value)}
        </span>
      )
    },
    {
      key: 'actor',
      header: 'Usuario',
      render: (value) =>
        value ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-surface-900/40 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-surface-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-surface-50">{value.fullName}</p>
              <p className="text-xs text-surface-400">{value.email}</p>
            </div>
          </div>
        ) : (
          <span className="text-sm text-surface-500">Sistema</span>
        )
    },
    {
      key: 'action',
      header: 'Accion',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-900/40 text-surface-300">
          {auditService.formatAction(value)}
        </span>
      )
    },
    {
      key: 'entityType',
      header: 'Entidad',
      render: (value, row) => (
        <div className="text-sm">
          <p className="text-surface-50">{auditService.formatEntityType(value)}</p>
          {row.entityId && (
            <p className="text-xs text-surface-400 font-mono">ID: {row.entityId}</p>
          )}
        </div>
      )
    },
    {
      key: 'metadata',
      header: 'Detalles',
      render: (value) =>
        value && Object.keys(value).length > 0 ? (
          <details className="cursor-pointer">
            <summary className="text-sm text-alina-600 hover:text-alina-700">
              Ver detalles
            </summary>
            <pre className="mt-2 text-xs bg-surface-900/40 p-2 rounded overflow-x-auto max-w-xs">
              {JSON.stringify(value, null, 2)}
            </pre>
          </details>
        ) : (
          <span className="text-sm text-surface-500">-</span>
        )
    },
    {
      key: 'ipAddress',
      header: 'IP',
      render: (value) => (
        <span className="text-xs text-surface-400 font-mono">{value || '-'}</span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Log de Auditoria</h1>
          <p className="text-surface-300 mt-1">Registro de todas las acciones del sistema</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          onClick={fetchLogs}
          disabled={loading}
        >
          Actualizar
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white/90 rounded-2xl border border-surface-700/35 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            size="sm"
            icon={Filter}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros
            {hasActiveFilters && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-alina-50 text-alina-700 rounded-full text-xs">
                {Object.values(filters).filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-surface-700/35">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-300">Accion</label>
                <select
                  name="action"
                  value={filters.action}
                  onChange={handleFilterChange}
                  className="block w-full rounded-xl border border-surface-700 px-4 py-2.5 text-surface-200 focus:border-alina-500 focus:ring-2 focus:ring-alina-500/20 appearance-none bg-white"
                >
                  <option value="">Todas</option>
                  {actionTypes.map((action) => (
                    <option key={action} value={action}>
                      {auditService.formatAction(action)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-300">Entidad</label>
                <select
                  name="entityType"
                  value={filters.entityType}
                  onChange={handleFilterChange}
                  className="block w-full rounded-xl border border-surface-700 px-4 py-2.5 text-surface-200 focus:border-alina-500 focus:ring-2 focus:ring-alina-500/20 appearance-none bg-white"
                >
                  <option value="">Todas</option>
                  {entityTypes.map((type) => (
                    <option key={type} value={type}>
                      {auditService.formatEntityType(type)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-300">Desde</label>
                <input
                  type="date"
                  name="from"
                  value={filters.from}
                  onChange={handleFilterChange}
                  className="block w-full rounded-xl border border-surface-700 px-4 py-2.5 text-surface-200 focus:border-alina-500 focus:ring-2 focus:ring-alina-500/20 bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-300">Hasta</label>
                <input
                  type="date"
                  name="to"
                  value={filters.to}
                  onChange={handleFilterChange}
                  className="block w-full rounded-xl border border-surface-700 px-4 py-2.5 text-surface-200 focus:border-alina-500 focus:ring-2 focus:ring-alina-500/20 bg-white"
                />
              </div>

              <div className="flex items-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpiar
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
        data={logs}
        loading={loading}
        emptyMessage="No se encontraron registros de auditoria"
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      {/* Summary */}
      {!loading && logs.length > 0 && (
        <div className="bg-surface-900/40 rounded-2xl p-4">
          <p className="text-sm text-surface-300">
            Mostrando {logs.length} de {pagination.total} registros
          </p>
        </div>
      )}
    </div>
  );
};

export default AuditLog;
