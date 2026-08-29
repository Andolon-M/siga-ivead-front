import React from 'react';
import { SongDetailPage } from '../song-detail-page';

/**
 * PublicSetlistPage
 * Reutiliza el 100% de la lógica, componentes visuales, controles móviles flotantes,
 * atril de pantalla completa, reproductor multimedia y cancionero de SongDetailPage,
 * adaptado para acceso público sin requerir inicio de sesión.
 */
export function PublicSetlistPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-3 sm:p-6 md:p-8">
      <SongDetailPage isPublicMode={true} />
    </div>
  );
}

export default PublicSetlistPage;
