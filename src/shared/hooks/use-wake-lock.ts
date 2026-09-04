import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseWakeLockOptions {
  /**
   * Si es true, intentará activar el bloqueo de pantalla automáticamente al montar el componente.
   * Por defecto: true
   */
  autoLock?: boolean;
  /**
   * Callback que se ejecuta cuando el estado de bloqueo cambia.
   */
  onChange?: (isLocked: boolean) => void;
  /**
   * Callback que se ejecuta cuando ocurre un error al solicitar el bloqueo.
   */
  onError?: (err: Error) => void;
}

export interface UseWakeLockReturn {
  /** Indica si la API de Screen Wake Lock es soportada por el navegador */
  isSupported: boolean;
  /** Indica si el bloqueo de pantalla está actualmente activo */
  isLocked: boolean;
  /** Error si ocurrió alguno al solicitar el bloqueo */
  error: Error | null;
  /** Solicita activar el bloqueo de pantalla */
  request: () => Promise<boolean>;
  /** Libera el bloqueo de pantalla */
  release: () => Promise<void>;
  /** Alterna entre activar y desactivar */
  toggle: () => Promise<boolean>;
}

/**
 * Hook para controlar el Screen Wake Lock API.
 * Evita que la pantalla de dispositivos móviles o computadoras se apague o entre en suspensión
 * mientras el usuario está visualizando el contenido (por ejemplo, leyendo canciones o acordes).
 */
export function useWakeLock(options: UseWakeLockOptions = {}): UseWakeLockReturn {
  const { autoLock = true, onChange, onError } = options;

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const isSupported = typeof window !== 'undefined' && 'wakeLock' in navigator;
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const isDesiredRef = useRef<boolean>(autoLock);
  const onChangeRef = useRef(onChange);
  const onErrorRef = useRef(onError);

  onChangeRef.current = onChange;
  onErrorRef.current = onError;

  // Actualiza el estado y ejecuta callbacks
  const updateLockState = useCallback((locked: boolean) => {
    setIsLocked(locked);
    onChangeRef.current?.(locked);
  }, []);

  // Función interna para solicitar el bloqueo
  const request = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      return false;
    }

    try {
      // Si ya tenemos un sentinel activo y no está liberado, no duplicar
      if (sentinelRef.current && !sentinelRef.current.released) {
        updateLockState(true);
        return true;
      }

      const sentinel = await navigator.wakeLock.request('screen');
      sentinelRef.current = sentinel;
      isDesiredRef.current = true;
      setError(null);
      updateLockState(true);

      // Manejar liberación automática por parte del sistema (ej. cambio de pestaña, bloqueo manual, batería baja)
      sentinel.addEventListener('release', () => {
        sentinelRef.current = null;
        updateLockState(false);
      });

      return true;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      onErrorRef.current?.(errorObj);
      return false;
    }
  }, [isSupported, updateLockState]);

  // Función para liberar el bloqueo
  const release = useCallback(async (): Promise<void> => {
    isDesiredRef.current = false;

    if (sentinelRef.current && !sentinelRef.current.released) {
      try {
        await sentinelRef.current.release();
      } catch (err) {
        console.warn('Error al liberar WakeLock:', err);
      }
    }
    sentinelRef.current = null;
    updateLockState(false);
  }, [updateLockState]);

  // Alternar
  const toggle = useCallback(async (): Promise<boolean> => {
    if (isLocked) {
      await release();
      return false;
    } else {
      return await request();
    }
  }, [isLocked, release, request]);

  // Manejar reconexión automática al volver a la pestaña (visibilitychange)
  useEffect(() => {
    if (!isSupported) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isDesiredRef.current) {
        await request();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSupported, request]);

  // Intentar adquirir el bloqueo automáticamente al montar o con la primera interacción si autoLock es true
  useEffect(() => {
    if (!isSupported || !autoLock) return;

    isDesiredRef.current = true;
    let isSubscribed = true;

    const tryAcquire = async () => {
      if (!isSubscribed) return;
      const success = await request();
      // Si el navegador requirió interacción del usuario para permitir Wake Lock,
      // registramos un listener de una sola vez en touchstart/click
      if (!success && isDesiredRef.current) {
        const handleFirstInteraction = async () => {
          if (isDesiredRef.current && (!sentinelRef.current || sentinelRef.current.released)) {
            await request();
          }
          window.removeEventListener('touchstart', handleFirstInteraction);
          window.removeEventListener('click', handleFirstInteraction);
        };
        window.addEventListener('touchstart', handleFirstInteraction, { once: true, passive: true });
        window.addEventListener('click', handleFirstInteraction, { once: true, passive: true });
      }
    };

    tryAcquire();

    return () => {
      isSubscribed = false;
      if (sentinelRef.current && !sentinelRef.current.released) {
        sentinelRef.current.release().catch(() => {});
      }
      sentinelRef.current = null;
    };
  }, [isSupported, autoLock, request]);

  return {
    isSupported,
    isLocked,
    error,
    request,
    release,
    toggle,
  };
}
