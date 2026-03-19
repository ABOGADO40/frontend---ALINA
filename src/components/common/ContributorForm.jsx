import { useState } from 'react';
import { MapPin, Building, User, FileText, Calendar, Phone, Mail, Home } from 'lucide-react';
import Button from './Button';
import Input from './Input';

const ContributorForm = ({ onSubmit, onCancel, loading = false, initialData = {} }) => {
  const [formData, setFormData] = useState({
    actaLugar: initialData.actaLugar || '',
    actaEntidadInterviniente: initialData.actaEntidadInterviniente || '',
    usuarioEntidad: initialData.usuarioEntidad || '',
    aportanteNombreCompleto: initialData.aportanteNombreCompleto || '',
    aportanteDocumentoTipo: initialData.aportanteDocumentoTipo || 'DNI',
    aportanteDocumentoNumero: initialData.aportanteDocumentoNumero || '',
    aportanteCondicion: initialData.aportanteCondicion || 'TESTIGO',
    aportanteCondicionOtro: initialData.aportanteCondicionOtro || '',
    aportanteDomicilio: initialData.aportanteDomicilio || '',
    aportanteTelefono: initialData.aportanteTelefono || '',
    aportanteCorreo: initialData.aportanteCorreo || '',
    dispositivoOrigen: initialData.dispositivoOrigen || '',
    fechaObtencionArchivo: initialData.fechaObtencionArchivo || ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.actaLugar.trim()) {
      newErrors.actaLugar = 'El lugar del acta es requerido';
    }
    if (!formData.actaEntidadInterviniente.trim()) {
      newErrors.actaEntidadInterviniente = 'La entidad interviniente es requerida';
    }
    if (!formData.aportanteNombreCompleto.trim()) {
      newErrors.aportanteNombreCompleto = 'El nombre del aportante es requerido';
    }
    if (!formData.aportanteDocumentoNumero.trim()) {
      newErrors.aportanteDocumentoNumero = 'El numero de documento es requerido';
    }
    if (formData.aportanteCondicion === 'OTRO' && !formData.aportanteCondicionOtro.trim()) {
      newErrors.aportanteCondicionOtro = 'Especifique la condicion';
    }

    if (formData.aportanteCorreo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.aportanteCorreo)) {
      newErrors.aportanteCorreo = 'Correo electronico invalido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const cleanData = { ...formData };
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === '') {
        cleanData[key] = null;
      }
    });

    onSubmit(cleanData);
  };

  const documentTypes = [
    { value: 'DNI', label: 'DNI' },
    { value: 'CE', label: 'Carnet de Extranjeria' },
    { value: 'PASAPORTE', label: 'Pasaporte' },
    { value: 'RUC', label: 'RUC' }
  ];

  const conditionTypes = [
    { value: 'TESTIGO', label: 'Testigo' },
    { value: 'AGRAVIADO', label: 'Agraviado' },
    { value: 'DENUNCIANTE', label: 'Denunciante' },
    { value: 'TERCERO', label: 'Tercero' },
    { value: 'OTRO', label: 'Otro' }
  ];

  const inputClasses = (fieldName) => `w-full px-3 py-2.5 border rounded-xl bg-white/90 text-surface-200 placeholder-surface-500 focus:ring-2 focus:ring-alina-500/15 focus:border-alina-500 transition-all duration-200 ${
    errors[fieldName] ? 'border-danger-400/60' : 'border-surface-700 hover:border-surface-600'
  }`;

  const selectClasses = 'w-full px-3 py-2.5 border border-surface-700 rounded-xl bg-white/90 text-surface-200 focus:ring-2 focus:ring-alina-500/15 focus:border-alina-500 hover:border-surface-600 transition-all duration-200';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Seccion 1: Datos del Acta */}
      <div>
        <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <div className="w-7 h-7 bg-alina-50 rounded-lg flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-alina-600" />
          </div>
          Datos Generales del Acta
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Lugar del Acta <span className="text-danger-400">*</span>
            </label>
            <input
              type="text"
              name="actaLugar"
              value={formData.actaLugar}
              onChange={handleChange}
              placeholder="Ej: Lima, Fiscalia Provincial"
              className={inputClasses('actaLugar')}
            />
            {errors.actaLugar && (
              <p className="mt-1 text-sm text-danger-400">{errors.actaLugar}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Entidad Interviniente <span className="text-danger-400">*</span>
            </label>
            <input
              type="text"
              name="actaEntidadInterviniente"
              value={formData.actaEntidadInterviniente}
              onChange={handleChange}
              placeholder="Ej: Ministerio Publico - Distrito Fiscal de Lima"
              className={inputClasses('actaEntidadInterviniente')}
            />
            {errors.actaEntidadInterviniente && (
              <p className="mt-1 text-sm text-danger-400">{errors.actaEntidadInterviniente}</p>
            )}
          </div>
        </div>
      </div>

      {/* Seccion 2: Usuario ALINA */}
      <div>
        <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <div className="w-7 h-7 bg-alina-50 rounded-lg flex items-center justify-center">
            <Building className="w-3.5 h-3.5 text-alina-600" />
          </div>
          Datos del Usuario ALINA (opcional)
        </h3>
        <div>
          <label className="block text-sm font-medium text-surface-300 mb-1.5">
            Entidad del Usuario
          </label>
          <input
            type="text"
            name="usuarioEntidad"
            value={formData.usuarioEntidad}
            onChange={handleChange}
            placeholder="Ej: Fiscalia Provincial Corporativa Especializada"
            className={inputClasses('usuarioEntidad')}
          />
          <p className="mt-1.5 text-xs text-surface-500">
            Si no se especifica, se usara la entidad del perfil del usuario
          </p>
        </div>
      </div>

      {/* Seccion 3: Identificacion del Aportante */}
      <div>
        <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <div className="w-7 h-7 bg-alina-50 rounded-lg flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-alina-600" />
          </div>
          Identificacion del Aportante
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Nombre Completo <span className="text-danger-400">*</span>
            </label>
            <input
              type="text"
              name="aportanteNombreCompleto"
              value={formData.aportanteNombreCompleto}
              onChange={handleChange}
              placeholder="Nombres y apellidos completos"
              className={inputClasses('aportanteNombreCompleto')}
            />
            {errors.aportanteNombreCompleto && (
              <p className="mt-1 text-sm text-danger-400">{errors.aportanteNombreCompleto}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                Tipo de Documento <span className="text-danger-400">*</span>
              </label>
              <select
                name="aportanteDocumentoTipo"
                value={formData.aportanteDocumentoTipo}
                onChange={handleChange}
                className={selectClasses}
              >
                {documentTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                Numero de Documento <span className="text-danger-400">*</span>
              </label>
              <input
                type="text"
                name="aportanteDocumentoNumero"
                value={formData.aportanteDocumentoNumero}
                onChange={handleChange}
                placeholder="Ej: 12345678"
                className={inputClasses('aportanteDocumentoNumero')}
              />
              {errors.aportanteDocumentoNumero && (
                <p className="mt-1 text-sm text-danger-400">{errors.aportanteDocumentoNumero}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                Condicion <span className="text-danger-400">*</span>
              </label>
              <select
                name="aportanteCondicion"
                value={formData.aportanteCondicion}
                onChange={handleChange}
                className={selectClasses}
              >
                {conditionTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            {formData.aportanteCondicion === 'OTRO' && (
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">
                  Especificar Condicion <span className="text-danger-400">*</span>
                </label>
                <input
                  type="text"
                  name="aportanteCondicionOtro"
                  value={formData.aportanteCondicionOtro}
                  onChange={handleChange}
                  placeholder="Especifique la condicion"
                  className={inputClasses('aportanteCondicionOtro')}
                />
                {errors.aportanteCondicionOtro && (
                  <p className="mt-1 text-sm text-danger-400">{errors.aportanteCondicionOtro}</p>
                )}
              </div>
            )}
          </div>

          {/* Campos opcionales de contacto */}
          <div className="pt-2">
            <p className="text-xs text-surface-500 mb-3 font-medium">Datos de contacto (opcional)</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">
                  <Home className="w-3 h-3 inline mr-1 text-surface-400" />
                  Domicilio
                </label>
                <input
                  type="text"
                  name="aportanteDomicilio"
                  value={formData.aportanteDomicilio}
                  onChange={handleChange}
                  placeholder="Direccion"
                  className={inputClasses('aportanteDomicilio')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">
                  <Phone className="w-3 h-3 inline mr-1 text-surface-400" />
                  Telefono
                </label>
                <input
                  type="text"
                  name="aportanteTelefono"
                  value={formData.aportanteTelefono}
                  onChange={handleChange}
                  placeholder="Numero de telefono"
                  className={inputClasses('aportanteTelefono')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">
                  <Mail className="w-3 h-3 inline mr-1 text-surface-400" />
                  Correo
                </label>
                <input
                  type="email"
                  name="aportanteCorreo"
                  value={formData.aportanteCorreo}
                  onChange={handleChange}
                  placeholder="correo@ejemplo.com"
                  className={inputClasses('aportanteCorreo')}
                />
                {errors.aportanteCorreo && (
                  <p className="mt-1 text-sm text-danger-400">{errors.aportanteCorreo}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seccion 4: Informacion Adicional de la Evidencia */}
      <div>
        <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <div className="w-7 h-7 bg-alina-50 rounded-lg flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-alina-600" />
          </div>
          Informacion Adicional de la Evidencia (opcional)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Dispositivo o Medio de Origen
            </label>
            <input
              type="text"
              name="dispositivoOrigen"
              value={formData.dispositivoOrigen}
              onChange={handleChange}
              placeholder="Ej: Celular iPhone 12, Laptop Dell, USB Kingston"
              className={inputClasses('dispositivoOrigen')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              <Calendar className="w-3 h-3 inline mr-1 text-surface-400" />
              Fecha Aproximada de Obtencion
            </label>
            <input
              type="date"
              name="fechaObtencionArchivo"
              value={formData.fechaObtencionArchivo}
              onChange={handleChange}
              className={inputClasses('fechaObtencionArchivo')}
            />
          </div>
        </div>
      </div>

      {/* Botones de accion */}
      <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/35">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={loading}
        >
          Guardar Aportante
        </Button>
      </div>
    </form>
  );
};

export default ContributorForm;
