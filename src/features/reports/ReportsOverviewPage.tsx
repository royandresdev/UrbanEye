import 'leaflet/dist/leaflet.css'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useReports, useReportsRealtime, useUpdateReportStatus, useVoteReport } from './useReports'
import type { ReportCategory, ReportItem, ReportStatus } from './reportsTypes'
import { NotificationCenter } from '../../shared/notifications/NotificationCenter'
import { useNotifications } from '../../shared/notifications/useNotifications'

const categoryLabel: Record<ReportCategory, string> = {
  bache: 'Bache',
  luminaria: 'Luminaria',
  basura: 'Basura',
  vandalismo: 'Vandalismo',
}

const statusLabel: Record<ReportStatus, string> = {
  nuevo: 'Nuevo',
  en_revision: 'En revisión',
  en_proceso: 'En proceso',
  resuelto: 'Resuelto',
}

const statusBadgeClass: Record<ReportStatus, string> = {
  nuevo: 'bg-slate-100 text-slate-700',
  en_revision: 'bg-amber-100 text-amber-800',
  en_proceso: 'bg-blue-100 text-blue-800',
  resuelto: 'bg-emerald-100 text-emerald-800',
}

const statusMarkerColor: Record<ReportStatus, string> = {
  nuevo: '#475569',
  en_revision: '#b45309',
  en_proceso: '#1d4ed8',
  resuelto: '#047857',
}

type ZoneMetrics = {
  zone: string
  totalReports: number
  pendingReports: number
  inProgressReports: number
  resolvedReports: number
  totalVotes: number
  criticalScore: number
  topCategory: ReportCategory
}

type DistanceFilter = 'all' | '1' | '3' | '5'

const distanceLabel: Record<DistanceFilter, string> = {
  all: 'Todas',
  '1': '1 km',
  '3': '3 km',
  '5': '5 km',
}

function getDistanceInKm(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
): number {
  const earthRadiusKm = 6371
  const latDelta = ((to.latitude - from.latitude) * Math.PI) / 180
  const lonDelta = ((to.longitude - from.longitude) * Math.PI) / 180

  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos((from.latitude * Math.PI) / 180) *
    Math.cos((to.latitude * Math.PI) / 180) *
    Math.sin(lonDelta / 2) *
    Math.sin(lonDelta / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadiusKm * c
}

function appliesDistanceFilter(
  report: ReportItem,
  userLocation: { latitude: number; longitude: number } | null,
  distanceFilter: DistanceFilter,
): boolean {
  if (distanceFilter === 'all') {
    return true
  }

  if (!userLocation) {
    return true
  }

  const distanceKm = Number(distanceFilter)
  const reportDistance = getDistanceInKm(userLocation, {
    latitude: report.latitude,
    longitude: report.longitude,
  })

  return reportDistance <= distanceKm
}

export function ReportsOverviewPage() {
  useReportsRealtime()
  const { data: reports = [], isLoading, isError } = useReports()
  const updateStatusMutation = useUpdateReportStatus()
  const voteReportMutation = useVoteReport()
  const { addNotification } = useNotifications()
  const [selectedCategory, setSelectedCategory] = useState<'all' | ReportCategory>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | ReportStatus>('all')
  const [selectedDistance, setSelectedDistance] = useState<DistanceFilter>('all')
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  const prioritizedReports = useMemo(
    () =>
      [...reports].sort((firstReport, secondReport) => {
        if (secondReport.votes !== firstReport.votes) {
          return secondReport.votes - firstReport.votes
        }

        return new Date(secondReport.createdAt).getTime() - new Date(firstReport.createdAt).getTime()
      }),
    [reports],
  )

  const filteredReports = useMemo(
    () =>
      prioritizedReports.filter((report) => {
        const categoryMatches = selectedCategory === 'all' || report.category === selectedCategory
        const statusMatches = selectedStatus === 'all' || report.status === selectedStatus
        const distanceMatches = appliesDistanceFilter(report, userLocation, selectedDistance)

        return categoryMatches && statusMatches && distanceMatches
      }),
    [prioritizedReports, selectedCategory, selectedStatus, selectedDistance, userLocation],
  )

  const operationalSummary = useMemo(() => {
    const pending = prioritizedReports.filter(
      (report) => report.status === 'nuevo' || report.status === 'en_revision',
    ).length
    const inProgress = prioritizedReports.filter((report) => report.status === 'en_proceso').length
    const resolved = prioritizedReports.filter((report) => report.status === 'resuelto').length
    const highPriority = prioritizedReports.filter((report) => report.votes >= 15).length

    return { pending, inProgress, resolved, highPriority }
  }, [prioritizedReports])

  const criticalZones = useMemo(() => {
    const zoneMap = new Map<
      string,
      {
        totalReports: number
        pendingReports: number
        inProgressReports: number
        resolvedReports: number
        totalVotes: number
        categoryCount: Record<ReportCategory, number>
      }
    >()

    for (const report of prioritizedReports) {
      const currentZone = zoneMap.get(report.address) ?? {
        totalReports: 0,
        pendingReports: 0,
        inProgressReports: 0,
        resolvedReports: 0,
        totalVotes: 0,
        categoryCount: {
          bache: 0,
          luminaria: 0,
          basura: 0,
          vandalismo: 0,
        },
      }

      currentZone.totalReports += 1
      currentZone.totalVotes += report.votes
      currentZone.categoryCount[report.category] += 1

      if (report.status === 'resuelto') {
        currentZone.resolvedReports += 1
      } else if (report.status === 'en_proceso') {
        currentZone.inProgressReports += 1
      } else {
        currentZone.pendingReports += 1
      }

      zoneMap.set(report.address, currentZone)
    }

    const zoneMetrics: ZoneMetrics[] = Array.from(zoneMap.entries()).map(([zone, stats]) => {
      const topCategory = Object.entries(stats.categoryCount).sort((firstCategory, secondCategory) => {
        if (secondCategory[1] !== firstCategory[1]) {
          return secondCategory[1] - firstCategory[1]
        }

        return firstCategory[0].localeCompare(secondCategory[0])
      })[0][0] as ReportCategory

      const criticalScore = Number(
        (stats.pendingReports * 3 + stats.inProgressReports * 2 + stats.totalVotes * 0.2).toFixed(1),
      )

      return {
        zone,
        totalReports: stats.totalReports,
        pendingReports: stats.pendingReports,
        inProgressReports: stats.inProgressReports,
        resolvedReports: stats.resolvedReports,
        totalVotes: stats.totalVotes,
        criticalScore,
        topCategory,
      }
    })

    return zoneMetrics.sort((firstZone, secondZone) => {
      if (secondZone.criticalScore !== firstZone.criticalScore) {
        return secondZone.criticalScore - firstZone.criticalScore
      }

      return secondZone.totalReports - firstZone.totalReports
    })
  }, [prioritizedReports])

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

  const center: [number, number] = filteredReports.length
    ? [filteredReports[0].latitude, filteredReports[0].longitude]
    : [19.432608, -99.133209]

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 py-6">
      <header className="mb-6">
        <p className="text-sm text-slate-600">Fase 4 · Paso 5</p>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">Reportes urbanos</h1>
          <NotificationCenter />
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Vista operativa con notificaciones y métricas de zonas críticas.
        </p>
      </header>

      <section className="mb-4 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-base font-medium text-slate-900">Panel operativo</h2>
        <div className="grid grid-cols-2 gap-2">
          <article className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs text-slate-500">Pendientes</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{operationalSummary.pending}</p>
          </article>
          <article className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs text-slate-500">En proceso</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{operationalSummary.inProgress}</p>
          </article>
          <article className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs text-slate-500">Resueltos</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{operationalSummary.resolved}</p>
          </article>
          <article className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs text-slate-500">Alta prioridad (15+)</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{operationalSummary.highPriority}</p>
          </article>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedStatus('nuevo')
              setSelectedDistance('all')
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700"
          >
            Ver nuevos
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedStatus('en_revision')
              setSelectedDistance('all')
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700"
          >
            Ver en revisión
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all')
              setSelectedStatus('all')
              setSelectedDistance('all')
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700"
          >
            Limpiar filtros
          </button>
        </div>
      </section>

      <section className="mb-4 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-base font-medium text-slate-900">Métricas de zonas críticas</h2>

        {criticalZones.length === 0 ? (
          <p className="text-sm text-slate-600">No hay datos suficientes para calcular métricas.</p>
        ) : (
          <ul className="space-y-3">
            {criticalZones.slice(0, 3).map((zone, index) => (
              <li key={zone.zone} className="rounded-lg border border-slate-200 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900">
                    #{index + 1} · {zone.zone}
                  </p>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                    Score {zone.criticalScore}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <p>Reportes: {zone.totalReports}</p>
                  <p>Votos: {zone.totalVotes}</p>
                  <p>Pendientes: {zone.pendingReports}</p>
                  <p>En proceso: {zone.inProgressReports}</p>
                </div>

                <p className="mt-2 text-xs text-slate-600">
                  Categoría dominante: <span className="font-medium text-slate-800">{categoryLabel[zone.topCategory]}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-4 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-base font-medium text-slate-900">Filtros</h2>
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

      <section className="mb-4 rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-medium text-slate-900">Mapa</h2>
          <Link to="/reports/new" className="text-sm font-medium text-slate-900 underline">
            Nuevo reporte
          </Link>
        </div>
        <div className="h-64 overflow-hidden rounded-lg border border-slate-200">
          <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredReports.map((report) => (
              <CircleMarker
                key={report.id}
                center={[report.latitude, report.longitude]}
                radius={8}
                pathOptions={{ color: statusMarkerColor[report.status], fillOpacity: 0.8 }}
              >
                <Popup>
                  <p className="text-sm font-medium">{categoryLabel[report.category]}</p>
                  <p className="text-xs">{report.address}</p>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-base font-medium text-slate-900">Lista</h2>

        {isLoading ? <p className="text-sm text-slate-600">Cargando reportes...</p> : null}
        {isError ? <p className="text-sm text-red-600">No fue posible cargar los reportes.</p> : null}

        {!isLoading && !isError ? (
          <ul className="space-y-3">
            {filteredReports.map((report) => (
              <li key={report.id} className="rounded-lg border border-slate-200 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-900">{categoryLabel[report.category]}</span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${statusBadgeClass[report.status]}`}
                  >
                    {statusLabel[report.status]}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{report.description}</p>
                <div className="mt-3">
                  <label className="text-xs text-slate-600">
                    Estado
                    <select
                      value={report.status}
                      onChange={(event) => {
                        const selectedStatus = event.target.value as ReportStatus

                        updateStatusMutation.mutate({
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
                          })
                      }}
                      disabled={
                        updateStatusMutation.isPending &&
                        updateStatusMutation.variables?.reportId === report.id
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none disabled:opacity-60"
                    >
                      {Object.entries(statusLabel).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
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
                      }}
                      disabled={
                        report.status === 'en_revision' ||
                        (updateStatusMutation.isPending &&
                          updateStatusMutation.variables?.reportId === report.id)
                      }
                      className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 disabled:opacity-50"
                    >
                      Tomar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
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
                      }}
                      disabled={
                        report.status === 'en_proceso' ||
                        (updateStatusMutation.isPending &&
                          updateStatusMutation.variables?.reportId === report.id)
                      }
                      className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 disabled:opacity-50"
                    >
                      Iniciar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
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
                      }}
                      disabled={
                        report.status === 'resuelto' ||
                        (updateStatusMutation.isPending &&
                          updateStatusMutation.variables?.reportId === report.id)
                      }
                      className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 disabled:opacity-50"
                    >
                      Resolver
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{report.address}</span>
                  <div className="flex items-center gap-2">
                    <span>{report.votes} votos</span>
                    <button
                      type="button"
                      onClick={() => {
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
                      }}
                      disabled={
                        voteReportMutation.isPending && voteReportMutation.variables?.reportId === report.id
                      }
                      className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 disabled:opacity-60"
                    >
                      Me afecta +1
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDistanceToNow(new Date(report.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </p>
              </li>
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
