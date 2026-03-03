import type { ReportCategory } from '../reportsTypes'

export type ZoneMetrics = {
  zone: string
  totalReports: number
  pendingReports: number
  inProgressReports: number
  resolvedReports: number
  totalVotes: number
  criticalScore: number
  topCategory: ReportCategory
}

type CriticalZonesPanelProps = {
  criticalZones: ZoneMetrics[]
  categoryLabel: Record<ReportCategory, string>
}

export function CriticalZonesPanel({ criticalZones, categoryLabel }: CriticalZonesPanelProps) {
  return (
    <section className="mb-4 rounded-xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-base font-medium text-slate-900">Métricas de zonas críticas</h2>

      {criticalZones.length === 0 ? (
        <p className="text-sm text-slate-600">No hay datos suficientes para calcular métricas.</p>
      ) : (
        <ul className="space-y-3">
          {criticalZones.slice(0, 3).map((zone, index) => (
            <li key={zone.zone} className="rounded-lg border border-slate-200 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-900">
                  #{index + 1} · {zone.zone}
                </p>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                  Score {zone.criticalScore}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                <p>Reportes: {zone.totalReports}</p>
                <p>Votos: {zone.totalVotes}</p>
                <p>Pendientes: {zone.pendingReports}</p>
                <p>En proceso: {zone.inProgressReports}</p>
              </div>

              <p className="mt-2 text-xs text-slate-600">
                Categoría dominante:{' '}
                <span className="font-medium text-slate-800">{categoryLabel[zone.topCategory]}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
