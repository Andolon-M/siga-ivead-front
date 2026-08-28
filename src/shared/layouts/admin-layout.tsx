import { ModularLayout } from "./modular-layout"
import { adminSidebarConfig } from "./configs/admin-sidebar.config"

export function AdminLayout() {
  return <ModularLayout config={adminSidebarConfig} />
}


