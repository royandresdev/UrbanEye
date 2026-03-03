type OperationalSummary = {
  pending: number
  inProgress: number
  resolved: number
  highPriority: number
}

type OperationalSummaryPanelProps = {
  summary: OperationalSummary
  onViewNew: () => void
  onViewInReview: () => void
  onClearFilters: () => void
}

export function OperationalSummaryPanel({
  summary,
  onViewNew,
  onViewInReview,
  onClearFilters,
}: OperationalSummaryPanelProps) {
  return (
    <section className="mb-4 rounded-xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-base font-medium text-slate-900">Panel operativo</h2>
      <div className="grid grid-cols-2 gap-2">
        <article className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500">Pendientes</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{summary.pending}</p>
        </article>
        <article className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500">En proceso</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{summary.inProgress}</p>
        </article>
        <article className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500">Resueltos</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{summary.resolved}</p>
        </article>
        <article className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500">Alta prioridad (15+)</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{summary.highPriority}</p>
        </article>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onViewNew}
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700"
        >
          Ver nuevos
        </button>
        <button
          type="button"
          onClick={onViewInReview}
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700"
        >
          Ver en revisión
        </button>
        <button
          type="button"
          onClick={onClearFilters}
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700"
        >
          Limpiar filtros
        </button>
      </div>
    </section>
  )
}
