import { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const Input = forwardRef(({
  type = 'text',
  label,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  success,
  helperText,
  required = false,
  disabled = false,
  readOnly = false,
  icon: Icon = null,
  className = '',
  inputClassName = '',
  autoComplete,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';

  const effectiveAutoComplete = autoComplete || (isPassword ? 'new-password' : undefined);
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const baseInputClasses = `
    block w-full rounded-xl border px-4 py-3
    text-surface-200 placeholder-surface-500
    bg-white/90 backdrop-blur-sm
    transition-all duration-300 ease-out
    focus:outline-none
    disabled:bg-surface-900/50 disabled:cursor-not-allowed disabled:border-surface-700
    read-only:bg-surface-900/30 read-only:border-alina-500/20
  `;

  const stateClasses = error
    ? 'border-danger-400/60 focus:border-danger-400 focus:ring-4 focus:ring-danger-500/15 bg-danger-50/10'
    : success
    ? 'border-success-400/60 focus:border-success-400 focus:ring-4 focus:ring-success-500/15 bg-success-50/10'
    : 'border-surface-700 focus:border-alina-500 focus:ring-4 focus:ring-alina-500/15 hover:border-surface-600';

  const paddingClasses = Icon ? 'pl-12' : 'pl-4';
  const passwordPadding = isPassword ? 'pr-12' : 'pr-4';

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className={`block text-sm font-semibold transition-colors duration-200 ${
            isFocused ? 'text-alina-600' : 'text-surface-300'
          }`}
        >
          {label}
          {required && <span className="text-danger-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative group">
        {/* Icon */}
        {Icon && (
          <div className={`
            absolute left-4 top-1/2 -translate-y-1/2
            transition-colors duration-200
            ${isFocused ? 'text-alina-600' : 'text-surface-500'}
            ${error ? 'text-danger-400' : ''}
            ${success ? 'text-success-400' : ''}
          `}>
            <Icon className="w-5 h-5" />
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          autoComplete={effectiveAutoComplete}
          className={`
            ${baseInputClasses}
            ${stateClasses}
            ${paddingClasses}
            ${passwordPadding}
            ${inputClassName}
          `}
          {...props}
        />

        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`
              absolute right-4 top-1/2 -translate-y-1/2
              p-1 rounded-lg transition-all duration-200
              hover:bg-alina-50/50
              ${isFocused ? 'text-alina-600' : 'text-surface-500'}
            `}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Success/Error indicator */}
        {(error || success) && !isPassword && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {error && <AlertCircle className="w-5 h-5 text-danger-400" />}
            {success && <CheckCircle className="w-5 h-5 text-success-400" />}
          </div>
        )}
      </div>

      {/* Helper text / Error message */}
      {(error || helperText || success) && (
        <div className={`
          flex items-start gap-2 text-sm animate-fade-in
          ${error ? 'text-danger-400' : success ? 'text-success-400' : 'text-surface-500'}
        `}>
          {error && <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
          {success && <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
          <span>{error || success || helperText}</span>
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
