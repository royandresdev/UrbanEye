import type { ReportItem } from '../reportsTypes'

type VoteControlProps = {
  report: ReportItem
  isPendingForReport: boolean
  onVote: (report: ReportItem) => void
}

export function VoteControl({ report, isPendingForReport, onVote }: VoteControlProps) {
  const isDisabled = Boolean(report.hasUserVoted) || isPendingForReport

  return (
    <div className="mt-3 border-t border-field-border-secondary pt-3">
      <button
        type="button"
        onClick={() => {
          onVote(report)
        }}
        disabled={isDisabled}
        aria-label="Me afecta +1"
        className="rounded-full border border-field-border-primary bg-field-bg-primary px-3 py-1 text-sm font-semibold text-accent-500 disabled:opacity-60"
      >
        {isDisabled ? `Me afecta (${report.votes})` : `Me afecta (${report.votes})`}
      </button>
    </div>
  )
}
