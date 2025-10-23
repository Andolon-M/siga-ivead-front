# SIGA IVEAD - Sistema de Gestión de Iglesia

Sistema completo de gestión para la Iglesia Vida y Esperanza - Asambleas de Dios (IVEAD).

## 🚀 Características

- **Landing Page Pública**: Información de la iglesia, horarios, ministerios y contacto
- **Panel Administrativo**: Gestión completa de:
  - Usuarios y roles
  - Miembros de la iglesia
  - Ministerios
  - Eventos y registros
  - Equipos de trabajo
  - Reportes financieros
  - Archivos
  - Configuración del sistema

## 🛠️ Tecnologías

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/ui (Radix UI)
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## 📁 Estructura del Proyecto

```
src/
├── modules/
│   ├── landing/          # Módulo del landing público
│   │   └── pages/
│   ├── admin/           # Módulo del panel admin
│   │   └── pages/
│   ├── auth/            # Módulo de autenticación
│   └── dashboard/       # Módulo del dashboard
├── shared/
│   ├── components/      # Componentes compartidos
│   │   ├── ui/         # Componentes UI de shadcn
│   │   └── admin/      # Componentes específicos de admin
│   ├── contexts/       # Contextos de React
│   ├── hooks/          # Custom hooks
│   ├── layouts/        # Layouts compartidos
│   ├── lib/            # Utilidades y helpers
│   ├── router/         # Configuración de rutas
│   └── styles/         # Estilos globales
└── App.tsx
```

## 🎨 Configuración de Tailwind CSS v4

El proyecto utiliza Tailwind CSS v4 con:
- Variables CSS personalizadas para temas
- Soporte para modo oscuro
- Componentes de shadcn/ui
- Animaciones personalizadas

## 🔐 Autenticación

El sistema incluirá autenticación para:
- Acceso al panel administrativo
- Gestión de roles y permisos
- Protección de rutas

## 📱 Responsive Design

El sistema está completamente optimizado para:
- Desktop
- Tablet
- Mobile

## 🌐 Rutas

### Públicas
- `/` - Landing page

### Privadas (Admin)
- `/admin` - Dashboard
- `/admin/users` - Gestión de usuarios
- `/admin/members` - Gestión de miembros
- `/admin/ministries` - Gestión de ministerios
- `/admin/events` - Gestión de eventos
- `/admin/teams` - Gestión de equipos
- `/admin/reports` - Reportes financieros
- `/admin/files` - Gestor de archivos
- `/admin/roles` - Roles y permisos
- `/admin/settings` - Configuración

## 🤝 Contribución

Este es un proyecto privado para la Iglesia Vida y Esperanza.

## 📄 Licencia

Privado - Todos los derechos reservados © 2025 Iglesia Vida y Esperanza
