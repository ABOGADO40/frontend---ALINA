import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon: Icon = null,
  iconPosition = 'left',
  onClick,
  className = '',
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-semibold rounded-xl
    transition-all duration-300 ease-out
    focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-white
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
    transform hover:-translate-y-0.5 active:translate-y-0
  `;

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-alina-600 to-alina-500
      hover:from-alina-500 hover:to-cyan-600
      text-white shadow-btn
      hover:shadow-btn-hover
      focus:ring-alina-500/25
    `,
    secondary: `
      bg-gradient-to-r from-cyan-700 to-cyan-600
      hover:from-cyan-600 hover:to-cyan-500
      text-white shadow-btn
      hover:shadow-btn-hover
      focus:ring-cyan-500/25
    `,
    accent: `
      bg-gradient-to-r from-accent-500 to-accent-400
      hover:from-accent-400 hover:to-accent-300
      text-white shadow-lg shadow-accent-500/15
      hover:shadow-xl hover:shadow-accent-500/25
      focus:ring-accent-500/25
    `,
    coral: `
      bg-gradient-to-r from-accent-500 to-accent-600
      hover:from-accent-600 hover:to-accent-700
      text-white shadow-lg shadow-accent-500/15
      hover:shadow-xl hover:shadow-accent-500/25
      focus:ring-accent-500/25
    `,
    outline: `
      border border-alina-500/30 text-alina-700
      bg-white/90 backdrop-blur-sm
      hover:bg-alina-50 hover:border-alina-500/50
      hover:shadow-glow-teal
      focus:ring-alina-500/25
    `,
    ghost: `
      text-surface-300 bg-transparent
      hover:bg-alina-50/40 hover:text-alina-700
      focus:ring-alina-500/15
    `,
    danger: `
      bg-gradient-to-r from-danger-600 to-danger-500
      hover:from-danger-500 hover:to-danger-400
      text-white shadow-lg shadow-danger-500/15
      hover:shadow-xl hover:shadow-danger-500/25
      focus:ring-danger-500/25
    `,
    success: `
      bg-gradient-to-r from-success-600 to-success-500
      hover:from-success-500 hover:to-success-400
      text-white shadow-lg shadow-success-500/15
      hover:shadow-xl hover:shadow-success-500/25
      focus:ring-success-500/25
    `,
    warning: `
      bg-gradient-to-r from-accent-600 to-accent-500
      hover:from-accent-500 hover:to-accent-400
      text-white shadow-lg shadow-accent-500/15
      hover:shadow-xl hover:shadow-accent-500/25
      focus:ring-accent-500/25
    `,
    link: `
      text-alina-600 hover:text-alina-700
      underline-offset-4 hover:underline
      focus:ring-alina-500/15
    `
  };

  const sizeClasses = {
    xs: 'px-3 py-1.5 text-xs gap-1.5',
    sm: 'px-4 py-2 text-sm gap-2',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
    xl: 'px-8 py-4 text-lg gap-3'
  };

  const iconSizeClasses = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${widthClass}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const renderIcon = () => {
    if (loading) return <Loader2 className={`${iconSizeClasses[size]} animate-spin`} />;
    if (Icon) return <Icon className={iconSizeClasses[size]} />;
    return null;
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={buttonClasses}
      {...props}
    >
      {iconPosition === 'left' && renderIcon()}
      {children}
      {iconPosition === 'right' && renderIcon()}
    </button>
  );
};

export default Button;
