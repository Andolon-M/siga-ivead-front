import type { MusicalKey, ParsedLine, ChordBlock } from '../types';

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
function transposeNote(note: string, semitones: number, preferFlats = false): string {
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
 * Transpone todo el contenido de la canción respetando corchetes [Acorde] y [riff:...]
 * Si el contenido viene en texto plano de dos líneas, lo normaliza automáticamente para transponerlo.
 */
export function transposeSongContent(content: string, semitones: number): string {
  if (!content) return '';

  // Si el contenido viene en texto plano (sin corchetes), primero lo normalizamos
  const normalized = content.includes('[')
    ? content
    : convertPlainTextToBracketed(content);

  if (semitones === 0) return normalized;

  return normalized.replace(/\[([^\]]+)\]/g, (match, chordName) => {
    const trimmed = chordName.trim();

    // Riff / notas de bajo (ej: [riff:AAA EEE D E FFF...])
    if (trimmed.toLowerCase().startsWith('riff:')) {
      const riffBody = trimmed.slice(5);
      return `[riff:${transposeRiffLine(riffBody, semitones)}]`;
    }

    // Si es un encabezado de sección como [Intro], [Verso 1], [Coro], [Puente], etc., no transponer
    if (isSectionHeaderTag(trimmed)) {
      return match;
    }

    // Si tiene varios acordes dentro del corchete separados por espacio (ej: [G D Em C])
    if (trimmed.includes(' ')) {
      const chords = trimmed.split(/\s+/).map((c: string) => transposeChord(c, semitones));
      return `[${chords.join('  ')}]`;
    }

    return `[${transposeChord(trimmed, semitones)}]`;
  });
}

/**
 * Determina si una etiqueta entre corchetes es un encabezado de sección o etiqueta informativa
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
    lower.startsWith('riff')
  );
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
 * Determina si una línea es un encabezado de sección o etiqueta informativa sin corchetes
 * Ej: "acordes", "Acordes:Bajo(puntos):", "Bajo:", "Punteo:", "Intro:", etc.
 */
export function isSectionOrInfoLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) return true;

  const lower = trimmed.toLowerCase();
  return (
    lower === 'acordes' ||
    lower.startsWith('acordes:') ||
    lower.startsWith('bajo') ||
    lower.startsWith('punteo') ||
    lower.startsWith('intro') ||
    lower.startsWith('verso') ||
    lower.startsWith('verse') ||
    lower.startsWith('coro') ||
    lower.startsWith('chorus') ||
    lower.startsWith('puente') ||
    lower.startsWith('bridge') ||
    lower.startsWith('solo') ||
    lower.startsWith('interludio') ||
    lower.startsWith('outro') ||
    lower.startsWith('final') ||
    lower.startsWith('notas') ||
    lower.startsWith('riff') ||
    lower.startsWith('tab') ||
    lower.endsWith(':')
  );
}

/**
 * Comprueba si una línea contiene notas de punteo, tablatura o notas de bajo repetidas
 * Ej: "AAA EEE D E FFF   EEE CC A" o "A A A  E E E  D E F F F" o "A - B - C"
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
 * Elimina todos los acordes [ ... ] para entregar solo la letra limpia
 */
export function stripChords(content: string): string {
  if (!content) return '';

  return content
    .replace(/\[([^\]]+)\]/g, (match, tag) => {
      if (isSectionHeaderTag(tag.trim())) {
        return `[${tag.trim()}]`;
      }
      return '';
    })
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n');
}

/**
 * Parsea el contenido de la canción en líneas estructuradas con bloques acorde-sílaba
 */
export function parseSongLines(content: string): ParsedLine[] {
  if (!content) return [];

  // Si el contenido no tiene corchetes pero tiene acordes en líneas separadas, auto-convertir internamente
  const normalizedContent = content.includes('[')
    ? content
    : convertPlainTextToBracketed(content);

  const rawLines = normalizedContent.split(/\r?\n/);

  return rawLines.map((rawLine) => {
    const trimmed = rawLine.trim();

    // Línea vacía
    if (!trimmed) {
      return {
        isEmpty: true,
        isSectionHeader: false,
        isComment: false,
        isRiffOrNotes: false,
        blocks: [],
      };
    }

    // Línea de punteo / notas de bajo (ej: [riff:AAA EEE D E FFF...])
    if (trimmed.startsWith('[riff:') && trimmed.endsWith(']')) {
      const riffText = trimmed.slice(6, -1).trim();
      return {
        isEmpty: false,
        isSectionHeader: false,
        isComment: false,
        isRiffOrNotes: true,
        blocks: [{ chord: null, text: riffText }],
      };
    }

    // Encabezado de sección (ej: [Verso 1], [Coro], [Intro], [Estribillo], [Acordes])
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const inside = trimmed.slice(1, -1).trim();
      if (isSectionHeaderTag(inside)) {
        return {
          isEmpty: false,
          isSectionHeader: true,
          sectionName: inside,
          isComment: false,
          isRiffOrNotes: false,
          blocks: [],
        };
      }
    }

    // Comentario (empieza por # o //)
    if (trimmed.startsWith('#') || trimmed.startsWith('//')) {
      return {
        isEmpty: false,
        isSectionHeader: false,
        isComment: true,
        isRiffOrNotes: false,
        blocks: [{ chord: null, text: trimmed.replace(/^[#\/]+\s*/, '') }],
      };
    }

    // Línea regular con letra y acordes embebidos [G]...
    const blocks: ChordBlock[] = [];
    const regex = /\[([^\]]+)\]/g;
    let lastIndex = 0;
    let currentChord: string | null = null;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(rawLine)) !== null) {
      const matchIndex = match.index;
      const textBefore = rawLine.slice(lastIndex, matchIndex);

      if (textBefore.length > 0 || currentChord !== null) {
        blocks.push({
          chord: currentChord,
          text: textBefore,
        });
      }

      currentChord = match[1];
      lastIndex = regex.lastIndex;
    }

    // Texto restante después del último acorde
    const remainingText = rawLine.slice(lastIndex);
    if (remainingText.length > 0 || currentChord !== null) {
      blocks.push({
        chord: currentChord,
        text: remainingText,
      });
    }

    return {
      isEmpty: false,
      isSectionHeader: false,
      isComment: false,
      isRiffOrNotes: false,
      blocks: blocks.length > 0 ? blocks : [{ chord: null, text: rawLine }],
    };
  });
}

/**
 * Conversor inteligente de texto plano de 2 líneas (acordes arriba, letra abajo)
 * a formato bracketed [Acorde]Letra con soporte universal para CifraClub / LaCuerda
 */
export function convertPlainTextToBracketed(plainText: string): string {
  if (!plainText) return '';

  const cleaned = cleanRawPastedChordSheet(plainText);
  const lines = cleaned.split(/\r?\n/);
  const result: string[] = [];

  let i = 0;
  while (i < lines.length) {
    const current = lines[i];
    const trimmedCurrent = current.trim();

    // 1. Si es línea vacía
    if (!trimmedCurrent) {
      result.push('');
      i++;
      continue;
    }

    // 2. Si es una sección con acordes al final (ej: [Puente] Am G/B C o [Interludio] Am F7M)
    const sectionWithChordsMatch = trimmedCurrent.match(/^\[([^\]]+)\]\s+(.+)$/);
    if (sectionWithChordsMatch) {
      const sectionName = sectionWithChordsMatch[1].trim();
      const trailingChords = sectionWithChordsMatch[2].trim();

      result.push(`[${sectionName}]`);
      const bracketedTrailing = trailingChords
        .split(/\s+/)
        .map((c) => (isSingleChord(c) ? `[${c}]` : c))
        .join('  ');
      result.push(bracketedTrailing);
      i++;
      continue;
    }

    // 3. Si es un encabezado de sección normal [Estribillo], [Coro], etc.
    if (trimmedCurrent.startsWith('[') && trimmedCurrent.endsWith(']')) {
      result.push(trimmedCurrent);
      i++;
      continue;
    }

    // 4. Encabezado descriptivo sin corchetes (ej: "acordes", "Acordes:Bajo(puntos):", "Bajo:")
    if (isSectionOrInfoLine(trimmedCurrent) && !isChordLine(trimmedCurrent)) {
      const cleanHeader = trimmedCurrent.replace(/[:]+$/, '').trim();
      result.push(`[${cleanHeader}]`);
      i++;
      continue;
    }

    // 5. Si la línea actual ya tiene corchetes de acordes [G]Letra o [riff:...], mantenerla
    if (/\[[A-G][#b]?[^\]]*\]/.test(current) || /\[riff:[^\]]*\]/i.test(current)) {
      result.push(current);
      i++;
      continue;
    }

    // 6. Línea de punteo / notas de bajo (ej: "AAA EEE D E FFF   EEE CC A")
    if (isNoteOrRiffLine(current) && !isChordLine(current)) {
      result.push(`[riff:${trimmedCurrent}]`);
      i++;
      continue;
    }

    // 7. Verificar si la línea actual es una línea de acordes
    if (isChordLine(current)) {
      const next = lines[i + 1];
      const isNextNonLyric =
        !next ||
        !next.trim() ||
        isChordLine(next) ||
        isNoteOrRiffLine(next) ||
        isSectionOrInfoLine(next.trim());

      if (isNextNonLyric) {
        // Línea de solo acordes (intro/interludio/outro/acordes)
        const chordTokens: { chord: string; index: number }[] = [];
        const tokenRegex = /\S+/g;
        let tm: RegExpExecArray | null;

        while ((tm = tokenRegex.exec(current)) !== null) {
          chordTokens.push({ chord: tm[0], index: tm.index });
        }

        const bracketed = chordTokens
          .map((t) => (isSingleChord(t.chord) ? `[${t.chord}]` : t.chord))
          .join('   ');
        result.push(bracketed);
        i++;
      } else {
        // Fusionar línea de acordes con la línea de letra siguiente
        const chordTokens: { chord: string; index: number }[] = [];
        const tokenRegex = /\S+/g;
        let tm: RegExpExecArray | null;

        while ((tm = tokenRegex.exec(current)) !== null) {
          chordTokens.push({ chord: tm[0], index: tm.index });
        }

        // Calcular offset de indentación: la diferencia entre el inicio
        // del contenido visible en la línea de acordes vs la línea de letra.
        const chordLineStart = current.search(/\S/);
        const lyricLineStart = next.search(/\S/);
        const offset = chordLineStart >= 0 && lyricLineStart >= 0
          ? chordLineStart - lyricLineStart
          : 0;

        let merged = '';
        let lastCharIdx = 0;
        let lastChordEndCol = 0;

        chordTokens.forEach(({ chord, index }) => {
          const adjustedIdx = Math.max(0, index - offset);

          if (adjustedIdx < next.length) {
            // El acorde cae dentro del rango de texto de la letra
            if (adjustedIdx > lastCharIdx) {
              merged += next.slice(lastCharIdx, adjustedIdx);
              lastCharIdx = adjustedIdx;
            }
          } else {
            // El acorde cae DESPUÉS del final de la letra (cola de acordes)
            if (lastCharIdx < next.length) {
              merged += next.slice(lastCharIdx);
              lastCharIdx = next.length;
            }
            // Espacio de separación proporcional para que los acordes finales no se peguen
            if (lastChordEndCol > 0) {
              const spaceBetween = Math.max(2, index - lastChordEndCol);
              merged += ' '.repeat(spaceBetween);
            } else {
              merged += '  ';
            }
          }

          const chordTag = isSingleChord(chord) ? `[${chord}]` : chord;
          merged += chordTag;
          lastChordEndCol = index + chord.length;
        });

        // Agregar cualquier texto restante de la letra después del último acorde
        if (lastCharIdx < next.length) {
          merged += next.slice(lastCharIdx);
        }

        result.push(merged);
        i += 2; // Avanzamos 2 líneas porque consumimos los acordes y la letra
      }
    } else {
      // Línea de solo letra
      result.push(current);
      i++;
    }
  }

  return result.join('\n');
}

/**
 * Convierte contenido en formato bracketed [Acorde]Letra a formato de texto plano
 * con acordes en una línea arriba y letra en la línea de abajo.
 * Esto es el inverso de convertPlainTextToBracketed.
 */
export function convertBracketedToPlainText(bracketedContent: string): string {
  if (!bracketedContent) return '';

  // Si el contenido no tiene corchetes de acordes o riffs, ya es texto plano
  if (!hasChordBrackets(bracketedContent)) return bracketedContent;

  const lines = bracketedContent.split(/\r?\n/);
  const result: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Línea vacía
    if (!trimmed) {
      result.push('');
      continue;
    }

    // Línea de punteo / notas de bajo
    if (trimmed.startsWith('[riff:') && trimmed.endsWith(']')) {
      const riffBody = trimmed.slice(6, -1).trim();
      result.push(riffBody);
      continue;
    }

    // Encabezado de sección [Verso 1], [Coro], etc.
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const inside = trimmed.slice(1, -1).trim();
      if (isSectionHeaderTag(inside)) {
        result.push(trimmed);
        continue;
      }
    }

    // Comentario
    if (trimmed.startsWith('#') || trimmed.startsWith('//')) {
      result.push(line);
      continue;
    }

    // Línea sin corchetes de acordes → pasar tal cual
    if (!/\[[^\]]+\]/.test(trimmed)) {
      result.push(line);
      continue;
    }

    // ── Parsear bloques {acorde, texto} ──
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

    // ── Construir línea de acordes y línea de letra ──
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

      // Ancho mínimo del bloque: el acorde necesita al menos su largo + 1 espacio separador
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
      // Línea de solo acordes (intro, interludio, etc.)
      result.push(chordLine);
    } else {
      result.push(lyricsLine);
    }
  }

  return result.join('\n');
}

/**
 * Verifica si el contenido tiene corchetes de acordes reales o riffs (no solo encabezados de sección)
 */
function hasChordBrackets(content: string): boolean {
  const regex = /\[([^\]]+)\]/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    const tag = match[1].trim();
    if (tag.toLowerCase().startsWith('riff:')) return true;
    if (!isSectionHeaderTag(tag)) {
      // Verificar si al menos un token dentro es un acorde
      const tokens = tag.split(/\s+/);
      if (tokens.some((t) => isSingleChord(t))) {
        return true;
      }
    }
  }
  return false;
}
