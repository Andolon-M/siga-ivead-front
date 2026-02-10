export type MetaTemplateCategory = "MARKETING" | "UTILITY" | "AUTHENTICATION" | string
export type MetaTemplateStatus = "APPROVED" | "PENDING" | "REJECTED" | "DISABLED" | string
export type MetaTemplateHeaderFormat = "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT"
export type MetaTemplateButtonType = "QUICK_REPLY" | "URL" | "PHONE_NUMBER" | "COPY_CODE" | string

export interface MetaTemplateButton {
  type: MetaTemplateButtonType
  text?: string
  url?: string
  phone_number?: string
}

export interface MetaTemplateComponent {
  type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS" | string
  format?: MetaTemplateHeaderFormat
  text?: string
  example?: Record<string, unknown>
  buttons?: MetaTemplateButton[]
}

export interface MetaTemplate {
  id: string
  name: string
  language: string
  category: MetaTemplateCategory
  status: MetaTemplateStatus
  components: MetaTemplateComponent[]
}

export interface MetaTemplatesListPayload {
  total: number
  templates: MetaTemplate[]
  paging?: {
    cursors?: {
      before?: string
      after?: string
    }
  }
}

export interface MetaTemplateButtonInput {
  type: MetaTemplateButtonType
  text?: string
  url?: string
  phone_number?: string
}

export interface MetaTemplateComponentInput {
  type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS"
  format?: MetaTemplateHeaderFormat
  text?: string
  buttons?: MetaTemplateButtonInput[]
}

export interface CreateMetaTemplateData {
  name: string
  language: string
  category: MetaTemplateCategory
  components: MetaTemplateComponentInput[]
}

export interface UpdateMetaTemplateData {
  name?: string
  language?: string
  category?: MetaTemplateCategory
  components?: MetaTemplateComponentInput[]
}

export interface MetaTemplateFilters {
  search?: string
  category?: string
  status?: string
}

