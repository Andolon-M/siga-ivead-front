import { Card } from "@/shared/components/ui/card"
import { Play } from "lucide-react"

interface VideoCardProps {
  videoId: string
  onClick: () => void
  showTitle?: boolean
  size?: 'large' | 'medium'
  /** Título del video (p. ej. desde el listado del backend) */
  title?: string
  /** URL de la miniatura (p. ej. desde el listado del backend) */
  thumbnailUrl?: string
}

export function VideoCard({
  videoId,
  onClick,
  showTitle = false,
  size = 'medium',
  title = '',
  thumbnailUrl,
}: VideoCardProps) {
  const thumbnail =
    thumbnailUrl ?? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

  const playIconSize = size === 'large' ? 'w-20 h-20' : 'w-16 h-16'
  const playSize = size === 'large' ? 'h-10 w-10' : 'h-8 w-8'

  return (
    <Card
      className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300"
      onClick={onClick}
    >
      <div className="relative aspect-video">
        <img
          src={thumbnail}
          alt={title || 'Video'}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
          <div className={`${playIconSize} bg-live rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <Play className={`${playSize} text-live-foreground fill-current ml-1`} />
          </div>
        </div>
      </div>
      {showTitle && (
        <div className="p-4 bg-card">
          <p className="text-sm font-medium line-clamp-2">{title || 'Video'}</p>
        </div>
      )}
    </Card>
  )
}

