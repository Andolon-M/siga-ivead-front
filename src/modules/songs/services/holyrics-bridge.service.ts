import type { HolyricsConfig, LiveSyncState } from '../types/live-sync.types';

const STORAGE_KEY = 'holyrics_bridge_config';

const DEFAULT_CONFIG: HolyricsConfig = {
  enabled: false,
  host: 'localhost',
  port: 8091,
  token: '',
  autoTrigger: true,
  songMappings: {},
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
 * Limpia sufijos ruidosos, números de ID y etiquetas de versión de títulos de canciones
 * Ej: "Te doy gloria / Vamos a cantar 13" -> "Te doy gloria / Vamos a cantar"
 * Ej: "Grande y Fuerte (En Vivo)" -> "Grande y Fuerte"
 */
export function cleanSongTitle(title: string): string {
  if (!title) return '';
  return title
    .replace(/\s+#?\d+$/i, '')
    .replace(/\s*\(\d+\)$/i, '')
    .replace(/\s*\(?(?:en vivo|live|acustico|acoustic|cover|official|oficial|video oficial|letra|lyrics)\)?/gi, '')
    .trim();
}

/**
 * Divide un título de popurrí / medley en sus canciones componentes individuales
 * Ej: "Te doy gloria / Vamos a cantar" -> ["Te doy gloria / Vamos a cantar", "Te doy gloria", "Vamos a cantar"]
 */
export function splitMedleyTitles(title: string): string[] {
  const cleaned = cleanSongTitle(title);
  if (!cleaned) return [];

  const parts = cleaned
    .split(/\s*(?:\/|\+|\band\b|\by\b|\||\s-\s)\s*/i)
    .map((p) => p.trim())
    .filter((p) => p.length > 1);

  if (parts.length <= 1) {
    return [cleaned];
  }

  return Array.from(new Set([cleaned, ...parts]));
}

function normalizeForMatch(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calcula puntaje de coincidencia inteligente entre títulos de canciones (0-1000)
 * Soporta de forma nativa medleys, artistas, números de versión y variaciones de espaciado.
 */
export function scoreTitleMatch(query: string, candidate: string, artist?: string): number {
  const cleanQ = cleanSongTitle(query);
  const cleanC = cleanSongTitle(candidate);

  const q = normalizeForMatch(cleanQ);
  const c = normalizeForMatch(cleanC);

  if (!q || !c) return 0;
  if (q === c) return 1000;

  const rawQWords = q.split(' ').filter((w) => w.length > 1 && !/^\d+$/.test(w));
  const rawCWords = c.split(' ').filter((w) => w.length > 1 && !/^\d+$/.test(w));

  if (!rawQWords.length || !rawCWords.length) return 0;

  // 1. ¿El candidato contiene TODAS las palabras clave de la consulta?
  // (Caso Medley: "Te Doy Gloria / Vamos a Cantar" -> candidate "Te Doy Gloria / Vamos a Cantar - Vision Juvenil")
  const matchingQWords = rawQWords.filter((w) => rawCWords.includes(w));
  const matchRatioQ = matchingQWords.length / rawQWords.length;

  if (matchRatioQ === 1) {
    if (c.includes(q) || q.includes(c)) {
      return 960 - Math.min(Math.abs(q.length - c.length) * 2, 70);
    }
    return 910 - Math.min(Math.abs(rawCWords.length - rawQWords.length) * 10, 70);
  }

  // 2. Si la consulta es un Medley (ej: "Te Doy Gloria / Vamos a Cantar"):
  // Verificar si el candidato coincide con una de las sub-canciones
  const medleyParts = splitMedleyTitles(query);
  if (medleyParts.length > 1) {
    for (let i = 1; i < medleyParts.length; i++) {
      const partNorm = normalizeForMatch(medleyParts[i]);
      if (partNorm && (c === partNorm || c.startsWith(partNorm) || partNorm.startsWith(c))) {
        // Coincide con una de las canciones del medley
        return 620 - Math.min(Math.abs(c.length - partNorm.length) * 4, 80);
      }
    }
  }

  // 3. Coincidencia por coeficiente de palabras compartidas
  const matchingCWords = rawCWords.filter((w) => rawQWords.includes(w));
  const diceScore = (matchingQWords.length + matchingCWords.length) / (rawQWords.length + rawCWords.length);

  let artistBoost = 0;
  if (artist) {
    const a = normalizeForMatch(artist);
    const aWords = a.split(' ').filter((w) => w.length > 2);
    if (aWords.some((w) => rawCWords.includes(w))) {
      artistBoost = 40;
    }
  }

  return Math.round(diceScore * 600) + artistBoost;
}

class HolyricsBridgeService {
  private config: HolyricsConfig;
  private logs: BridgeLogEntry[] = [];
  private listeners: ((logs: BridgeLogEntry[]) => void)[] = [];
  private activeSongId: string | null = null;
  private activeHolyricsTitle: string | null = null;
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
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          songMappings: parsed.songMappings || {},
        };
      }
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

  public async api<T = any>(action: string, body: Record<string, any> = {}): Promise<{ ok: boolean; data?: T; error?: string }> {
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

  // ─── Gestión de Catálogo y Vinculaciones ───────────────────────────

  public async getHolyricsSongs(forceRefresh = false): Promise<Array<{ id: string; title: string }>> {
    if (this.cachedSongs.length > 0 && !forceRefresh) {
      return this.cachedSongs;
    }
    try {
      const res = await this.api('GetSongs', { fields: 'id,title' });
      if (res.ok && Array.isArray(res.data)) {
        this.cachedSongs = res.data;
        return this.cachedSongs;
      }
    } catch (err) {
      console.warn('[HolyricsBridge] Error cargando catálogo:', err);
    }
    return this.cachedSongs;
  }

  /**
   * Vincula manualmente una canción de SIGA con una de Holyrics
   */
  public linkSong(sigaSongId: string, holyricsSongId: string): void {
    const currentMappings = { ...(this.config.songMappings || {}) };
    if (holyricsSongId) {
      currentMappings[String(sigaSongId)] = String(holyricsSongId);
    } else {
      delete currentMappings[String(sigaSongId)];
    }
    this.saveConfig({ songMappings: currentMappings });
    this.addLog('info', `🔗 Canción SIGA #${sigaSongId} vinculada a Holyrics ID #${holyricsSongId}`);
  }

  /**
   * Obtiene la mejor coincidencia de Holyrics para una canción de SIGA
   */
  public getMatchedHolyricsSong(
    sigaSongId: string,
    sigaSongTitle?: string,
    artist?: string
  ): { id: string; title: string; isManual: boolean; score: number } | null {
    const songIdStr = String(sigaSongId);
    const manualId = this.config.songMappings?.[songIdStr];

    if (manualId && this.cachedSongs.length > 0) {
      const manualSong = this.cachedSongs.find((s) => String(s.id) === String(manualId));
      if (manualSong) {
        return { ...manualSong, isManual: true, score: 1000 };
      }
    }

    if (!sigaSongTitle || this.cachedSongs.length === 0) return null;

    let best: { id: string; title: string } | null = null;
    let bestScore = 0;

    for (const s of this.cachedSongs) {
      const score = scoreTitleMatch(sigaSongTitle, s.title, artist);
      if (score > bestScore) {
        bestScore = score;
        best = s;
      }
    }

    if (best && bestScore >= 450) {
      return { ...best, isManual: false, score: bestScore };
    }

    return null;
  }

  // ─── Conexión ─────────────────────────────────────────────────────

  public async testConnection(): Promise<{ success: boolean; message: string }> {
    this.addLog('info', 'Verificando conexión con Holyrics...');
    const tokenRes = await this.api('GetTokenInfo', {});
    if (tokenRes.ok) {
      const ver = tokenRes.data?.version || '2.x';
      const songRes = await this.api('GetSongs', { fields: 'id,title' });
      if (Array.isArray(songRes.data)) this.cachedSongs = songRes.data;
      const msg = `Holyrics v${ver} conectado (${this.cachedSongs.length} canciones cargadas)`;
      this.addLog('success', msg);
      return { success: true, message: msg };
    }
    if (tokenRes.error === 'unauthorized action' || tokenRes.error === 'invalid token') {
      const msg = 'Token inválido. Holyrics > File > Settings > API server > Manage Permissions.';
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
   */
  public async handleLiveSyncTrigger(state: LiveSyncState): Promise<void> {
    if (!this.config.enabled || !this.config.autoTrigger) return;

    const rawSection = (state.rawSection || state.section || state.normalizedSection || '').trim();
    const songTitle = (state.songTitle || '').trim();
    const songId = String(state.songId || '');

    if (!rawSection) return;

    this.addLog('info', `📡 Ableton: "${rawSection}" (Canción: ${songTitle || songId})`);

    try {
      // 1. Detectar si el clip especifica una sub-canción en medleys
      // Ejemplos: "[Vamos a Cantar] Coro 1.1", "Vamos a Cantar - Coro 1.1", "[Te Doy Gloria] Verso 1.1"
      let targetSubSong: string | undefined = undefined;
      let cleanSlideName = rawSection.toLowerCase().trim();

      const bracketMatch = rawSection.match(/^\[([^\]]+)\]\s*(.*)$/);
      const prefixMatch = rawSection.match(/^(.+?)\s*[:\-]\s*(verso|verse|coro|chorus|puente|bridge|intro|outro|pre-coro|precoro|solo|instrumental|estrofa|slide|diapositiva)(.*)$/i);

      if (bracketMatch) {
        targetSubSong = bracketMatch[1].trim();
        cleanSlideName = bracketMatch[2].toLowerCase().trim() || cleanSlideName;
      } else if (prefixMatch) {
        targetSubSong = prefixMatch[1].trim();
        const sec = prefixMatch[2].trim();
        const num = prefixMatch[3] ? prefixMatch[3].trim() : '';
        cleanSlideName = `${sec} ${num}`.toLowerCase().trim();
      }

      // 2. Determinar qué canción abrir en Holyrics
      const desiredSongTitle = targetSubSong || songTitle;
      const isTitleMismatch = Boolean(
        desiredSongTitle &&
        this.activeHolyricsTitle &&
        normalizeForMatch(cleanSongTitle(this.activeHolyricsTitle)) !== normalizeForMatch(cleanSongTitle(desiredSongTitle))
      );
      const isSongChange =
        this.activeSongId !== songId ||
        isTitleMismatch ||
        Boolean(targetSubSong && this.activeHolyricsTitle !== targetSubSong);

      if (isSongChange) {
        await this.openSong(songId, desiredSongTitle, targetSubSong);
        await this.delay(250);
      }

      // 3. Sección instrumental → vaciar pantalla (F9)
      if (isClearSection(cleanSlideName) || isClearSection(rawSection)) {
        this.addLog('info', `🎸 [${cleanSlideName}] instrumental → F9`);
        await this.api('SetF9', { enable: true });
        return;
      }

      // 4. Enviar el nombre del clip como etiqueta de Holyrics
      this.addLog('info', `🔍 Buscando etiqueta: "${cleanSlideName}"`);
      let res = await this.api('ActionGoToSlideDescription', { name: cleanSlideName });

      // Si falló y la canción es un Medley (ej: "Te doy gloria / Vamos a cantar"):
      // Es posible que el slide pertenezca a la otra sub-canción del medley
      if (!res.ok) {
        const medleyParts = splitMedleyTitles(songTitle);
        if (medleyParts.length > 1) {
          for (let i = 1; i < medleyParts.length; i++) {
            const subPart = medleyParts[i];
            if (this.activeHolyricsTitle !== subPart) {
              this.addLog('info', `🔄 Probando sub-canción del medley: "${subPart}"...`);
              const opened = await this.openSong(songId, subPart, subPart);
              if (opened) {
                await this.delay(250);
                res = await this.api('ActionGoToSlideDescription', { name: cleanSlideName });
                if (res.ok) {
                  this.activeHolyricsTitle = subPart;
                  break;
                }
              }
            }
          }
        }
      }

      // Si no hay presentación abierta, intentar abrir y reintentar
      if (!res.ok && res.error?.includes('presentation')) {
        this.addLog('info', 'Presentación no abierta, reabriendo...');
        await this.openSong(songId, desiredSongTitle, targetSubSong);
        await this.delay(250);
        res = await this.api('ActionGoToSlideDescription', { name: cleanSlideName });
      }

      if (res.ok) {
        await this.api('SetF9', { enable: false });
        await this.api('SetF8', { enable: false });
        this.addLog('success', `✅ Proyectando: "${cleanSlideName}"`);
      } else {
        this.addLog('info', `❌ "${cleanSlideName}" no encontrada → F9`);
        await this.api('SetF9', { enable: true });
      }
    } catch (err: any) {
      this.addLog('error', `Error en live sync: ${err.message}`);
    }
  }

  // ─── Play / Stop de Ableton ───────────────────────────────────────

  public async handlePlaybackState(payload: { isPlaying: boolean; songId?: string; songTitle?: string }): Promise<void> {
    if (!this.config.enabled || !this.config.autoTrigger) return;

    if (payload.isPlaying) {
      if (payload.songId && payload.songTitle) {
        this.addLog('info', `▶️ Ableton Play: cargando "${payload.songTitle}" (#${payload.songId})...`);
        await this.openSong(String(payload.songId), payload.songTitle);
        await this.delay(200);
        await this.api('SetF9', { enable: true });
      } else if (payload.songId) {
        this.addLog('info', `▶️ Ableton Play: canción #${payload.songId} detectada, esperando primer trigger...`);
      }
    } else {
      this.addLog('info', '⏹️ Ableton Stop: cerrando presentación');
      await this.api('CloseCurrentPresentation', {});
      this.activeSongId = null;
      this.activeHolyricsTitle = null;
    }
  }

  // ─── Abrir canción en Holyrics ────────────────────────────────────

  public async openSong(songId: string, songTitle: string, subSongName?: string): Promise<boolean> {
    if (this.isOpening) return false;
    this.isOpening = true;

    try {
      if (this.cachedSongs.length === 0) {
        await this.getHolyricsSongs(true);
      }

      let targetHolyricsId: string | null = null;
      let matchedTitle: string = '';

      // 1. Revisar si existe vinculación manual
      const manualId = this.config.songMappings?.[String(songId)];
      if (manualId) {
        const found = this.cachedSongs.find((s) => String(s.id) === String(manualId));
        if (found) {
          targetHolyricsId = found.id;
          matchedTitle = found.title;
          this.addLog('info', `🎯 Usando vinculación manual: "${matchedTitle}" (ID: ${targetHolyricsId})`);
        }
      }

      // 2. Si no hay vinculación manual, buscar la mejor coincidencia automática
      if (!targetHolyricsId && (subSongName || songTitle)) {
        const queryToSearch = subSongName || songTitle;
        let best: { id: string; title: string } | null = null;
        let bestScore = 0;

        for (const s of this.cachedSongs) {
          const score = scoreTitleMatch(queryToSearch, s.title);
          if (score > bestScore) {
            bestScore = score;
            best = s;
          }
        }

        if (best && bestScore >= 450) {
          targetHolyricsId = best.id;
          matchedTitle = best.title;
          this.addLog('info', `🔍 Mejor coincidencia (${bestScore} pts): "${matchedTitle}"`);
        }
      }

      // 3. Fallback por ID directo
      if (!targetHolyricsId) {
        const byId = this.cachedSongs.find((s) => String(s.id) === String(songId));
        if (byId) {
          targetHolyricsId = byId.id;
          matchedTitle = byId.title;
        }
      }

      if (targetHolyricsId) {
        this.addLog('info', `Abriendo en Holyrics: "${matchedTitle}"`);
        const res = await this.api('ShowLyrics', { id: targetHolyricsId });
        if (res.ok) {
          this.activeSongId = songId;
          this.activeHolyricsTitle = subSongName || matchedTitle;
          this.addLog('success', `✨ Canción cargada en Holyrics: "${matchedTitle}"`);
          return true;
        }
      } else {
        this.addLog('info', `"${subSongName || songTitle || songId}" no encontrada en Holyrics`);
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
