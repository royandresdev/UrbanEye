import type { ReportItem } from '../reportsTypes'

type VoteControlProps = {
  report: ReportItem
  isPendingForReport: boolean
  onVote: (report: ReportItem) => void
}

export function VoteControl({ report, isPendingForReport, onVote }: VoteControlProps) {
  return (
    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
      <span>{report.address}</span>
      <div className="flex items-center gap-2">
        <span>{report.votes} votos</span>
        <button
          type="button"
          onClick={() => {
            onVote(report)
          }}
          disabled={Boolean(report.hasUserVoted) || isPendingForReport}
          className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 disabled:opacity-60"
        >
          Me afecta +1
        </button>
      </div>
    </div>
  )
}
