# Entorno, setup y roles

[← Volver al README principal](../../README.md)

Este documento concentra requisitos de ejecución, configuración de Supabase y responsabilidades por rol.

## Contenido
- [Entorno, setup y roles](#entorno-setup-y-roles)
  - [Contenido](#contenido)
  - [Requisitos de entorno](#requisitos-de-entorno)
  - [Setup inicial Supabase](#setup-inicial-supabase)
  - [Requisitos para imágenes](#requisitos-para-imágenes)
  - [Funciones por rol](#funciones-por-rol)

## Requisitos de entorno

- **Node.js**: 20 LTS o superior
- **npm**: 10+ (o pnpm/yarn)
- **Git**
- Cuenta en **Supabase** (si elegimos opción BaaS)

Variables de entorno esperadas (ejemplo):

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

## Setup inicial Supabase

1. Copiar `.env.example` a `.env.local`.
2. Completar `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` desde tu proyecto Supabase.
3. El cliente queda disponible en `src/shared/lib/supabase.ts`.
4. El helper `src/shared/lib/env.ts` valida que las variables requeridas existan.

## Requisitos para imágenes

- Bucket de Storage: `report-images`.
- Tabla recomendada: `report_images` con columnas mínimas:
  - `report_id` (uuid),
  - `user_id` (uuid, opcional),
  - `storage_path` (text),
  - `public_url` (text),
  - `created_at` (timestamptz default now()).

## Funciones por rol

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
