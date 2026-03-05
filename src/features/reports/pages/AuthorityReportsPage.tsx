import { Link } from 'react-router-dom'
import { CriticalZonesPanel } from '../components/CriticalZonesPanel'
import { OperationalSummaryPanel } from '../components/OperationalSummaryPanel'
import { ReportsHeader } from '../components/ReportsHeader'
import { ReportsList } from '../components/ReportsList'
import { ReportsMapPanel } from '../components/ReportsMapPanel'
import { categoryLabel, distanceLabel, statusLabel, statusMarkerColor } from '../reportsUiConstants'
import type { ReportCategory, ReportStatus } from '../reportsTypes'
import type { DistanceFilter } from '../reportsViewUtils'
import { useReportsDashboardState } from '../useReportsDashboardState'

export function AuthorityReportsPage() {
  const {
    isLoading,
    isError,
    filteredReports,
    operationalSummary,
    criticalZones,
    center,
    selectedCategory,
    selectedStatus,
    selectedDistance,
    userLocation,
    locationError,
    setSelectedCategory,
    setSelectedStatus,
    setSelectedDistance,
    onUseCurrentLocation,
    handleStatusChange,
    handleTakeReport,
    handleStartReport,
    handleResolveReport,
    handleVoteReport,
    isUpdatePendingForReport,
    isVotePendingForReport,
  } = useReportsDashboardState()

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 py-6">
      <ReportsHeader />

      <OperationalSummaryPanel
        summary={operationalSummary}
        onViewNew={() => {
          setSelectedStatus('nuevo')
          setSelectedDistance('all')
        }}
        onViewInReview={() => {
          setSelectedStatus('en_revision')
          setSelectedDistance('all')
        }}
        onClearFilters={() => {
          setSelectedCategory('all')
          setSelectedStatus('all')
          setSelectedDistance('all')
        }}
      />

      <CriticalZonesPanel criticalZones={criticalZones} categoryLabel={categoryLabel} />

      <section className="mb-4 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-medium text-slate-900">Filtros</h2>
        <div className="space-y-3">
          <label className="block text-xs text-slate-600">
            Categoría
            <select
              value={selectedCategory}
              onChange={(event) => {
                setSelectedCategory(event.target.value as 'all' | ReportCategory)
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            >
              <option value="all">Todas</option>
              {Object.entries(categoryLabel).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs text-slate-600">
            Estado
            <select
              value={selectedStatus}
              onChange={(event) => {
                setSelectedStatus(event.target.value as 'all' | ReportStatus)
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            >
              <option value="all">Todos</option>
              {Object.entries(statusLabel).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs text-slate-600">
            Distancia
            <select
              value={selectedDistance}
              onChange={(event) => {
                setSelectedDistance(event.target.value as DistanceFilter)
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            >
              {(Object.keys(distanceLabel) as DistanceFilter[]).map((distanceValue) => (
                <option key={distanceValue} value={distanceValue}>
                  {distanceLabel[distanceValue]}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={onUseCurrentLocation}
            className="inline-flex rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
          >
            Usar mi ubicación para distancia
          </button>

          {selectedDistance !== 'all' && !userLocation ? (
            <p className="text-xs text-slate-500">Selecciona tu ubicación para aplicar el filtro de distancia.</p>
          ) : null}
          {locationError ? <p className="text-xs text-red-600">{locationError}</p> : null}
        </div>
      </section>

      <ReportsMapPanel
        center={center}
        reports={filteredReports}
        categoryLabel={categoryLabel}
        statusMarkerColor={statusMarkerColor}
      />

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-medium text-slate-900">Lista</h2>

        <ReportsList
          reports={filteredReports}
          isLoading={isLoading}
          isError={isError}
          isAuthority
          emptyMessage="No hay reportes que coincidan con los filtros seleccionados."
          loadingClassName="text-sm text-slate-600"
          errorClassName="text-sm text-red-600"
          emptyClassName="rounded-lg border border-slate-200 p-3 text-sm text-slate-600"
          onStatusChange={handleStatusChange}
          onTake={handleTakeReport}
          onStart={handleStartReport}
          onResolve={handleResolveReport}
          onVote={handleVoteReport}
          isUpdatePendingForReport={isUpdatePendingForReport}
          isVotePendingForReport={isVotePendingForReport}
        />
      </section>

      <p className="mt-4 text-center text-sm text-slate-600">
        <Link to="/" className="font-medium text-slate-900 underline">
          Volver al inicio
        </Link>
      </p>
    </main>
  )
}
