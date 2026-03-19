import { useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlay = true,
  footer,
  className = ''
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[calc(100vw-2rem)]'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-surface-100/25 backdrop-blur-sm animate-fade-in"
        onClick={closeOnOverlay ? onClose : undefined}
      />

      {/* Modal content */}
      <div
        className={`
          relative w-full ${sizeClasses[size]}
          bg-white rounded-3xl shadow-float-lg
          border border-surface-700/35
          overflow-hidden
          animate-scale-in
          ${className}
        `}
      >
        {/* Gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-alina-600 via-cyan-500 to-alina-600 opacity-60" />

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between px-6 pt-6 pb-4">
            <div className="flex-1">
              {title && (
                <h2 className="text-xl font-bold text-surface-50 font-display">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-surface-400">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="
                  flex-shrink-0 ml-4 p-2 rounded-xl
                  text-surface-400 hover:text-surface-200
                  hover:bg-surface-900/40
                  transition-all duration-200
                "
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 pb-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-surface-900/30 border-t border-surface-700/35">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar accion',
  message = '¿Estas seguro de realizar esta accion?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false
}) => {
  const variantConfig = {
    danger: {
      icon: AlertTriangle,
      iconBg: 'bg-danger-50',
      iconColor: 'text-danger-500',
      buttonVariant: 'danger'
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-accent-50',
      iconColor: 'text-accent-500',
      buttonVariant: 'warning'
    },
    success: {
      icon: CheckCircle,
      iconBg: 'bg-success-50',
      iconColor: 'text-success-500',
      buttonVariant: 'success'
    },
    info: {
      icon: Info,
      iconBg: 'bg-alina-50',
      iconColor: 'text-alina-600',
      buttonVariant: 'primary'
    }
  };

  const config = variantConfig[variant] || variantConfig.danger;
  const IconComponent = config.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
    >
      <div className="text-center py-4">
        {/* Icon */}
        <div className={`
          w-16 h-16 mx-auto rounded-2xl
          flex items-center justify-center mb-4
          ${config.iconBg}
        `}>
          <IconComponent className={`w-8 h-8 ${config.iconColor}`} />
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold text-surface-100 mb-2">
          {title}
        </h3>
        <p className="text-surface-400 mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="min-w-[100px]"
          >
            {cancelText}
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={onConfirm}
            loading={loading}
            className="min-w-[100px]"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default Modal;
