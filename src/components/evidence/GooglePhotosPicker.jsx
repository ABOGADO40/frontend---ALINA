import { useCallback, useEffect, useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const PHOTOS_SCOPE = 'https://www.googleapis.com/auth/photospicker.mediaitems.readonly';
const PHOTOS_API = 'https://photospicker.googleapis.com/v1';

/**
 * GooglePhotosPicker
 *
 * Implementa el flujo del Google Photos Picker API (no existe libreria npm madura):
 *   1. Pide access_token via Google Identity Services (GIS) con el scope de Photos Picker
 *   2. Crea una sesion POST /v1/sessions  -> obtiene { id, pickerUri, pollingConfig }
 *   3. Abre el pickerUri en un popup
 *   4. Hace polling GET /v1/sessions/{id} hasta mediaItemsSet === true
 *   5. Lista los mediaItems seleccionados GET /v1/mediaItems?sessionId=...
 *   6. Limpia la sesion DELETE /v1/sessions/{id}
 *   7. Devuelve via callback { mediaItems, sessionId, accessToken }
 *
 * @param {Function} props.onMediaItemsSelected
 * @param {boolean}  props.disabled
 */
const GooglePhotosPicker = ({ onMediaItemsSelected, disabled = false }) => {
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('Importar desde Google Photos');
  const popupRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (popupRef.current && !popupRef.current.closed) {
        try { popupRef.current.close(); } catch (_) { /* ignore */ }
      }
    };
  }, []);

  /**
   * Solicita un access_token a Google Identity Services
   * Carga el script de GIS dinamicamente si no esta presente.
   */
  const requestAccessToken = useCallback(() => {
    return new Promise((resolve, reject) => {
      const startTokenFlow = () => {
        try {
          const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: PHOTOS_SCOPE,
            callback: (response) => {
              if (response.error) return reject(new Error(response.error_description || response.error));
              if (!response.access_token) return reject(new Error('No se obtuvo access_token'));
              resolve(response.access_token);
            },
            error_callback: (err) => reject(new Error(err?.message || 'Error de autorizacion con Google'))
          });
          tokenClient.requestAccessToken({ prompt: '' });
        } catch (err) {
          reject(err);
        }
      };

      // Si GIS ya esta cargado, usarlo directamente
      if (window.google?.accounts?.oauth2) {
        return startTokenFlow();
      }

      // Cargar el script de Google Identity Services
      const existing = document.getElementById('google-identity-services');
      if (existing) {
        existing.addEventListener('load', startTokenFlow, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-identity-services';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => startTokenFlow();
      script.onerror = () => reject(new Error('No se pudo cargar Google Identity Services'));
      document.head.appendChild(script);
    });
  }, []);

  /**
   * Crea una sesion del Picker
   */
  const createSession = async (accessToken) => {
    const res = await fetch(`${PHOTOS_API}/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Error creando sesion del Picker (HTTP ${res.status}): ${text}`);
    }
    return res.json();
  };

  /**
   * Polling: espera hasta que el usuario complete la seleccion (mediaItemsSet === true)
   */
  const waitForSelection = (accessToken, sessionId, pollingConfig) => {
    return new Promise((resolve, reject) => {
      // pollInterval llega como string con formato "5s" o numero; usar fallback razonable
      const parseInterval = (raw) => {
        if (!raw) return 3000;
        if (typeof raw === 'number') return Math.max(raw * 1000, 2000);
        const m = String(raw).match(/^(\d+)/);
        return m ? Math.max(parseInt(m[1]) * 1000, 2000) : 3000;
      };
      const parseTimeout = (raw) => {
        if (!raw) return 3 * 60 * 1000; // 3min default si Google no provee
        if (typeof raw === 'number') return raw * 1000;
        const m = String(raw).match(/^(\d+)/);
        return m ? parseInt(m[1]) * 1000 : 3 * 60 * 1000;
      };

      const baseInterval = parseInterval(pollingConfig?.pollInterval);
      const timeoutMs = parseTimeout(pollingConfig?.timeoutIn);
      const deadline = Date.now() + timeoutMs;
      let stopping = false;

      const stop = () => {
        stopping = true;
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      };

      // NOTA: NO verificamos popup.closed como criterio de abortar.
      // Cross-Origin-Opener-Policy (COOP) hace que esa lectura sea no confiable
      // en popups cross-origin (photospicker.googleapis.com) y produce falsos
      // positivos. Solo confiamos en mediaItemsSet (exito) y timeout (cancelacion).
      // Si el usuario cierra el popup sin seleccionar, esperara hasta el timeout.

      const checkOnce = async () => {
        if (stopping) return;
        try {
          const res = await fetch(`${PHOTOS_API}/sessions/${sessionId}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          if (!res.ok) throw new Error(`Polling HTTP ${res.status}`);
          const data = await res.json();

          if (data.mediaItemsSet === true) {
            stop();
            return resolve();
          }

          if (Date.now() > deadline) {
            stop();
            return reject(new Error('Tiempo de espera agotado para seleccionar fotos. Intenta de nuevo.'));
          }
        } catch (err) {
          stop();
          reject(err);
        }
      };

      pollIntervalRef.current = setInterval(checkOnce, baseInterval);
      checkOnce();
    });
  };

  /**
   * Lista los mediaItems seleccionados en la sesion (paginado)
   */
  const listSessionMediaItems = async (accessToken, sessionId) => {
    const items = [];
    let pageToken = null;
    do {
      const url = new URL(`${PHOTOS_API}/mediaItems`);
      url.searchParams.set('sessionId', sessionId);
      if (pageToken) url.searchParams.set('pageToken', pageToken);
      const res = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!res.ok) throw new Error(`List mediaItems HTTP ${res.status}`);
      const data = await res.json();
      if (data.mediaItems) items.push(...data.mediaItems);
      pageToken = data.nextPageToken || null;
    } while (pageToken);
    return items;
  };

  /**
   * Elimina la sesion (best-effort, no se reporta error)
   */
  const deleteSession = async (accessToken, sessionId) => {
    try {
      await fetch(`${PHOTOS_API}/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
    } catch (_) {
      /* best-effort */
    }
  };

  const handleOpenPicker = useCallback(async () => {
    if (!GOOGLE_CLIENT_ID) {
      console.error('[GooglePhotosPicker] VITE_GOOGLE_CLIENT_ID no configurado');
      alert('Configuracion de Google Client ID faltante. Contacte al administrador.');
      return;
    }

    // ========================================================================
    // PRE-ABRIR popup SINCRONICAMENTE durante el click del usuario.
    // Los navegadores bloquean window.open si NO es resultado directo de un
    // gesto de usuario. Como mas adelante hacemos awaits (requestAccessToken,
    // createSession), si abrieramos el popup despues, el navegador lo bloquea.
    // Pre-abrimos un 'about:blank' aqui (mientras el navegador aun considera
    // que estamos en el contexto del click) y despues lo navegamos al pickerUri.
    // ========================================================================
    popupRef.current = window.open(
      'about:blank',
      'google_photos_picker',
      'width=900,height=700,resizable=yes,scrollbars=yes'
    );

    if (!popupRef.current) {
      alert('El navegador bloqueo el popup. Habilita los pop-ups para localhost:5173 (o tu dominio) y vuelve a intentar.');
      return;
    }

    // Mostrar mensaje en el popup mientras se prepara la sesion
    try {
      popupRef.current.document.write(
        '<html><head><title>Cargando Google Photos...</title></head>' +
        '<body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f5f5f5;">' +
        '<div style="text-align:center;color:#444;">' +
        '<div style="width:48px;height:48px;border:4px solid #ddd;border-top-color:#0e7490;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 16px;"></div>' +
        '<p style="font-size:14px;">Preparando Google Photos...</p>' +
        '<p style="font-size:12px;color:#888;margin-top:8px;">Por favor espera unos segundos.</p>' +
        '</div>' +
        '<style>@keyframes spin{to{transform:rotate(360deg)}}</style>' +
        '</body></html>'
      );
      popupRef.current.document.close();
    } catch (_) {
      // about:blank en algunos navegadores puede no permitir document.write; ignorar.
    }

    setLoading(true);
    setStatusText('Solicitando autorizacion...');

    try {
      const accessToken = await requestAccessToken();

      setStatusText('Creando sesion del Picker...');
      const session = await createSession(accessToken);

      // Si el usuario cerro el popup mientras autorizaba, abortar limpiamente.
      // Aqui es seguro chequear popupRef.current porque la URL aun es about:blank
      // (same-origin con la page padre) y no hay restriccion de COOP.
      let popupAvailable = true;
      try {
        popupAvailable = popupRef.current && !popupRef.current.closed;
      } catch (_) {
        popupAvailable = true; // si lanza, asumir disponible
      }
      if (!popupAvailable) {
        throw new Error('El popup fue cerrado antes de completar la autorizacion. Intenta de nuevo.');
      }

      // Navegar el popup ya abierto al pickerUri (NO usar window.open nuevamente)
      setStatusText('Abriendo Google Photos...');
      try {
        popupRef.current.location.href = session.pickerUri;
      } catch (navErr) {
        console.error('[GooglePhotosPicker] Error navegando popup al pickerUri:', navErr);
        throw new Error('No se pudo navegar al selector de Google Photos.');
      }

      setStatusText('Esperando seleccion en Google Photos...');
      await waitForSelection(accessToken, session.id, session.pollingConfig);

      // ======================================================================
      // CIERRE DEL POPUP - LIMITACION TECNICA CONOCIDA
      // ======================================================================
      // Tras navegar a photos.google.com (cross-origin), Chrome aplica
      // Cross-Origin-Opener-Policy y DESACOPLA el popup del opener:
      //   - popup.closed mentirosamente reporta true aunque la ventana siga visible
      //   - popup.close() se ejecuta sin error pero NO cierra la ventana
      //   - popup.location.href = ... ya no llega al popup
      // Esto es una proteccion de seguridad del navegador (anti-tabnabbing).
      //
      // Verificado con Playwright en Chrome moderno (2026): las 3 estrategias
      // (close directo, about:blank+close, retry) fallan consistentemente.
      //
      // Solucion: esperar 2s para que el usuario vea "Hecho" en Google Photos,
      // intentar close() (por si funciona en navegadores antiguos), y SIEMPRE
      // mostrar un toast informativo persistente porque no podemos verificar
      // si cerro (popup.closed miente cross-origin).
      // ======================================================================
      setStatusText('Seleccion confirmada. Procesando...');

      // Esperar 2 segundos para que el usuario vea "Hecho" en Google Photos
      await new Promise((r) => setTimeout(r, 2000));

      // Intento de cierre (puede fallar silenciosamente por COOP, pero por si acaso)
      try { popupRef.current?.close(); } catch (_) { /* ignore */ }

      // SIEMPRE mostrar aviso prominente al usuario porque no podemos
      // verificar de forma confiable si la ventana cerro (COOP miente).
      // Toast persistente de 8s con icono claro.
      toast(
        'Cierra la ventana de Google Photos. Tus fotos se estan procesando aqui.',
        {
          icon: '👉',
          duration: 8000,
          style: {
            background: '#fef3c7',
            color: '#78350f',
            border: '2px solid #f59e0b',
            fontWeight: '600'
          }
        }
      );

      setStatusText('Obteniendo items seleccionados...');
      const items = await listSessionMediaItems(accessToken, session.id);

      // IMPORTANTE: NO eliminar la sesion aqui. El backend necesita usarla
      // para descargar las fotos (llamando listSessionMediaItems con el mismo
      // sessionId). La sesion expira sola tras ~1 dia segun expireTime de la
      // Photos Picker API. Si se necesita cleanup explicito, debe hacerse
      // en el backend DESPUES de procesar las descargas.

      if (items.length === 0) {
        console.warn('[GooglePhotosPicker] No se selecciono ningun media item');
        alert('No se selecciono ningun elemento.');
        return;
      }

      // Normalizar para enviar al backend (sin baseUrl - el backend pedira
      // metadata fresca con sessionId+id porque baseUrl expira ~60min)
      const mediaItems = items.map(it => ({
        id: it.id,
        type: it.type || null,
        mimeType: it.mediaFile?.mimeType || null,
        filename: it.mediaFile?.filename || it.id
      }));

      onMediaItemsSelected({
        mediaItems,
        sessionId: session.id,
        accessToken
      });
    } catch (err) {
      console.error('[GooglePhotosPicker] Error:', err);
      // Cerrar popup si todavia esta abierto
      try {
        if (popupRef.current && !popupRef.current.closed) {
          popupRef.current.close();
        }
      } catch (_) { /* ignore */ }
      alert(`Error al importar desde Google Photos: ${err.message}`);
    } finally {
      setLoading(false);
      setStatusText('Importar desde Google Photos');
    }
  }, [requestAccessToken, onMediaItemsSelected]);

  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleOpenPicker}
      disabled={disabled || loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-dashed border-surface-700/50 rounded-xl text-surface-300 hover:border-alina-500 hover:text-alina-600 hover:bg-alina-50/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ImagePlus className="w-5 h-5" />
      <span className="font-medium">{statusText}</span>
    </button>
  );
};

export default GooglePhotosPicker;
