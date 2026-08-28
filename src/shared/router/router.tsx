import { Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from '@/modules/landing/pages/public/landing-page'
import { AdminLayout } from '@/shared/layouts/admin-layout'
import { SaraLayout } from '@/shared/layouts/sara-layout'
import { SongsLayout } from '@/shared/layouts/songs-layout'
import { AdminDashboard } from '@/modules/dashboard/pages/dashboard'
import { UsersPage } from '@/modules/users/pages'
import { MembersPage, MemberDetailPage } from '@/modules/members/pages'
import { MinistriesPage, MinistryDetailPage } from '@/modules/ministries/pages'
import { EventsPage, EventDetailPage } from '@/modules/events/pages'
import { ServicesPage, SessionDetailPage } from '@/modules/services/pages'
import { TeamsPage } from '@/modules/teams/pages'
import { ReportsPage } from '@/modules/reports/pages'
import { FilesPage } from '@/modules/files/pages'
import { RolesPage } from '@/modules/roles/pages'
import { MassMessagingPage } from '@/modules/mass-messaging/pages'
import { MetaTemplatesPage, MetaTemplateDetailPage } from '@/modules/meta-templates/pages'
import { SaraChatsPage, SaraChatDetailPage, EmptyChatSelection } from '@/modules/sara-chats/pages'
import {
  SongsListPage,
  SongDetailPage,
  CreateSongPage,
  EditSongPage,
  SongVersionTypesPage,
} from '@/modules/songs/pages'
import {
  ActivitySlotsBoardPage,
  MemberVolunteerHistoryPage,
  TaskOccurrencesPage,
  VolunteersActivitiesPage,
  VolunteersTasksPage,
} from '@/modules/volunteers/pages'
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
        <Route
          path="users"
          element={
            <ProtectedRoute requirePermission={{ resource: "users", action: "read" }}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="members"
          element={
            <ProtectedRoute requirePermission={{ resource: "members", action: "read" }}>
              <MembersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="members/:id"
          element={
            <ProtectedRoute requirePermission={{ resource: "members", action: "read" }}>
              <MemberDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="ministries"
          element={
            <ProtectedRoute requirePermission={{ resource: "ministries", action: "read" }}>
              <MinistriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="ministries/:id"
          element={
            <ProtectedRoute requirePermission={{ resource: "ministries", action: "read" }}>
              <MinistryDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="events"
          element={
            <ProtectedRoute requirePermission={{ resource: "events", action: "read" }}>
              <EventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="services"
          element={
            <ProtectedRoute requirePermission={{ resource: "services", action: "read" }}>
              <ServicesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="services/session/:id"
          element={
            <ProtectedRoute requirePermission={{ resource: "services", action: "read" }}>
              <SessionDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="events/:id"
          element={
            <ProtectedRoute requirePermission={{ resource: "events", action: "read" }}>
              <EventDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="teams" element={<TeamsPage />} />
        <Route
          path="reports"
          element={
            <ProtectedRoute requirePermission={{ resource: "reports", action: "read" }}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="files"
          element={
            <ProtectedRoute requirePermission={{ resource: "files", action: "read" }}>
              <FilesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="roles"
          element={
            <ProtectedRoute requirePermission={{ resource: "roles", action: "read" }}>
              <RolesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="volunteers"
          element={
            <ProtectedRoute requirePermission={{ resource: "volunteers", action: "read" }}>
              <VolunteersTasksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="volunteers/occurrences"
          element={
            <ProtectedRoute requirePermission={{ resource: "volunteers", action: "read" }}>
              <TaskOccurrencesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="volunteers/activities"
          element={
            <ProtectedRoute requirePermission={{ resource: "volunteers", action: "read" }}>
              <VolunteersActivitiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="volunteers/activities/:id/slots"
          element={
            <ProtectedRoute requirePermission={{ resource: "volunteers", action: "read" }}>
              <ActivitySlotsBoardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="volunteers/history"
          element={
            <ProtectedRoute requirePermission={{ resource: "volunteers", action: "read" }}>
              <MemberVolunteerHistoryPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Sub-panel SARA — layout propio con sidebar */}
      <Route
        path="/admin/sara"
        element={
          <ProtectedRoute requirePermission={{ resource: "sara", action: "access" }}>
            <SaraLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="chats" replace />} />
        <Route
          path="chats"
          element={
            <ProtectedRoute requirePermission={{ resource: "sara", action: "read_chats" }}>
              <SaraChatsPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<EmptyChatSelection />} />
          <Route path=":id" element={<SaraChatDetailPage />} />
        </Route>
        <Route
          path="mass-messaging"
          element={
            <ProtectedRoute requirePermission={{ resource: "mass_messaging", action: "read_campaigns" }}>
              <MassMessagingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="meta-templates"
          element={
            <ProtectedRoute requirePermission={{ resource: "meta_templates", action: "read" }}>
              <MetaTemplatesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="meta-templates/:id"
          element={
            <ProtectedRoute requirePermission={{ resource: "meta_templates", action: "read" }}>
              <MetaTemplateDetailPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Sub-panel Cancionero / Canciones — layout modular propio con sidebar */}
      <Route
        path="/admin/songs"
        element={
          <ProtectedRoute requirePermission={{ resource: "songs", action: "read" }}>
            <SongsLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SongsListPage />} />
        <Route
          path="new"
          element={
            <ProtectedRoute requirePermission={{ resource: "songs", action: "create" }}>
              <CreateSongPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="version-types"
          element={
            <ProtectedRoute requirePermission={{ resource: "songs", action: "manage_types" }}>
              <SongVersionTypesPage />
            </ProtectedRoute>
          }
        />
        <Route path=":id" element={<SongDetailPage />} />
        <Route
          path=":id/edit"
          element={
            <ProtectedRoute requirePermission={{ resource: "songs", action: "update" }}>
              <EditSongPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

