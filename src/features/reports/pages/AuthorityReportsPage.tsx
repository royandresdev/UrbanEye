import { FiBell, FiChevronDown, FiFlag, FiMapPin, FiShield } from 'react-icons/fi'
import { categoryLabel, statusLabel } from '../reportsUiConstants'
import type { ReportCategory, ReportStatus } from '../reportsTypes'
import { useReportsDashboardState } from '../useReportsDashboardState'

export function AuthorityReportsPage() {
  const {
    isLoading,
    isError,
    filteredReports,
    operationalSummary,
    selectedCategory,
    selectedStatus,
    setSelectedCategory,
    setSelectedStatus,
    setSelectedDistance,
    handleTakeReport,
    handleStartReport,
    handleResolveReport,
  } = useReportsDashboardState()

  const priorityReports = filteredReports.slice(0, 3)

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-base px-4 py-6 text-fg-primary">
      <header className="mb-5 flex items-center justify-between rounded-2xl border border-field-border-secondary bg-brand-950/70 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-field-bg-primary text-accent-500">
            <FiShield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-4xl font-semibold leading-tight">Panel de Gestión</h1>
            <p className="text-sm text-fg-secondary">Portal de Autoridades v2.4</p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-field-bg-secondary text-fg-secondary"
          aria-label="Notificaciones"
        >
          <FiBell className="h-5 w-5" />
        </button>
      </header>

      <section className="mb-4 grid grid-cols-3 gap-3">
        <StatCard label="Pendientes" value={operationalSummary.pending} />
        <StatCard label="En Proceso" value={operationalSummary.inProgress} />
        <StatCard label="Resueltos" value={operationalSummary.resolved} />
      </section>

      <section className="mb-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setSelectedCategory('all')
            setSelectedStatus('all')
            setSelectedDistance('all')
          }}
          className="rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-brand-950"
        >
          Todos los Reportes
        </button>

        <label className="relative">
          <select
            value={selectedCategory}
            onChange={(event) => {
              setSelectedCategory(event.target.value as 'all' | ReportCategory)
            }}
            className="appearance-none rounded-full border border-field-border-secondary bg-field-bg-secondary py-2 pl-4 pr-8 text-sm text-fg-primary"
            aria-label="Filtrar por categoría"
          >
            <option value="all">Categoría</option>
            {Object.entries(categoryLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-secondary" />
        </label>

        <label className="relative">
          <select
            value={selectedStatus}
            onChange={(event) => {
              setSelectedStatus(event.target.value as 'all' | ReportStatus)
            }}
            className="appearance-none rounded-full border border-field-border-secondary bg-field-bg-secondary py-2 pl-4 pr-8 text-sm text-fg-primary"
            aria-label="Filtrar por estado"
          >
            <option value="all">Estado</option>
            {Object.entries(statusLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-secondary" />
        </label>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-5xl font-semibold">Alta Prioridad</h2>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent-500">Por "Me Afecta"</p>
        </div>

        {isLoading ? <p className="text-sm text-fg-secondary">Cargando reportes...</p> : null}
        {isError ? <p className="text-sm text-error">No fue posible cargar los reportes.</p> : null}

        {!isLoading && !isError ? (
          <ul className="space-y-3">
            {priorityReports.map((report) => {
              const isPending = report.status === 'nuevo' || report.status === 'en_revision'

              return (
                <li key={report.id} className="rounded-2xl border border-field-border-secondary bg-field-bg-secondary p-3">
                  <div className="mb-3 flex items-start gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-900 text-accent-500">
                      <FiShield className="h-6 w-6" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <h3 className="line-clamp-2 text-lg font-semibold text-fg-primary">{report.description}</h3>
                        <PriorityBadge votes={report.votes} />
                      </div>

                      <p className="mb-1 flex items-center gap-1 text-sm text-fg-secondary">
                        <FiMapPin className="h-3.5 w-3.5" />
                        {report.address}
                      </p>

                      <p className="flex items-center gap-1 text-sm font-semibold text-accent-500">
                        <FiFlag className="h-4 w-4" />
                        {report.votes} "Me afecta"
                      </p>
                    </div>
                  </div>

                  <div className="mb-3 h-px bg-field-border-secondary" />

                  <div className="flex items-center justify-between gap-2">
                    <p className="inline-flex items-center gap-2 text-sm font-medium uppercase text-fg-secondary">
                      <span className={`h-2.5 w-2.5 rounded-full ${statusDotClass(report.status)}`} />
                      {statusLabel[report.status]}
                    </p>

                    {isPending ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (report.status === 'nuevo') {
                            handleTakeReport(report)
                            return
                          }

                          handleStartReport(report)
                        }}
                        className="rounded-xl bg-accent-500 px-4 py-2 text-sm font-semibold text-brand-950"
                      >
                        Cambiar Estado
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (report.status === 'en_proceso') {
                            handleResolveReport(report)
                          }
                        }}
                        className="rounded-xl border border-field-border-secondary bg-field-bg-primary px-4 py-2 text-sm font-semibold text-fg-primary"
                      >
                        Ver Detalles
                      </button>
                    )}
                  </div>

                  <div className="sr-only">
                    <button type="button" onClick={() => handleTakeReport(report)}>
                      Tomar
                    </button>
                    <button type="button" onClick={() => handleStartReport(report)}>
                      Iniciar
                    </button>
                    <button type="button" onClick={() => handleResolveReport(report)}>
                      Resolver
                    </button>
                  </div>
                </li>
              )
            })}

            {priorityReports.length === 0 ? (
              <li className="rounded-2xl border border-field-border-secondary bg-field-bg-secondary p-4 text-sm text-fg-secondary">
                No hay reportes que coincidan con los filtros seleccionados.
              </li>
            ) : null}
          </ul>
        ) : null}
      </section>
    </main>
  )
}

type StatCardProps = {
  label: string
  value: number
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-field-border-secondary bg-field-bg-secondary p-3">
      <p className="text-sm text-fg-secondary">{label}</p>
      <p className="mt-1 text-5xl font-semibold text-fg-primary">{value}</p>
    </article>
  )
}

type PriorityBadgeProps = {
  votes: number
}

function PriorityBadge({ votes }: PriorityBadgeProps) {
  if (votes >= 100) {
    return <span className="rounded-lg bg-error/20 px-2 py-1 text-xs font-semibold uppercase text-error">Crítico</span>
  }

  if (votes >= 60) {
    return <span className="rounded-lg bg-warning/20 px-2 py-1 text-xs font-semibold uppercase text-warning">Alta</span>
  }

  return <span className="rounded-lg bg-field-bg-primary px-2 py-1 text-xs font-semibold uppercase text-fg-secondary">Media</span>
}

function statusDotClass(status: ReportStatus) {
  if (status === 'resuelto') {
    return 'bg-success'
  }

  if (status === 'en_proceso') {
    return 'bg-accent-500'
  }

  return 'bg-warning'
}
