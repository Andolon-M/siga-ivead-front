import type { MusicalKey, ParsedLine } from '../types';

// Mapeo de enums a nombres legibles de tonalidad
export const MUSICAL_KEY_LABELS: Record<MusicalKey, string> = {
  C: 'C (Do Mayor)',
  C_SHARP: 'C# (Do# Mayor)',
  Db: 'Db (Re♭ Mayor)',
  D: 'D (Re Mayor)',
  D_SHARP: 'D# (Re# Mayor)',
  Eb: 'Eb (Mi♭ Mayor)',
  E: 'E (Mi Mayor)',
  F: 'F (Fa Mayor)',
  F_SHARP: 'F# (Fa# Mayor)',
  Gb: 'Gb (Sol♭ Mayor)',
  G: 'G (Sol Mayor)',
  G_SHARP: 'G# (Sol# Mayor)',
  Ab: 'Ab (La♭ Mayor)',
  A: 'A (La Mayor)',
  A_SHARP: 'A# (La# Mayor)',
  Bb: 'Bb (Si♭ Mayor)',
  B: 'B (Si Mayor)',
  Cm: 'Cm (Do Menor)',
  C_SHARPm: 'C#m (Do# Menor)',
  Dbm: 'Dbm (Re♭ Menor)',
  Dm: 'Dm (Re Menor)',
  D_SHARPm: 'D#m (Re# Menor)',
  Ebm: 'Ebm (Mi♭ Menor)',
  Em: 'Em (Mi Menor)',
  Fm: 'Fm (Fa Menor)',
  F_SHARPm: 'F#m (Fa# Menor)',
  Gbm: 'Gbm (Sol♭ Menor)',
  Gm: 'Gm (Sol Menor)',
  G_SHARPm: 'G#m (Sol# Menor)',
  Abm: 'Abm (La♭ Menor)',
  Am: 'Am (La Menor)',
  A_SHARPm: 'A#m (La# Menor)',
  Bbm: 'Bbm (Si♭ Menor)',
  Bm: 'Bm (Si Menor)',
};

// Formato corto para visualización rápida
export const MUSICAL_KEY_SHORT: Record<MusicalKey, string> = {
  C: 'C',
  C_SHARP: 'C#',
  Db: 'Db',
  D: 'D',
  D_SHARP: 'D#',
  Eb: 'Eb',
  E: 'E',
  F: 'F',
  F_SHARP: 'F#',
  Gb: 'Gb',
  G: 'G',
  G_SHARP: 'G#',
  Ab: 'Ab',
  A: 'A',
  A_SHARP: 'A#',
  Bb: 'Bb',
  B: 'B',
  Cm: 'Cm',
  C_SHARPm: 'C#m',
  Dbm: 'Dbm',
  Dm: 'Dm',
  D_SHARPm: 'D#m',
  Ebm: 'Ebm',
  Em: 'Em',
  Fm: 'Fm',
  F_SHARPm: 'F#m',
  Gbm: 'Gbm',
  Gm: 'Gm',
  G_SHARPm: 'G#m',
  Abm: 'Abm',
  Am: 'Am',
  A_SHARPm: 'A#m',
  Bbm: 'Bbm',
  Bm: 'Bm',
};

// Escala cromática (12 semitonos) con sostenidos y bemoles
const CHROMATIC_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CHROMATIC_FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

/**
 * Normaliza una nota raíz a su índice cromático (0 a 11)
 */
function getRootIndex(note: string): number {
  const normalized = note.trim();
  let idx = CHROMATIC_SHARPS.indexOf(normalized);
  if (idx !== -1) return idx;
  idx = CHROMATIC_FLATS.indexOf(normalized);
  return idx;
}

/**
 * Transpone una nota raíz individual por N semitonos
 */
export function transposeNote(note: string, semitones: number, preferFlats = false): string {
  const rootIndex = getRootIndex(note);
  if (rootIndex === -1) return note;

  const targetIndex = (rootIndex + semitones + 1200) % 12;
  const scale = preferFlats ? CHROMATIC_FLATS : CHROMATIC_SHARPS;
  return scale[targetIndex];
}

/**
 * Transpone un acorde completo (incluyendo bajo invertido / e.g. D/F# -> E/G#)
 */
export function transposeChord(chord: string, semitones: number): string {
  if (semitones === 0) return chord;

  // Manejar acordes con bajo invertido (slash chords, ej: G/B o D/F#)
  if (chord.includes('/')) {
    const parts = chord.split('/');
    const mainChord = transposeChord(parts[0], semitones);
    const bassNote = transposeNote(parts[1], semitones);
    return `${mainChord}/${bassNote}`;
  }

  // Expresión regular para separar nota raíz del sufijo/calidad (m, 7, maj7, sus4, add9, etc.)
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chord;

  const [, root, suffix] = match;
  const preferFlats = chord.includes('b') || chord.includes('F') || chord.includes('Bb');
  const transposedRoot = transposeNote(root, semitones, preferFlats);

  return `${transposedRoot}${suffix}`;
}

/**
 * Expresión regular universal para validar tokens de acordes
 * Soporta: Am, F7M, Em7, G/B, A7/C#, F#m7(b5), C9, Bbm, G#dim7, Dsus4, etc.
 */
export const CHORD_REGEX = /^[A-G][#b]?(?:m(?:aj|in)?|maj|min|dim|aug|sus|add|M)?[0-9]*(?:M|\+|º|ø|dim|aug|sus[24]?|add[29]?|\([#b]?[0-9]+\))*(?:\/[A-G][#b]?)?$/i;

/**
 * Comprueba si un token individual es un acorde válido
 */
export function isSingleChord(token: string): boolean {
  const clean = token.replace(/[()]/g, '').trim();
  return CHORD_REGEX.test(clean);
}

/**
 * Comprueba si una línea de texto contiene principalmente acordes
 */
export function isChordLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  // Si es un encabezado de sección, no es línea de acordes
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) return false;

  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;

  // Contar cuántos tokens son acordes válidos
  const chordCount = tokens.filter((t) => isSingleChord(t) || t === '|' || t === '/' || t === '-').length;
  return chordCount / tokens.length >= 0.6;
}

/**
 * Determina si una etiqueta entre corchetes o línea es un encabezado de sección
 */
export function isSectionHeaderTag(tag: string): boolean {
  const lower = tag.toLowerCase().trim();
  return (
    lower.startsWith('intro') ||
    lower.startsWith('verso') ||
    lower.startsWith('verse') ||
    lower.startsWith('estrofa') ||
    lower.startsWith('coro') ||
    lower.startsWith('chorus') ||
    lower.startsWith('estribillo') ||
    lower.startsWith('primera parte') ||
    lower.startsWith('segunda parte') ||
    lower.startsWith('tercera parte') ||
    lower.startsWith('parte 1') ||
    lower.startsWith('parte 2') ||
    lower.startsWith('parte 3') ||
    lower.startsWith('pre-coro') ||
    lower.startsWith('pre coro') ||
    lower.startsWith('puente') ||
    lower.startsWith('bridge') ||
    lower.startsWith('solo') ||
    lower.startsWith('interludio') ||
    lower.startsWith('interlude') ||
    lower.startsWith('outro') ||
    lower.startsWith('final') ||
    lower.startsWith('instrumental') ||
    lower.startsWith('tag') ||
    lower === 'acordes' ||
    lower.startsWith('acordes:') ||
    lower.startsWith('bajo') ||
    lower.startsWith('punteo') ||
    lower.startsWith('notas') ||
    lower.startsWith('riff') ||
    lower.startsWith('todos')
  );
}

/**
 * Determina si una línea es un encabezado de sección sin corchetes
 */
export function isSectionOrInfoLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) return true;
  return isSectionHeaderTag(trimmed) || trimmed.endsWith(':');
}

/**
 * Comprueba si una línea contiene notas de punteo, tablatura o notas de bajo repetidas
 * Ej: "AAA EEE D E FFF   EEE CC A" o "AA Bb CC C#C#" o "A - B - C"
 */
export function isNoteOrRiffLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) return false;

  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;

  let noteCount = 0;
  for (const t of tokens) {
    const clean = t.replace(/[()]/g, '').trim();
    if (isSingleChord(clean)) {
      noteCount++;
    } else if (/^([A-G][#b]?)+$/i.test(clean)) {
      noteCount++;
    } else if (/^[|/\-~0-9]+$/.test(clean)) {
      noteCount++;
    }
  }

  return noteCount / tokens.length >= 0.6;
}

/**
 * Transpone tokens de riff / punteo / bajo (ej: "AAA", "EEE", "C#C#", "A-B-C", "D")
 */
export function transposeRiffToken(token: string, semitones: number): string {
  if (semitones === 0) return token;

  // Si es nota repetida (ej: "AAA", "EEE", "FFF", "CC", "DDD")
  const repeatedMatch = token.match(/^([A-G][#b]?)\1*$/i);
  if (repeatedMatch) {
    const singleNote = token.match(/^([A-G][#b]?)/i)?.[1];
    if (singleNote) {
      const count = token.length / singleNote.length;
      const transposed = transposeNote(singleNote.toUpperCase(), semitones);
      return transposed.repeat(count);
    }
  }

  // Si son notas separadas por guión (ej: "A-B-C" o "A-D-E")
  if (token.includes('-')) {
    return token.split('-').map((t) => transposeRiffToken(t, semitones)).join('-');
  }

  // Si es un acorde o nota individual
  const chordMatch = token.match(/^([A-G][#b]?)(.*)$/);
  if (chordMatch) {
    return transposeChord(token, semitones);
  }

  return token;
}

/**
 * Transpone una línea completa de punteo / bajo / notas musicales
 */
export function transposeRiffLine(riffContent: string, semitones: number): string {
  if (semitones === 0) return riffContent;
  return riffContent.replace(/\b([A-G][#b]?(?:\1*|[0-9a-zA-Z#b\/\-]*))\b/g, (match) => {
    return transposeRiffToken(match, semitones);
  });
}

/**
 * Transpone una línea de acordes conservando con exactitud la columna de cada acorde
 */
export function transposeChordLineDirect(chordLine: string, semitones: number): string {
  if (semitones === 0) return chordLine;

  const tokens: { chord: string; index: number; length: number }[] = [];
  const tokenRegex = /\S+/g;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(chordLine)) !== null) {
    tokens.push({ chord: match[0], index: match.index, length: match[0].length });
  }

  let result = '';
  let lastPos = 0;

  for (let i = 0; i < tokens.length; i++) {
    const { chord, index } = tokens[i];
    const isChord = isSingleChord(chord);
    const transposed = isChord ? transposeChord(chord, semitones) : chord;

    if (index > lastPos) {
      result += ' '.repeat(index - lastPos);
    } else if (result.length > 0 && !result.endsWith(' ')) {
      result += ' ';
    }

    result += transposed;
    lastPos = index + chord.length;
  }

  return result;
}

/**
 * Transpone el contenido de la canción línea por línea preservando la alineación exacta de columnas
 */
export function transposeSongContent(content: string, semitones: number): string {
  if (!content) return '';
  if (semitones === 0) return content;

  // Si el contenido tuviera formato antiguo con corchetes [G]Letra, lo desglosamos primero
  const cleanContent = hasChordBrackets(content) ? convertBracketedToPlainText(content) : content;

  const lines = cleanContent.split(/\r?\n/);
  const result: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // 1. Línea vacía o comentario
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) {
      result.push(line);
      continue;
    }

    // 2. Encabezado de sección [Verso 1], [Coro], etc.
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      result.push(line);
      continue;
    }

    // 3. Línea de acordes
    if (isChordLine(line)) {
      result.push(transposeChordLineDirect(line, semitones));
      continue;
    }

    // 4. Línea de notas/riff (ej: "AAA EEE D E FFF...")
    if (isNoteOrRiffLine(line) && !isChordLine(line)) {
      result.push(transposeRiffLine(line, semitones));
      continue;
    }

    // 5. Letra normal
    result.push(line);
  }

  return result.join('\n');
}

/**
 * Limpia artefactos comunes al copiar y pegar desde CifraClub, LaCuerda, etc.
 */
export function cleanRawPastedChordSheet(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // 1. Limpiar artefactos de CifraClub como ">Em7 o ">Am
  cleaned = cleaned.replace(/^[ \t]*">([A-G][^\r\n]*)/gm, '$1');
  cleaned = cleaned.replace(/[ \t]+">([A-G][^\r\n]*)/g, ' $1');

  // 2. Limpiar etiquetas HTML residuales si se pegó texto enriquecido
  cleaned = cleaned.replace(/<[^>]+>/g, '');

  return cleaned;
}

/**
 * Elimina las líneas de acordes para entregar solo la letra limpia
 */
export function stripChords(content: string): string {
  if (!content) return '';

  const cleanContent = hasChordBrackets(content) ? convertBracketedToPlainText(content) : content;
  const lines = cleanContent.split(/\r?\n/);

  return lines
    .filter((line) => !isChordLine(line) && !isNoteOrRiffLine(line))
    .join('\n');
}

/**
 * Parsea el contenido de la canción directamente en líneas clasificadas
 */
export function parseSongLines(content: string, semitones = 0): ParsedLine[] {
  if (!content) return [];

  // Si tuviera corchetes embebidos antiguos, convertimos a texto limpio
  const cleanContent = hasChordBrackets(content) ? convertBracketedToPlainText(content) : content;
  const rawLines = cleanContent.split(/\r?\n/);
  const result: ParsedLine[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i];
    const trimmed = rawLine.trim();

    // 1. Línea vacía
    if (!trimmed) {
      result.push({
        type: 'empty',
        text: '',
        isEmpty: true,
      });
      continue;
    }

    // 2. Encabezado de sección [Verso 1], [Coro], [Intro], etc.
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const inside = trimmed.slice(1, -1).trim();
      result.push({
        type: 'section',
        text: trimmed,
        sectionName: inside,
        isSectionHeader: true,
      });
      continue;
    }

    // 2.1. Encabezado descriptivo sin corchetes (ej: "acordes", "Acordes:Bajo(puntos):", "Bajo:")
    if (isSectionOrInfoLine(trimmed) && !isChordLine(trimmed) && !isNoteOrRiffLine(trimmed)) {
      const inside = trimmed.replace(/[:]+$/, '').trim();
      result.push({
        type: 'section',
        text: `[${inside}]`,
        sectionName: inside,
        isSectionHeader: true,
      });
      continue;
    }

    // 3. Comentario (# o //)
    if (trimmed.startsWith('#') || trimmed.startsWith('//')) {
      const commentText = trimmed.replace(/^[#\/]+\s*/, '');
      result.push({
        type: 'comment',
        text: commentText,
        isComment: true,
      });
      continue;
    }

    // 4. Línea de acordes
    if (isChordLine(rawLine)) {
      const transposedLine = semitones !== 0 ? transposeChordLineDirect(rawLine, semitones) : rawLine;
      result.push({
        type: 'chord',
        text: transposedLine,
      });
      continue;
    }

    // 5. Línea de notas/riff (ej: "AAA EEE D E FFF..." o "AA Bb CC C#C#")
    if (isNoteOrRiffLine(rawLine) && !isChordLine(rawLine)) {
      const transposedRiff = semitones !== 0 ? transposeRiffLine(rawLine, semitones) : rawLine;
      result.push({
        type: 'riff',
        text: transposedRiff,
        isRiffOrNotes: true,
      });
      continue;
    }

    // 6. Línea de letra normal
    result.push({
      type: 'lyrics',
      text: rawLine,
    });
  }

  return result;
}

/**
 * Filtra líneas visibles eliminando acordes/riffs en modo Solo Letra y descartando secciones que queden vacías
 */
export function filterVisibleSongLines(lines: ParsedLine[], showChords: boolean): ParsedLine[] {
  if (showChords) {
    // Cuando los acordes están activos, limpiar únicamente secciones completamente vacías
    const result: ParsedLine[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.type === 'section') {
        let hasContent = false;
        for (let j = i + 1; j < lines.length; j++) {
          const next = lines[j];
          if (next.type === 'section') break;
          if ((next.type === 'chord' || next.type === 'lyrics' || next.type === 'riff' || next.type === 'comment') && next.text.trim()) {
            hasContent = true;
            break;
          }
        }
        if (!hasContent) continue;
      }

      result.push(line);
    }
    return result;
  }

  // Cuando showChords es FALSE (Modo Solo Letra):
  const result: ParsedLine[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Ocultar líneas de acordes y notas/riff
    if (line.type === 'chord' || line.type === 'riff') {
      continue;
    }

    // Si es encabezado de sección, verificar si tiene letra o comentarios debajo
    if (line.type === 'section') {
      let hasVisibleLyrics = false;
      for (let j = i + 1; j < lines.length; j++) {
        const next = lines[j];
        if (next.type === 'section') break;
        if ((next.type === 'lyrics' || next.type === 'comment') && next.text.trim()) {
          hasVisibleLyrics = true;
          break;
        }
      }

      if (!hasVisibleLyrics) {
        // La sección quedó vacía (solo tenía acordes o notas instrumentales)
        continue;
      }
    }

    // Evitar múltiples líneas vacías consecutivas provocadas por el filtrado
    if (line.type === 'empty') {
      const last = result[result.length - 1];
      if (!last || last.type === 'empty' || last.type === 'section') {
        continue;
      }
    }

    result.push(line);
  }

  // Limpiar líneas vacías sobrantes al final
  while (result.length > 0 && result[result.length - 1].type === 'empty') {
    result.pop();
  }

  return result;
}

/**
 * Verifica si el contenido tiene corchetes de acordes reales antiguos
 */
export function hasChordBrackets(content: string): boolean {
  const regex = /\[([^\]]+)\]/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    const tag = match[1].trim();
    if (!isSectionHeaderTag(tag)) {
      const tokens = tag.split(/\s+/);
      if (tokens.some((t) => isSingleChord(t))) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Convierte formato bracketed antiguo a texto plano puro
 */
export function convertBracketedToPlainText(bracketedContent: string): string {
  if (!bracketedContent) return '';
  if (!hasChordBrackets(bracketedContent)) return bracketedContent;

  const lines = bracketedContent.split(/\r?\n/);
  const result: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      result.push('');
      continue;
    }

    if (trimmed.startsWith('[riff:') && trimmed.endsWith(']')) {
      result.push(trimmed.slice(6, -1).trim());
      continue;
    }

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      result.push(trimmed);
      continue;
    }

    if (!/\[[^\]]+\]/.test(trimmed)) {
      result.push(line);
      continue;
    }

    const blocks: { chord: string | null; text: string }[] = [];
    const regex = /\[([^\]]+)\]/g;
    let lastIndex = 0;
    let currentChord: string | null = null;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(line)) !== null) {
      const textBefore = line.slice(lastIndex, match.index);
      if (textBefore.length > 0 || currentChord !== null) {
        blocks.push({ chord: currentChord, text: textBefore });
      }
      currentChord = match[1];
      lastIndex = regex.lastIndex;
    }

    const remaining = line.slice(lastIndex);
    if (remaining.length > 0 || currentChord !== null) {
      blocks.push({ chord: currentChord, text: remaining });
    }

    let chordLine = '';
    let lyricsLine = '';
    let hasAnyChord = false;
    let hasAnyLyrics = false;

    for (let j = 0; j < blocks.length; j++) {
      const block = blocks[j];
      const chord = block.chord || '';
      const text = block.text;
      const isLast = j === blocks.length - 1;

      if (chord) hasAnyChord = true;
      if (text.replace(/\s/g, '')) hasAnyLyrics = true;

      const minChordSpace = chord ? (isLast ? chord.length : chord.length + 1) : 0;
      const blockWidth = Math.max(minChordSpace, text.length);

      chordLine += chord ? chord.padEnd(blockWidth) : ' '.repeat(blockWidth);
      lyricsLine += text.padEnd(blockWidth);
    }

    chordLine = chordLine.trimEnd();
    lyricsLine = lyricsLine.trimEnd();

    if (hasAnyChord && hasAnyLyrics) {
      result.push(chordLine);
      result.push(lyricsLine);
    } else if (hasAnyChord) {
      result.push(chordLine);
    } else {
      result.push(lyricsLine);
    }
  }

  return result.join('\n');
}

/**
 * Mantenido por compatibilidad: retorna el texto tal cual
 */
export function convertPlainTextToBracketed(plainText: string): string {
  return cleanRawPastedChordSheet(plainText);
}
