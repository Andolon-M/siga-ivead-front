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

export interface SongVersionType {
  id: string;
  name: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  original_key: MusicalKey;
  version_type_id: string;
  version_type?: SongVersionType;
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
  artist: string;
  original_key: MusicalKey;
  version_type_id: string;
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
  key?: MusicalKey;
  version_type_id?: string;
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

export interface ChordBlock {
  chord: string | null;
  text: string;
}

export interface ParsedLine {
  isSectionHeader: boolean;
  sectionName?: string;
  isComment: boolean;
  isRiffOrNotes?: boolean;
  isEmpty: boolean;
  blocks: ChordBlock[];
}
