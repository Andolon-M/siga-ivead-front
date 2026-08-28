import { Link, useLocation } from "react-router-dom"
import { ArrowLeft, X } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"
import type { ModuleSidebarConfig } from "@/shared/layouts/types/module-sidebar.types"

interface GenericSidebarProps {
  config: ModuleSidebarConfig
  isOpen?: boolean
  onClose?: () => void
}

export function GenericSidebar({ config, isOpen = true, onClose }: GenericSidebarProps) {
  const { pathname } = useLocation()

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 h-screen bg-card border-r flex flex-col transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand / Logo */}
        <div className="p-4 lg:p-6 border-b flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {typeof config.brand.logo === "string" ? (
              <img
                src={config.brand.logo}
                alt={config.brand.title}
                className="w-10 h-10 rounded-lg object-cover shadow-sm ring-1 ring-border/50"
              />
            ) : (
              config.brand.logo
            )}
            <div>
              <h2 className="font-bold text-lg leading-tight">{config.brand.title}</h2>
              {config.brand.subtitle && (
                <p className="text-xs text-muted-foreground">{config.brand.subtitle}</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Back to Admin / Custom link */}
        {config.backTo && (
          <div className="px-4 pt-4 pb-2">
            <Link
              to={config.backTo.to}
              onClick={onClose}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md hover:bg-accent"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {config.backTo.label}
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-4 overflow-y-auto">
          {config.groups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {group.label && (
                <p className="text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase px-3 py-1">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin" && pathname.startsWith(item.href + "/"))

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="truncate block">{item.title}</span>
                        {item.description && (
                          <span
                            className={cn(
                              "text-[10px] block truncate font-normal",
                              isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                            )}
                          >
                            {item.description}
                          </span>
                        )}
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={cn(
                            "text-xs px-1.5 py-0.5 rounded-full font-semibold",
                            isActive
                              ? "bg-primary-foreground/20 text-primary-foreground"
                              : "bg-primary/10 text-primary"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Optional Footer Slot */}
        {config.footerSlot && (
          <div className="p-4 border-t shrink-0">{config.footerSlot}</div>
        )}
      </aside>
    </>
  )
}
