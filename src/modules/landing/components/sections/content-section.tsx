import { Card } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Search, Play, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { getYoutubeVideos, type YouTubeVideo } from "../../services/landing.service"
import { cn } from "@/shared/lib/utils"

function VideoListItem({
  video,
  isSelected,
  onClick,
}: {
  video: YouTubeVideo
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex gap-3 p-2 rounded-lg text-left transition-colors hover:bg-muted/60",
        isSelected && "bg-muted"
      )}
    >
      <div className="relative shrink-0 w-[120px] min-w-[120px] aspect-video rounded-md overflow-hidden bg-muted">
        <img
          src={video.thumbnail}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <Play className="h-6 w-6 text-white fill-white/90 drop-shadow" />
        </div>
      </div>
      <p className="text-sm font-medium line-clamp-2 flex-1 min-w-0 pt-0.5">
        {video.name}
      </p>
    </button>
  )
}

export function ContentSection() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getYoutubeVideos()
      .then((data) => {
        if (!cancelled) {
          setVideos(data)
          if (data.length > 0 && !selectedId) setSelectedId(data[0].id)
        }
      })
      .catch(() => {
        if (!cancelled) setError("No se pudieron cargar los videos.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const selectedVideo = videos.find((v) => v.id === selectedId) ?? videos[0]
  const sidebarVideos = videos.filter((v) => v.id !== selectedVideo?.id)

  return (
    <section id="predicas" className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-20 w-64 h-64 opacity-5 pointer-events-none rotate-45">
        <img src="/images/hoja-ive.svg" alt="" className="w-full h-full object-contain" />
      </div>
      <div className="absolute bottom-0 left-20 w-96 h-96 opacity-5 pointer-events-none -rotate-90">
        <img src="/images/hoja-ive.svg" alt="" className="w-full h-full object-contain" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Nuestro <span className="text-primary">contenido</span>
          </h2>

          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar un video aqui"
                className="pl-12 py-6 text-lg rounded-xl border-2 focus:border-primary"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : error ? (
            <p className="text-center text-muted-foreground py-8">{error}</p>
          ) : selectedVideo ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-8">
              {/* Reproductor principal - izquierda */}
              <div className="min-w-0">
                <Card
                  className="overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-300"
                  onClick={() =>
                    setPlayingId(playingId === selectedVideo.id ? null : selectedVideo.id)
                  }
                >
                  <div className="relative aspect-video">
                    {playingId === selectedVideo.id ? (
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                        title={selectedVideo.name}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <>
                        <img
                          src={selectedVideo.thumbnail}
                          alt={selectedVideo.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                          <div className="w-20 h-20 bg-live rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="h-10 w-10 text-live-foreground fill-current ml-1" />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
                <p className="mt-3 text-lg font-medium text-foreground line-clamp-2 px-1">
                  {selectedVideo.name}
                </p>
                <p className="mt-2 pl-2 text-xs font-medium text-foreground opacity-80  line-clamp-2 px-1">
                  {selectedVideo.description}
                </p>
              </div>

              {/* Columna Historial - derecha (estilo YouTube) */}
              <div className="flex flex-col min-w-0">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1 shrink-0">
                  Historial
                </h3>
                <div className="relative max-h-[520px]">
                  <div className="h-full max-h-[520px] overflow-y-auto space-y-0.5 pr-1 scrollbar-thin">
                    {sidebarVideos.map((video) => (
                      <VideoListItem
                        key={video.id}
                        video={video}
                        isSelected={false}
                        onClick={() => {
                          setSelectedId(video.id)
                          setPlayingId(null)
                        }}
                      />
                    ))}
                  </div>
                  {/* Borde inferior difuminado */}
                  <div
                    className="pointer-events-none absolute bottom-0 left-0 right-3 h-16 bg-gradient-to-t from-background to-transparent"
                    aria-hidden
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No hay videos disponibles.</p>
          )}
        </div>
      </div>
    </section>
  )
}
