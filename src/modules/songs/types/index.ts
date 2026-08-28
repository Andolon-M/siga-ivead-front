export type MusicalKey =
  | 'C'
  | 'C_SHARP'
  | 'Db'
  | 'D'
  | 'D_SHARP'
  | 'Eb'
  | 'E'
  | 'F'
  | 'F_SHARP'
  | 'Gb'
  | 'G'
  | 'G_SHARP'
  | 'Ab'
  | 'A'
  | 'A_SHARP'
  | 'Bb'
  | 'B'
  | 'Cm'
  | 'C_SHARPm'
  | 'Dbm'
  | 'Dm'
  | 'D_SHARPm'
  | 'Ebm'
  | 'Em'
  | 'Fm'
  | 'F_SHARPm'
  | 'Gbm'
  | 'Gm'
  | 'G_SHARPm'
  | 'Abm'
  | 'Am'
  | 'A_SHARPm'
  | 'Bbm'
  | 'Bm';

export type TempoType = 'fast' | 'slow';

export interface SongVersionType {
  id: string;
  name: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SongArtist {
  id: string;
  name: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SongTheme {
  id: string;
  name: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SongUserPreference {
  id: string;
  user_id: string;
  song_id: string;
  semitones: number;
  font_size?: number | null;
  columns?: number | null;
  show_chords: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  artist_id?: string | null;
  artist_rel?: SongArtist | null;
  theme_id?: string | null;
  theme?: SongTheme | null;
  original_key: MusicalKey;
  version_type_id?: string | null;
  version_type?: SongVersionType | null;
  bpm?: number | null;
  time_signature?: string | null;
  content: string;
  multitrack_url?: string | null;
  youtube_url?: string | null;
  notes?: string | null;
  created_by?: string | null;
  creator?: {
    id: string;
    email: string;
  } | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateSongData {
  title: string;
  artist?: string;
  artist_id?: string | null;
  theme_id?: string | null;
  original_key: MusicalKey;
  version_type_id?: string | null;
  bpm?: number | null;
  time_signature?: string | null;
  content: string;
  multitrack_url?: string | null;
  youtube_url?: string | null;
  notes?: string | null;
}

export interface UpdateSongData extends Partial<CreateSongData> {}

export interface SongFilters {
  search?: string;
  artist?: string;
  artist_id?: string;
  theme_id?: string;
  key?: MusicalKey;
  version_type_id?: string;
  tempo_type?: TempoType;
  page?: number;
  limit?: number;
}

export interface SongsListResponse {
  songs: Song[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type SongLineType = 'empty' | 'section' | 'chord' | 'lyrics' | 'riff' | 'comment';

export interface ChordBlock {
  chord: string | null;
  text: string;
}

export interface ParsedLine {
  type: SongLineType;
  text: string;
  sectionName?: string;
  isSectionHeader?: boolean;
  isComment?: boolean;
  isRiffOrNotes?: boolean;
  isEmpty?: boolean;
  blocks?: ChordBlock[];
}
