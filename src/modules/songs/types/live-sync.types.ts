export interface LiveSyncState {
  sessionId?: string;
  songId: string;
  songTitle?: string;
  section: string;
  normalizedSection: string;
  rawSection?: string;
  sectionSlug: string;
  slideIndex?: number;
  parentSection?: string;
  measure?: number;
  bpm?: number;
  timestamp: number;
}

export interface HolyricsConfig {
  enabled: boolean;
  host: string;
  port: number;
  token: string;
  autoTrigger: boolean;
  songMappings?: Record<string, string>;
}

/**
 * Normaliza nombres de sección a minúsculas, sin espacios ni caracteres especiales,
 * mapeando sub-diapositivas ("verso 1.1", "verso 1.2") a su sección padre canónica ("verso1"),
 * y "verso 2.1" a "verso2".
 * 
 * Ejemplos deterministas:
 * "[Verso 1]"   -> "verso1"
 * "verso-1"     -> "verso1"
 * "Verso 1.1"   -> "verso1"
 * "Verso 1.2"   -> "verso1"
 * "[Verso 2]"   -> "verso2"
 * "verso-2"     -> "verso2"
 * "Verso 2.1"   -> "verso2"
 * "Verso 2.2"   -> "verso2"
 * "Verso 3"     -> "verso3"
 * "[Coro]"      -> "coro"
 * "Coro 1.1"    -> "coro"
 * "Coro 2"      -> "coro2"
 * "[Puente]"    -> "puente"
 * "Puente 1.2"  -> "puente"
 * "Puente 2"    -> "puente2"
 */
/**
 * Normaliza nombres de sección a claves canónicas únicas para emparejar eventos
 * en tiempo real de Ableton Live con las secciones del visor de acordes/letras.
 * 
 * Soporta de manera universal:
 * - Etiquetas estándar: Verso, Coro, Puente, Pre-Coro, Intro, Outro, Final, Instrumental, Solo.
 * - Etiquetas personalizadas: Tag, Ministración, Espontáneo, Interludio, Subida, etc.
 * - Sub-diapositivas y sub-índices de Ableton: ej. "Tag 1.1", "Tag 1.2", "Tag .2", "Tag 1", "Verso 2.1"
 * - Desacentuación automática (ej: "Ministración" <-> "ministracion").
 * - Sin conversiones forzadas: Instrumental NO cambia a Solo, Final NO cambia a Outro.
 */
/**
 * Normaliza nombres de sección a minúsculas y sin espacios para comparación directa.
 * Elimina corchetes, paréntesis y guiones para evitar formatos como "tag-1-2".
 * Ejemplos:
 * "TAG 2.4" -> "tag2.4"
 * "[TAG 2]" -> "tag2"
 * "tag 1"   -> "tag1"
 * "tag"     -> "tag"
 */
export function getCanonicalSectionKey(rawSection: string): string {
  if (!rawSection) return '';
  return rawSection
    .trim()
    .toLowerCase()
    .replace(/[\[\]\(\)\-_]/g, '')
    .replace(/\s+/g, '');
}

/**
 * Compara la sección activa recibida (ej: Ableton "tag 2.4") contra una sección de la hoja (ej: "[TAG 2]" -> "tag2").
 * Regla:
 * - En la base de datos las canciones se guardan como bloques principales: "tag 1", "tag 2", "coro", "verso 1".
 * - Ableton envía sub-secciones como "tag 2.4", "tag 1.2", "coro 1.1".
 * - Se compara en minúsculas y sin espacios.
 * - "tag 2.4" se empareja directamente con el bloque "tag 2".
 * - "tag 1.2" se empareja con "tag 1", o con "tag" si la sección en la hoja no tiene número.
 */
export function isSectionMatch(targetKey: string, blockKey: string): boolean {
  if (!targetKey || !blockKey) return false;
  if (targetKey === blockKey) return true;

  // 1. Quitar subíndice decimal: "tag2.4" -> "tag2"
  const targetParent = targetKey.replace(/\.\d+$/, '');
  if (targetParent === blockKey) return true;

  // 2. Si el bloque en la hoja es genérico sin número (ej: [TAG] -> "tag") y Ableton envía "tag1.2" o "tag1"
  const targetBase = targetParent.replace(/1$/, '');
  const blockBase = blockKey.replace(/1$/, '');
  if (targetBase && blockBase && targetBase === blockBase) {
    return true;
  }

  return false;
}

/**
 * Normaliza nombres de sección para slugs DOM
 */
export function normalizeSectionSlug(rawSection: string): string {
  if (!rawSection) return 'general';
  return getCanonicalSectionKey(rawSection);
}

