import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, User, Phone, CreditCard, Sparkles, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button, Input, Alert } from '../components/common';
import { useAuth } from '../features/auth/useAuth';
import logoAlina from '../assets/logo-alina.jpeg';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '', dni: '', ruc: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    setApiError(null);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'El nombre es requerido';
    else if (formData.fullName.trim().length < 3) newErrors.fullName = 'El nombre debe tener al menos 3 caracteres';
    if (!formData.email.trim()) newErrors.email = 'El correo es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Ingrese un correo valido';
    if (!formData.password) newErrors.password = 'La contrasena es requerida';
    else if (formData.password.length < 8) newErrors.password = 'La contrasena debe tener al menos 8 caracteres';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirma tu contrasena';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contrasenas no coinciden';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiError(null);
    const result = await register({ fullName: formData.fullName, email: formData.email, password: formData.password, dni: formData.dni || null, ruc: formData.ruc || null, phone: formData.phone || null });
    if (result.success) navigate('/dashboard', { replace: true });
    else setApiError(result.error);
    setSubmitting(false);
  };

  const benefits = [
    'Sube archivos hasta 2GB',
    'Hash SHA-256 verificable',
    'Cadena de custodia inmutable',
    'Exportacion forense cifrada'
  ];

  return (
    <div className="min-h-screen bg-gradient-page flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-radial from-alina-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-gradient-radial from-cyan-500/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-gradient-radial from-alina-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 pattern-dots opacity-30" />
      </div>

      <nav className="relative h-16 glass-effect border-b border-surface-700/30">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-alina-600 via-cyan-500 to-alina-500" />
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
          <Link to="/" className="flex items-center group">
            <img src={logoAlina} alt="ALINA - Prueba Digital" className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(15,181,179,0.3)]" />
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-8 relative">
        <div className="w-full max-w-4xl">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Benefits Panel */}
            <div className="lg:col-span-2 hidden lg:block">
              <div className="sticky top-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-surface-50 font-display mb-2">Crea tu cuenta gratis</h2>
                  <p className="text-surface-400">Comienza a proteger tu evidencia digital hoy mismo</p>
                </div>

                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-alina-50/50 rounded-xl border border-alina-200 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="w-8 h-8 bg-gradient-to-br from-alina-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-surface-200 font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-gradient-to-br from-alina-600 to-cyan-700 rounded-2xl text-white shadow-glow-teal">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-8 h-8" />
                    <div>
                      <p className="font-bold">100% Seguro</p>
                      <p className="text-sm text-alina-100">Tus datos estan protegidos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3 animate-fade-in-up">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card shadow-prismatic border border-surface-700/35 p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-alina-600 via-alina-400 to-cyan-500" />

                <div className="lg:hidden text-center mb-6">
                  <img src={logoAlina} alt="ALINA powered by SOFTIA" className="h-16 w-auto object-contain mx-auto mb-3" />
                  <h1 className="text-xl font-bold text-surface-50 font-display">Crear Cuenta</h1>
                </div>

                {apiError && <Alert type="error" message={apiError} className="mb-6" dismissible onDismiss={() => setApiError(null)} />}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <Input label="Nombre completo" name="fullName" placeholder="Tu nombre completo" value={formData.fullName} onChange={handleChange} error={errors.fullName} icon={User} required disabled={submitting} />
                  <Input label="Correo electronico" name="email" type="email" placeholder="tu@correo.com" value={formData.email} onChange={handleChange} error={errors.email} icon={Mail} autoComplete="email" required disabled={submitting} />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="Contrasena" name="password" type="password" placeholder="Minimo 8 caracteres" value={formData.password} onChange={handleChange} error={errors.password} icon={Lock} required disabled={submitting} />
                    <Input label="Confirmar contrasena" name="confirmPassword" type="password" placeholder="Repite tu contrasena" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} icon={Lock} required disabled={submitting} />
                  </div>

                  <div className="pt-4 border-t border-surface-700/35">
                    <p className="text-sm text-surface-400 mb-4">Informacion adicional (opcional)</p>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <Input label="DNI" name="dni" placeholder="12345678" value={formData.dni} onChange={handleChange} icon={CreditCard} disabled={submitting} />
                      <Input label="RUC" name="ruc" placeholder="20123456789" value={formData.ruc} onChange={handleChange} icon={CreditCard} disabled={submitting} />
                      <Input label="Telefono" name="phone" placeholder="+51 999 999 999" value={formData.phone} onChange={handleChange} icon={Phone} disabled={submitting} />
                    </div>
                  </div>

                  <Button type="submit" fullWidth loading={submitting} disabled={loading} size="lg" icon={Sparkles}>
                    Crear Cuenta
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-surface-400">
                    Ya tienes una cuenta?{' '}
                    <Link to="/login" className="font-semibold text-alina-600 hover:text-alina-700 transition-colors">Inicia sesion</Link>
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-center gap-3 text-xs text-surface-400">
                  <Link to="/privacy" className="hover:text-alina-600 transition-colors">
                    Politica de Privacidad
                  </Link>
                  <span className="opacity-30">|</span>
                  <Link to="/terms" className="hover:text-alina-600 transition-colors">
                    Terminos y Condiciones
                  </Link>
                </div>
              </div>

              <Link to="/" className="mt-6 flex items-center justify-center gap-2 text-surface-400 hover:text-alina-600 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
