import type { Gender, MemberStatus } from "@/modules/members/types"

export interface MetaTemplateComponent {
  type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS" | string
  format?: string
  text?: string
  example?: Record<string, unknown>
  buttons?: Array<Record<string, unknown>>
}

export interface MetaTemplate {
  id: string
  name: string
  language: string
  category: string
  status: string
  components: MetaTemplateComponent[]
}

export interface MetaTemplatesListResponse {
  total: number
  templates: MetaTemplate[]
  paging?: {
    cursors?: {
      before?: string
      after?: string
    }
  }
}

export interface RecipientInput {
  phone: string
  memberId?: string
  name?: string
  note?: string
  variables?: Record<string, string>
}

export interface SendTemplatePayload {
  templateId: string
  personalize: 0 | 1
  recipients: RecipientInput[]
}

export interface SendTemplateResult {
  requestId: string
  templateId: string
  totalRecipients: number
}

export interface CampaignStatusSummary {
  requestId: string
  templateId: string
  status: "queued" | "processing" | "completed"
  total: number
  queued: number
  processing: number
  sent: number
  failed: number
  completed: number
  createdAt: string
  updatedAt: string
}

export interface MassMessageEventPayload {
  requestId: string
  phone?: string
  templateId?: string
  templateName?: string
  totalRecipients?: number
  queuedAt?: string
  startedAt?: string
  sentAt?: string
  failedAt?: string
  waMessageId?: string
  error?: string
  summary?: CampaignStatusSummary
}

export interface ManualRecipientForm {
  name: string
  phone: string
  note?: string
}

export interface RecipientViewModel {
  key: string
  source: "member" | "manual"
  memberId?: string
  name: string
  phone: string
  note?: string
}

export type AudienceMode = "all" | "status" | "gender"

export interface MemberSelectionFilters {
  audienceMode: AudienceMode
  search?: string
  status?: MemberStatus
  gender?: Gender
  page: number
  pageSize: number
}

