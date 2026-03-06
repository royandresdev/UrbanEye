import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ReportCategory, ReportItem, ReportStatus } from '../reportsTypes'
import { AuthorityStatusControls } from './AuthorityStatusControls'
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
  const relativeTime = formatDistanceToNow(new Date(report.createdAt), {
    addSuffix: true,
    locale: es,
  })

  return (
    <li className="rounded-md border border-field-border-secondary bg-field-bg-secondary p-4">
      <div className="flex gap-3">
        <div className="h-20 w-20 shrink-0 rounded-sm border border-field-border-secondary bg-brand-900">
          {report.imageUrl ? (
            <img
              src={report.imageUrl}
              alt={`Imagen del reporte: ${report.description}`}
              className="h-full w-full rounded-sm object-cover"
            />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className={`rounded px-2 py-1 text-[10px] font-bold uppercase ${statusBadgeClass[report.status]}`}>
              {statusLabel[report.status]}
            </span>
            <span className="text-xs text-fg-muted">{relativeTime}</span>
          </div>

          <p className="line-clamp-2 font-semibold text-fg-primary">{report.description}</p>
          <p className="mt-1 line-clamp-1 text-sm text-fg-secondary">{report.address || categoryLabel[report.category]}</p>
        </div>
      </div>

      {isAuthority ? (
        <AuthorityStatusControls
          report={report}
          statusLabel={statusLabel}
          isUpdatePendingForReport={isUpdatePendingForReport}
          onStatusChange={onStatusChange}
          onTake={onTake}
          onStart={onStart}
          onResolve={onResolve}
        />
      ) : null}

      <VoteControl report={report} isPendingForReport={isVotePendingForReport} onVote={onVote} />
    </li>
  )
}
