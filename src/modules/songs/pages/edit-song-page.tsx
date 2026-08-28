import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type { Song } from '../types';
import { songsService } from '../services/songs.service';
import { SongForm } from '../components/song-form';

export function EditSongPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [song, setSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadSong = async () => {
      setIsLoading(true);
      try {
        const data = await songsService.getSongById(id);
        setSong(data);
      } catch (err) {
        console.error('Error al cargar canción para editar:', err);
        alert('No se pudo encontrar la canción.');
        navigate('/admin/songs');
      } finally {
        setIsLoading(false);
      }
    };

    loadSong();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Cargando datos de la canción...</p>
      </div>
    );
  }

  if (!song) return null;

  return <SongForm initialData={song} isEditing={true} />;
}
