import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ReportCategory, ReportItem, ReportStatus } from '../reportsTypes'
import { VoteControl } from './VoteControl'

type ReportListItemProps = {
  report: ReportItem
  isAuthority: boolean
  categoryLabel: Record<ReportCategory, string>
  statusLabel: Record<ReportStatus, string>
  statusBadgeClass: Record<ReportStatus, string>
  isUpdatePendingForReport: boolean
  isVotePendingForReport: boolean
  onStatusChange: (report: ReportItem, status: ReportStatus) => void
  onTake: (report: ReportItem) => void
  onStart: (report: ReportItem) => void
  onResolve: (report: ReportItem) => void
  onVote: (report: ReportItem) => void
}

export function ReportListItem({
  report,
  isAuthority,
  categoryLabel,
  statusLabel,
  statusBadgeClass,
  isUpdatePendingForReport,
  isVotePendingForReport,
  onStatusChange,
  onTake,
  onStart,
  onResolve,
  onVote,
}: ReportListItemProps) {
  return (
    <li key={report.id} className="rounded-lg border border-slate-200 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-slate-900">{categoryLabel[report.category]}</span>
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusBadgeClass[report.status]}`}>
          {statusLabel[report.status]}
        </span>
      </div>
      <p className="text-sm text-slate-700">{report.description}</p>
      {isAuthority ? (
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
      ) : null}

      <VoteControl
        report={report}
        isPendingForReport={isVotePendingForReport}
        onVote={onVote}
      />

      <p className="mt-1 text-xs text-slate-500">
        {formatDistanceToNow(new Date(report.createdAt), {
          addSuffix: true,
          locale: es,
        })}
      </p>
    </li>
  )
}
