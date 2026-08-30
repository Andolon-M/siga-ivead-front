export interface LiveSyncState {
  sessionId?: string;
  songId: string;
  songTitle?: string;
  section: string;
  normalizedSection: string;
  sectionSlug: string;
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
 * Normaliza nombres de sección para emparejamiento con el parser de acordes
 */
export function normalizeSectionSlug(rawSection: string): string {
  if (!rawSection) return 'general';
  const cleaned = rawSection.trim().replace(/^\[|\]$/g, '').trim().toLowerCase();
  return cleaned
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}
