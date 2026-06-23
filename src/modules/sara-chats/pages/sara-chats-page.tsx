import { useState } from "react"
import { useNavigate, Outlet, useParams } from "react-router-dom"
import { cn } from "@/shared/lib/utils"
import { Search, MessageSquare, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/shared/components/ui/input"
import { Button } from "@/shared/components/ui/button"
import { ChatListItem } from "../components/chat-list-item"
import { useSaraChats } from "../hooks/use-sara-chats"

export function SaraChatsPage() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const limit = 20

  const { id } = useParams<{ id?: string }>()
  const { chats, pagination, isLoading, isFetchingMore, refetch, loadMore } = useSaraChats({ search, limit })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      loadMore()
    }
  }

  return (
    <div className="flex h-[calc(100vh-5.5rem)] border rounded-xl overflow-hidden bg-card shadow-sm">
      
      {/* Left Pane: Chat List */}
      <div
        className={cn(
          "flex flex-col w-full md:w-[350px] lg:w-[400px] border-r shrink-0 bg-card",
          id ? "hidden md:flex" : "flex"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b shrink-0 flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Chats con Sara
            </h1>
          </div>
          <Button variant="ghost" size="icon" onClick={refetch} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 shrink-0 border-b">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar nombre o teléfono..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Button type="submit" size="sm" className="h-9">
              Buscar
            </Button>
          </form>
          {search && (
            <div className="mt-2 text-xs text-muted-foreground">
              {pagination.total} resultados
            </div>
          )}
        </div>

        {/* Chat List */}
        <div 
          className="flex-1 overflow-y-auto p-3 bg-muted/10"
          onScroll={handleScroll}
        >
          {isLoading && !isFetchingMore ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl border bg-card animate-pulse" />
              ))}
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                {search ? "No hay resultados." : "No hay conversaciones."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {chats.map((chat) => (
                <div 
                  key={chat.id} 
                  className={cn(
                    "rounded-xl overflow-hidden transition-colors border",
                    id === chat.id 
                      ? "ring-1 ring-primary border-primary bg-primary/5" 
                      : "border-transparent hover:bg-accent"
                  )}
                >
                  <ChatListItem
                    chat={chat}
                    onClick={() => navigate(`/admin/sara/chats/${chat.id}`)}
                  />
                </div>
              ))}
              {isFetchingMore && (
                <div className="py-4 flex justify-center">
                  <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          )}
        </div>


      </div>

      {/* Right Pane: Chat Detail (Outlet) */}
      <div
        className={cn(
          "flex-1 flex-col min-w-0 bg-[#efeae2] dark:bg-[#0b141a]",
          !id ? "hidden md:flex" : "flex"
        )}
      >
        <Outlet />
      </div>
    </div>
  )
}



export function EmptyChatSelection() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <MessageSquare className="h-8 w-8 text-primary/40" />
      </div>
      <h3 className="text-xl font-semibold text-foreground">SARA AI Chat</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm">
        Selecciona un chat del panel lateral para ver la conversación detallada y su historial.
      </p>
    </div>
  )
}
