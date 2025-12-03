export interface File {
  id: number
  nombre: string
  tipo: string
  descripcion: string
  url: string
  size: string
  created_at: string
}

export interface UploadFileData {
  file: globalThis.File
  descripcion: string
  tipo: string
}

