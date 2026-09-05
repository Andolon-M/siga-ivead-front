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

    // 1. Limpiar corchetes y paréntesis, dejando espacios simples en minúsculas
    const cleanSec = currentSectionName
      .replace(/[\[\]\(\)]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

    // 2. Determinar la base genérica de la sección:
    // Si ya tiene subíndice tipo "tag 1.1" -> la base es "tag 1"
    // Si tiene número mayor tipo "verso 2" o "tag 1" -> la base es esa misma
    // Si no tiene ningún número tipo "tag", "coro", "puente" -> se convierte a "<nombre> 1"
    let baseTag: string;
    const subIndexMatch = cleanSec.match(/^(.*?)\s*(\d+)\.\d+$/);
    const numMatch = cleanSec.match(/^(.*?)\s*(\d+)$/);

    if (subIndexMatch) {
      baseTag = `${subIndexMatch[1].trim()} ${subIndexMatch[2]}`.trim();
    } else if (numMatch) {
      baseTag = `${numMatch[1].trim()} ${numMatch[2]}`.trim();
    } else {
      baseTag = `${cleanSec} 1`.trim();
    }

    // 3. Dividir las líneas de la letra en grupos de 2 líneas por diapositiva
    const chunkSize = 2;
    let slideSubIndex = 1;

    for (let i = 0; i < currentLyricsLines.length; i += chunkSize) {
      const chunk = currentLyricsLines.slice(i, i + chunkSize);
      const tag = `${baseTag}.${slideSubIndex}`;

      outputSlides.push(`##(${tag})\n${chunk.join('\n')}`);
      slideSubIndex++;
    }

    currentLyricsLines = [];
  };

  for (const line of lines) {
    if (line.type === 'section' || line.isSectionHeader) {
      flushCurrentLyrics();
      currentSectionName = line.sectionName || 'Verso 1';
    } else if (line.type === 'lyrics') {
      const text = (line.text || '').trim();
      if (text) {
        currentLyricsLines.push(text);
      }
    }
  }

  flushCurrentLyrics();

  return outputSlides.join('\n\n');
}
