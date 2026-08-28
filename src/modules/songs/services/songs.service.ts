import { axiosInstance } from '@/shared/api/axios.config';
import { API_ENDPOINTS } from '@/shared/api/enpoints';
import type {
  Song,
  SongVersionType,
  SongArtist,
  SongTheme,
  SongTypeItem,
  SongUserPreference,
  CreateSongData,
  UpdateSongData,
  SongFilters,
  SongsListResponse,
} from '../types';

export const songsService = {
  /**
   * Obtiene la lista de canciones con filtros
   */
  async getAllSongs(filters?: SongFilters): Promise<SongsListResponse> {
    const params: Record<string, any> = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.artist) params.artist = filters.artist;
    if (filters?.artist_id) params.artist_id = filters.artist_id;
    if (filters?.theme_id) params.theme_id = filters.theme_id;
    if (filters?.song_type_id) params.song_type_id = filters.song_type_id;
    if (filters?.key) params.key = filters.key;
    if (filters?.version_type_id) params.version_type_id = filters.version_type_id;
    if (filters?.tempo_type) params.tempo_type = filters.tempo_type;
    if (filters?.page) params.page = filters.page;
    if (filters?.limit) params.limit = filters.limit;

    const response = await axiosInstance.get<{ status: number; message: string; data: SongsListResponse }>(
      API_ENDPOINTS.SONGS.LIST,
      { params }
    );

    return response.data.data;
  },

  /**
   * Obtiene una canción por su ID
   */
  async getSongById(id: string): Promise<Song> {
    const response = await axiosInstance.get<{ status: number; message: string; data: { song: Song } }>(
      API_ENDPOINTS.SONGS.GET(id)
    );

    return response.data.data.song;
  },

  /**
   * Crea una nueva canción
   */
  async createSong(data: CreateSongData): Promise<Song> {
    const response = await axiosInstance.post<{ status: number; message: string; data: { song: Song } }>(
      API_ENDPOINTS.SONGS.CREATE,
      data
    );

    return response.data.data.song;
  },

  /**
   * Actualiza una canción existente
   */
  async updateSong(id: string, data: UpdateSongData): Promise<Song> {
    const response = await axiosInstance.put<{ status: number; message: string; data: { song: Song } }>(
      API_ENDPOINTS.SONGS.UPDATE(id),
      data
    );

    return response.data.data.song;
  },

  /**
   * Elimina una canción
   */
  async deleteSong(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.SONGS.DELETE(id));
  },

  // ========== PREFERENCIAS DE USUARIO ==========

  /**
   * Obtiene la preferencia del usuario actual para una canción
   */
  async getUserPreference(songId: string): Promise<SongUserPreference | null> {
    const response = await axiosInstance.get<{
      status: number;
      message: string;
      data: { preference: SongUserPreference | null };
    }>(API_ENDPOINTS.SONGS.PREFERENCES(songId));

    return response.data.data.preference;
  },

  /**
   * Guarda o actualiza la preferencia del usuario actual para una canción
   */
  async saveUserPreference(
    songId: string,
    data: { semitones?: number; font_size?: number | null; columns?: number | null; show_chords?: boolean }
  ): Promise<SongUserPreference> {
    const response = await axiosInstance.put<{
      status: number;
      message: string;
      data: { preference: SongUserPreference };
    }>(API_ENDPOINTS.SONGS.PREFERENCES(songId), data);

    return response.data.data.preference;
  },

  /**
   * Restablece la preferencia del usuario actual para una canción
   */
  async deleteUserPreference(songId: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.SONGS.PREFERENCES(songId));
  },

  // ========== ARTISTAS ==========

  /**
   * Obtiene todos los artistas
   */
  async getAllArtists(): Promise<SongArtist[]> {
    const response = await axiosInstance.get<{ status: number; message: string; data: { artists: SongArtist[] } }>(
      API_ENDPOINTS.SONGS.ARTISTS
    );

    return response.data.data.artists;
  },

  /**
   * Crea un artista
   */
  async createArtist(name: string): Promise<SongArtist> {
    const response = await axiosInstance.post<{ status: number; message: string; data: { artist: SongArtist } }>(
      API_ENDPOINTS.SONGS.CREATE_ARTIST,
      { name }
    );

    return response.data.data.artist;
  },

  /**
   * Actualiza un artista
   */
  async updateArtist(id: string, name: string): Promise<SongArtist> {
    const response = await axiosInstance.put<{ status: number; message: string; data: { artist: SongArtist } }>(
      API_ENDPOINTS.SONGS.UPDATE_ARTIST(id),
      { name }
    );

    return response.data.data.artist;
  },

  /**
   * Elimina un artista
   */
  async deleteArtist(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.SONGS.DELETE_ARTIST(id));
  },

  // ========== TEMAS CENTRALES ==========

  /**
   * Obtiene todos los temas centrales
   */
  async getAllThemes(): Promise<SongTheme[]> {
    const response = await axiosInstance.get<{ status: number; message: string; data: { themes: SongTheme[] } }>(
      API_ENDPOINTS.SONGS.THEMES
    );

    return response.data.data.themes;
  },

  /**
   * Crea un tema central
   */
  async createTheme(name: string): Promise<SongTheme> {
    const response = await axiosInstance.post<{ status: number; message: string; data: { theme: SongTheme } }>(
      API_ENDPOINTS.SONGS.CREATE_THEME,
      { name }
    );

    return response.data.data.theme;
  },

  /**
   * Actualiza un tema central
   */
  async updateTheme(id: string, name: string): Promise<SongTheme> {
    const response = await axiosInstance.put<{ status: number; message: string; data: { theme: SongTheme } }>(
      API_ENDPOINTS.SONGS.UPDATE_THEME(id),
      { name }
    );

    return response.data.data.theme;
  },

  /**
   * Elimina un tema central
   */
  async deleteTheme(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.SONGS.DELETE_THEME(id));
  },

  // ========== TIPOS DE VERSIÓN ==========

  /**
   * Obtiene todos los tipos de versión
   */
  async getAllVersionTypes(): Promise<SongVersionType[]> {
    const response = await axiosInstance.get<{ status: number; message: string; data: { types: SongVersionType[] } }>(
      API_ENDPOINTS.SONGS.VERSION_TYPES
    );

    return response.data.data.types;
  },

  /**
   * Crea un tipo de versión
   */
  async createVersionType(name: string): Promise<SongVersionType> {
    const response = await axiosInstance.post<{ status: number; message: string; data: { type: SongVersionType } }>(
      API_ENDPOINTS.SONGS.CREATE_VERSION_TYPE,
      { name }
    );

    return response.data.data.type;
  },

  /**
   * Actualiza un tipo de versión
   */
  async updateVersionType(id: string, name: string): Promise<SongVersionType> {
    const response = await axiosInstance.put<{ status: number; message: string; data: { type: SongVersionType } }>(
      API_ENDPOINTS.SONGS.UPDATE_VERSION_TYPE(id),
      { name }
    );

    return response.data.data.type;
  },

  /**
   * Elimina un tipo de versión
   */
  async deleteVersionType(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.SONGS.DELETE_VERSION_TYPE(id));
  },

  // ========== TIPOS DE CANCIÓN (ALABANZA, ADORACIÓN, INTIMIDAD...) ==========

  /**
   * Obtiene todos los tipos de canción
   */
  async getAllSongTypes(): Promise<SongTypeItem[]> {
    const response = await axiosInstance.get<{ status: number; message: string; data: { types: SongTypeItem[] } }>(
      API_ENDPOINTS.SONGS.SONG_TYPES
    );

    return response.data.data.types;
  },

  /**
   * Crea un tipo de canción
   */
  async createSongType(name: string): Promise<SongTypeItem> {
    const response = await axiosInstance.post<{ status: number; message: string; data: { type: SongTypeItem } }>(
      API_ENDPOINTS.SONGS.CREATE_SONG_TYPE,
      { name }
    );

    return response.data.data.type;
  },

  /**
   * Actualiza un tipo de canción
   */
  async updateSongType(id: string, name: string): Promise<SongTypeItem> {
    const response = await axiosInstance.put<{ status: number; message: string; data: { type: SongTypeItem } }>(
      API_ENDPOINTS.SONGS.UPDATE_SONG_TYPE(id),
      { name }
    );

    return response.data.data.type;
  },

  /**
   * Elimina un tipo de canción
   */
  async deleteSongType(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.SONGS.DELETE_SONG_TYPE(id));
  },
};
