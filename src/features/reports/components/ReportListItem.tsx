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
