import { Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from '@/modules/landing/pages/public/landing-page'
import { AdminLayout } from '@/shared/layouts/admin-layout'
import { AdminDashboard } from '@/modules/dashboard/pages/dashboard'
import { UsersPage } from '@/modules/users/pages'
import { MembersPage, MemberDetailPage } from '@/modules/members/pages'
import { MinistriesPage, MinistryDetailPage } from '@/modules/ministries/pages'
import { EventsPage, EventDetailPage } from '@/modules/events/pages'
import { ServicesPage } from '@/modules/services/pages'
import { TeamsPage } from '@/modules/teams/pages'
import { ReportsPage } from '@/modules/reports/pages'
import { FilesPage } from '@/modules/files/pages'
import { RolesPage } from '@/modules/roles/pages'
import { SettingsPage } from '@/modules/settings/pages'
import {
  LoginPage,
  // RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  PrivacyPolicyPage,
} from '@/modules/auth/pages/public'
import { ProtectedRoute } from '@/shared/components/protected-route'
import { GuestRoute } from '@/shared/components/guest-route'

export default function AppRouter() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<LandingPage />} />

      {/* Rutas de Autenticación - Solo para usuarios NO autenticados */}
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      {/* <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} /> */}
      <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
      <Route path="/reset-password/:token" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />

      {/* Política de privacidad - Accesible para todos */}
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

      {/* Rutas de Admin con Layout compartido - Protegidas */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="members/:id" element={<MemberDetailPage />} />
        <Route path="ministries" element={<MinistriesPage />} />
        <Route path="ministries/:id" element={<MinistryDetailPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="services" element={<ServicesPage />} />
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

