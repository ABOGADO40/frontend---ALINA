import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Download,
  FileArchive,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button, Table, Loading, Alert } from '../../components/common';
import exportService from '../../services/exportService';
import { formatDate, formatDateTime, formatFileSize } from '../../utils/formatters';
import {
  DEFAULT_PAGE_SIZE,
  EXPORT_STATUS,
  EXPORT_STATUS_LABELS
} from '../../utils/constants';
import toast from 'react-hot-toast';

/**
 * ExportList Page
 * List all forensic exports
 */
const ExportList = () => {
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0
  });

  // Polling for status updates
  const [pollingIds, setPollingIds] = useState([]);

  useEffect(() => {
    fetchExports();
  }, [pagination.page]);

  // Poll for creating exports
  useEffect(() => {
    if (pollingIds.length === 0) return;

    const interval = setInterval(async () => {
      let hasUpdates = false;

      for (const id of pollingIds) {
        try {
          const result = await exportService.checkStatus(id);
          if (result.isReady || result.status === 'ERROR') {
            hasUpdates = true;
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }

      if (hasUpdates) {
        fetchExports();
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [pollingIds]);

  const fetchExports = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await exportService.getExports({
        page: pagination.page,
        limit: pagination.limit
      });

      // Backend devuelve { success, data: { exports: [...], pagination } }
      const exportsArray = response?.data?.exports || response?.exports || [];
      setExports(exportsArray);

      // Track creating exports for polling
      const creating = exportsArray
        .filter((e) => e.status === 'CREATING')
        .map((e) => e.id);
      setPollingIds(creating);

      const paginationData = response?.data?.pagination || response?.pagination;
      if (paginationData) {
        setPagination((prev) => ({
          ...prev,
          total: paginationData.total,
          totalPages: paginationData.totalPages
        }));
      }
    } catch (err) {
      setError(err.error?.message || 'Error al cargar las exportaciones');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleDownload = async (exportItem) => {
    if (exportItem.status !== 'READY') {
      toast.error('La exportacion aun no esta lista');
      return;
    }

    try {
      const blob = await exportService.downloadExport(exportItem.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportItem.file?.filename || `export-${exportItem.id}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Descarga iniciada');
    } catch (err) {
      toast.error(err.error?.message || 'Error al descargar');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CREATING':
        return <Clock className="w-4 h-4 text-alina-600 animate-pulse" />;
      case 'READY':
        return <CheckCircle className="w-4 h-4 text-success-400" />;
      case 'ERROR':
        return <AlertCircle className="w-4 h-4 text-danger-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CREATING':
        return 'bg-alina-50 text-alina-700';
      case 'READY':
        return 'bg-success-50 text-success-700';
      case 'ERROR':
        return 'bg-danger-50 text-danger-700';
      default:
        return 'bg-surface-900/40 text-surface-300';
    }
  };

  const columns = [
    {
      key: 'scope',
      header: 'Tipo',
      render: (value, row) => {
        // Determinar el tipo de exportación
        let tipoLabel = 'Múltiples';
        if (value === 'SINGLE_EVIDENCE') {
          tipoLabel = 'Evidencia';
        } else if (value === 'FULL_CASE') {
          tipoLabel = 'Caso';
        } else if (value === 'MULTIPLE_EVIDENCE') {
          tipoLabel = `${row.evidenceCount || 0} Evidencia${row.evidenceCount !== 1 ? 's' : ''}`;
        }

        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <FileArchive className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="font-medium text-surface-50">{tipoLabel}</p>
              <p className="text-sm text-surface-400">
                {row.displayTitle || row.evidence?.title || row.case?.title || '-'}
              </p>
            </div>
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Estado',
      render: (value) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(value)}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
            {EXPORT_STATUS_LABELS[value] || value}
          </span>
        </div>
      )
    },
    {
      key: 'file',
      header: 'Archivo',
      render: (value, row) =>
        row.status === 'READY' && value ? (
          <div className="text-sm">
            <p className="text-surface-50">{value.filename}</p>
            <p className="text-surface-400">{formatFileSize(value.sizeBytes)}</p>
          </div>
        ) : row.status === 'CREATING' ? (
          <span className="text-sm text-surface-400">Generando...</span>
        ) : (
          <span className="text-sm text-surface-500">-</span>
        )
    },
    {
      key: 'createdAt',
      header: 'Fecha',
      render: (value) => (
        <span className="text-sm text-surface-300">{formatDateTime(value)}</span>
      )
    },
    {
      key: 'actions',
      header: '',
      render: (_, row) => (
        <Button
          variant="outline"
          size="sm"
          icon={Download}
          onClick={() => handleDownload(row)}
          disabled={row.status !== 'READY'}
        >
          Descargar
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Mis Exportaciones</h1>
          <p className="text-surface-300 mt-1">Paquetes ZIP forenses generados</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={fetchExports}
            disabled={loading}
          >
            Actualizar
          </Button>
          <Link to="/exports/create">
            <Button icon={Plus}>Nueva Exportacion</Button>
          </Link>
        </div>
      </div>

      {/* Info about creating exports */}
      {pollingIds.length > 0 && (
        <Alert
          type="info"
          title="Exportaciones en proceso"
          message={`${pollingIds.length} exportacion(es) se estan generando. La pagina se actualizara automaticamente.`}
        />
      )}

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
        data={exports}
        loading={loading}
        emptyMessage="No tienes exportaciones. Crea tu primera exportacion forense."
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      {/* Empty State with CTA */}
      {!loading && exports.length === 0 && (
        <div className="bg-white/90 rounded-2xl border border-surface-700/35 p-12 text-center">
          <FileArchive className="w-12 h-12 text-surface-500 mx-auto mb-4" />
          <h3 className="font-medium text-surface-50 mb-2">Sin exportaciones</h3>
          <p className="text-surface-300 mb-6">
            Crea tu primera exportacion forense para generar un paquete ZIP cifrado
            con toda la documentacion de tus evidencias.
          </p>
          <Link to="/exports/create">
            <Button icon={Plus}>Crear Primera Exportacion</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ExportList;
