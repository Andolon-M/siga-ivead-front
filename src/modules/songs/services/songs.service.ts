import { axiosInstance } from '@/shared/api/axios.config';
import { API_ENDPOINTS } from '@/shared/api/enpoints';
import type {
  Song,
  SongVersionType,
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
    if (filters?.key) params.key = filters.key;
    if (filters?.version_type_id) params.version_type_id = filters.version_type_id;
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
