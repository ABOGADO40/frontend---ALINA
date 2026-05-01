import { useCallback, useRef, useEffect } from 'react';
import useDrivePicker from 'react-google-drive-picker';
import { HardDrive } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_APP_ID = import.meta.env.VITE_GOOGLE_APP_ID;

// MIME types nativos de Google que NO se deben importar
const GOOGLE_NATIVE_MIMES = [
  'application/vnd.google-apps.document',
  'application/vnd.google-apps.spreadsheet',
  'application/vnd.google-apps.presentation',
  'application/vnd.google-apps.form',
  'application/vnd.google-apps.drawing',
  'application/vnd.google-apps.site',
  'application/vnd.google-apps.script'
];

/**
 * GoogleDrivePicker - Boton que abre el selector de Google Drive
 * @param {Object} props
 * @param {Function} props.onFilesSelected - Callback con { files: [{id, name, mimeType, sizeBytes}], accessToken }
 * @param {boolean} props.disabled - Deshabilitar boton
 */
const GoogleDrivePicker = ({ onFilesSelected, disabled = false }) => {
  const [openPicker, authResponse] = useDrivePicker();
  const authResponseRef = useRef(null);

  // Mantener ref sincronizado con authResponse para acceder dentro de callbacks
  useEffect(() => {
    if (authResponse) {
      authResponseRef.current = authResponse;
    }
  }, [authResponse]);

  const handleOpenPicker = useCallback(() => {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_API_KEY) {
      console.error('Google Drive credentials not configured');
      return;
    }

    openPicker({
      clientId: GOOGLE_CLIENT_ID,
      developerKey: GOOGLE_API_KEY,
      appId: GOOGLE_APP_ID,
      viewId: 'DOCS',
      customScopes: ['https://www.googleapis.com/auth/drive.file'],
      showUploadView: false,
      showUploadFolders: false,
      supportDrives: true,
      multiselect: true,
      callbackFunction: (data) => {
        if (data.action === 'cancel') {
          return;
        }

        if (data.action === 'picked' && data.docs) {
          // Filtrar archivos nativos de Google
          const validFiles = data.docs.filter(
            doc => !GOOGLE_NATIVE_MIMES.includes(doc.mimeType)
          );

          const skippedFiles = data.docs.filter(
            doc => GOOGLE_NATIVE_MIMES.includes(doc.mimeType)
          );

          if (skippedFiles.length > 0) {
            console.warn(
              `[GoogleDrivePicker] ${skippedFiles.length} archivo(s) nativo(s) de Google omitido(s):`,
              skippedFiles.map(f => f.name)
            );
          }

          if (validFiles.length > 0) {
            // El token viene de authResponse (via ref), no de data.access_token
            const accessToken = data.access_token
              || authResponseRef.current?.access_token
              || authResponseRef.current?.token;

            onFilesSelected({
              files: validFiles.map(doc => ({
                id: doc.id,
                name: doc.name,
                mimeType: doc.mimeType,
                sizeBytes: doc.sizeBytes || 0
              })),
              accessToken
            });
          }
        }
      }
    });
  }, [openPicker, onFilesSelected]);

  // No renderizar si no hay credenciales configuradas
  if (!GOOGLE_CLIENT_ID || !GOOGLE_API_KEY) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleOpenPicker}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-dashed border-surface-700/50 rounded-xl text-surface-300 hover:border-alina-500 hover:text-alina-600 hover:bg-alina-50/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <HardDrive className="w-5 h-5" />
      <span className="font-medium">Importar desde Google Drive</span>
    </button>
  );
};

export default GoogleDrivePicker;
