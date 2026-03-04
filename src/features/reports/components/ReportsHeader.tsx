import { NotificationCenter } from '../../../shared/notifications/NotificationCenter'

export function ReportsHeader() {
  return (
    <header className="mb-6">
      <p className="text-sm text-slate-600">Fase 4 · Paso 5</p>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">Reportes urbanos</h1>
        <NotificationCenter />
      </div>
      <p className="mt-2 text-sm text-slate-600">
        Vista operativa con notificaciones y métricas de zonas críticas.
      </p>
    </header>
  )
}
