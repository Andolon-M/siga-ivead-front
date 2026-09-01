import { axiosInstance } from '@/shared/api/axios.config';
import { API_ENDPOINTS } from '@/shared/api/enpoints';
import type {
  Song,
  SongVersionType,
  SongArtist,
  SongTag,
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
    if (filters?.tag_ids) {
      params.tag_ids = Array.isArray(filters.tag_ids) ? filters.tag_ids.join(',') : filters.tag_ids;
    }
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
  async updateSong(id: string, data: UpdateSongData, options?: { silent?: boolean }): Promise<Song> {
    const response = await axiosInstance.put<{ status: number; message: string; data: { song: Song } }>(
      API_ENDPOINTS.SONGS.UPDATE(id),
      data,
      options?.silent ? ({ silent: true } as any) : undefined
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
   * Guarda o actualiza la preferencia del usuario actual para una canción de forma silenciosa
   */
  async saveUserPreference(
    songId: string,
    data: { semitones?: number; font_size?: number | null; columns?: number | null; show_chords?: boolean }
  ): Promise<SongUserPreference> {
    const response = await axiosInstance.put<{
      status: number;
      message: string;
      data: { preference: SongUserPreference };
    }>(API_ENDPOINTS.SONGS.PREFERENCES(songId), data, {
      silent: true,
    } as any);

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

  // ========== ETIQUETAS (TAGS) ==========

  /**
   * Obtiene todas las etiquetas
   */
  async getAllTags(): Promise<SongTag[]> {
    const response = await axiosInstance.get<{ status: number; message: string; data: { tags: SongTag[] } }>(
      API_ENDPOINTS.SONGS.TAGS
    );

    return response.data.data.tags;
  },

  /**
   * Crea una etiqueta
   */
  async createTag(name: string): Promise<SongTag> {
    const response = await axiosInstance.post<{ status: number; message: string; data: { tag: SongTag } }>(
      API_ENDPOINTS.SONGS.CREATE_TAG,
      { name }
    );

    return response.data.data.tag;
  },

  /**
   * Actualiza una etiqueta
   */
  async updateTag(id: string, name: string): Promise<SongTag> {
    const response = await axiosInstance.put<{ status: number; message: string; data: { tag: SongTag } }>(
      API_ENDPOINTS.SONGS.UPDATE_TAG(id),
      { name }
    );

    return response.data.data.tag;
  },

  /**
   * Elimina una etiqueta
   */
  async deleteTag(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.SONGS.DELETE_TAG(id));
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
};
