import { cn } from "@/shared/lib/utils"
import { Wrench } from "lucide-react"
import type { SaraChatMessage } from "../types"

interface MessageBubbleProps {
  message: SaraChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const msgType = message.message?.type as string || ""
  const isAi = msgType === "ai" || msgType === "system"
  const content = message.message?.content ?? ""
  const timestamp = message.created_at
    ? new Date(message.created_at).toLocaleString("es-CO", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null

  const source = message.message?.additional_kwargs?.source as string | undefined

  // Detectar si es una acción o resultado de herramienta (LangChain / Agente)
  const isToolAction = content.startsWith("Calling ") && content.includes(" with input:")
  const isToolResult = msgType === "tool" || msgType === "function" || (content.startsWith("[{") && content.includes('"status"'))

  if (isToolAction || isToolResult) {
    let summary = isToolResult ? "Resultado de herramienta" : "Llamada a herramienta"
    let parsedContent = content
    
    if (isToolAction) {
      const parts = content.split(" with input:\n")
      if (parts.length > 1) {
        summary = `Sara usó la herramienta: ${parts[0].replace("Calling ", "").trim()}`
        parsedContent = parts[1]
      }
    }

    return (
      <div className="flex justify-center my-1 w-full">
        <details className="max-w-[90%] md:max-w-[70%] text-xs bg-card/60 text-muted-foreground border border-border/50 shadow-sm rounded-xl px-3 py-2 cursor-pointer group">
          <summary className="font-medium select-none flex items-center gap-2 outline-none">
            <Wrench className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{summary}</span>
            {timestamp && <span className="ml-2 shrink-0 text-[10px] opacity-70">{timestamp}</span>}
          </summary>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words bg-background p-2 rounded text-[10px] border font-mono">
            {parsedContent}
          </pre>
        </details>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col max-w-[85%] md:max-w-[70%]", isAi ? "self-start" : "self-end")}>
      {/* Bubble */}
      <div
        className={cn(
          "px-3 py-2 text-[14.5px] leading-relaxed shadow-sm flex flex-col",
          isAi
            ? "bg-card text-foreground rounded-2xl rounded-tl-sm border border-border/50"
            : "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
        )}
      >
        {/* Content */}
        <p className="whitespace-pre-wrap break-words">{content}</p>

        {/* Metadata row */}
        <div className={cn(
          "flex items-center gap-1.5 text-[10px] mt-1 self-end shrink-0",
          isAi ? "text-muted-foreground" : "text-primary-foreground/80"
        )}>
          {source && source !== "user" && (
            <span className="capitalize opacity-80">{source.replace(/_/g, " ")}</span>
          )}
          {timestamp && <span>{timestamp}</span>}
        </div>
      </div>
    </div>
  )
}
