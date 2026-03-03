# UrbanEye

Aplicación ciudadana para reportar en tiempo real problemas urbanos (baches, luminarias apagadas, basura acumulada, vandalismo, etc.) con foto, ubicación y comentarios, priorizando una experiencia **mobile first**.

---

## 1) Visión del proyecto

UrbanEye busca mejorar la comunicación entre residentes y autoridades locales mediante:
- Reportes geolocalizados con evidencia visual.
- Priorización comunitaria de incidencias.
- Seguimiento del estado de cada intervención.

---

## 2) Enfoque de desarrollo

- **Frontend:** React + TypeScript
- **Estrategia UX:** Mobile first (pantallas pequeñas como base y escalado progresivo a tablet/desktop)
- **Desarrollo incremental:** MVP primero, luego mejoras por fases

---

## 3) Alcance MVP (primera versión)

1. Registro/inicio de sesión de usuarios.
2. Crear reporte con:
   - categoría (bache, luminaria, basura, vandalismo),
   - descripción,
   - foto,
   - ubicación (GPS o selección en mapa).
3. Vista de reportes en mapa y lista.
4. Votación/priorización comunitaria (por ejemplo, “me afecta” o “importante”).
5. Estado del reporte (nuevo, en revisión, en proceso, resuelto).

---

## 4) Stack técnico recomendado

## Frontend
- **React 18+**
- **TypeScript**
- **Vite** (build rápido y simple para SPA)
- **React Router DOM** (navegación)
- **Tailwind CSS** (estilos rápidos y enfoque mobile first)
- **React Hook Form + Zod** (formularios y validación)
- **TanStack Query (React Query)** (manejo de estado servidor/cache)
- **Axios** o `fetch` (consumo API)
- **Leaflet + React-Leaflet** (mapa)

## Backend (opciones sugeridas)
- **Opción A (rápida): Supabase**
  - Auth, PostgreSQL, Storage para imágenes, Realtime.
- **Opción B (control total): Node.js + Express/Nest + PostgreSQL**
  - + almacenamiento de imágenes en Cloudinary/S3.

> Para arrancar rápido y validar el MVP, se recomienda **Supabase**.

---

## 5) Paquetes de terceros (frontend)

### Base
- `react`
- `react-dom`
- `typescript`
- `vite`
- `@vitejs/plugin-react`

### Navegación y estado
- `react-router-dom`
- `@tanstack/react-query`

### Formularios y validación
- `react-hook-form`
- `zod`
- `@hookform/resolvers`

### Mapa y geolocalización
- `leaflet`
- `react-leaflet`

### UI y utilidades
- `tailwindcss`
- `postcss`
- `autoprefixer`
- `clsx`
- `date-fns`

### Backend as a Service (si usamos Supabase)
- `@supabase/supabase-js`

### Calidad de código
- `eslint`
- `@typescript-eslint/eslint-plugin`
- `@typescript-eslint/parser`
- `prettier`
- `eslint-config-prettier`
- `eslint-plugin-react-hooks`

### Testing
- `vitest`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `@testing-library/user-event`
- `jsdom`

---

## 6) Capacidades técnicas clave del producto

- Captura/subida de imágenes de incidencias.
- Geolocalización por GPS del dispositivo.
- Selección y visualización de puntos en mapa.
- Feed/listado de reportes cercanos.
- Priorización por interacción ciudadana.
- Estados de seguimiento por parte de autoridades/moderadores.
- Notificaciones (fase posterior: push/web push/email).

---

## 7) Arquitectura inicial sugerida

### Frontend (SPA)
- Autenticación
- Módulo de creación de reporte
- Módulo de mapa/listado
- Módulo de detalle y estado del reporte
- Panel básico de administración (fase 2)

### Datos principales
- `users`
- `reports`
- `report_images`
- `report_votes`
- `report_status_history`

---

## 8) Estructura de carpetas recomendada (frontend)

```bash
src/
  app/
    router/
    providers/
  features/
    auth/
    reports/
    map/
    profile/
  shared/
    components/
    hooks/
    lib/
    types/
    utils/
  assets/
  styles/
```

---

## 9) Requisitos de entorno

- **Node.js**: 20 LTS o superior
- **npm**: 10+ (o pnpm/yarn)
- **Git**
- Cuenta en **Supabase** (si elegimos opción BaaS)

Variables de entorno esperadas (ejemplo):

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_MAP_TILE_URL=
```

### Setup inicial Supabase (Fase 4 · Paso 1)

1. Copiar `.env.example` a `.env.local`.
2. Completar `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` desde tu proyecto Supabase.
3. El cliente queda disponible en `src/shared/lib/supabase.ts`.
4. El helper `src/shared/lib/env.ts` valida que las variables requeridas existan.

### Requisitos para imágenes (Fase 4 · Paso 4)

- Bucket de Storage: `report-images`.
- Tabla recomendada: `report_images` con columnas mínimas:
  - `report_id` (uuid),
  - `user_id` (uuid, opcional),
  - `storage_path` (text),
  - `public_url` (text),
  - `created_at` (timestamptz default now()).

### Funciones por rol (Fase 4 · Paso 6)

**Ciudadano**
- Registrarse e iniciar/cerrar sesión.
- Crear reportes.
- Subir imágenes del reporte.
- Votar/priorizar reportes.
- Ver mapa, lista, estados y métricas públicas.

**Autoridad**
- Todo lo de ciudadano.
- Cambiar estado de reportes (`nuevo`, `en_revision`, `en_proceso`, `resuelto`).
- Gestionar flujo operativo de atención.
- Consultar y priorizar zonas críticas para intervención.

---

## 10) Roadmap por fases

### Fase 0 — Base técnica ✅ COMPLETADA
- Inicializar proyecto React + TypeScript + Vite.
- Configurar Tailwind, ESLint, Prettier.
- Definir layout mobile first.

### Fase 1 — MVP funcional ✅ COMPLETADA
- Auth básica.
- Alta de reportes con foto + ubicación.
- Visualización en mapa/listado.
- Estados iniciales del reporte.

### Fase 2 — Comunidad y priorización ✅ COMPLETADA
- Votación/priorización ciudadana.
- Filtros por categoría/estado/distancia.
- Mejora de UX para autoridades.

### Fase 3 — Escalado ✅ COMPLETADA
- Notificaciones.
- Métricas de zonas críticas.
- PWA/offline parcial.

### Fase 4 — Integración Supabase ✅ COMPLETADA
- Configurar proyecto Supabase y variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`).
- Implementar autenticación real (registro, inicio de sesión y cierre de sesión).
- Migrar datos mock de reportes a tablas reales (`reports`, `report_votes`, `report_status_history`).
- Integrar subida de imágenes en Supabase Storage.
- Habilitar sincronización en tiempo real de cambios de estado y votos.
- Definir políticas RLS para seguridad de acceso por rol (ciudadano/autoridad).

### Fase 5 — Testing y Coverage
- Definir estrategia de pruebas (unitarias, integración y UI crítica).
- Implementar tests para módulos clave: auth, reportes, votación y cambios de estado.
- Configurar reporte de coverage con Vitest.
- Establecer umbrales mínimos de cobertura (líneas, funciones, ramas y statements).
- Integrar pruebas y coverage en flujo de CI/CD.
- Documentar comandos y criterios de calidad de pruebas en el README.

### Fase 5 · Paso 1 — Estrategia de pruebas (definición)

**Objetivo inicial**
- Validar flujos críticos del producto antes de ampliar cobertura global.
- Reducir regresiones en autenticación, reportes y priorización comunitaria.

**Pirámide de pruebas**
- **Unitarias (base):** utilidades puras, validaciones de formularios, cálculos (distancia, métricas de zonas).
- **Integración (prioridad):** hooks de reportes/auth con React Query y Supabase (mockeado), mutaciones y estados de carga/error.
- **UI crítica (mínimas):** login/registro, creación de reporte, voto, cambio de estado.

**Cobertura funcional prioritaria**
- Auth: registro, login, logout, manejo de correo no confirmado.
- Reportes: alta, listado, filtros, votación y transición de estados.
- Datos: sincronización de cache y actualización en tiempo real.

**Criterios de salida del Paso 1**
- Estrategia documentada y aceptada.
- Alcance de módulos críticos definido.
- Convención de pruebas acordada (`*.test.ts` / `*.test.tsx`).
- Lista de casos iniciales priorizados para implementación en el Paso 2.

---

## 11) Criterios de calidad

- Diseño **mobile first** real (no adaptado al final).
- Accesibilidad básica (contraste, labels, foco, navegación táctil).
- Tiempos de carga optimizados para red móvil.
- Validaciones en cliente y servidor.
- Manejo de errores y estados vacíos.
