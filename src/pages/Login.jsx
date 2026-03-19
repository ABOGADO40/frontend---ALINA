import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { Button, Input, Alert } from '../components/common';
import { useAuth } from '../features/auth/useAuth';
import logoAlina from '../assets/logo-alina.jpeg';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    setApiError(null);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'El correo es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Ingrese un correo valido';
    if (!formData.password) newErrors.password = 'La contrasena es requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiError(null);
    const result = await login(formData.email, formData.password);
    if (result.success) navigate(from, { replace: true });
    else setApiError(result.error);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-page flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-radial from-alina-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-radial from-cyan-500/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-alina-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 pattern-dots opacity-30" />
      </div>

      {/* Header */}
      <nav className="relative h-16 glass-effect border-b border-surface-700/30">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-alina-600 via-cyan-500 to-alina-500" />
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
          <Link to="/" className="flex items-center group">
            <img
              src={logoAlina}
              alt="ALINA - Prueba Digital"
              className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(15,181,179,0.3)]"
            />
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-prismatic border border-surface-700/35 p-8 relative overflow-hidden">
            {/* Gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-alina-600 via-cyan-500 to-alina-500" />

            {/* Header */}
            <div className="text-center mb-8">
              <img
                src={logoAlina}
                alt="ALINA powered by SOFTIA"
                className="h-20 w-auto object-contain mx-auto mb-4 drop-shadow-[0_0_15px_rgba(15,181,179,0.3)]"
              />
              <h1 className="text-2xl font-bold text-surface-50 font-display">Iniciar Sesion</h1>
              <p className="text-surface-400 mt-2">
                Ingresa tus credenciales para acceder
              </p>
            </div>

            {apiError && (
              <Alert type="error" message={apiError} className="mb-6" dismissible onDismiss={() => setApiError(null)} />
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input label="Correo electronico" name="email" type="email" placeholder="tu@correo.com" value={formData.email} onChange={handleChange} error={errors.email} icon={Mail} autoComplete="email" required disabled={submitting} />
              <Input label="Contrasena" name="password" type="password" placeholder="Tu contrasena" value={formData.password} onChange={handleChange} error={errors.password} icon={Lock} autoComplete="current-password" required disabled={submitting} />
              <Button type="submit" fullWidth loading={submitting} disabled={loading} size="lg">
                Iniciar Sesion
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-surface-700/35 text-center">
              <p className="text-surface-400">
                No tienes una cuenta?{' '}
                <Link to="/register" className="font-semibold text-alina-600 hover:text-alina-700 transition-colors">
                  Registrate aqui
                </Link>
              </p>
            </div>
          </div>

          <Link to="/" className="mt-6 flex items-center justify-center gap-2 text-surface-400 hover:text-alina-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
