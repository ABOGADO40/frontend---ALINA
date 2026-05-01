import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Calendar } from 'lucide-react';
import { Loading, Alert, Button } from '../components/common';
import { Footer } from '../components/layout';
import legalService from '../services/legalService';
import { formatDateTime } from '../utils/formatters';
import logoAlina from '../assets/logo-alina.jpeg';

/**
 * Privacy Policy Page - publica, accesible desde Landing/Login/Register sin autenticacion
 */
const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await legalService.getPrivacyPolicy();
        setContent(data?.content || '');
        setUpdatedAt(data?.dateTimeModification || data?.dateTimeRegistration || null);
      } catch (err) {
        setError(err.error?.message || 'No se pudo cargar la Politica de Privacidad');
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-page flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-30" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-radial from-alina-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-radial from-cyan-500/8 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-surface-700/30">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-alina-600 via-cyan-500 to-alina-500" />
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center group">
            <img
              src={logoAlina}
              alt="ALINA - Prueba Digital"
              className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(15,181,179,0.3)]"
            />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:block px-4 py-2 text-surface-300 hover:text-alina-600 font-medium transition-colors">
              Iniciar Sesion
            </Link>
            <Link to="/register">
              <Button size="sm">Registrarse</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 pt-28 pb-16 px-4 relative">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-surface-300 hover:text-alina-600 mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Atras</span>
          </button>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card shadow-prismatic border border-surface-700/35 p-6 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-alina-600 via-cyan-500 to-alina-500" />

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-alina-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-surface-50 font-display">
                  Politica de Privacidad
                </h1>
                {updatedAt && (
                  <p className="text-sm text-surface-400 mt-1 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Ultima actualizacion: {formatDateTime(updatedAt)}
                  </p>
                )}
              </div>
            </div>

            {loading && (
              <div className="py-10">
                <Loading message="Cargando..." />
              </div>
            )}

            {error && !loading && (
              <Alert type="error" message={error} className="mb-4" />
            )}

            {!loading && !error && (
              content.trim().length > 0 ? (
                <div className="prose-legal whitespace-pre-wrap text-surface-100 leading-relaxed text-[15px]">
                  {content}
                </div>
              ) : (
                <Alert
                  type="info"
                  message="Aun no se ha publicado la Politica de Privacidad. Vuelva a intentarlo mas tarde."
                />
              )
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
