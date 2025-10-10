# SIGA IVEAD - Frontend

Aplicación frontend desarrollada con React, TypeScript y Vite para el sistema SIGA IVEAD.

## 🚀 Tecnologías

- **React 19.1.1** - Biblioteca de interfaz de usuario
- **TypeScript 5.9.3** - Superset de JavaScript con tipado estático
- **Vite 7.1.7** - Build tool y servidor de desarrollo
- **ESLint** - Linter para mantener calidad del código

## 📁 Estructura del Proyecto

```
siga-ivead-front/
├── public/                    # Archivos públicos estáticos
│   └── vite.svg
├── src/                       # Código fuente de la aplicación
│   ├── modules/               # Módulos de la aplicación
│   │   ├── auth/              # Módulo de autenticación
│   │   │   ├── components/    # Componentes del módulo auth
│   │   │   ├── pages/         # Páginas del módulo
│   │   │   │   ├── private/   # Páginas privadas (requieren auth)
│   │   │   │   └── public/    # Páginas públicas (login, registro)
│   │   │   ├── services/      # Servicios y lógica de negocio
│   │   │   └── types/         # Tipos e interfaces TypeScript
│   │   └── dashboard/         # Módulo del dashboard
│   │       ├── components/    # Componentes del dashboard
│   │       ├── pages/         # Páginas del módulo
│   │       │   ├── private/   # Páginas privadas
│   │       │   └── public/    # Páginas públicas
│   │       ├── services/      # Servicios y lógica de negocio
│   │       └── types/         # Tipos e interfaces TypeScript
│   ├── shared/                # Recursos compartidos
│   │   ├── api/               # Configuración de APIs
│   │   │   ├── axios.config.ts  # Configuración de Axios
│   │   │   └── endpoints.ts     # Definición de endpoints
│   │   ├── components/        # Componentes reutilizables
│   │   ├── contexts/          # Contextos de React
│   │   ├── hooks/             # Custom hooks
│   │   ├── router/            # Configuración de rutas
│   │   └── styles/            # Estilos globales
│   ├── assets/                # Recursos estáticos (imágenes, iconos)
│   ├── App.tsx                # Componente principal
│   ├── App.css                # Estilos del componente App
│   ├── main.tsx               # Punto de entrada de la aplicación
│   └── index.css              # Estilos globales
├── .env.example               # Variables de entorno de ejemplo
├── .gitignore                 # Archivos ignorados por Git
├── eslint.config.js           # Configuración de ESLint
├── index.html                 # HTML principal
├── package.json               # Dependencias y scripts
├── tsconfig.json              # Configuración de TypeScript
├── tsconfig.app.json          # Configuración de TS para la app
├── tsconfig.node.json         # Configuración de TS para Node
└── vite.config.ts             # Configuración de Vite
```

## 📋 Requisitos Previos

- **Node.js** >= 18.x
- **npm** >= 9.x o **yarn** >= 1.22.x

## 🔧 Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/Andolon-M/siga-ivead-front.git
cd siga-ivead-front
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita el archivo .env con tus configuraciones
```

## 🚀 Comandos Disponibles

### Desarrollo

Inicia el servidor de desarrollo con hot-reload:
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`

### Compilación

Compila la aplicación para producción:
```bash
npm run build
```
Los archivos compilados se generarán en la carpeta `dist/`

### Compilación sin emitir archivos

Verifica errores de TypeScript sin generar archivos:
```bash
npm run build:noEmit
```

### Linting

Ejecuta el linter para verificar calidad del código:
```bash
npm run lint
```

### Vista Previa

Previsualiza la aplicación compilada localmente:
```bash
npm run preview
```

## 🏗️ Arquitectura del Proyecto

### Módulos
El proyecto utiliza una arquitectura modular donde cada módulo contiene:
- **components/**: Componentes específicos del módulo
- **pages/**: Páginas públicas y privadas
- **services/**: Lógica de negocio y llamadas a APIs
- **types/**: Definiciones de tipos TypeScript

### Shared
Recursos compartidos entre módulos:
- **api/**: Configuración centralizada de Axios y endpoints
- **components/**: Componentes reutilizables en toda la app
- **contexts/**: Contextos globales de React
- **hooks/**: Custom hooks compartidos
- **router/**: Configuración del enrutamiento
- **styles/**: Estilos globales y temas

## 🔐 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basado en `.env.example`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=SIGA IVEAD
```

## 📝 Convenciones de Código

- Usar TypeScript para todos los archivos
- Seguir las reglas de ESLint configuradas
- Nombrar componentes en PascalCase
- Nombrar archivos de componentes con extensión `.tsx`
- Nombrar hooks personalizados con prefijo `use`
- Mantener la estructura modular del proyecto

## 🤝 Contribución

1. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
2. Realiza tus cambios y haz commit (`git commit -m 'Agrega nueva funcionalidad'`)
3. Sube los cambios (`git push origin feature/nueva-funcionalidad`)
4. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 📧 Contacto

Para más información, contacta al equipo de desarrollo.

---

Desarrollado con ❤️ para IVEAD
