import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  CheckCircle,
  FileCheck,
  Lock,
  Search,
  Download,
  ArrowRight,
  Hash,
  Sparkles,
  Zap,
  Globe,
  Award,
  AlertCircle,
  XCircle,
  Mail,
  Phone
} from 'lucide-react';
import { Button, Input, Alert } from '../components/common';
import { Footer } from '../components/layout';
import verificationService from '../services/verificationService';
import { formatDateTime, formatHash } from '../utils/formatters';
import logoAlina from '../assets/logo-alina.jpeg';

const formatRegistrationDate = (date) => {
  if (!date) return '-';
  try {
    const d = new Date(date);
    const f = new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Lima'
    });
    const parts = f.formatToParts(d);
    const get = (type) => parts.find(p => p.type === type)?.value || '';
    return `${get('day')}/${get('month')}/${get('year')} \u2013 ${get('hour')}:${get('minute')} (UTC-5)`;
  } catch {
    return '-';
  }
};

const formatReferenceCode = (evidenceId) => {
  if (!evidenceId) return 'ALINA-00000';
  return `ALINA-${String(evidenceId).padStart(5, '0')}`;
};

/**
 * Landing Page
 * Dark Forensic Elegance public landing page
 */
const Landing = () => {
  const navigate = useNavigate();
  const [hash, setHash] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!hash.trim()) {
      setError('Ingrese el hash SHA-256 a verificar');
      return;
    }

    if (!verificationService.isValidHashFormat(hash.trim())) {
      setError('El hash debe ser una cadena hexadecimal de 64 caracteres');
      return;
    }

    setVerifying(true);

    try {
      const response = await verificationService.verifyByHash(hash.trim());
      setResult(verificationService.formatResult(response));
    } catch (err) {
      if (err.error?.code === 'HASH_NOT_FOUND') {
        setResult({ found: false });
      } else {
        setError(err.error?.message || 'Error al verificar el hash');
      }
    } finally {
      setVerifying(false);
    }
  };

  const features = [
    {
      icon: FileCheck,
      title: 'Integridad Verificable',
      description: 'Hash SHA-256 para garantizar que tus archivos no han sido modificados',
      color: 'from-alina-500 to-alina-600',
      bgColor: 'bg-white/90'
    },
    {
      icon: Lock,
      title: 'Cadena de Custodia',
      description: 'Registro inmutable de todas las acciones realizadas sobre cada evidencia',
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-white/90'
    },
    {
      icon: Download,
      title: 'Exportacion Forense',
      description: 'Genera paquetes ZIP cifrados listos para uso legal y pericial',
      color: 'from-accent-500 to-accent-600',
      bgColor: 'bg-white/90'
    },
    {
      icon: Search,
      title: 'Verificacion Publica',
      description: 'Cualquier tercero puede verificar la autenticidad de una evidencia',
      color: 'from-accent-500 to-accent-600',
      bgColor: 'bg-white/90'
    }
  ];

  const stats = [
    { value: '2GB', label: 'Tamaño maximo', icon: Zap },
    { value: 'SHA-256', label: 'Algoritmo hash', icon: Shield },
    { value: '100%', label: 'Trazabilidad', icon: Award },
    { value: 'Global', label: 'Verificacion', icon: Globe }
  ];

  return (
    <div className="min-h-screen bg-gradient-page">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-30" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-radial from-alina-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-[400px] h-[400px] bg-gradient-radial from-cyan-500/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-[500px] h-[500px] bg-gradient-radial from-accent-500/6 to-transparent rounded-full blur-3xl" />
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
            <Link
              to="/login"
              className="hidden sm:block px-4 py-2 text-surface-300 hover:text-alina-600 font-medium transition-colors"
            >
              Iniciar Sesion
            </Link>
            <Link to="/register">
              <Button size="sm">Registrarse</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center relative">
          {/* Logo grande + Badge */}
          <div className="mb-8 animate-fade-in-down">
            <img
              src={logoAlina}
              alt="ALINA powered by SOFTIA"
              className="h-28 md:h-36 w-auto object-contain mx-auto mb-6 drop-shadow-[0_0_8px_rgba(15,181,179,0.3)]"
            />
            <div className="inline-flex items-center gap-2 bg-alina-50 text-alina-700 px-5 py-2.5 rounded-full text-sm font-semibold shadow-card border border-alina-500/30">
              <Shield className="w-4 h-4" />
              Sistema de Evidencia Digital Forense
              <Sparkles className="w-4 h-4 text-accent-400" />
            </div>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-surface-50 mb-6 leading-tight animate-fade-in-up font-display">
            Protege la integridad de tu{' '}
            <span className="bg-gradient-to-r from-alina-600 via-cyan-600 to-alina-500 bg-clip-text text-transparent">
              evidencia digital
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-surface-300 mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Sistema profesional para incorporar, verificar y exportar evidencia digital
            con cadena de custodia inmutable y verificacion publica.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <Link to="/register">
              <Button size="lg" icon={ArrowRight} iconPosition="right">
                Comenzar Ahora
              </Button>
            </Link>
            <a href="#verificar">
              <Button variant="outline" size="lg" icon={Search}>
                Verificar Hash
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-surface-700/35 shadow-card hover:shadow-glow-teal transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-alina-50 to-cyan-50 rounded-xl flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-alina-600" />
                </div>
                <p className="text-xl font-bold text-surface-50">{stat.value}</p>
                <p className="text-xs text-surface-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-surface-50 mb-4 font-display">
              Funcionalidades principales
            </h2>
            <p className="text-surface-300 max-w-2xl mx-auto">
              Todo lo que necesitas para gestionar tu evidencia digital de forma segura y profesional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`
                  group relative overflow-hidden
                  ${feature.bgColor}
                  backdrop-blur-sm rounded-2xl p-6 border border-surface-700/35
                  shadow-card hover:shadow-glow-teal
                  transition-all duration-300 hover:-translate-y-2
                  animate-fade-in-up
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon */}
                <div className={`
                  w-14 h-14 bg-gradient-to-br ${feature.color}
                  rounded-xl flex items-center justify-center mb-4
                  shadow-lg group-hover:scale-110 transition-transform duration-300
                `}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-lg font-bold text-surface-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-surface-400 text-sm">{feature.description}</p>

                {/* Decorative corner */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-alina-500/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verification Section */}
      <section id="verificar" className="py-20 px-4 relative">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-alina-50 text-alina-700 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-alina-500/30">
              <Search className="w-4 h-4" />
              Verificacion Publica
            </div>
            <h2 className="text-3xl font-bold text-surface-50 mb-4 font-display">
              Verifica cualquier evidencia
            </h2>
            <p className="text-surface-300">
              Ingresa el hash SHA-256 de un archivo para verificar su autenticidad
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card shadow-prismatic border border-surface-700/35 p-6 md:p-8">
            <form onSubmit={handleVerify} className="space-y-4">
              <Input
                label="Hash SHA-256"
                name="hash"
                placeholder="Ingresa el hash de 64 caracteres hexadecimales"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                icon={Hash}
                disabled={verifying}
              />

              <Button
                type="submit"
                fullWidth
                loading={verifying}
                icon={Search}
              >
                Verificar
              </Button>
            </form>

            {/* Error */}
            {error && (
              <Alert
                type="error"
                message={error}
                className="mt-6"
                dismissible
                onDismiss={() => setError(null)}
              />
            )}

            {/* Result */}
            {result && (
              <div className="mt-6 animate-fade-in-up">
                {result.found && result.isPublic ? (
                  <div className="p-6 bg-success-500/10 border border-success-500/30 rounded-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-success-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-success-700 text-lg">
                          Resultado: VERIFICADO
                        </h3>
                        <p className="text-sm text-success-600">
                          Coincidencia confirmada. El codigo hash ingresado existe en ALINA y corresponde a un registro valido en nuestra base de datos.
                        </p>
                      </div>
                    </div>

                    <div className="bg-surface-900/40 rounded-xl p-4 mb-4">
                      <h4 className="text-sm font-semibold text-success-700 mb-3">Datos de verificacion (informacion minima):</h4>
                      <div className="space-y-3 text-sm">
                        {[
                          { label: 'Algoritmo', value: 'SHA-256' },
                          { label: 'Estado', value: 'Registrado en ALINA' },
                          { label: 'Fecha y hora de registro', value: formatRegistrationDate(result.hash?.registeredAt || result.evidence?.createdAt) },
                          { label: 'Codigo de referencia', value: formatReferenceCode(result.evidence?.id) },
                        ].map((item, index) => (
                          <div key={index} className="flex justify-between py-2 border-b border-success-500/20 last:border-0">
                            <span className="text-success-600">{item.label}</span>
                            <span className="font-medium text-success-700">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4 bg-surface-900/40 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-success-700 mb-2">
                        Contacto con el titular (sin revelar identidad):
                      </h4>
                      <p className="text-sm text-success-600">
                        Para solicitar mayor informacion o acceso a la evidencia, comuniquese con el correo de enlace del titular:{' '}
                        <a href={`mailto:${result.contact?.email}`} className="underline font-medium hover:text-success-700">
                          {result.contact?.email}
                        </a>
                      </p>
                    </div>

                    <div className="pt-4 border-t border-success-500/20">
                      <div className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-success-600">
                          <span className="font-semibold">Aviso de privacidad:</span>{' '}
                          ALINA no exhibe datos personales del titular ni contenido de la evidencia en este modulo publico. Cualquier intercambio posterior se realiza bajo responsabilidad del solicitante y del titular, conforme a la Ley N.° 29733.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : result.found && !result.isPublic ? (
                  <div className="p-6 bg-accent-500/10 border border-accent-500/30 rounded-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg">
                        <AlertCircle className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-accent-300 text-lg">
                          Evidencia Privada
                        </h3>
                        <p className="text-sm text-accent-400">
                          {result.message || 'El hash existe en el sistema pero la evidencia es privada.'}
                        </p>
                      </div>
                    </div>

                    {(result.contact?.email || result.contact?.phone) && (
                      <div className="mt-4 pt-4 border-t border-accent-500/20">
                        <p className="text-sm font-medium text-accent-300 mb-3">
                          Para solicitar acceso, contacte al propietario:
                        </p>
                        <div className="space-y-2 bg-surface-900/40 rounded-xl p-4">
                          {result.contact.email && (
                            <div className="flex items-center gap-3 text-sm text-accent-400">
                              <Mail className="w-4 h-4 flex-shrink-0" />
                              <a
                                href={`mailto:${result.contact.email}`}
                                className="underline hover:text-accent-300 font-medium"
                              >
                                {result.contact.email}
                              </a>
                            </div>
                          )}
                          {result.contact.phone && (
                            <div className="flex items-center gap-3 text-sm text-accent-400">
                              <Phone className="w-4 h-4 flex-shrink-0" />
                              <a
                                href={`tel:${result.contact.phone}`}
                                className="underline hover:text-accent-300 font-medium"
                              >
                                {result.contact.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 bg-surface-900/40 border border-surface-700/40 rounded-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-surface-500 to-surface-600 rounded-xl flex items-center justify-center shadow-lg">
                        <XCircle className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-surface-200 text-lg">
                          Sin coincidencias
                        </h3>
                        <p className="text-sm text-surface-400">
                          Codigo hash ingresado no registra coincidencias en ALINA.
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-surface-400 mb-4">
                      Esto significa que no puede acreditarse que dicho hash haya sido generado o registrado por ALINA en nuestra base de datos.
                    </p>

                    <div className="bg-surface-900/40 rounded-xl p-4 mb-4">
                      <h4 className="text-sm font-semibold text-surface-300 mb-3">Recomendaciones:</h4>
                      <ol className="space-y-2 text-sm text-surface-400 list-decimal list-inside">
                        <li>Verifique que el hash este completo y sin espacios.</li>
                        <li>Confirme que el algoritmo utilizado sea SHA-256.</li>
                        <li>Si cuenta con el reporte de ALINA, comparelo con el hash ingresado.</li>
                      </ol>
                    </div>

                    <p className="text-sm text-surface-500 italic">
                      Si considera que existe un error, solicite al titular de la evidencia el reporte de integridad emitido por ALINA.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-alina-600 via-alina-500 to-cyan-600 rounded-3xl" />
          <div className="absolute inset-0 pattern-dots opacity-20 rounded-3xl" />

          <div className="relative px-8 py-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-display">
              Comienza a proteger tu evidencia digital hoy
            </h2>
            <p className="text-alina-100 text-lg mb-8 max-w-2xl mx-auto">
              Registrate gratis y sube tu primera evidencia en minutos
            </p>
            <Link to="/register">
              <Button
                variant="accent"
                size="lg"
                icon={Sparkles}
                className="shadow-lg shadow-accent-500/30"
              >
                Crear Cuenta Gratis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
