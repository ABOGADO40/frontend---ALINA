import { Loader2, Shield } from 'lucide-react';

const Loading = ({ size = 'md', variant = 'spinner', text = '', fullScreen = false, className = '' }) => {
  const sizeClasses = {
    sm: { spinner: 'w-5 h-5', dots: 'w-1.5 h-1.5', text: 'text-sm' },
    md: { spinner: 'w-8 h-8', dots: 'w-2 h-2', text: 'text-base' },
    lg: { spinner: 'w-12 h-12', dots: 'w-3 h-3', text: 'text-lg' },
    xl: { spinner: 'w-16 h-16', dots: 'w-4 h-4', text: 'text-xl' }
  };

  const SpinnerLoader = () => (
    <div className="relative">
      <div className={`${sizeClasses[size].spinner} border-4 border-surface-700/30 border-t-alina-500 rounded-full animate-spin`} />
      <div className={`absolute inset-0 ${sizeClasses[size].spinner} border-4 border-transparent border-b-cyan-400 rounded-full animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
    </div>
  );

  const DotsLoader = () => (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <div key={i} className={`${sizeClasses[size].dots} rounded-full animate-bounce ${i === 0 ? 'bg-alina-500' : i === 1 ? 'bg-cyan-500' : 'bg-accent-500'}`} style={{ animationDelay: `${i * 150}ms` }} />
      ))}
    </div>
  );

  const PulseLoader = () => (
    <div className="relative">
      <div className={`${sizeClasses[size].spinner} bg-gradient-to-br from-alina-500 to-cyan-500 rounded-full animate-pulse`} />
      <div className={`absolute inset-0 ${sizeClasses[size].spinner} border-2 border-alina-400 rounded-full animate-ping opacity-75`} />
    </div>
  );

  const BrandLoader = () => (
    <div className="relative">
      <div className={`${size === 'sm' ? 'w-10 h-10' : size === 'md' ? 'w-14 h-14' : size === 'lg' ? 'w-20 h-20' : 'w-24 h-24'} bg-gradient-to-br from-alina-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-glow-teal animate-pulse`}>
        <Shield className={`${size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-7 h-7' : size === 'lg' ? 'w-10 h-10' : 'w-12 h-12'} text-white`} />
      </div>
      <div className={`absolute inset-0 ${size === 'sm' ? 'w-10 h-10' : size === 'md' ? 'w-14 h-14' : size === 'lg' ? 'w-20 h-20' : 'w-24 h-24'} border-2 border-alina-400/50 rounded-2xl animate-ping opacity-40`} />
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots': return <DotsLoader />;
      case 'pulse': return <PulseLoader />;
      case 'brand': return <BrandLoader />;
      default: return <SpinnerLoader />;
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      {renderLoader()}
      {text && <p className={`${sizeClasses[size].text} font-medium text-surface-400 animate-pulse`}>{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/85 backdrop-blur-md">
        <div className="absolute inset-0 bg-mesh-dash" />
        <div className="relative">{content}</div>
      </div>
    );
  }

  return content;
};

export default Loading;
