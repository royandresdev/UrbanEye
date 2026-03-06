# UrbanEye

Aplicación ciudadana para reportar en tiempo real problemas urbanos (baches, luminarias apagadas, basura acumulada, vandalismo, etc.) con foto, ubicación y comentarios, priorizando una experiencia **mobile first**.

<img width="1747" height="1041" alt="Vistas UrbanEye" src="https://github.com/user-attachments/assets/a5d40df7-3434-491f-aab3-546e256a7e75" />

Capacidades principales:
- Autenticación de usuarios y manejo por rol (`ciudadano` / `autoridad`).
- Creación de reportes con categoría, descripción, imagen y coordenadas en mapa.
- Visualización y seguimiento de reportes en lista/mapa.
- Priorización comunitaria mediante votos.
- Flujo de estados operativo: `nuevo` → `en_revision` → `en_proceso` → `resuelto`.

---

## Requisitos

- Node.js 20+
- npm 10+
- Proyecto de Supabase con Auth, DB y Storage

---

## Instalación

1. Clonar el repositorio.
2. Instalar dependencias:

```bash
npm install
```

3. Crear archivo de entorno local:

```bash
cp .env.example .env.local
```

En Windows PowerShell, puedes usar:

```powershell
Copy-Item .env.example .env.local
```

---

## Variables de entorno

Completa `.env.local` con:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

Notas:
- `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` son obligatorias.
- `VITE_MAP_TILE_URL` define el proveedor de tiles del mapa.

---

## Ejecución local

Iniciar modo desarrollo:

```bash
npm run dev
```

Build de producción:

```bash
npm run build
```

Previsualizar build:

```bash
npm run preview
```

---

## Scripts útiles

- `npm run dev` → servidor de desarrollo.
- `npm run build` → build de producción.
- `npm run preview` → preview local del build.
- `npm run lint` → validación estática.
- `npm run test` → ejecución de tests.
- `npm run test:watch` → tests en modo watch.
- `npm run test:coverage` → tests + cobertura.
- `npm run format` → formateo de código.
- `npm run format:check` → validar formato.

---

## Stack

- Frontend: React + TypeScript + Vite
- Routing: React Router
- Estado servidor/cache: TanStack Query
- Formularios: React Hook Form + Zod
- Mapas: Leaflet + React-Leaflet
- Backend/BaaS: Supabase
- Estilos: Tailwind CSS
- Testing: Vitest + Testing Library

---

## Estructura principal

```bash
src/
	app/
	features/
		auth/
		reports/
		map/
		profile/
	shared/
```

---

## Documentación detallada

Para el detalle completo por tema:

1. [Producto, arquitectura y flujos](docs/readme/producto-arquitectura-y-flujos.md)
2. [Tecnologías y paquetes](docs/readme/tecnologias-y-paquetes.md)
3. [Entorno, setup y roles](docs/readme/entorno-setup-y-roles.md)
4. [Roadmap, testing y calidad](docs/readme/roadmap-testing-y-calidad.md)
