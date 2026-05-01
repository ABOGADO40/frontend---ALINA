import { useEffect, useState } from 'react';
import { Settings, Shield, FileText, Save, User as UserIcon, Calendar, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button, Loading, Alert } from '../../components/common';
import legalService from '../../services/legalService';
import { formatDateTime } from '../../utils/formatters';

const MAX_CONTENT_LENGTH = 50000;

/**
 * Legal Settings Page (Admin SUPER_ADMIN only)
 * Permite editar el contenido de la Politica de Privacidad y los Terminos y Condiciones.
 */
const LegalSettings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [privacy, setPrivacy] = useState({ content: '', modifierName: null, dateTimeModification: null });
  const [terms, setTerms] = useState({ content: '', modifierName: null, dateTimeModification: null });

  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [savingTerms, setSavingTerms] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await legalService.getAllLegalDocuments();
      setPrivacy({
        content: data?.privacy?.content || '',
        modifierName: data?.privacy?.modifierName || null,
        dateTimeModification: data?.privacy?.dateTimeModification || null
      });
      setTerms({
        content: data?.terms?.content || '',
        modifierName: data?.terms?.modifierName || null,
        dateTimeModification: data?.terms?.dateTimeModification || null
      });
    } catch (err) {
      setError(err.error?.message || 'Error al cargar los documentos legales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleSave = async (type) => {
    const setSaving = type === 'privacy' ? setSavingPrivacy : setSavingTerms;
    const document = type === 'privacy' ? privacy : terms;
    const label = type === 'privacy' ? 'Politica de Privacidad' : 'Terminos y Condiciones';

    if (!document.content.trim()) {
      toast.error('El contenido no puede estar vacio');
      return;
    }
    if (document.content.length > MAX_CONTENT_LENGTH) {
      toast.error(`El contenido excede el limite de ${MAX_CONTENT_LENGTH} caracteres`);
      return;
    }

    setSaving(true);
    try {
      await legalService.updateLegalDocument(type, document.content);
      toast.success(`${label} actualizada correctamente`);
      await fetchDocuments();
    } catch (err) {
      toast.error(err.error?.message || `Error al actualizar la ${label}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Loading message="Cargando configuracion..." />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
        <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-alina-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
          <Settings className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-surface-50 font-display">
            Configuracion
          </h1>
          <p className="text-sm text-surface-400 mt-1">
            Edicion de Politica de Privacidad y Terminos y Condiciones. Cambios visibles en /privacy y /terms.
          </p>
        </div>
      </div>

      {error && (
        <Alert type="error" message={error} className="mb-6" />
      )}

      {/* Politica de Privacidad */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card border border-surface-700/35 p-6 mb-8 relative overflow-hidden animate-fade-in-up">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-alina-600 via-cyan-500 to-alina-500" />

        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-alina-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-surface-50">Politica de Privacidad</h2>
              <p className="text-xs text-surface-400 mt-0.5">URL publica: /privacy</p>
            </div>
          </div>
          <Link
            to="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-alina-600 hover:text-alina-700 font-medium"
          >
            <Eye className="w-4 h-4" />
            Ver pagina publica
          </Link>
        </div>

        {(privacy.modifierName || privacy.dateTimeModification) && (
          <div className="flex items-center gap-4 text-xs text-surface-400 mb-3 flex-wrap">
            {privacy.modifierName && (
              <span className="inline-flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5" />
                Ultima modificacion por: <span className="font-medium text-surface-300">{privacy.modifierName}</span>
              </span>
            )}
            {privacy.dateTimeModification && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDateTime(privacy.dateTimeModification)}
              </span>
            )}
          </div>
        )}

        <textarea
          value={privacy.content}
          onChange={(e) => setPrivacy((prev) => ({ ...prev, content: e.target.value }))}
          rows={20}
          maxLength={MAX_CONTENT_LENGTH}
          placeholder="Escribe aqui el contenido de la Politica de Privacidad..."
          className="w-full px-4 py-3 rounded-xl bg-white/70 border border-surface-700/35 focus:border-alina-500 focus:ring-2 focus:ring-alina-500/20 outline-none transition-all font-mono text-sm text-surface-100 placeholder-surface-500 resize-y leading-relaxed whitespace-pre-wrap"
          disabled={savingPrivacy}
        />

        <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
          <span className="text-xs text-surface-400">
            {privacy.content.length} / {MAX_CONTENT_LENGTH} caracteres
          </span>
          <Button
            type="button"
            onClick={() => handleSave('privacy')}
            loading={savingPrivacy}
            disabled={savingPrivacy || !privacy.content.trim()}
            icon={Save}
          >
            Guardar Politica
          </Button>
        </div>
      </div>

      {/* Terminos y Condiciones */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card border border-surface-700/35 p-6 relative overflow-hidden animate-fade-in-up">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent-500 via-cyan-500 to-alina-500" />

        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-surface-50">Terminos y Condiciones</h2>
              <p className="text-xs text-surface-400 mt-0.5">URL publica: /terms</p>
            </div>
          </div>
          <Link
            to="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-alina-600 hover:text-alina-700 font-medium"
          >
            <Eye className="w-4 h-4" />
            Ver pagina publica
          </Link>
        </div>

        {(terms.modifierName || terms.dateTimeModification) && (
          <div className="flex items-center gap-4 text-xs text-surface-400 mb-3 flex-wrap">
            {terms.modifierName && (
              <span className="inline-flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5" />
                Ultima modificacion por: <span className="font-medium text-surface-300">{terms.modifierName}</span>
              </span>
            )}
            {terms.dateTimeModification && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDateTime(terms.dateTimeModification)}
              </span>
            )}
          </div>
        )}

        <textarea
          value={terms.content}
          onChange={(e) => setTerms((prev) => ({ ...prev, content: e.target.value }))}
          rows={20}
          maxLength={MAX_CONTENT_LENGTH}
          placeholder="Escribe aqui el contenido de los Terminos y Condiciones..."
          className="w-full px-4 py-3 rounded-xl bg-white/70 border border-surface-700/35 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none transition-all font-mono text-sm text-surface-100 placeholder-surface-500 resize-y leading-relaxed whitespace-pre-wrap"
          disabled={savingTerms}
        />

        <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
          <span className="text-xs text-surface-400">
            {terms.content.length} / {MAX_CONTENT_LENGTH} caracteres
          </span>
          <Button
            type="button"
            variant="accent"
            onClick={() => handleSave('terms')}
            loading={savingTerms}
            disabled={savingTerms || !terms.content.trim()}
            icon={Save}
          >
            Guardar Terminos
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LegalSettings;
