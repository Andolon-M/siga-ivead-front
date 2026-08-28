import { ModularLayout } from "./modular-layout"
import { saraSidebarConfig } from "./configs/sara-sidebar.config"

export function SaraLayout() {
  return <ModularLayout config={saraSidebarConfig} />
}

