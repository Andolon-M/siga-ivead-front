import { HolyricsConfig, LiveSyncState } from '../types/live-sync.types';

const STORAGE_KEY = 'holyrics_bridge_config';

const DEFAULT_CONFIG: HolyricsConfig = {
  enabled: false,
  host: 'localhost',
  port: 8091,
  token: '',
  autoTrigger: true,
};

export interface BridgeLogEntry {
  id: string;
  timestamp: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

class HolyricsBridgeService {
  private config: HolyricsConfig;
  private logs: BridgeLogEntry[] = [];
  private listeners: ((logs: BridgeLogEntry[]) => void)[] = [];

  constructor() {
    this.config = this.loadConfig();
  }

  public getConfig(): HolyricsConfig {
    return { ...this.config };
  }

  public saveConfig(newConfig: Partial<HolyricsConfig>): HolyricsConfig {
    this.config = { ...this.config, ...newConfig };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch (err) {
      console.error('[HolyricsBridge] Error guardando configuración:', err);
    }
    return this.getConfig();
  }

  private loadConfig(): HolyricsConfig {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch (err) {
      console.error('[HolyricsBridge] Error cargando configuración:', err);
    }
    return { ...DEFAULT_CONFIG };
  }

  public subscribeLogs(callback: (logs: BridgeLogEntry[]) => void): () => void {
    this.listeners.push(callback);
    callback([...this.logs]);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private addLog(type: 'success' | 'error' | 'info', message: string) {
    const entry: BridgeLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    };
    this.logs = [entry, ...this.logs.slice(0, 49)];
    this.listeners.forEach((l) => l([...this.logs]));
  }

  /**
   * Prueba la conexión local con el API Server de Holyrics
   */
  public async testConnection(): Promise<{ success: boolean; message: string }> {
    const { host, port, token } = this.config;
    const url = `http://${host || 'localhost'}:${port || 8091}/api/version`;

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (res.ok || res.status === 401 || res.status === 404) {
        this.addLog('success', `Conexión con Holyrics detectada en ${url} (HTTP ${res.status})`);
        return { success: true, message: `Servidor Holyrics respondió correctamente (HTTP ${res.status})` };
      }

      this.addLog('error', `Error HTTP ${res.status} al conectar con Holyrics en ${url}`);
      return { success: false, message: `Error HTTP ${res.status}: ${res.statusText}` };
    } catch (err: any) {
      const msg = err.message || 'No se pudo conectar al API server de Holyrics. Asegúrate de haberlo habilitado en File > Settings > API server.';
      this.addLog('error', `Fallo de conexión: ${msg}`);
      return { success: false, message: msg };
    }
  }

  /**
   * Dispara el cambio de sección/diapositiva en Holyrics
   */
  public async handleLiveSyncTrigger(state: LiveSyncState): Promise<void> {
    if (!this.config.enabled || !this.config.autoTrigger) {
      return;
    }

    const { host, port, token } = this.config;
    const baseUrl = `http://${host || 'localhost'}:${port || 8091}`;

    const sectionName = state.normalizedSection;
    const songTitle = state.songTitle || `Canción ${state.songId}`;

    try {
      this.addLog('info', `Enviando a Holyrics: [${sectionName}] para "${songTitle}"`);

      // Intentar disparar vía endpoint genérico de acción / diapositiva de Holyrics
      const payload = {
        song_id: state.songId,
        song_title: songTitle,
        section: sectionName,
        section_slug: state.sectionSlug,
        action: 'show_section',
      };

      const response = await fetch(`${baseUrl}/api/presentation/section`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }).catch(async () => {
        // Fallback a endpoint alternativo de API item si el principal difiere por versión
        return fetch(`${baseUrl}/api/item/trigger`, {
          method: 'POST',
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ item: sectionName, ...payload }),
        });
      });

      if (response && response.ok) {
        this.addLog('success', `Holyrics actualizado con éxito: [${sectionName}]`);
      } else if (response) {
        this.addLog('info', `Señal enviada a Holyrics (Respuesta HTTP ${response.status})`);
      }
    } catch (err: any) {
      this.addLog('error', `Error al comunicar con Holyrics: ${err.message}`);
    }
  }
}

export const holyricsBridgeService = new HolyricsBridgeService();
