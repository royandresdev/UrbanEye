import type { ReportItem, ReportStatus } from '../reportsTypes'
import { categoryLabel, statusBadgeClass, statusLabel } from '../reportsUiConstants'
import { ReportListItem } from './ReportListItem'

type ReportsListProps = {
  reports: ReportItem[]
  isLoading: boolean
  isError: boolean
  isAuthority: boolean
  emptyMessage: string
  loadingClassName: string
  errorClassName: string
  emptyClassName: string
  onStatusChange: (report: ReportItem, status: ReportStatus) => void
  onTake: (report: ReportItem) => void
  onStart: (report: ReportItem) => void
  onResolve: (report: ReportItem) => void
  onVote: (report: ReportItem) => void
  isUpdatePendingForReport: (reportId: string) => boolean
  isVotePendingForReport: (reportId: string) => boolean
}

export function ReportsList({
  reports,
  isLoading,
  isError,
  isAuthority,
  emptyMessage,
  loadingClassName,
  errorClassName,
  emptyClassName,
  onStatusChange,
  onTake,
  onStart,
  onResolve,
  onVote,
  isUpdatePendingForReport,
  isVotePendingForReport,
}: ReportsListProps) {
  if (isLoading) {
    return <p className={loadingClassName}>Cargando reportes...</p>
  }

  if (isError) {
    return <p className={errorClassName}>No fue posible cargar los reportes.</p>
  }

  return (
    <ul className="space-y-3">
      {reports.map((report) => (
        <ReportListItem
          key={report.id}
          report={report}
          isAuthority={isAuthority}
          categoryLabel={categoryLabel}
          statusLabel={statusLabel}
          statusBadgeClass={statusBadgeClass}
          isUpdatePendingForReport={isUpdatePendingForReport(report.id)}
          isVotePendingForReport={isVotePendingForReport(report.id)}
          onStatusChange={onStatusChange}
          onTake={onTake}
          onStart={onStart}
          onResolve={onResolve}
          onVote={onVote}
        />
      ))}
      {reports.length === 0 ? <li className={emptyClassName}>{emptyMessage}</li> : null}
    </ul>
  )
}
