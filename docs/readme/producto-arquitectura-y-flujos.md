# Producto, arquitectura y flujos

[← Volver al README principal](../../README.md)

Este documento reúne la visión funcional del producto, su arquitectura base y los flujos operativos.

## Contenido
- [Visión del proyecto](#visión-del-proyecto)
- [Enfoque de desarrollo](#enfoque-de-desarrollo)
- [Alcance MVP (primera versión)](#alcance-mvp-primera-versión)
- [Capacidades técnicas clave del producto](#capacidades-técnicas-clave-del-producto)
- [Arquitectura inicial sugerida](#arquitectura-inicial-sugerida)
- [Estructura de carpetas recomendada (frontend)](#estructura-de-carpetas-recomendada-frontend)
- [Flujo de la aplicación](#flujo-de-la-aplicación)

## Visión del proyecto

UrbanEye busca mejorar la comunicación entre residentes y autoridades locales mediante:
- Reportes geolocalizados con evidencia visual.
- Priorización comunitaria de incidencias.
- Seguimiento del estado de cada intervención.

---

## Enfoque de desarrollo

- **Frontend:** React + TypeScript
- **Estrategia UX:** Mobile first (pantallas pequeñas como base y escalado progresivo a tablet/desktop)
- **Desarrollo incremental:** MVP primero, luego mejoras por fases

---

## Alcance MVP (primera versión)

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

## Capacidades técnicas clave del producto

- Captura/subida de imágenes de incidencias.
- Geolocalización por GPS del dispositivo.
- Selección y visualización de puntos en mapa.
- Feed/listado de reportes cercanos.
- Priorización por interacción ciudadana.
- Estados de seguimiento por parte de autoridades/moderadores.
- Notificaciones (fase posterior: push/web push/email).

---

## Arquitectura inicial sugerida

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

## Estructura de carpetas recomendada (frontend)

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

## Flujo de la aplicación

### Flujo principal (end-to-end)

1. El usuario entra a la app y se autentica (registro o inicio de sesión).
2. Crea un reporte con categoría, descripción, foto y ubicación.
3. El reporte se publica con estado inicial `nuevo` y aparece en lista/mapa.
4. La comunidad puede votar (`Me afecta +1`) para aumentar prioridad.
5. Una autoridad toma el reporte y lo mueve por el flujo operativo.
6. El reporte finaliza en `resuelto` y queda visible como histórico.

### Flujo ciudadano

1. **Acceso**: iniciar sesión o registrarse.
2. **Crear reporte**: completar formulario, adjuntar foto y ubicación.
3. **Seguimiento**: consultar estado actual en lista y mapa.
4. **Priorizar**: votar reportes que le afectan (1 voto por usuario por reporte).
5. **Notificaciones**: recibir confirmaciones y mensajes de éxito/error en acciones clave.

### Flujo autoridad

1. **Acceso**: iniciar sesión con rol `autoridad`.
2. **Monitoreo**: revisar panel operativo (pendientes, en proceso, resueltos, alta prioridad).
3. **Gestión**: actualizar estado del reporte según avance operativo.
4. **Cierre**: marcar como `resuelto` cuando la incidencia fue atendida.

### Ciclo de estados del reporte

- `nuevo` → `en_revision` → `en_proceso` → `resuelto`

Reglas funcionales:
- Solo autoridad puede cambiar estado.
- Ciudadano puede crear y votar, pero no cambiar estado.
- Si un usuario ya votó un reporte, el botón de voto se desactiva.

### Reglas de interfaz y navegación

- Navegación principal: Inicio → Auth → Crear reporte / Ver reportes.
- La interfaz oculta acciones operativas cuando el rol es `ciudadano`.
- En cambio de sesión (ej. autoridad → ciudadano), la UI se re-renderiza y actualiza permisos visibles.
