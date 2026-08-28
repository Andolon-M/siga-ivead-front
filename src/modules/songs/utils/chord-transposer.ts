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
 * Transpone todo el contenido de la canción respetando corchetes [Acorde]
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
    // Si es un encabezado de sección como [Intro], [Verso 1], [Coro], [Puente], etc., no transponer
    const trimmed = chordName.trim();
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
 * Determina si una etiqueta entre corchetes es un encabezado de sección
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
    lower.startsWith('tag')
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
        blocks: [],
      };
    }

    // Encabezado de sección (ej: [Verso 1], [Coro], [Intro], [Estribillo])
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const inside = trimmed.slice(1, -1).trim();
      if (isSectionHeaderTag(inside)) {
        return {
          isEmpty: false,
          isSectionHeader: true,
          sectionName: inside,
          isComment: false,
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

    // 4. Si la línea actual ya tiene corchetes de acordes [G]Letra, mantenerla
    if (/\[[A-G][#b]?[^\]]*\]/.test(current)) {
      result.push(current);
      i++;
      continue;
    }

    // 5. Verificar si la línea actual es una línea de acordes
    if (isChordLine(current)) {
      const next = lines[i + 1];
      const isNextChordOrEmpty = !next || !next.trim() || isChordLine(next) || next.trim().startsWith('[');

      if (isNextChordOrEmpty) {
        // Línea de solo acordes (intro/interludio/outro)
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

        let merged = '';
        let lastCharIdx = 0;

        chordTokens.forEach(({ chord, index }) => {
          if (index > lastCharIdx && index < next.length) {
            merged += next.slice(lastCharIdx, index);
            lastCharIdx = index;
          } else if (index >= next.length && lastCharIdx < next.length) {
            merged += next.slice(lastCharIdx);
            lastCharIdx = next.length;
          }

          const chordTag = isSingleChord(chord) ? `[${chord}]` : chord;
          merged += chordTag;
        });

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
