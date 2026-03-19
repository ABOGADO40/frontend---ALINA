import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Button from './Button';

const Table = ({
  columns,
  data,
  loading = false,
  emptyMessage = 'No hay datos para mostrar',
  emptyIcon: EmptyIcon = null,
  pagination = null,
  onPageChange = null,
  className = ''
}) => {
  const renderCell = (row, column) => {
    if (column.render) {
      return column.render(row[column.key], row);
    }
    return row[column.key] ?? '-';
  };

  return (
    <div className={`bg-white/95 rounded-2xl border border-surface-700/35 shadow-card overflow-hidden ${className}`}>
      {/* Table wrapper */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          {/* Header */}
          <thead>
            <tr className="bg-surface-900/50 border-b border-surface-700/40">
              {columns.map((column, index) => (
                <th
                  key={column.key}
                  className={`
                    px-6 py-4 text-left text-xs font-bold
                    text-surface-400 uppercase tracking-wider
                    ${column.className || ''}
                    ${index === 0 ? 'rounded-tl-2xl' : ''}
                    ${index === columns.length - 1 ? 'rounded-tr-2xl' : ''}
                  `}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center gap-2">
                    {column.icon && <column.icon className="w-4 h-4 text-alina-600" />}
                    {column.label}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-surface-700/25">
            {loading ? (
              [...Array(5)].map((_, rowIndex) => (
                <tr key={rowIndex} className="animate-pulse">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
                      <div className="h-4 bg-surface-700/30 rounded-full w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center">
                    {EmptyIcon && (
                      <div className="w-16 h-16 bg-alina-50 rounded-2xl flex items-center justify-center mb-4">
                        <EmptyIcon className="w-8 h-8 text-alina-600" />
                      </div>
                    )}
                    <p className="text-surface-400 font-medium">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className={`
                    transition-all duration-200
                    hover:bg-alina-50/20
                    ${rowIndex % 2 === 1 ? 'bg-surface-900/25' : ''}
                  `}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`
                        px-6 py-4 text-sm text-surface-300
                        ${column.cellClassName || ''}
                      `}
                    >
                      {renderCell(row, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-4 border-t border-surface-700/35 bg-surface-900/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Info */}
            <div className="text-sm text-surface-400">
              Mostrando{' '}
              <span className="font-semibold text-surface-200">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{' '}
              a{' '}
              <span className="font-semibold text-surface-200">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              de{' '}
              <span className="font-semibold text-surface-200">{pagination.total}</span>{' '}
              resultados
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onPageChange?.(1)}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg text-surface-400 hover:text-alina-600 hover:bg-alina-50/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                title="Primera pagina"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg text-surface-400 hover:text-alina-600 hover:bg-alina-50/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                title="Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange?.(pageNum)}
                      className={`
                        min-w-[36px] h-9 px-3 rounded-lg text-sm font-semibold
                        transition-all duration-200
                        ${pagination.page === pageNum
                          ? 'bg-gradient-to-r from-alina-500 to-alina-600 text-white shadow-sm shadow-alina-500/25'
                          : 'text-surface-300 hover:bg-alina-50/50 hover:text-alina-600'
                        }
                      `}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-lg text-surface-400 hover:text-alina-600 hover:bg-alina-50/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                title="Siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onPageChange?.(pagination.totalPages)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-lg text-surface-400 hover:text-alina-600 hover:bg-alina-50/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                title="Ultima pagina"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
