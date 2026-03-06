## Tecnologías y paquetes

### 4) Stack técnico recomendado

#### Frontend
- **React 18+**
- **TypeScript**
- **Vite** (build rápido y simple para SPA)
- **React Router DOM** (navegación)
- **Tailwind CSS** (estilos rápidos y enfoque mobile first)
- **React Hook Form + Zod** (formularios y validación)
- **TanStack Query (React Query)** (manejo de estado servidor/cache)
- **Axios** o `fetch` (consumo API)
- **Leaflet + React-Leaflet** (mapa)

#### Backend (opciones sugeridas)
- **Opción A (rápida): Supabase**
  - Auth, PostgreSQL, Storage para imágenes, Realtime.
- **Opción B (control total): Node.js + Express/Nest + PostgreSQL**
  - + almacenamiento de imágenes en Cloudinary/S3.

> Para arrancar rápido y validar el MVP, se recomienda **Supabase**.

---

### 5) Paquetes de terceros (frontend)

#### Base
- `react`
- `react-dom`
- `typescript`
- `vite`
- `@vitejs/plugin-react`

#### Navegación y estado
- `react-router-dom`
- `@tanstack/react-query`

#### Formularios y validación
- `react-hook-form`
- `zod`
- `@hookform/resolvers`

#### Mapa y geolocalización
- `leaflet`
- `react-leaflet`

#### UI y utilidades
- `tailwindcss`
- `postcss`
- `autoprefixer`
- `clsx`
- `date-fns`

#### Backend as a Service (si usamos Supabase)
- `@supabase/supabase-js`

#### Calidad de código
- `eslint`
- `@typescript-eslint/eslint-plugin`
- `@typescript-eslint/parser`
- `prettier`
- `eslint-config-prettier`
- `eslint-plugin-react-hooks`

#### Testing
- `vitest`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `@testing-library/user-event`
- `jsdom`
