import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { FileText, ImageIcon, Video, Music, Upload, Search, Download, Eye, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import type { File } from "../types"

const mockFiles: File[] = [
  {
    id: 1,
    nombre: "Reporte Mensual Enero",
    tipo: "PDF",
    descripcion: "Reporte financiero del mes",
    url: "#",
    size: "2.5 MB",
    created_at: "2024-01-31",
  },
  {
    id: 2,
    nombre: "Foto Evento Navidad",
    tipo: "Imagen",
    descripcion: "Fotos del evento navideño",
    url: "#",
    size: "5.2 MB",
    created_at: "2024-12-25",
  },
  {
    id: 3,
    nombre: "Video Culto Domingo",
    tipo: "Video",
    descripcion: "Grabación del servicio dominical",
    url: "#",
    size: "120 MB",
    created_at: "2025-01-21",
  },
]

const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "pdf":
      return <FileText className="h-8 w-8 text-red-500" />
    case "imagen":
      return <ImageIcon className="h-8 w-8 text-blue-500" />
    case "video":
      return <Video className="h-8 w-8 text-purple-500" />
    case "audio":
      return <Music className="h-8 w-8 text-green-500" />
    default:
      return <FileText className="h-8 w-8 text-gray-500" />
  }
}

export function FilesPage() {
  const [files] = useState<File[]>(mockFiles)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || file.tipo.toLowerCase() === filterType.toLowerCase()
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Archivos</h1>
          <p className="text-muted-foreground">Gestiona los archivos de la iglesia</p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Subir Archivo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Archivos</CardTitle>
          <CardDescription>Todos los archivos almacenados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar archivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="imagen">Imagen</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredFiles.map((file) => (
              <Card key={file.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    {getFileIcon(file.tipo)}
                    <div className="space-y-1 w-full">
                      <h3 className="font-medium truncate">{file.nombre}</h3>
                      <p className="text-xs text-muted-foreground truncate">{file.descripcion}</p>
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>{file.created_at}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-1" />
                        Descargar
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

