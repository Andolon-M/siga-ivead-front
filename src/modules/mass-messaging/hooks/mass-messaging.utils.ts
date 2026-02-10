import type { MetaTemplate, RecipientInput, RecipientViewModel } from "../types"

export function isTemplatePersonalizableByMessage(template?: MetaTemplate | null): boolean {
  if (!template) return false
  const body = template.components.find((component) => component.type === "BODY")
  if (!body) return false

  const bodyText = (body.text ?? "").toLowerCase()
  if (bodyText.includes("{{message}}") || bodyText.includes("{message}")) {
    return true
  }

  const example = body.example as Record<string, unknown> | undefined
  const namedParams = (example?.body_text_named_params ?? []) as Array<Record<string, unknown>>
  return namedParams.some((param) => String(param.param_name ?? "").toLowerCase() === "message")
}

export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "")
  if (digits.startsWith("57")) return digits
  if (digits.startsWith("0")) return `57${digits.slice(1)}`
  return digits
}

export function isValidColombiaPhone(input: string): boolean {
  const digits = normalizePhone(input)
  return /^57\d{8,13}$/.test(digits)
}

export function dedupeRecipients(recipients: RecipientViewModel[], personalize: 0 | 1): RecipientInput[] {
  const uniqueMap = new Map<string, RecipientInput>()

  recipients.forEach((recipient) => {
    const normalizedPhone = normalizePhone(recipient.phone)
    if (!normalizedPhone) return
    if (uniqueMap.has(normalizedPhone)) return

    uniqueMap.set(normalizedPhone, {
      phone: normalizedPhone,
      memberId: recipient.memberId,
      name: recipient.name || undefined,
      note: personalize === 1 ? recipient.note || undefined : undefined,
    })
  })

  return Array.from(uniqueMap.values())
}

