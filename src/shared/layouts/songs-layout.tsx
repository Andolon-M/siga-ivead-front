import { ModularLayout } from "./modular-layout"
import { songsSidebarConfig } from "./configs/songs-sidebar.config"

export function SongsLayout() {
  return <ModularLayout config={songsSidebarConfig} />
}
