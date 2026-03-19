import {
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  Sparkles
} from 'lucide-react';

const Alert = ({
  type = 'info',
  title,
  message,
  dismissible = false,
  onDismiss,
  className = '',
  children
}) => {
  const typeConfig = {
    info: {
      icon: Info,
      bg: 'bg-alina-50/50',
      border: 'border-l-4 border-alina-500',
      iconBg: 'bg-alina-50',
      iconColor: 'text-alina-600',
      titleColor: 'text-alina-800',
      textColor: 'text-alina-700',
      dismissColor: 'text-alina-600 hover:text-alina-800 hover:bg-alina-100/50'
    },
    success: {
      icon: CheckCircle,
      bg: 'bg-success-50/50',
      border: 'border-l-4 border-success-500',
      iconBg: 'bg-success-50',
      iconColor: 'text-success-600',
      titleColor: 'text-success-800',
      textColor: 'text-success-700',
      dismissColor: 'text-success-600 hover:text-success-800 hover:bg-success-100/50'
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-accent-50/50',
      border: 'border-l-4 border-accent-500',
      iconBg: 'bg-accent-50',
      iconColor: 'text-accent-600',
      titleColor: 'text-accent-800',
      textColor: 'text-accent-700',
      dismissColor: 'text-accent-600 hover:text-accent-800 hover:bg-accent-100/50'
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-danger-50/50',
      border: 'border-l-4 border-danger-500',
      iconBg: 'bg-danger-50',
      iconColor: 'text-danger-600',
      titleColor: 'text-danger-800',
      textColor: 'text-danger-700',
      dismissColor: 'text-danger-600 hover:text-danger-800 hover:bg-danger-100/50'
    },
    special: {
      icon: Sparkles,
      bg: 'bg-gradient-to-r from-alina-50/50 via-cyan-50/50 to-accent-50/50',
      border: 'border-l-4 border-alina-500',
      iconBg: 'bg-gradient-to-br from-alina-50 to-cyan-50',
      iconColor: 'text-alina-600',
      titleColor: 'text-surface-100',
      textColor: 'text-surface-300',
      dismissColor: 'text-surface-400 hover:text-surface-200 hover:bg-alina-50/50'
    }
  };

  const config = typeConfig[type] || typeConfig.info;
  const IconComponent = config.icon;

  return (
    <div
      className={`
        relative overflow-hidden
        ${config.bg} ${config.border}
        rounded-xl p-4
        shadow-sm
        animate-fade-in-up
        ${className}
      `}
      role="alert"
    >
      {/* Content */}
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`
          flex-shrink-0 w-10 h-10 rounded-xl
          flex items-center justify-center
          ${config.iconBg}
        `}>
          <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`font-semibold ${config.titleColor} mb-1`}>
              {title}
            </h4>
          )}
          {message && (
            <p className={`text-sm ${config.textColor}`}>
              {message}
            </p>
          )}
          {children}
        </div>

        {/* Dismiss button */}
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className={`
              flex-shrink-0 p-1.5 rounded-lg
              transition-all duration-200
              ${config.dismissColor}
            `}
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.06] pointer-events-none">
        <IconComponent className="w-full h-full" />
      </div>
    </div>
  );
};

export default Alert;
