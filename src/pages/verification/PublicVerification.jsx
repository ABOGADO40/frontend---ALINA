import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Search,
  Hash,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Copy,
  Mail,
  Phone
} from 'lucide-react';
import { Button, Input, Alert } from '../../components/common';
import verificationService from '../../services/verificationService';
import { formatDateTime, formatHash } from '../../utils/formatters';
import toast from 'react-hot-toast';

/**
 * PublicVerification Page
 * Verify evidence by SHA-256 hash (accessible from authenticated area)
 */
const PublicVerification = () => {
  const [hash, setHash] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const cleanHash = hash.trim();

    if (!cleanHash) {
      setError('Ingrese el hash SHA-256 a verificar');
      return;
    }

    if (!verificationService.isValidHashFormat(cleanHash)) {
      setError('El hash debe ser una cadena hexadecimal de 64 caracteres (SHA-256)');
      return;
    }

    setVerifying(true);

    try {
      const response = await verificationService.verifyByHash(cleanHash);
      setResult(verificationService.formatResult(response));
    } catch (err) {
      setError(err.error?.message || 'Error al verificar el hash');
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Hash copiado al portapapeles');
  };

  const clearResult = () => {
    setHash('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" icon={ArrowLeft}>
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Verificacion de Hash</h1>
          <p className="text-surface-300 mt-1">
            Verifica la autenticidad de una evidencia mediante su hash SHA-256
          </p>
        </div>
      </div>

      {/* Verification Form */}
      <div className="bg-white/90 rounded-2xl border border-surface-700/35 p-6 md:p-8 shadow-prismatic">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-alina-50 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-alina-600" />
          </div>
          <div>
            <h2 className="font-semibold text-surface-50">Verificar Evidencia</h2>
            <p className="text-sm text-surface-400">Ingresa el hash para verificar</p>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <Input
            label="Hash SHA-256"
            name="hash"
            placeholder="Ingresa el hash de 64 caracteres hexadecimales"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            icon={Hash}
            disabled={verifying}
            helperText="El hash debe ser exactamente 64 caracteres hexadecimales (0-9, a-f)"
          />

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              loading={verifying}
              icon={Search}
            >
              Verificar
            </Button>
            {(result || error) && (
              <Button
                type="button"
                variant="secondary"
                onClick={clearResult}
              >
                Limpiar
              </Button>
            )}
          </div>
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
          <div className="mt-6">
            {result.found && result.isPublic ? (
              // Found and public
              <div className="p-6 bg-success-500/10 border border-success-200 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-8 h-8 text-success-400" />
                  <div>
                    <h3 className="font-semibold text-success-800">
                      Evidencia Verificada
                    </h3>
                    <p className="text-sm text-success-700">{result.message}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-success-500/30">
                    <span className="text-success-700">Titulo</span>
                    <span className="font-medium text-success-800">
                      {result.evidence?.title || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-success-500/30">
                    <span className="text-success-700">Tipo de Fuente</span>
                    <span className="font-medium text-success-800">
                      {result.evidence?.sourceType || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-success-500/30">
                    <span className="text-success-700">Tipo de Archivo</span>
                    <span className="font-medium text-success-800">
                      {result.file?.mimeType || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-success-500/30">
                    <span className="text-success-700">Estado</span>
                    <span className="font-medium text-success-800">
                      {result.evidence?.status || '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-success-500/30">
                    <span className="text-success-700">Hash Registrado</span>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs bg-success-50 text-success-700 px-2 py-1 rounded">
                        {formatHash(result.hash?.value, 12)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(result.hash?.value)}
                        className="p-1 text-success-400 hover:text-success-800 rounded"
                        title="Copiar hash completo"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between py-2 border-b border-success-500/30">
                    <span className="text-success-700">Algoritmo</span>
                    <span className="font-medium text-success-800">
                      {result.hash?.algorithm || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-success-500/30">
                    <span className="text-success-700">Fecha de Registro</span>
                    <span className="font-medium text-success-800">
                      {formatDateTime(result.evidence?.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-success-700">Verificado</span>
                    <span className="font-medium text-success-800">
                      {formatDateTime(result.verifiedAt)}
                    </span>
                  </div>
                </div>
              </div>
            ) : result.found && !result.isPublic ? (
              // Found but not public - show contact info
              <div className="p-6 bg-accent-50/50 border border-accent-200 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-8 h-8 text-accent-400" />
                  <div>
                    <h3 className="font-semibold text-accent-800">
                      Evidencia Privada
                    </h3>
                    <p className="text-sm text-accent-700 mt-1">
                      {result.message || 'El hash existe en el sistema pero la evidencia es privada.'}
                    </p>
                  </div>
                </div>

                {/* Contact info */}
                {(result.contact?.email || result.contact?.phone) && (
                  <div className="mt-4 pt-4 border-t border-accent-500/30">
                    <p className="text-sm font-medium text-accent-800 mb-3">
                      Para solicitar acceso, contacte al propietario:
                    </p>
                    <div className="space-y-2">
                      {result.contact.email && (
                        <div className="flex items-center gap-2 text-sm text-accent-700">
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <a
                            href={`mailto:${result.contact.email}`}
                            className="underline hover:text-accent-800"
                          >
                            {result.contact.email}
                          </a>
                        </div>
                      )}
                      {result.contact.phone && (
                        <div className="flex items-center gap-2 text-sm text-accent-700">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <a
                            href={`tel:${result.contact.phone}`}
                            className="underline hover:text-accent-800"
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
              // Not found
              <div className="p-6 bg-surface-900/40 border border-surface-700/40 rounded-2xl">
                <div className="flex items-center gap-3">
                  <XCircle className="w-8 h-8 text-surface-500" />
                  <div>
                    <h3 className="font-semibold text-surface-300">
                      Hash No Encontrado
                    </h3>
                    <p className="text-sm text-surface-400 mt-1">
                      {result.message || 'No se encontro ninguna evidencia registrada con este hash en el sistema.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Help */}
      <div className="bg-alina-50/50 rounded-2xl p-6">
        <h3 className="font-medium text-alina-800 mb-2">Como funciona</h3>
        <div className="text-sm text-alina-700 space-y-2">
          <p>
            La verificacion por hash te permite confirmar que un archivo es identico
            al que fue registrado en el sistema.
          </p>
          <p>
            <strong>Para verificar:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Calcula el hash SHA-256 del archivo que deseas verificar</li>
            <li>Ingresa el hash en el campo de arriba</li>
            <li>Si el hash coincide con una evidencia publica, veras sus datos</li>
          </ol>
          <p className="mt-3">
            Si el archivo fue modificado de cualquier forma, el hash sera diferente
            y la verificacion fallara.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicVerification;
