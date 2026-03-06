# Roadmap, testing y calidad

[← Volver al README principal](../../README.md)

Este documento agrupa el avance por fases, la estrategia de pruebas y los criterios de calidad del proyecto.

## Contenido
- [Roadmap por fases](#roadmap-por-fases)
- [Estrategia de pruebas (Fase 5 · Paso 1)](#estrategia-de-pruebas-fase-5--paso-1)
- [Comandos y criterios de calidad (Fase 5 · Paso 6)](#comandos-y-criterios-de-calidad-fase-5--paso-6)
- [Criterios de calidad](#criterios-de-calidad)

## Roadmap por fases

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

### Fase 5 — Testing y Coverage ✅ COMPLETADA
- Definir estrategia de pruebas (unitarias, integración y UI crítica).
- Implementar tests para módulos clave: auth, reportes, votación y cambios de estado.
- Configurar reporte de coverage con Vitest.
- Establecer umbrales mínimos de cobertura (líneas, funciones, ramas y statements).
- Integrar pruebas y coverage en flujo de CI/CD. (`.github/workflows/ci.yml`)
- Documentar comandos y criterios de calidad de pruebas en el README.

### Fase 6 — Limpieza de interfaz ✅ COMPLETADA
- Consolidar la interfaz final para uso ciudadano y de autoridades con enfoque mobile first.
- Eliminar trazas de debug visibles en UI (`console` expuesto, placeholders técnicos, etiquetas temporales).
- Retirar comentarios de apoyo visual incrustados en componentes (textos tipo “TODO”, “debug”, “test”).
- Homogeneizar textos finales de botones, estados y mensajes para experiencia de producto.
- Revisar vistas clave (`Auth`, `Reportes`, `Mapa`, `Detalle`) para asegurar acabado de interfaz sin artefactos de desarrollo.

**Criterios de salida Fase 6**
- Ninguna pantalla productiva muestra información de depuración.
- No existen mensajes/comentarios temporales visibles para el usuario final.
- La navegación principal y acciones críticas mantienen consistencia visual y textual.
- Se validan manualmente los flujos principales en móvil y desktop.

### Fase 7 — Implementación UI según Figma 🚧 EN PROGRESO
**Paso 1 — Extraer Design Tokens de Figma**
- Definir paleta (primario, secundarios, fondo, texto, éxito, warning, error).
- Definir tipografías, tamaños, pesos, radios, bordes, sombras y espaciados.
- Documentar tokens en una tabla base antes de tocar componentes.
- Referencia de implementación actual: la configuración de colores/tokens está en `src/index.css` dentro de `:root`.

**Paso 2 — Configurar colores/tokens en Tailwind**
- Como el proyecto usa `@import 'tailwindcss'` en `src/index.css` (sin `tailwind.config`), declarar tokens CSS en `:root` (por ejemplo `--color-primary`, `--color-bg`, etc.) y usarlos con utilidades arbitrarias (`bg-[var(--color-primary)]`, `text-[var(--color-text)]`).
- Si luego se agrega `tailwind.config`, mapear la misma paleta en `theme.extend.colors` para usar clases semánticas (`bg-brand-primary`, `text-brand-muted`).
- Evitar colores hardcodeados nuevos fuera del sistema de tokens.

**Paso 3 — Base global de UI**
- Ajustar `src/index.css` con variables globales, tipografía base y color de fondo principal.
- Unificar estilos de foco (`focus-visible`), estados disabled y contraste mínimo.

**Paso 4 — Implementar Auth según Figma**
- Replicar layout mobile (hero, título, formulario, CTA principal y enlaces secundarios).
- Mantener reglas funcionales de sesión (login, registro, logout y estado de sesión activa).
- Validar que `/` muestre autenticación cuando no existe sesión.

**Paso 5 — Aplicar diseño a Reportes (lista/mapa/detalle)**
- Migrar tarjetas, filtros, badges de estado y botones al nuevo sistema visual.
- Mantener restricciones por rol (`ciudadano` vs `autoridad`) sin cambios de lógica.

**Paso 6 — Estados de UI consistentes**
- Normalizar vistas de `loading`, `empty`, `error` y `success` en pantallas principales.
- Alinear notificaciones y mensajes de feedback al tono visual de Figma.

**Paso 7 — QA visual y regresión funcional**
- Checklist visual por pantalla contra Figma (spacing, color, tipografía, jerarquía).
- Pruebas mínimas: `npm run test -- src/features/auth/AuthPage.test.tsx` y `npm run test -- src/features/reports/ReportsOverviewPage.test.tsx`.
- Validación responsive en móvil y desktop antes de marcar cierre de fase.

**Criterios de salida Fase 7**
- Pantallas principales alineadas visualmente con Figma.
- Estados de UI (vacío, carga, error, éxito) con estilo consistente.
- Navegación y acciones críticas conservan usabilidad y accesibilidad básica.
- No hay regresiones funcionales en pruebas de auth y reportes.

## Estrategia de pruebas (Fase 5 · Paso 1)

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

## Comandos y criterios de calidad (Fase 5 · Paso 6)

**Comandos de pruebas**
- `npm run test`: ejecuta toda la suite de pruebas con Vitest.
- `npm run test:watch`: ejecuta pruebas en modo watch durante desarrollo.
- `npm run test:coverage`: ejecuta pruebas con coverage y genera reportes en `coverage/`.
- `npm run lint`: validación estática obligatoria previa a PR.

**Reportes de coverage**
- Consola: resumen de `% Stmts`, `% Branch`, `% Funcs`, `% Lines`.
- HTML: abrir `coverage/index.html` para revisar cobertura por archivo.

**Umbrales mínimos definidos (Vitest)**
- `lines >= 60`
- `functions >= 60`
- `statements >= 60`
- `branches >= 50`

**Criterios de calidad para PR/CI**
- El pipeline de CI debe pasar en `.github/workflows/ci.yml`.
- No se aceptan PR con `lint` o `test` fallando.
- Si `test:coverage` falla por umbral o tests rojos, se corrige antes de merge.
- Los tests críticos de auth/reportes deben incluir caso feliz y caso de error.

---

## Criterios de calidad

- Diseño **mobile first** real (no adaptado al final).
- Accesibilidad básica (contraste, labels, foco, navegación táctil).
- Tiempos de carga optimizados para red móvil.
- Validaciones en cliente y servidor.
- Manejo de errores y estados vacíos.
