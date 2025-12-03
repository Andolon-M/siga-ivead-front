import { Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from '@/modules/landing/pages/public/landing-page'
import { AdminLayout } from '@/shared/layouts/admin-layout'
import { AdminDashboard } from '@/modules/admin/pages/dashboard'
import { UsersPage } from '@/modules/users/pages'
import { MembersPage } from '@/modules/members/pages'
import { MinistriesPage } from '@/modules/ministries/pages'
import { EventsPage, EventDetailPage } from '@/modules/events/pages'
import { TeamsPage } from '@/modules/admin/pages/teams'
import { ReportsPage } from '@/modules/admin/pages/reports'
import { FilesPage } from '@/modules/admin/pages/files'
import { RolesPage } from '@/modules/admin/pages/roles'
import { SettingsPage } from '@/modules/admin/pages/settings'

export default function AppRouter() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Rutas de Admin con Layout compartido */}
      <Route path="/admin" element={<AdminLayout />}> 
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="ministries" element={<MinistriesPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:id" element={<EventDetailPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="files" element={<FilesPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="settings" element={<SettingsPage />} />
       </Route>

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

