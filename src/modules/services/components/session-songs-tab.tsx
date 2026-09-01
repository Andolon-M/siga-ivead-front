import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Input } from "@/shared/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog"
import {
  Music,
  Plus,
  Play,
  ArrowUp,
  ArrowDown,
  Trash2,
  Search,
  Loader2,
  ExternalLink,
  Sparkles,
  User,
  ListMusic,
  Check,
  Share2,
} from "lucide-react"
import { meetingsService } from "../services/meetings.service"
import { songsService } from "@/modules/songs/services/songs.service"
import { MUSICAL_KEY_SHORT } from "@/modules/songs/utils/chord-transposer"
import { ShareSetlistModal } from "@/modules/songs/components/share-setlist-modal"
import type { MeetingSessionSongItem } from "../types"
import type { Song } from "@/modules/songs/types"

interface SessionSongsTabProps {
  sessionId: string
  sessionName?: string
  sessionDate?: string
}

export function SessionSongsTab({ sessionId, sessionName, sessionDate }: SessionSongsTabProps) {
  const navigate = useNavigate()
  const [songsList, setSongsList] = useState<MeetingSessionSongItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  // Estados del modal de agregar canción
  const [availableSongs, setAvailableSongs] = useState<Song[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false)
  const [isAddingSongId, setIsAddingSongId] = useState<string | null>(null)

  // Cargar lista de canciones de la sesión
  const loadSessionSongs = async () => {
    try {
      setIsLoading(true)
      const data = await meetingsService.getSessionSongs(sessionId)
      setSongsList(data)
    } catch (err) {
      console.error("Error al cargar canciones del culto:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (sessionId) {
      loadSessionSongs()
    }
  }, [sessionId])

  // Cargar catálogo de canciones cuando se abre el modal
  const loadCatalog = async (query = "") => {
    try {
      setIsLoadingCatalog(true)
      const res = await songsService.getAllSongs({ search: query || undefined, limit: 100 })
      setAvailableSongs(res.songs)
    } catch (err) {
      console.error("Error al cargar catálogo de canciones:", err)
    } finally {
      setIsLoadingCatalog(false)
    }
  }

  useEffect(() => {
    if (isAddModalOpen) {
      loadCatalog(searchTerm)
    }
  }, [isAddModalOpen, searchTerm])

  // Agregar canción a la sesión
  const handleAddSong = async (song: Song) => {
    try {
      setIsAddingSongId(song.id)
      await meetingsService.addSongToSession(sessionId, {
        song_id: song.id,
      })
      await loadSessionSongs()
      setIsAddModalOpen(false)
    } catch (err) {
      console.error("Error al agregar canción al culto:", err)
      alert("No se pudo agregar la canción al culto.")
    } finally {
      setIsAddingSongId(null)
    }
  }

  // Mover orden de canción (arriba / abajo)
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= songsList.length) return

    const reordered = [...songsList]
    const [movedItem] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, movedItem)

    // Actualizar optimistic UI
    setSongsList(reordered)

    try {
      const ids = reordered.map((item) => item.id)
      await meetingsService.reorderSessionSongs(sessionId, ids)
    } catch (err) {
      console.error("Error al reordenar repertorio:", err)
      await loadSessionSongs()
    }
  }

  // Quitar canción del setlist
  const handleRemove = async (item: MeetingSessionSongItem) => {
    if (!window.confirm(`¿Quitar "${item.song.title}" del repertorio de este culto?`)) {
      return
    }

    try {
      await meetingsService.removeSongFromSession(sessionId, item.id)
      setSongsList((prev) => prev.filter((s) => s.id !== item.id))
    } catch (err) {
      console.error("Error al quitar canción:", err)
      alert("No se pudo quitar la canción.")
      await loadSessionSongs()
    }
  }

  // Iniciar modo en vivo (Atril) desde la primera canción
  const handleStartLiveMode = () => {
    if (songsList.length === 0) return
    const firstSong = songsList[0]
    navigate(`/admin/songs/${firstSong.song_id}?sessionId=${sessionId}`)
  }

  return (
    <div className="space-y-6">
      {/* Cabecera de la sección */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ListMusic className="h-5 w-5 text-primary" />
            Repertorio de Alabanza (Setlist)
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Orden y secuencia de canciones programadas para este culto
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {songsList.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => setIsShareModalOpen(true)}
                className="gap-2 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-semibold"
                title="Compartir repertorio por WhatsApp o enlace público"
              >
                <Share2 className="h-4 w-4" />
                Compartir
              </Button>

              <Button
                onClick={handleStartLiveMode}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold"
              >
                <Play className="h-4 w-4 fill-current" />
                Modo En Vivo / Atril
              </Button>
            </>
          )}

          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="gap-2">
                <Plus className="h-4 w-4" />
                Agregar Canción
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[85vh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5 text-primary" />
                  Agregar Canción al Culto
                </DialogTitle>
                <DialogDescription>
                  Selecciona una canción del repertorio general de la iglesia.
                </DialogDescription>
              </DialogHeader>

              {/* Buscador */}
              <div className="relative my-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título o artista..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>

              {/* Lista de Canciones Disponibles */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[50vh]">
                {isLoadingCatalog ? (
                  <div className="flex flex-col items-center justify-center p-8 gap-2 text-muted-foreground text-sm">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    Buscando en el cancionero...
                  </div>
                ) : availableSongs.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground text-sm">
                    No se encontraron canciones en el catálogo.
                  </div>
                ) : (
                  availableSongs.map((song) => {
                    const isAlreadyInSession = songsList.some((s) => s.song_id === song.id)
                    return (
                      <div
                        key={song.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                          isAlreadyInSession
                            ? "bg-muted/40 opacity-75 border-dashed"
                            : "hover:bg-muted/60 hover:border-primary/40 bg-card"
                        }`}
                      >
                        <div className="space-y-1 flex-1 min-w-0 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm truncate">{song.title}</span>
                            <Badge
                              variant="default"
                              className="font-mono text-[10px] px-1.5 py-0 shrink-0 bg-primary/90"
                            >
                              {MUSICAL_KEY_SHORT[song.original_key]}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                            <span>{song.artist_rel?.name || song.artist}</span>
                            {song.tags && song.tags.length > 0 && (
                              <span className="text-primary font-medium truncate">
                                • {song.tags.map((t) => t.name).join(", ")}
                              </span>
                            )}
                            {song.bpm && <span>• {song.bpm} BPM</span>}
                          </div>
                        </div>

                        <div>
                          {isAlreadyInSession ? (
                            <Badge variant="outline" className="text-xs gap-1 text-muted-foreground">
                              <Check className="h-3 w-3 text-emerald-500" />
                              Agregada
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleAddSong(song)}
                              disabled={isAddingSongId === song.id}
                              className="gap-1.5 text-xs h-8"
                            >
                              {isAddingSongId === song.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Plus className="h-3.5 w-3.5" />
                              )}
                              Agregar
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Listado del Setlist */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 gap-3 text-muted-foreground text-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          Cargando repertorio del culto...
        </div>
      ) : songsList.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-3">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <Music className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">No hay canciones programadas</h3>
              <p className="text-sm text-muted-foreground max-w-md mt-1">
                Agrega las canciones que la banda y el grupo de alabanza interpretarán en este culto.
              </p>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 mt-2">
              <Plus className="h-4 w-4" />
              Agregar Primera Canción
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {songsList.map((item, index) => {
            const isFirst = index === 0
            const isLast = index === songsList.length - 1
            const song = item.song

            return (
              <Card
                key={item.id}
                className="group hover:border-primary/40 hover:shadow-sm transition-all overflow-hidden"
              >
                <div className="flex items-center p-3.5 sm:p-4 gap-3">
                  {/* Posición / Orden */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                    {index + 1}
                  </div>

                  {/* Datos de la canción */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() =>
                      navigate(`/admin/songs/${item.song_id}?sessionId=${sessionId}`)
                    }
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm sm:text-base group-hover:text-primary transition-colors truncate">
                        {song.title}
                      </h4>
                      <Badge variant="default" className="font-mono text-xs px-2 py-0 bg-primary/90">
                        {MUSICAL_KEY_SHORT[item.custom_key || song.original_key]}
                      </Badge>
                      {item.custom_key && item.custom_key !== song.original_key && (
                        <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">
                          (Transportada)
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                      <span className="font-medium text-foreground/80">
                        {song.artist_rel?.name || song.artist}
                      </span>
                      {song.tags && song.tags.length > 0 && song.tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="text-[11px] font-normal bg-primary/10 text-primary border-primary/20 py-0"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                      {song.bpm && (
                        <Badge
                          variant="outline"
                          className={`text-[11px] font-normal font-mono py-0 ${
                            song.bpm >= 100
                              ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                          }`}
                        >
                          {song.bpm >= 100 ? "⚡ Rápida" : "🕊️ Lenta"} ({song.bpm})
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Acciones de Orden y Eliminación */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleMove(index, "up")}
                      disabled={isFirst}
                      title="Mover arriba"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleMove(index, "down")}
                      disabled={isLast}
                      title="Mover abajo"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1 text-xs hidden sm:inline-flex"
                      onClick={() =>
                        navigate(`/admin/songs/${item.song_id}?sessionId=${sessionId}`)
                      }
                      title="Ver acordes y tocar"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Ver
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemove(item)}
                      title="Quitar del culto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal para Compartir Repertorio */}
      <ShareSetlistModal
        open={isShareModalOpen}
        onOpenChange={setIsShareModalOpen}
        session={{
          id: sessionId,
          session_date: sessionDate || '',
          recurring_meetings: { name: sessionName || 'Culto de Adoración' },
        } as any}
        sessionSongs={songsList}
        sessionId={sessionId}
      />
    </div>
  )
}
