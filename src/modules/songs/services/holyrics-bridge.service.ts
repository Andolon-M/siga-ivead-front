import type { HolyricsConfig, LiveSyncState } from '../types/live-sync.types';

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

/**
 * Secciones instrumentales que deben vaciar la pantalla
 */
const CLEAR_SECTIONS = [
  'conteo', 'count', 'click', 'vamp', 'instrumental', 'inst',
  'solo', 'interludio', 'interlude', 'corte', 'break',
  'pausa', 'silencio', 'mute', 'vaciar', 'clear',
];

function isClearSection(name: string): boolean {
  const lower = name.toLowerCase().trim();
  return CLEAR_SECTIONS.some((kw) => lower === kw || lower.startsWith(`${kw} `) || lower.startsWith(`${kw}-`));
}

/**
 * Calcula puntaje de coincidencia entre títulos de canciones (0-1000)
 */
function scoreTitleMatch(query: string, candidate: string): number {
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const c = candidate.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!q || !c) return 0;
  if (q === c) return 1000;
  if (q.startsWith(c) || c.startsWith(q)) return Math.max(800 - Math.abs(q.length - c.length) * 15, 400);
  const qw = q.split(' ').filter((w) => w.length > 2);
  const cw = c.split(' ').filter((w) => w.length > 2);
  if (!qw.length || !cw.length) return 0;
  let m = 0;
  for (const w of qw) if (cw.includes(w)) m++;
  return Math.round((m * 2 / (qw.length + cw.length)) * 600);
}

class HolyricsBridgeService {
  private config: HolyricsConfig;
  private logs: BridgeLogEntry[] = [];
  private listeners: ((logs: BridgeLogEntry[]) => void)[] = [];
  private activeSongId: string | null = null;
  private isOpening = false;
  private cachedSongs: Array<{ id: string; title: string }> = [];

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
      if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    } catch {}
    return { ...DEFAULT_CONFIG };
  }

  public subscribeLogs(cb: (logs: BridgeLogEntry[]) => void): () => void {
    this.listeners.push(cb);
    cb([...this.logs]);
    return () => { this.listeners = this.listeners.filter((l) => l !== cb); };
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

  private async api<T = any>(action: string, body: Record<string, any> = {}): Promise<{ ok: boolean; data?: T; error?: string }> {
    const { host, port, token } = this.config;
    const url = `http://${(host || 'localhost').trim()}:${port || 8091}/api/${action}?token=${encodeURIComponent((token || '').trim())}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.status === 'ok') return { ok: true, data: json.data };
      return { ok: false, error: json.error || `HTTP ${res.status}` };
    } catch (err: any) {
      return { ok: false, error: err.message || 'Error de red' };
    }
  }

  // ─── Conexión ─────────────────────────────────────────────────────

  public async testConnection(): Promise<{ success: boolean; message: string }> {
    this.addLog('info', 'Verificando conexión con Holyrics...');
    const tokenRes = await this.api('GetTokenInfo', {});
    if (tokenRes.ok) {
      const ver = tokenRes.data?.version || '2.x';
      const songRes = await this.api('GetSongs', { fields: 'id,title' });
      if (Array.isArray(songRes.data)) this.cachedSongs = songRes.data;
      const msg = `Holyrics v${ver} conectado (${this.cachedSongs.length} canciones)`;
      this.addLog('success', msg);
      return { success: true, message: msg };
    }
    if (tokenRes.error === 'unauthorized action' || tokenRes.error === 'invalid token') {
      const msg = 'Token inválido. Holyrics > Settings > API server > Manage Permissions.';
      this.addLog('error', msg);
      return { success: false, message: msg };
    }
    const msg = tokenRes.error || 'No se pudo contactar Holyrics';
    this.addLog('error', msg);
    return { success: false, message: msg };
  }

  // ─── Flujo principal: Ableton → Holyrics ──────────────────────────

  /**
   * Recibe el evento de sección desde Ableton (vía WebSocket).
   * 
   * Flujo SIMPLE:
   * 1. rawSection viene TAL CUAL del clip de Ableton (ej: "Verso 2.1")
   * 2. Se convierte a minúsculas (ej: "verso 2.1")
   * 3. Se envía a Holyrics como ActionGoToSlideDescription({ name: "verso 2.1" })
   * 4. Si no existe esa etiqueta → F9 (pantalla vacía)
   * 5. Si existe → F9 off, F8 off (mostrar letra)
   */
  public async handleLiveSyncTrigger(state: LiveSyncState): Promise<void> {
    if (!this.config.enabled || !this.config.autoTrigger) return;

    // rawSection = nombre EXACTO del clip en Ableton
    const rawSection = (state.rawSection || state.section || state.normalizedSection || '').trim();
    const songTitle = (state.songTitle || '').trim();
    const songId = String(state.songId || '');

    if (!rawSection) return;

    this.addLog('info', `📡 Ableton: "${rawSection}"`);

    try {
      // 1. Abrir canción en Holyrics si es nueva
      if (this.activeSongId !== songId) {
        await this.openSong(songId, songTitle);
        await this.delay(250);
      }

      // 2. Sección instrumental → vaciar pantalla
      if (isClearSection(rawSection)) {
        this.addLog('info', `🎸 [${rawSection}] instrumental → F9`);
        await this.api('SetF9', { enable: true });
        return;
      }

      // 3. Enviar el nombre del clip en minúsculas como etiqueta de Holyrics
      const slideName = rawSection.toLowerCase().trim();
      this.addLog('info', `🔍 Buscando etiqueta: "${slideName}"`);

      let res = await this.api('ActionGoToSlideDescription', { name: slideName });

      // Si no hay presentación abierta, intentar abrir y reintentar
      if (!res.ok && res.error?.includes('presentation')) {
        this.addLog('info', 'Presentación no abierta, reabriendo...');
        await this.openSong(songId, songTitle);
        await this.delay(250);
        res = await this.api('ActionGoToSlideDescription', { name: slideName });
      }

      if (res.ok) {
        // Etiqueta encontrada → mostrar letra
        await this.api('SetF9', { enable: false });
        await this.api('SetF8', { enable: false });
        this.addLog('success', `✅ Proyectando: "${slideName}"`);
      } else {
        // Etiqueta no encontrada → vaciar pantalla
        this.addLog('info', `❌ "${slideName}" no encontrada → F9`);
        await this.api('SetF9', { enable: true });
      }
    } catch (err: any) {
      this.addLog('error', `Error: ${err.message}`);
    }
  }

  // ─── Play / Stop de Ableton ───────────────────────────────────────

  public async handlePlaybackState(payload: { isPlaying: boolean; songId?: string; songTitle?: string }): Promise<void> {
    if (!this.config.enabled || !this.config.autoTrigger) return;

    if (payload.isPlaying) {
      this.addLog('info', '▶️ Ableton Play: abriendo canción...');
      if (payload.songId) {
        await this.openSong(String(payload.songId), payload.songTitle || '');
        await this.delay(200);
        await this.api('SetF9', { enable: true }); // Pantalla vacía hasta la primera estrofa
      }
    } else {
      this.addLog('info', '⏹️ Ableton Stop: cerrando presentación');
      await this.api('CloseCurrentPresentation', {});
      this.activeSongId = null;
    }
  }

  // ─── Abrir canción en Holyrics ────────────────────────────────────

  private async openSong(songId: string, songTitle: string): Promise<boolean> {
    if (this.isOpening) return false;
    this.isOpening = true;

    try {
      // Cargar catálogo si está vacío
      if (this.cachedSongs.length === 0) {
        const res = await this.api('GetSongs', { fields: 'id,title' });
        if (res.ok && Array.isArray(res.data)) this.cachedSongs = res.data;
      }

      // Buscar mejor coincidencia por título
      let best: { id: string; title: string } | null = null;
      let bestScore = 0;

      if (songTitle) {
        for (const s of this.cachedSongs) {
          const score = scoreTitleMatch(songTitle, s.title);
          if (score > bestScore) { bestScore = score; best = s; }
        }
      }

      // Fallback por ID
      if (!best) {
        best = this.cachedSongs.find((s) => String(s.id) === String(songId)) || null;
      }

      if (best) {
        this.addLog('info', `Abriendo: "${best.title}"`);
        const res = await this.api('ShowLyrics', { id: best.id });
        if (res.ok) {
          this.activeSongId = songId;
          this.addLog('success', `Canción cargada: "${best.title}"`);
          return true;
        }
      } else {
        this.addLog('info', `"${songTitle || songId}" no encontrada en Holyrics`);
      }

      this.activeSongId = songId;
      return false;
    } finally {
      this.isOpening = false;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }
}

export const holyricsBridgeService = new HolyricsBridgeService();
