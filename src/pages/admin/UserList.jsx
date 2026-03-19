import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  User
} from 'lucide-react';
import { Button, Input, Table, Loading, Alert } from '../../components/common';
import userService from '../../services/userService';
import { formatDate } from '../../utils/formatters';
import { DEFAULT_PAGE_SIZE, USER_ROLES } from '../../utils/constants';
import toast from 'react-hot-toast';

/**
 * UserList Page (Admin)
 * List and manage all users
 */
const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, search, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await userService.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        role: roleFilter || undefined,
        isActive: statusFilter !== '' ? statusFilter === 'true' : undefined
      });

      // Backend devuelve { success, data: { users: [...], pagination } }
      const usersArray = response?.data?.users || response?.users || [];
      setUsers(usersArray);

      const paginationData = response?.data?.pagination || response?.pagination;
      if (paginationData) {
        setPagination((prev) => ({
          ...prev,
          total: paginationData.total,
          totalPages: paginationData.totalPages
        }));
      }
    } catch (err) {
      setError(err.error?.message || 'Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleRoleFilter = (e) => {
    setRoleFilter(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await userService.toggleUserStatus(userId, !currentStatus);
      toast.success(currentStatus ? 'Usuario desactivado' : 'Usuario activado');
      fetchUsers();
    } catch (err) {
      toast.error(err.error?.message || 'Error al cambiar estado');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const columns = [
    {
      key: 'fullName',
      header: 'Usuario',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-alina-50 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-alina-600" />
          </div>
          <div>
            <p className="font-medium text-surface-50">{value}</p>
            <p className="text-sm text-surface-400">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'roles',
      header: 'Rol',
      render: (value) => {
        const role = Array.isArray(value) ? value[0] : value;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-700' : 'bg-alina-50 text-alina-700'}`}>
            {role === 'SUPER_ADMIN' ? 'Administrador' : 'Cliente'}
          </span>
        );
      }
    },
    {
      key: 'isActive',
      header: 'Estado',
      render: (value) => (
        <div className="flex items-center gap-2">
          {value ? (
            <>
              <CheckCircle className="w-4 h-4 text-success-400" />
              <span className="text-sm text-success-700">Activo</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-danger-400" />
              <span className="text-sm text-danger-700">Inactivo</span>
            </>
          )}
        </div>
      )
    },
    {
      key: 'createdAt',
      header: 'Fecha Registro',
      render: (value) => (
        <span className="text-sm text-surface-300">{formatDate(value)}</span>
      )
    },
    {
      key: 'actions',
      header: '',
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleToggleStatus(row.id, row.isActive)}
        >
          {row.isActive ? 'Desactivar' : 'Activar'}
        </Button>
      )
    }
  ];

  const hasActiveFilters = search || roleFilter || statusFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Usuarios</h1>
          <p className="text-surface-300 mt-1">Administracion de usuarios del sistema</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          onClick={fetchUsers}
          disabled={loading}
        >
          Actualizar
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/90 rounded-2xl border border-surface-700/35 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Buscar por nombre o email..."
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
                {[search, roleFilter, statusFilter].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-surface-700/35">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-300">Rol</label>
                <select
                  value={roleFilter}
                  onChange={handleRoleFilter}
                  className="block w-full rounded-xl border border-surface-700 px-4 py-2.5 text-surface-200 focus:border-alina-500 focus:ring-2 focus:ring-alina-500/20 appearance-none bg-white"
                >
                  <option value="">Todos los roles</option>
                  <option value="SUPER_ADMIN">Administrador</option>
                  <option value="CLIENT">Cliente</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-300">Estado</label>
                <select
                  value={statusFilter}
                  onChange={handleStatusFilter}
                  className="block w-full rounded-xl border border-surface-700 px-4 py-2.5 text-surface-200 focus:border-alina-500 focus:ring-2 focus:ring-alina-500/20 appearance-none bg-white"
                >
                  <option value="">Todos</option>
                  <option value="true">Activos</option>
                  <option value="false">Inactivos</option>
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
        data={users}
        loading={loading}
        emptyMessage="No se encontraron usuarios"
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default UserList;
