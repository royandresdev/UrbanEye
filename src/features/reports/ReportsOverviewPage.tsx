import 'leaflet/dist/leaflet.css'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  useCurrentUserRole,
  useReports,
  useReportsRealtime,
  useUpdateReportStatus,
  useVoteReport,
} from './useReports'
import type { ReportCategory, ReportItem, ReportStatus } from './reportsTypes'
import { useNotifications } from '../../shared/notifications/useNotifications'
import { CriticalZonesPanel } from './components/CriticalZonesPanel'
import { CitizenPanelHeader } from './components/CitizenPanelHeader'
import { CitizenStatsPanel } from './components/CitizenStatsPanel'
import { OperationalSummaryPanel } from './components/OperationalSummaryPanel'
import { ReportListItem } from './components/ReportListItem'
import { ReportsHeader } from './components/ReportsHeader'
import { ReportsMapPanel } from './components/ReportsMapPanel'
import {
  categoryLabel,
  distanceLabel,
  statusBadgeClass,
  statusLabel,
  statusMarkerColor,
} from './reportsUiConstants'
import { useReportsViewModel } from './useReportsViewModel'
import type { DistanceFilter } from './reportsViewUtils'

export function ReportsOverviewPage() {
  useReportsRealtime()
  const { data: reports = [], isLoading, isError } = useReports()
  const { data: currentUserRole = 'ciudadano' } = useCurrentUserRole()
  const updateStatusMutation = useUpdateReportStatus()
  const voteReportMutation = useVoteReport()
  const { addNotification } = useNotifications()
  const isAuthority = currentUserRole === 'autoridad'
  const [selectedCategory, setSelectedCategory] = useState<'all' | ReportCategory>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | ReportStatus>('all')
  const [selectedDistance, setSelectedDistance] = useState<DistanceFilter>('all')
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [showCitizenMap, setShowCitizenMap] = useState(false)

  const { filteredReports, operationalSummary, criticalZones, center } = useReportsViewModel({
    reports,
    selectedCategory,
    selectedStatus,
    selectedDistance,
    userLocation,
  })

  const onUseCurrentLocation = () => {
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError('Tu dispositivo no soporta geolocalización')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
        })
      },
      () => {
        setLocationError('No fue posible obtener tu ubicación')
      },
      {
        enableHighAccuracy: true,
        timeout: 12_000,
      },
    )
  }

  const handleStatusChange = (report: ReportItem, selectedStatus: ReportStatus) => {
    updateStatusMutation.mutate(
      {
        reportId: report.id,
        status: selectedStatus,
      },
      {
        onSuccess: () => {
          addNotification({
            title: 'Estado actualizado',
            message: `${categoryLabel[report.category]} ahora está en ${statusLabel[selectedStatus]}.`,
            level: 'success',
          })
        },
        onError: () => {
          addNotification({
            title: 'Error al actualizar',
            message: 'No fue posible actualizar el estado del reporte.',
            level: 'warning',
          })
        },
      },
    )
  }

  const handleTakeReport = (report: ReportItem) => {
    updateStatusMutation.mutate(
      { reportId: report.id, status: 'en_revision' },
      {
        onSuccess: () => {
          addNotification({
            title: 'Reporte tomado',
            message: `${categoryLabel[report.category]} pasó a En revisión.`,
            level: 'info',
          })
        },
      },
    )
  }

  const handleStartReport = (report: ReportItem) => {
    updateStatusMutation.mutate(
      { reportId: report.id, status: 'en_proceso' },
      {
        onSuccess: () => {
          addNotification({
            title: 'Atención iniciada',
            message: `${categoryLabel[report.category]} pasó a En proceso.`,
            level: 'info',
          })
        },
      },
    )
  }

  const handleResolveReport = (report: ReportItem) => {
    updateStatusMutation.mutate(
      { reportId: report.id, status: 'resuelto' },
      {
        onSuccess: () => {
          addNotification({
            title: 'Reporte resuelto',
            message: `${categoryLabel[report.category]} marcado como Resuelto.`,
            level: 'success',
          })
        },
      },
    )
  }

  const handleVoteReport = (report: ReportItem) => {
    voteReportMutation.mutate(
      { reportId: report.id },
      {
        onSuccess: () => {
          addNotification({
            title: 'Prioridad actualizada',
            message: `Se agregó un voto a ${categoryLabel[report.category]}.`,
            level: 'success',
          })
        },
        onError: () => {
          addNotification({
            title: 'Error al votar',
            message: 'No fue posible registrar el voto en este momento.',
            level: 'warning',
          })
        },
      },
    )
  }

  const newReportsCount = reports.filter((report) => report.status === 'nuevo').length
  const inProgressReportsCount = reports.filter((report) => report.status === 'en_proceso').length
  const resolvedReportsCount = reports.filter((report) => report.status === 'resuelto').length

  const citizenRecentReports = [...filteredReports].slice(0, 6)

  if (!isAuthority) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-md bg-base px-4 py-4 text-fg-primary">

        <CitizenPanelHeader />

        <CitizenStatsPanel
          newReportsCount={newReportsCount}
          inProgressReportsCount={inProgressReportsCount}
          resolvedReportsCount={resolvedReportsCount}
        />

        <Link to="/reports/new" className="btn-primary mb-6 inline-flex w-full items-center justify-center gap-2">
          <span aria-hidden>⊕</span>
          Reportar Problema
        </Link>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-4xl font-semibold text-fg-primary">Reportes Recientes</h2>
            <button
              type="button"
              onClick={() => {
                setShowCitizenMap((current) => !current)
              }}
              className="text-2xl font-medium text-accent-500"
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

          {isLoading ? <p className="text-sm text-fg-secondary">Cargando reportes...</p> : null}
          {isError ? <p className="text-sm text-error">No fue posible cargar los reportes.</p> : null}

          {!isLoading && !isError ? (
            <ul className="space-y-3">
              {citizenRecentReports.map((report) => (
                <ReportListItem
                  key={report.id}
                  report={report}
                  isAuthority={false}
                  categoryLabel={categoryLabel}
                  statusLabel={statusLabel}
                  statusBadgeClass={statusBadgeClass}
                  isUpdatePendingForReport={false}
                  isVotePendingForReport={
                    voteReportMutation.isPending && voteReportMutation.variables?.reportId === report.id
                  }
                  onStatusChange={handleStatusChange}
                  onTake={handleTakeReport}
                  onStart={handleStartReport}
                  onResolve={handleResolveReport}
                  onVote={handleVoteReport}
                />
              ))}
              {citizenRecentReports.length === 0 ? (
                <li className="rounded-xl border border-field-border-secondary bg-field-bg-secondary p-4 text-sm text-fg-secondary">
                  No hay reportes recientes para mostrar.
                </li>
              ) : null}
            </ul>
          ) : null}
        </section>

        <nav className="mt-8 grid grid-cols-3 border-t border-field-border-secondary pt-3 text-center text-xs text-fg-muted">
          <button type="button" className="font-semibold text-accent-500">
            Inicio
          </button>
          <button type="button">Explorar</button>
          <button type="button">Mis reportes</button>
        </nav>
      </main>
    )
  }

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
            <p className="text-xs text-slate-500">
              Selecciona tu ubicación para aplicar el filtro de distancia.
            </p>
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

        {isLoading ? <p className="text-sm text-slate-600">Cargando reportes...</p> : null}
        {isError ? <p className="text-sm text-red-600">No fue posible cargar los reportes.</p> : null}

        {!isLoading && !isError ? (
          <ul className="space-y-3">
            {filteredReports.map((report) => (
              <ReportListItem
                key={report.id}
                report={report}
                isAuthority={isAuthority}
                categoryLabel={categoryLabel}
                statusLabel={statusLabel}
                statusBadgeClass={statusBadgeClass}
                isUpdatePendingForReport={
                  updateStatusMutation.isPending && updateStatusMutation.variables?.reportId === report.id
                }
                isVotePendingForReport={
                  voteReportMutation.isPending && voteReportMutation.variables?.reportId === report.id
                }
                onStatusChange={handleStatusChange}
                onTake={handleTakeReport}
                onStart={handleStartReport}
                onResolve={handleResolveReport}
                onVote={handleVoteReport}
              />
            ))}
            {filteredReports.length === 0 ? (
              <li className="rounded-lg border border-slate-200 p-3 text-sm text-slate-600">
                No hay reportes que coincidan con los filtros seleccionados.
              </li>
            ) : null}
          </ul>
        ) : null}
      </section>

      <p className="mt-4 text-center text-sm text-slate-600">
        <Link to="/" className="font-medium text-slate-900 underline">
          Volver al inicio
        </Link>
      </p>
    </main>
  )
}
