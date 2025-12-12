// Pages
export { MinistriesPage } from "./pages/ministries-page"
export { MinistryDetailPage } from "./pages/ministry-detail-page"

// Components
export { CreateMinistryDialog } from "./components/create-ministry-dialog"
export { EditMinistryDialog } from "./components/edit-ministry-dialog"
export { MinistriesStats } from "./components/ministries-stats"
export { MinistriesTable } from "./components/ministries-table"
export { AddMemberDialog } from "./components/add-member-dialog"
export { MemberSelector } from "./components/member-selector"
export { MinistryMembersTable } from "./components/ministry-members-table"

// Hooks
export { useMinistries } from "./hooks/use-ministries"
export { useMinistryMembers } from "./hooks/use-ministry-members"

// Services
export { ministriesService } from "./services/ministries.service"

// Types
export type {
  Ministry,
  CreateMinistryRequest,
  UpdateMinistryRequest,
  MinistryStats,
  MinistryMember,
  MinistryMemberStats,
  MemberStats,
  MemberMinistry,
  AddMemberToMinistryRequest,
  UpdateMemberRoleRequest,
  MinistryRole,
  MinistryFilters,
  MinistryMemberFilters,
  PaginatedResponse,
  ApiResponse,
} from "./types"
