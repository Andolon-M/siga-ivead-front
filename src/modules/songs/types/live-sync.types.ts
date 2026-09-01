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
export function getCanonicalSectionKey(rawSection: string): string {
  if (!rawSection) return '';
  const cleaned = rawSection.trim().replace(/^\[|\]$/g, '').toLowerCase().trim();

  // 1. Verso / Verse / Estrofa (soporta "verso 1", "verso-1", "verso 2", "verso-2", "verso 2.1", "verso 2.2")
  const vMatch = cleaned.match(/^(?:verso|verse|estrofa)[\s\-_]*(\d+)?(?:[\.\-:\s]+(\d+|[a-d]))?$/i);
  if (vMatch) {
    const mainNum = vMatch[1] || '1';
    return `verso${mainNum}`;
  }

  // 2. Coro / Chorus / Estribillo (soporta "coro", "coro 1", "coro-1", "coro 2", "coro-2", "coro 1.1")
  const cMatch = cleaned.match(/^(?:coro|chorus|estribillo)[\s\-_]*(\d+)?(?:[\.\-:\s]+(\d+|[a-d]))?$/i);
  if (cMatch) {
    const mainNum = cMatch[1] && cMatch[1] !== '1' ? cMatch[1] : '';
    return `coro${mainNum}`;
  }

  // 3. Puente / Bridge (soporta "puente", "puente 1", "puente-1", "puente 2", "puente 1.2")
  const pMatch = cleaned.match(/^(?:puente|bridge)[\s\-_]*(\d+)?(?:[\.\-:\s]+(\d+|[a-d]))?$/i);
  if (pMatch) {
    const mainNum = pMatch[1] && pMatch[1] !== '1' ? pMatch[1] : '';
    return `puente${mainNum}`;
  }

  // 4. Pre-Coro
  if (cleaned.startsWith('pre-coro') || cleaned.startsWith('precoro') || cleaned.startsWith('pre coro')) {
    return 'precoro';
  }

  // 5. Intro / Outro / Solo / Instrumental
  if (cleaned.startsWith('intro')) return 'intro';
  if (cleaned.startsWith('outro') || cleaned.startsWith('final')) return 'outro';
  if (cleaned.startsWith('solo') || cleaned.startsWith('instrumental')) return 'solo';

  // Fallback: remover todo lo que no sea alfanumérico
  return cleaned.replace(/[^a-z0-9]/g, '');
}

/**
 * Normaliza nombres de sección para slugs DOM
 */
export function normalizeSectionSlug(rawSection: string): string {
  if (!rawSection) return 'general';
  return getCanonicalSectionKey(rawSection);
}
