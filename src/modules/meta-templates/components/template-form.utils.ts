import type {
  CreateMetaTemplateData,
  MetaTemplate,
  MetaTemplateButtonInput,
  MetaTemplateComponentInput,
  UpdateMetaTemplateData,
} from "../types"

export interface MetaTemplateFormState {
  name: string
  language: string
  category: string
  components: MetaTemplateComponentInput[]
}

function extractVariableIndexes(text?: string): number[] {
  if (!text) return []
  const matches = Array.from(text.matchAll(/\{\{\s*(\d+)\s*\}\}/g))
  const unique = new Set<number>()
  matches.forEach((match) => {
    const index = Number(match[1])
    if (Number.isFinite(index) && index > 0) unique.add(index)
  })
  return Array.from(unique).sort((a, b) => a - b)
}

export function createEmptyTemplateFormState(): MetaTemplateFormState {
  return {
    name: "",
    language: "es_CO",
    category: "MARKETING",
    components: [
      {
        type: "BODY",
        text: "",
      },
    ],
  }
}

export function createTemplateFormStateFromTemplate(template: MetaTemplate): MetaTemplateFormState {
  return {
    name: template.name,
    language: template.language,
    category: template.category,
    components: template.components
      .filter((item) => ["HEADER", "BODY", "FOOTER", "BUTTONS"].includes(item.type))
      .map((item) => ({
        type: item.type as "HEADER" | "BODY" | "FOOTER" | "BUTTONS",
        format: item.format,
        text: item.text,
        example: item.example as MetaTemplateComponentInput["example"] | undefined,
        buttons: item.buttons?.map((button) => ({
          type: button.type,
          text: button.text,
          url: button.url,
          phone_number: button.phone_number,
        })),
      })),
  }
}

function hasBody(components: MetaTemplateComponentInput[]): boolean {
  const body = components.find((component) => component.type === "BODY")
  return Boolean(body?.text?.trim())
}

function isButtonValid(button: MetaTemplateButtonInput): boolean {
  if (!button.text?.trim()) return false
  if (button.type === "URL" && !button.url?.trim()) return false
  if (button.type === "PHONE_NUMBER" && !button.phone_number?.trim()) return false
  return true
}

export function validateTemplateFormState(form: MetaTemplateFormState): string | null {
  if (!form.name.trim()) return "El nombre de la plantilla es obligatorio"
  if (!form.language.trim()) return "El idioma es obligatorio"
  if (!form.category.trim()) return "La categoría es obligatoria"
  if (!hasBody(form.components)) return "El componente BODY es obligatorio y debe tener texto"

  const header = form.components.find((component) => component.type === "HEADER")
  if (header?.format === "TEXT" && !header.text?.trim()) {
    return "Si HEADER es de tipo TEXT, debes ingresar el texto del encabezado"
  }
  if (header?.format === "TEXT") {
    const headerVars = extractVariableIndexes(header.text)
    if (headerVars.length > 0) {
      const examples = header.example?.header_text ?? []
      const hasMissingExample = headerVars.some((variableIndex) => !examples[variableIndex - 1]?.trim())
      if (hasMissingExample) {
        return "El componente HEADER con variables debe incluir example.header_text para cada variable"
      }
    }
  }

  const body = form.components.find((component) => component.type === "BODY")
  if (body) {
    const bodyVars = extractVariableIndexes(body.text)
    if (bodyVars.length > 0) {
      const bodyExamples = body.example?.body_text?.[0] ?? []
      const hasMissingBodyExample = bodyVars.some((variableIndex) => !bodyExamples[variableIndex - 1]?.trim())
      if (hasMissingBodyExample) {
        return "El componente BODY con variables debe incluir example.body_text con valores de ejemplo"
      }
    }
  }

  const buttons = form.components.find((component) => component.type === "BUTTONS")
  if (buttons?.buttons?.length) {
    const invalid = buttons.buttons.some((button) => !isButtonValid(button))
    if (invalid) return "Cada botón debe tener texto y campos requeridos según su tipo"
  }

  return null
}

export function buildCreatePayload(form: MetaTemplateFormState): CreateMetaTemplateData {
  return {
    name: form.name.trim(),
    language: form.language.trim(),
    category: form.category.trim(),
    components: form.components.map((component) => {
      const variableIndexes = extractVariableIndexes(component.text)
      const nextExample = component.example
      const normalizedHeaderExamples = (nextExample?.header_text ?? []).map((value) => value.trim())
      const normalizedBodyExamples = (nextExample?.body_text?.[0] ?? []).map((value) => value.trim())

      const normalizedComponent: MetaTemplateComponentInput = {
        ...component,
        text: component.text?.trim() || undefined,
        buttons: component.buttons?.map((button) => ({
          ...button,
          text: button.text?.trim() || undefined,
          url: button.url?.trim() || undefined,
          phone_number: button.phone_number?.trim() || undefined,
        })),
      }

      if (component.type === "HEADER" && variableIndexes.length > 0) {
        normalizedComponent.example = {
          header_text: variableIndexes.map((idx) => normalizedHeaderExamples[idx - 1] ?? ""),
        }
      } else if (component.type === "BODY" && variableIndexes.length > 0) {
        normalizedComponent.example = {
          body_text: [variableIndexes.map((idx) => normalizedBodyExamples[idx - 1] ?? "")],
        }
      } else {
        normalizedComponent.example = undefined
      }

      return normalizedComponent
    }),
  }
}

export function buildUpdatePayload(form: MetaTemplateFormState): UpdateMetaTemplateData {
  return buildCreatePayload(form)
}

