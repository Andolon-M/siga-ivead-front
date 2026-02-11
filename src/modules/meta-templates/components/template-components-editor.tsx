import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Switch } from "@/shared/components/ui/switch"
import { Textarea } from "@/shared/components/ui/textarea"
import type {
  MetaTemplateButtonInput,
  MetaTemplateButtonType,
  MetaTemplateComponentInput,
  MetaTemplateHeaderFormat,
} from "../types"

interface TemplateComponentsEditorProps {
  value: MetaTemplateComponentInput[]
  onChange: (components: MetaTemplateComponentInput[]) => void
}

const HEADER_FORMATS: MetaTemplateHeaderFormat[] = ["TEXT", "IMAGE", "VIDEO", "DOCUMENT"]
const BUTTON_TYPES: MetaTemplateButtonType[] = ["QUICK_REPLY", "URL", "PHONE_NUMBER", "COPY_CODE"]

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

function upsertComponent(
  components: MetaTemplateComponentInput[],
  component: MetaTemplateComponentInput
): MetaTemplateComponentInput[] {
  const index = components.findIndex((item) => item.type === component.type)
  if (index === -1) return [...components, component]
  const copy = [...components]
  copy[index] = component
  return copy
}

function removeComponent(components: MetaTemplateComponentInput[], type: MetaTemplateComponentInput["type"]) {
  return components.filter((item) => item.type !== type)
}

export function TemplateComponentsEditor({ value, onChange }: TemplateComponentsEditorProps) {
  const body = value.find((item) => item.type === "BODY")
  const header = value.find((item) => item.type === "HEADER")
  const footer = value.find((item) => item.type === "FOOTER")
  const buttons = value.find((item) => item.type === "BUTTONS")

  const headerEnabled = Boolean(header)
  const footerEnabled = Boolean(footer)
  const buttonsEnabled = Boolean(buttons)
  const headerVariables = extractVariableIndexes(header?.text)
  const bodyVariables = extractVariableIndexes(body?.text)

  const setBodyText = (text: string) => {
    onChange(
      upsertComponent(value, {
        type: "BODY",
        text,
      })
    )
  }

  const setHeader = (nextHeader: MetaTemplateComponentInput) => {
    onChange(upsertComponent(value, nextHeader))
  }

  const setFooter = (nextFooter: MetaTemplateComponentInput) => {
    onChange(upsertComponent(value, nextFooter))
  }

  const setButtons = (nextButtons: MetaTemplateButtonInput[]) => {
    onChange(
      upsertComponent(value, {
        type: "BUTTONS",
        buttons: nextButtons,
      })
    )
  }

  const setHeaderExampleValue = (variableIndex: number, variableValue: string) => {
    const currentHeader = header ?? { type: "HEADER", format: "TEXT", text: "" as string }
    const examples = [...(currentHeader.example?.header_text ?? [])]
    examples[variableIndex - 1] = variableValue
    setHeader({
      ...currentHeader,
      type: "HEADER",
      example: {
        ...(currentHeader.example ?? {}),
        header_text: examples,
      },
    })
  }

  const setBodyExampleValue = (variableIndex: number, variableValue: string) => {
    const currentBody = body ?? { type: "BODY", text: "" as string }
    const firstRow = [...(currentBody.example?.body_text?.[0] ?? [])]
    firstRow[variableIndex - 1] = variableValue
    onChange(
      upsertComponent(value, {
        ...currentBody,
        type: "BODY",
        example: {
          ...(currentBody.example ?? {}),
          body_text: [firstRow],
        },
      })
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>BODY (obligatorio)</Label>
        <Textarea
          value={body?.text ?? ""}
          onChange={(event) => setBodyText(event.target.value)}
          placeholder="Texto principal del mensaje. Puedes usar variables como {{1}}"
          rows={4}
        />
        {bodyVariables.length > 0 ? (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Ejemplos de variables para BODY</Label>
            <div className="grid md:grid-cols-2 gap-2">
              {bodyVariables.map((variableIndex) => (
                <Input
                  key={`body-example-${variableIndex}`}
                  value={body?.example?.body_text?.[0]?.[variableIndex - 1] ?? ""}
                  onChange={(event) => setBodyExampleValue(variableIndex, event.target.value)}
                  placeholder={`Valor de ejemplo para {{${variableIndex}}}`}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label>HEADER (opcional)</Label>
          <Switch
            checked={headerEnabled}
            onCheckedChange={(checked) => {
              if (!checked) {
                onChange(removeComponent(value, "HEADER"))
                return
              }
              setHeader({
                type: "HEADER",
                format: "TEXT",
                text: "",
              })
            }}
          />
        </div>
        {headerEnabled ? (
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Formato</Label>
              <Select
                value={header?.format ?? "TEXT"}
                onValueChange={(newFormat: MetaTemplateHeaderFormat) => {
                  setHeader({
                    ...(header ?? { type: "HEADER" }),
                    type: "HEADER",
                    format: newFormat,
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona formato" />
                </SelectTrigger>
                <SelectContent>
                  {HEADER_FORMATS.map((format) => (
                    <SelectItem key={format} value={format}>
                      {format}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Texto header</Label>
              <Input
                value={header?.text ?? ""}
                onChange={(event) =>
                  setHeader({
                    ...(header ?? { type: "HEADER", format: "TEXT" }),
                    type: "HEADER",
                    text: event.target.value,
                  })
                }
                placeholder="Ej. ¡Hola {{1}}!"
              />
            </div>
            {header?.format === "TEXT" && headerVariables.length > 0 ? (
              <div className="md:col-span-2 space-y-2">
                <Label className="text-xs text-muted-foreground">Ejemplos de variables para HEADER</Label>
                <div className="grid md:grid-cols-2 gap-2">
                  {headerVariables.map((variableIndex) => (
                    <Input
                      key={`header-example-${variableIndex}`}
                      value={header?.example?.header_text?.[variableIndex - 1] ?? ""}
                      onChange={(event) => setHeaderExampleValue(variableIndex, event.target.value)}
                      placeholder={`Valor de ejemplo para {{${variableIndex}}}`}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label>FOOTER (opcional)</Label>
          <Switch
            checked={footerEnabled}
            onCheckedChange={(checked) => {
              if (!checked) {
                onChange(removeComponent(value, "FOOTER"))
                return
              }
              setFooter({
                type: "FOOTER",
                text: "",
              })
            }}
          />
        </div>
        {footerEnabled ? (
          <Input
            value={footer?.text ?? ""}
            onChange={(event) =>
              setFooter({
                type: "FOOTER",
                text: event.target.value,
              })
            }
            placeholder="Texto de pie de página"
          />
        ) : null}
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label>BUTTONS (opcional)</Label>
          <Switch
            checked={buttonsEnabled}
            onCheckedChange={(checked) => {
              if (!checked) {
                onChange(removeComponent(value, "BUTTONS"))
                return
              }
              setButtons([
                {
                  type: "QUICK_REPLY",
                  text: "",
                },
              ])
            }}
          />
        </div>

        {buttonsEnabled ? (
          <div className="space-y-3">
            {(buttons?.buttons ?? []).map((button, index) => (
              <div key={`${button.type}-${index}`} className="rounded-md border p-3 space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Tipo de botón</Label>
                    <Select
                      value={button.type}
                      onValueChange={(type: MetaTemplateButtonType) => {
                        const next = [...(buttons?.buttons ?? [])]
                        next[index] = { ...next[index], type }
                        setButtons(next)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {BUTTON_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Texto</Label>
                    <Input
                      value={button.text ?? ""}
                      onChange={(event) => {
                        const next = [...(buttons?.buttons ?? [])]
                        next[index] = { ...next[index], text: event.target.value }
                        setButtons(next)
                      }}
                      placeholder="Texto del botón"
                    />
                  </div>
                </div>

                {button.type === "URL" ? (
                  <div className="space-y-2">
                    <Label>URL</Label>
                    <Input
                      value={button.url ?? ""}
                      onChange={(event) => {
                        const next = [...(buttons?.buttons ?? [])]
                        next[index] = { ...next[index], url: event.target.value }
                        setButtons(next)
                      }}
                      placeholder="https://..."
                    />
                  </div>
                ) : null}

                {button.type === "PHONE_NUMBER" ? (
                  <div className="space-y-2">
                    <Label>Número telefónico</Label>
                    <Input
                      value={button.phone_number ?? ""}
                      onChange={(event) => {
                        const next = [...(buttons?.buttons ?? [])]
                        next[index] = { ...next[index], phone_number: event.target.value }
                        setButtons(next)
                      }}
                      placeholder="+573001112233"
                    />
                  </div>
                ) : null}

                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const next = [...(buttons?.buttons ?? [])]
                      next.splice(index, 1)
                      setButtons(next)
                    }}
                    title="Eliminar botón"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setButtons([...(buttons?.buttons ?? []), { type: "QUICK_REPLY", text: "" }])
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Añadir botón
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

