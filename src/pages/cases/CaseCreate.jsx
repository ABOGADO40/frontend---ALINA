import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FolderOpen } from 'lucide-react';
import { Button, Input, Alert } from '../../components/common';
import caseService from '../../services/caseService';
import toast from 'react-hot-toast';

/**
 * CaseCreate Page
 * Form to create a new case
 */
const CaseCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    setApiError(null);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El titulo es requerido';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'El titulo debe tener al menos 3 caracteres';
    } else if (formData.title.trim().length > 255) {
      newErrors.title = 'El titulo no puede exceder 255 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    setApiError(null);

    try {
      const response = await caseService.createCase({
        title: formData.title.trim(),
        description: formData.description.trim() || null
      });

      toast.success('Caso creado exitosamente');
      navigate(`/cases/${response.data.id}`);
    } catch (err) {
      setApiError(err.error?.message || 'Error al crear el caso');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/cases">
          <Button variant="ghost" size="sm" icon={ArrowLeft}>
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Nuevo Caso</h1>
          <p className="text-surface-300 mt-1">Crea un nuevo expediente para organizar tus evidencias</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white/90 rounded-2xl border border-surface-700/35 p-6 md:p-8">
        {/* Icon */}
        <div className="w-16 h-16 bg-alina-50 rounded-xl flex items-center justify-center mb-6">
          <FolderOpen className="w-8 h-8 text-alina-600" />
        </div>

        {/* API Error */}
        {apiError && (
          <Alert
            type="error"
            message={apiError}
            className="mb-6"
            dismissible
            onDismiss={() => setApiError(null)}
          />
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Titulo del Caso"
            name="title"
            placeholder="Ej: Caso Civil 2026-001"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            required
            disabled={submitting}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-300">
              Descripcion <span className="text-surface-500">(opcional)</span>
            </label>
            <textarea
              name="description"
              placeholder="Describe brevemente el caso o expediente..."
              value={formData.description}
              onChange={handleChange}
              disabled={submitting}
              rows={4}
              className="block w-full rounded-xl border border-surface-700 bg-white/90 px-4 py-2.5 text-surface-100 placeholder-surface-500 focus:border-alina-500 focus:ring-2 focus:ring-alina-500/20 transition-colors duration-200 disabled:bg-surface-900/60 disabled:cursor-not-allowed"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4">
            <Button
              type="submit"
              loading={submitting}
            >
              Crear Caso
            </Button>
            <Link to="/cases">
              <Button variant="secondary" disabled={submitting}>
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </div>

      {/* Help Text */}
      <div className="bg-alina-50/50 rounded-2xl p-6">
        <h3 className="font-medium text-alina-800 mb-2">Consejo</h3>
        <p className="text-sm text-alina-700">
          Los casos te permiten agrupar evidencias relacionadas. Puedes crear un caso por expediente
          legal, proyecto, o cualquier otra agrupacion que necesites. Una vez creado, podras
          asociar evidencias al caso.
        </p>
      </div>
    </div>
  );
};

export default CaseCreate;
