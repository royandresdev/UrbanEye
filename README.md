# UrbanEye

Aplicación ciudadana para reportar en tiempo real problemas urbanos (baches, luminarias apagadas, basura acumulada, vandalismo, etc.) con foto, ubicación y comentarios. El proyecto está diseñado con enfoque mobile first.

## Visión

- Facilitar reportes geolocalizados con evidencia visual.
- Permitir priorización comunitaria de incidencias.
- Mejorar la comunicación entre vecinos y autoridades locales.

## Estado actual

✅ Fase 0 completada:
- React + TypeScript + Vite
- Tailwind CSS v4
- React Router
- TanStack Query
- React Hook Form + Zod
- ESLint + Prettier
- Vitest configurado

## Stack base

- Frontend: React 19 + TypeScript + Vite
- Estilos: Tailwind CSS (mobile first)
- Navegación: React Router DOM
- Estado servidor/cache: TanStack Query
- Formularios/validación: React Hook Form + Zod
- Calidad: ESLint + Prettier
- Testing: Vitest + Testing Library

## Comandos

```bash
npm run dev
npm run lint
npm run test
npm run build
npm run format
```

## Estructura inicial

```bash
src/
  app/
    providers/
    router/
  features/
    home/
  test/
```

## Próximo paso

Fase 1 (MVP): crear el flujo mobile de "Crear reporte" con categoría, descripción, foto y ubicación.
