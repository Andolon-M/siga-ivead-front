"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Play } from "lucide-react"

export function ContentSection() {
  const videos = [
    {
      id: 1,
      thumbnail: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5-R9xjsfjKSYaoPEJq12xDWtSRSmYQGL.jpg",
      title: "Un Panorama Diferente",
    },
    {
      id: 2,
      thumbnail: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5-R9xjsfjKSYaoPEJq12xDWtSRSmYQGL.jpg",
      title: "Un Panorama Diferente",
    },
    {
      id: 3,
      thumbnail: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5-R9xjsfjKSYaoPEJq12xDWtSRSmYQGL.jpg",
      title: "Un Panorama Diferente",
    },
  ]

  return (
    <section className="py-24 bg-background relative overflow-hidden">
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
            <button className="text-lg font-semibold text-foreground border-b-2 border-primary pb-2">
              Video más reciente
            </button>
            <button className="text-lg font-semibold text-muted-foreground hover:text-foreground transition-colors pb-2">
              Historial
            </button>
          </div>

          {/* Videos Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Featured Video */}
            <Card className="md:col-span-2 overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-300">
              <div className="relative aspect-video">
                <img
                  src={videos[0].thumbnail || "/placeholder.svg"}
                  alt={videos[0].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                  <div className="w-20 h-20 bg-live rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="h-10 w-10 text-live-foreground fill-current ml-1" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Smaller Videos */}
            {videos.slice(1).map((video) => (
              <Card
                key={video.id}
                className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-video">
                  <img
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <div className="w-16 h-16 bg-live rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="h-8 w-8 text-live-foreground fill-current ml-1" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
