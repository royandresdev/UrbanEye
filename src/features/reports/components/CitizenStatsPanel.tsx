type CitizenStatsPanelProps = {
  newReportsCount: number
  inProgressReportsCount: number
  resolvedReportsCount: number
}

export function CitizenStatsPanel({
  newReportsCount,
  inProgressReportsCount,
  resolvedReportsCount,
}: CitizenStatsPanelProps) {
  return (
    <section className="mb-4 grid grid-cols-3 gap-3">
      <article className="rounded-xl border border-field-border-secondary bg-field-bg-secondary p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-fg-muted">Nuevos</p>
        <p className="mt-2 text-5xl font-bold text-fg-primary">{newReportsCount}</p>
      </article>
      <article className="rounded-xl border border-field-border-secondary bg-field-bg-secondary p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-fg-muted">En proceso</p>
        <p className="mt-2 text-5xl font-bold text-accent-500">{inProgressReportsCount}</p>
      </article>
      <article className="rounded-xl border border-field-border-secondary bg-field-bg-secondary p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-fg-muted">Resueltos</p>
        <p className="mt-2 text-5xl font-bold text-fg-primary">{resolvedReportsCount}</p>
      </article>
    </section>
  )
}
