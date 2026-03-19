import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderOpen, FileCheck, Download, Upload, ArrowRight, CheckCircle,
  Sparkles, TrendingUp, Clock, Shield
} from 'lucide-react';
import { Button, Loading, Alert } from '../components/common';
import { useAuth } from '../features/auth/useAuth';
import caseService from '../services/caseService';
import evidenceService from '../services/evidenceService';
import exportService from '../services/exportService';
import { EVIDENCE_STATUS_LABELS, EVIDENCE_STATUS_COLORS } from '../utils/constants';

const Dashboard = () => {
  const { user, isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ cases: { total: 0 }, evidence: { total: 0, byStatus: {} }, exports: { total: 0, ready: 0 } });
  const [recentEvidence, setRecentEvidence] = useState([]);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [casesRes, evidenceRes, exportsRes] = await Promise.all([
        caseService.getCases({ limit: 100 }),
        evidenceService.getEvidence({ limit: 5 }),
        exportService.getExports({ limit: 100 })
      ]);
      const casesData = casesRes?.data?.cases || casesRes?.cases || [];
      const evidenceData = evidenceRes?.data?.evidences || evidenceRes?.evidences || [];
      const evidenceByStatus = {};
      evidenceData.forEach((e) => { evidenceByStatus[e.status] = (evidenceByStatus[e.status] || 0) + 1; });
      const exportsData = exportsRes?.data?.exports || exportsRes?.exports || [];
      const readyExports = exportsData.filter((e) => e.status === 'READY').length;
      setStats({
        cases: { total: casesRes?.data?.pagination?.total || casesData.length },
        evidence: { total: evidenceRes?.data?.pagination?.total || evidenceData.length, byStatus: evidenceByStatus },
        exports: { total: exportsRes?.data?.pagination?.total || exportsData.length, ready: readyExports }
      });
      setRecentEvidence(evidenceData);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.error?.message || 'Error al cargar el dashboard');
    } finally { setLoading(false); }
  };

  const quickActions = [
    { label: 'Nuevo Caso', description: 'Crear un nuevo expediente', icon: FolderOpen, path: '/cases/create', gradient: 'from-alina-500 to-alina-600', shadow: 'shadow-alina-500/20', iconBg: 'bg-alina-50 text-alina-600' },
    { label: 'Subir Evidencia', description: 'Incorporar nueva evidencia', icon: Upload, path: '/evidence/upload', gradient: 'from-cyan-600 to-cyan-500', shadow: 'shadow-cyan-500/20', iconBg: 'bg-cyan-50 text-cyan-600' },
    { label: 'Exportar', description: 'Crear paquete forense', icon: Download, path: '/exports/create', gradient: 'from-accent-500 to-accent-600', shadow: 'shadow-accent-500/20', iconBg: 'bg-accent-50 text-accent-600' }
  ];

  const statCards = [
    { label: 'Casos', value: stats.cases.total, icon: FolderOpen, gradient: 'from-alina-500 to-alina-600', iconBg: 'bg-alina-50', textColor: 'text-alina-600', path: '/cases' },
    { label: 'Evidencias', value: stats.evidence.total, icon: FileCheck, gradient: 'from-cyan-500 to-cyan-600', iconBg: 'bg-cyan-50', textColor: 'text-cyan-600', path: '/evidence' },
    { label: 'Exportaciones', value: stats.exports.total, icon: Download, gradient: 'from-accent-500 to-accent-600', iconBg: 'bg-accent-50', textColor: 'text-accent-600', path: '/exports' },
    { label: 'Listas para Exportar', value: stats.exports.ready, icon: CheckCircle, gradient: 'from-success-500 to-success-600', iconBg: 'bg-success-50', textColor: 'text-success-600', path: '/evidence?status=READY_FOR_EXPORT' }
  ];

  const getStatusClasses = (status) => {
    const classes = {
      RECEIVED: 'bg-alina-50 text-alina-700 border-alina-500/30',
      SCANNED_OK: 'bg-cyan-50 text-cyan-700 border-cyan-500/30',
      HASHED: 'bg-alina-50 text-alina-700 border-alina-500/30',
      CLONED_BITCOPY: 'bg-success-50 text-success-700 border-success-500/30',
      SEALED: 'bg-accent-50 text-accent-700 border-accent-500/30',
      ANALYZED: 'bg-cyan-50 text-cyan-700 border-cyan-500/30',
      READY_FOR_EXPORT: 'bg-success-50 text-success-700 border-success-500/30',
      EXPORTED: 'bg-alina-50 text-alina-700 border-alina-500/30',
      ERROR: 'bg-danger-50 text-danger-700 border-danger-500/30'
    };
    return classes[status] || 'bg-surface-700 text-surface-300 border-surface-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading variant="brand" size="lg" text="Cargando dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-alina-600 via-alina-500 to-cyan-600 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-glow-teal-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 pattern-dots" />
        </div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold">
                  Bienvenido, {user?.fullName?.split(' ')[0]}
                </h1>
                <Sparkles className="w-6 h-6 text-accent-300" />
              </div>
              <p className="text-alina-100 mt-1">
                {isSuperAdmin() ? 'Panel de administracion del sistema' : 'Panel de gestion de evidencias digitales'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
            <Clock className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {error && <Alert type="error" message={error} dismissible onDismiss={() => setError(null)} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.path}
            className="group bg-white/90 rounded-2xl border border-surface-700/35 p-6 shadow-card shadow-prismatic hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 hover:border-alina-500/25 animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl ${stat.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-7 h-7 ${stat.textColor}`} />
              </div>
              <div>
                <p className="text-3xl font-bold text-surface-50">{stat.value}</p>
                <p className="text-sm text-surface-400">{stat.label}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs text-alina-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              <TrendingUp className="w-3 h-3" />
              Ver detalles
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-surface-50 mb-4 font-display flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-500" />
          Acciones Rapidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className="group relative overflow-hidden bg-white/90 rounded-2xl border border-surface-700/35 p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 hover:border-alina-500/25 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg ${action.shadow} group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-surface-100 text-lg mb-1 group-hover:text-alina-600 transition-colors">
                {action.label}
              </h3>
              <p className="text-sm text-surface-400">{action.description}</p>
              <ArrowRight className="absolute top-6 right-6 w-5 h-5 text-surface-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Evidence */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-surface-50 font-display">Evidencias Recientes</h2>
          <Link to="/evidence">
            <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">Ver todas</Button>
          </Link>
        </div>

        {recentEvidence.length === 0 ? (
          <div className="bg-white/90 rounded-2xl border border-surface-700/35 shadow-card p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-alina-50 rounded-2xl flex items-center justify-center">
              <FileCheck className="w-10 h-10 text-alina-600" />
            </div>
            <h3 className="font-bold text-surface-100 text-lg mb-2">Sin evidencias</h3>
            <p className="text-surface-400 mb-6">Aun no has subido ninguna evidencia</p>
            <Link to="/evidence/upload">
              <Button icon={Upload}>Subir Primera Evidencia</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white/90 rounded-2xl border border-surface-700/35 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-900/40 border-b border-surface-700/35">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-surface-400 uppercase tracking-wider">Titulo</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-surface-400 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-surface-400 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-surface-400 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-700/25">
                  {recentEvidence.map((evidence, index) => (
                    <tr key={evidence.id} className={`hover:bg-alina-50/30 transition-colors ${index % 2 === 1 ? 'bg-surface-900/20' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-surface-100">{evidence.title || 'Sin titulo'}</div>
                        <div className="text-sm text-surface-400">{evidence.originalFile?.filename || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-alina-50 text-alina-700 border border-alina-500/30">
                          {evidence.sourceType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusClasses(evidence.status)}`}>
                          {EVIDENCE_STATUS_LABELS[evidence.status] || evidence.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link to={`/evidence/${evidence.id}`} className="inline-flex items-center gap-1 text-alina-600 hover:text-alina-700 text-sm font-medium transition-colors group">
                          Ver detalle
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Evidence Status Distribution */}
      {Object.keys(stats.evidence.byStatus).length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-surface-50 mb-4 font-display">Estado de Evidencias</h2>
          <div className="bg-white/90 rounded-2xl border border-surface-700/35 shadow-card p-6">
            <div className="flex flex-wrap gap-3">
              {Object.entries(stats.evidence.byStatus).map(([status, count]) => (
                <div key={status} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${getStatusClasses(status)}`}>
                  <span className="text-sm font-medium">{EVIDENCE_STATUS_LABELS[status] || status}</span>
                  <span className="font-bold text-lg">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
