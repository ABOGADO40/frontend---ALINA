import { Link } from 'react-router-dom';
import { Heart, ExternalLink, Mail, Phone } from 'lucide-react';
import logoAlina from '../../assets/logo-alina.jpeg';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Producto',
      links: [
        { label: 'Caracteristicas', href: '#features' },
        { label: 'Precios', href: '#pricing' },
        { label: 'Seguridad', href: '#security' },
      ]
    },
    {
      title: 'Recursos',
      links: [
        { label: 'Documentacion', href: '#docs' },
        { label: 'Guias', href: '#guides' },
        { label: 'API', href: '#api' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacidad', href: '#privacy' },
        { label: 'Terminos', href: '#terms' },
        { label: 'Licencia', href: '#license' },
      ]
    }
  ];

  return (
    <footer className="bg-white/90 border-t border-surface-700/30 relative overflow-hidden">
      {/* Subtle pattern background */}
      <div className="absolute inset-0 pattern-dots opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 py-12 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4 group">
              <img
                src={logoAlina}
                alt="ALINA powered by SOFTIA"
                className="h-14 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <p className="text-surface-300 mb-6 max-w-sm leading-relaxed">
              Sistema profesional para la gestion de evidencia digital con integridad verificable
              y cadena de custodia inmutable.
            </p>

            <div className="space-y-3">
              <a href="mailto:contacto@pruebadigital.com" className="flex items-center gap-3 text-surface-400 hover:text-alina-600 transition-colors group">
                <div className="w-8 h-8 bg-alina-50 rounded-lg flex items-center justify-center group-hover:shadow-sm transition-shadow">
                  <Mail className="w-4 h-4 text-alina-600" />
                </div>
                <span className="text-sm">contacto@pruebadigital.com</span>
              </a>
              <a href="tel:+51999999999" className="flex items-center gap-3 text-surface-400 hover:text-alina-600 transition-colors group">
                <div className="w-8 h-8 bg-cyan-50 rounded-lg flex items-center justify-center group-hover:shadow-sm transition-shadow">
                  <Phone className="w-4 h-4 text-cyan-600" />
                </div>
                <span className="text-sm">+51 999 999 999</span>
              </a>
            </div>
          </div>

          {footerLinks.map((section, index) => (
            <div key={index}>
              <h4 className="font-bold text-surface-100 mb-4 flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  index === 0 ? 'bg-alina-500' : index === 1 ? 'bg-cyan-500' : 'bg-accent-500'
                }`} />
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-surface-400 hover:text-alina-600 transition-colors text-sm flex items-center gap-1 group"
                    >
                      {link.label}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-surface-700/30 bg-surface-900/40 relative">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-surface-400 flex items-center gap-1">
              &copy; {currentYear} ALINA powered by SOFTIA. Hecho con
              <Heart className="w-4 h-4 text-danger-500 fill-danger-500 animate-pulse" />
              en Peru
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-surface-500 bg-white/80 px-3 py-1 rounded-full border border-surface-700/30">
                Todos los derechos reservados
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
