import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CitizenPanelHeader } from '../components/CitizenPanelHeader'
import { CitizenStatsPanel } from '../components/CitizenStatsPanel'
import { ReportsList } from '../components/ReportsList'
import { ReportsMapPanel } from '../components/ReportsMapPanel'
import { UserSidebar } from '../components/UserSidebar'
import { categoryLabel, statusMarkerColor } from '../reportsUiConstants'
import { useReportsDashboardState } from '../useReportsDashboardState'
import { MdAddCircleOutline } from 'react-icons/md'

export function CitizenReportsPage() {
  const [showCitizenMap, setShowCitizenMap] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const {
    isLoading,
    isError,
    center,
    filteredReports,
    citizenRecentReports,
    citizenSummary,
    handleStatusChange,
    handleTakeReport,
    handleStartReport,
    handleResolveReport,
    handleVoteReport,
    isUpdatePendingForReport,
    isVotePendingForReport,
  } = useReportsDashboardState()

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-base px-4 py-4 text-fg-primary">
      <CitizenPanelHeader
        onOpenSidebar={() => {
          setIsSidebarOpen(true)
        }}
      />

      <CitizenStatsPanel
        newReportsCount={citizenSummary.newReports}
        inProgressReportsCount={citizenSummary.inProgressReports}
        resolvedReportsCount={citizenSummary.resolvedReports}
      />

      <Link to="/reports/new" className="text-lg btn-primary mb-6 inline-flex w-full items-center justify-center gap-2">
        <span aria-hidden>
          <MdAddCircleOutline />
        </span>
        Reportar Problema
      </Link>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-fg-primary">Reportes Recientes</h2>
          <button
            type="button"
            onClick={() => {
              setShowCitizenMap((current) => !current)
            }}
            className="font-medium text-accent-500"
          >
            {showCitizenMap ? 'Ocultar mapa' : 'Ver Mapa'}
          </button>
        </div>

        {showCitizenMap ? (
          <ReportsMapPanel
            center={center}
            reports={filteredReports}
            categoryLabel={categoryLabel}
            statusMarkerColor={statusMarkerColor}
          />
        ) : null}

        <ReportsList
          reports={citizenRecentReports}
          isLoading={isLoading}
          isError={isError}
          isAuthority={false}
          emptyMessage="No hay reportes recientes para mostrar."
          loadingClassName="text-sm text-fg-secondary"
          errorClassName="text-sm text-error"
          emptyClassName="rounded-xl border border-field-border-secondary bg-field-bg-secondary p-4 text-sm text-fg-secondary"
          onStatusChange={handleStatusChange}
          onTake={handleTakeReport}
          onStart={handleStartReport}
          onResolve={handleResolveReport}
          onVote={handleVoteReport}
          isUpdatePendingForReport={isUpdatePendingForReport}
          isVotePendingForReport={isVotePendingForReport}
        />
      </section>

      <UserSidebar
        isOpen={isSidebarOpen}
        onClose={() => {
          setIsSidebarOpen(false)
        }}
        roleLabel="Ciudadano"
      />
    </main>
  )
}
