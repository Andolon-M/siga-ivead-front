import { parseSongLines } from './chord-transposer';

/**
 * Convierte el contenido de acordes y letras de SIGA
 * a texto con formato de diapositivas y etiquetas nativas ##(...) de Holyrics
 * 
 * Reglas:
 * 1. Elimina las líneas que son solo acordes musicales.
 * 2. Agrupa los versos en diapositivas de 2 líneas (óptimo para proyección en pantalla).
 * 3. Asigna la etiqueta ##(seccion sub_indice) correspondiente:
 *    - Verso 1 -> ##(verso 1.1), ##(verso 1.2)
 *    - Verso 2 -> ##(verso 2.1), ##(verso 2.2)
 *    - Coro    -> ##(coro 1.1), ##(coro 1.2)
 *    - Puente  -> ##(puente 1.1), ##(puente 1.2)
 */
export function formatSongForHolyrics(rawContent: string): string {
  if (!rawContent || !rawContent.trim()) {
    return '';
  }

  const lines = parseSongLines(rawContent);
  const outputSlides: string[] = [];

  let currentSectionName = 'Verso 1';
  let currentLyricsLines: string[] = [];

  const flushCurrentLyrics = () => {
    if (currentLyricsLines.length === 0) return;

    // Determinar nombre canónico de la sección base
    const lowerSec = currentSectionName.toLowerCase().replace(/^\[|\]$/g, '').trim();

    // Verso
    const vMatch = lowerSec.match(/^(?:verso|verse|estrofa)[\s\-_]*(\d+)?/i);
    // Coro
    const cMatch = lowerSec.match(/^(?:coro|chorus|estribillo)[\s\-_]*(\d+)?/i);
    // Puente
    const pMatch = lowerSec.match(/^(?:puente|bridge)[\s\-_]*(\d+)?/i);

    let baseTag = 'verso 1';
    if (vMatch) {
      baseTag = `verso ${vMatch[1] || '1'}`;
    } else if (cMatch) {
      baseTag = `coro ${cMatch[1] || '1'}`;
    } else if (pMatch) {
      baseTag = `puente ${pMatch[1] || '1'}`;
    } else if (lowerSec.startsWith('pre-coro') || lowerSec.startsWith('precoro') || lowerSec.startsWith('pre coro')) {
      baseTag = 'pre-coro';
    } else if (lowerSec.startsWith('intro')) {
      baseTag = 'intro';
    } else if (lowerSec.startsWith('outro') || lowerSec.startsWith('final')) {
      baseTag = 'outro';
    } else if (lowerSec.startsWith('solo') || lowerSec.startsWith('instrumental')) {
      baseTag = 'solo';
    } else {
      baseTag = lowerSec;
    }

    // Dividir las líneas de la estrofa en grupos de 2 líneas por diapositiva
    const chunkSize = 2;
    let slideSubIndex = 1;

    for (let i = 0; i < currentLyricsLines.length; i += chunkSize) {
      const chunk = currentLyricsLines.slice(i, i + chunkSize);
      const tag = baseTag.includes(' ') && !baseTag.startsWith('pre') 
        ? `${baseTag}.${slideSubIndex}` 
        : (baseTag === 'pre-coro' || baseTag === 'intro' || baseTag === 'outro' || baseTag === 'solo'
            ? `${baseTag} ${slideSubIndex}`
            : `${baseTag} 1.${slideSubIndex}`);

      outputSlides.push(`##(${tag})\n${chunk.join('\n')}`);
      slideSubIndex++;
    }

    currentLyricsLines = [];
  };

  for (const line of lines) {
    if (line.type === 'section' || line.isSectionHeader) {
      flushCurrentLyrics();
      currentSectionName = line.sectionName || 'Verso 1';
    } else if (line.type === 'lyrics' || line.lyrics || (line.type === 'pair' && line.lyrics)) {
      const text = (line.text || line.lyrics || '').trim();
      if (text) {
        currentLyricsLines.push(text);
      }
    }
  }

  flushCurrentLyrics();

  return outputSlides.join('\n\n');
}
