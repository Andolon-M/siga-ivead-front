import { Card } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Search, Play } from "lucide-react"
import { useState } from "react"
import { useYouTubeVideoInfo } from "../../hooks/useYouTubeVideoInfo"
import { VideoCard } from "./video-card"

export function ContentSection() {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'recent' | 'history'>('recent')
  
  const videoIds = {
    recent: "QNg-SFqqbi0",
    history: ["M1kCPzvnTF8", "_Ae4l5wYQKU", "vdNHzYIvljk"]
  }

  const { videoInfo: recentVideoInfo } = useYouTubeVideoInfo(videoIds.recent)

  return (
    <section id="predicas" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative leaf elements */}
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

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar un video aqui"
                className="pl-12 py-6 text-lg rounded-xl border-2 focus:border-primary"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-center gap-8 mb-12">
            <button 
              onClick={() => {
                setActiveTab('recent')
                setPlayingVideo(null)
              }}
              className={`text-lg font-semibold transition-colors pb-2 ${
                activeTab === 'recent' 
                  ? 'text-foreground border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Video más reciente
            </button>
            <button 
              onClick={() => {
                setActiveTab('history')
                setPlayingVideo(null)
              }}
              className={`text-lg font-semibold transition-colors pb-2 ${
                activeTab === 'history' 
                  ? 'text-foreground border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Historial
            </button>
          </div>

          {/* Videos Grid */}
          {activeTab === 'recent' ? (
            /* Video Más Reciente */
            <div className="max-w-4xl mx-auto">
              <Card 
                className="overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-300"
                onClick={() => setPlayingVideo(playingVideo === videoIds.recent ? null : videoIds.recent)}
              >
                <div className="relative aspect-video">
                  {playingVideo === videoIds.recent ? (
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${videoIds.recent}?autoplay=1`}
                      title={recentVideoInfo?.title || "Video"}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <img
                        src={`https://img.youtube.com/vi/${videoIds.recent}/maxresdefault.jpg`}
                        alt={recentVideoInfo?.title || "Video más reciente"}
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
            </div>
          ) : (
            /* Historial de Videos */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoIds.history.map((videoId) => (
                <VideoCard
                  key={videoId}
                  videoId={videoId}
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')}
                  showTitle={true}
                  size="medium"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
