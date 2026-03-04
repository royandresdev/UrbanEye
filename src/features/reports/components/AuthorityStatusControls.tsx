import type { ReportItem, ReportStatus } from '../reportsTypes'

type AuthorityStatusControlsProps = {
  report: ReportItem
  statusLabel: Record<ReportStatus, string>
  isUpdatePendingForReport: boolean
  onStatusChange: (report: ReportItem, status: ReportStatus) => void
  onTake: (report: ReportItem) => void
  onStart: (report: ReportItem) => void
  onResolve: (report: ReportItem) => void
}

export function AuthorityStatusControls({
  report,
  statusLabel,
  isUpdatePendingForReport,
  onStatusChange,
  onTake,
  onStart,
  onResolve,
}: AuthorityStatusControlsProps) {
  return (
    <div className="mt-3">
      <label className="text-xs text-slate-600">
        Estado
        <select
          value={report.status}
          onChange={(event) => {
            onStatusChange(report, event.target.value as ReportStatus)
          }}
          disabled={isUpdatePendingForReport}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none disabled:opacity-60"
        >
          {Object.entries(statusLabel).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            onTake(report)
          }}
          disabled={report.status === 'en_revision' || isUpdatePendingForReport}
          className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 disabled:opacity-50"
        >
          Tomar
        </button>
        <button
          type="button"
          onClick={() => {
            onStart(report)
          }}
          disabled={report.status === 'en_proceso' || isUpdatePendingForReport}
          className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 disabled:opacity-50"
        >
          Iniciar
        </button>
        <button
          type="button"
          onClick={() => {
            onResolve(report)
          }}
          disabled={report.status === 'resuelto' || isUpdatePendingForReport}
          className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 disabled:opacity-50"
        >
          Resolver
        </button>
      </div>
    </div>
  )
}
