import { useState, useRef } from 'react';
import {
  Upload,
  File,
  Image,
  Video,
  Music,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Cloud,
  Sparkles
} from 'lucide-react';
import { formatFileSize } from '../../utils/formatters';

const FileUpload = ({
  onFileSelect,
  accept = '*',
  maxSize = 2 * 1024 * 1024 * 1024, // 2GB default
  multiple = false,
  disabled = false,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef(null);

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return Image;
    if (type?.startsWith('video/')) return Video;
    if (type?.startsWith('audio/')) return Music;
    if (type?.includes('pdf')) return FileText;
    return File;
  };

  const getFileTypeColor = (type) => {
    if (type?.startsWith('image/')) return 'from-cyan-500 to-cyan-600';
    if (type?.startsWith('video/')) return 'from-danger-500 to-danger-600';
    if (type?.startsWith('audio/')) return 'from-accent-500 to-accent-600';
    if (type?.includes('pdf')) return 'from-danger-500 to-danger-600';
    return 'from-alina-500 to-alina-600';
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError(null);

    if (selectedFile.size > maxSize) {
      setError(`El archivo excede el tamaño maximo de ${formatFileSize(maxSize)}`);
      return;
    }

    setFile(selectedFile);
    onFileSelect?.(selectedFile);

    simulateProgress();
  };

  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onFileSelect?.(null);
  };

  const FileIcon = file ? getFileIcon(file.type) : Upload;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && !file && inputRef.current?.click()}
        className={`
          relative overflow-hidden
          border-2 border-dashed rounded-2xl p-8
          transition-all duration-300 ease-out
          ${disabled
            ? 'border-surface-700 bg-surface-900/40 cursor-not-allowed'
            : file
              ? 'border-success-400/50 bg-success-50/20'
              : isDragging
                ? 'border-alina-500 bg-alina-50/30 shadow-glow-teal'
                : 'border-surface-600/50 bg-white/60 hover:border-alina-500/40 hover:bg-alina-50/15 cursor-pointer'
          }
        `}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none pattern-dots" />

        {/* Floating decorations */}
        {!file && !disabled && (
          <>
            <div className="absolute top-4 right-4 text-surface-600/40 animate-float">
              <Cloud className="w-8 h-8" />
            </div>
            <div className="absolute bottom-4 left-4 text-alina-500/20 animate-float" style={{ animationDelay: '1s' }}>
              <Sparkles className="w-6 h-6" />
            </div>
          </>
        )}

        <div className="relative text-center">
          {file ? (
            <div className="space-y-4">
              <div className={`
                w-20 h-20 mx-auto rounded-2xl
                bg-gradient-to-br ${getFileTypeColor(file.type)}
                flex items-center justify-center
                shadow-lg
              `}>
                <FileIcon className="w-10 h-10 text-white" />
              </div>

              <div>
                <p className="font-semibold text-surface-100 truncate max-w-xs mx-auto">
                  {file.name}
                </p>
                <p className="text-sm text-surface-400">
                  {formatFileSize(file.size)}
                </p>
              </div>

              {uploadProgress < 100 && (
                <div className="w-full max-w-xs mx-auto">
                  <div className="h-2 bg-surface-700/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-alina-500 to-cyan-500 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-surface-400 mt-1">Procesando... {uploadProgress}%</p>
                </div>
              )}

              {uploadProgress === 100 && (
                <div className="flex items-center justify-center gap-2 text-success-500">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Archivo listo</span>
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-danger-500 hover:bg-danger-50/40 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
                Remover archivo
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`
                w-20 h-20 mx-auto rounded-2xl
                ${isDragging
                  ? 'bg-gradient-to-br from-alina-500 to-cyan-500'
                  : 'bg-alina-50'
                }
                flex items-center justify-center
                transition-all duration-300
                ${isDragging ? 'scale-110 shadow-lg' : ''}
              `}>
                <Upload className={`w-10 h-10 ${isDragging ? 'text-white' : 'text-alina-600'}`} />
              </div>

              <div>
                <p className={`text-lg font-semibold ${isDragging ? 'text-alina-700' : 'text-surface-100'}`}>
                  {isDragging ? '¡Suelta el archivo aqui!' : 'Arrastra y suelta tu archivo'}
                </p>
                <p className="text-sm text-surface-400 mt-1">
                  o{' '}
                  <span className="text-alina-600 font-medium hover:text-alina-700 cursor-pointer">
                    haz clic para seleccionar
                  </span>
                </p>
              </div>

              <p className="text-xs text-surface-500">
                Tamaño maximo: {formatFileSize(maxSize)}
              </p>
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-danger-50/40 border border-danger-200 rounded-xl text-danger-600 animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
