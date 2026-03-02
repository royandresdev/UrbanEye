import 'leaflet/dist/leaflet.css'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useReports, useUpdateReportStatus, useVoteReport } from './useReports'
import type { ReportCategory, ReportStatus } from './reportsTypes'

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

export function ReportsOverviewPage() {
  const { data: reports = [], isLoading, isError } = useReports()
  const updateStatusMutation = useUpdateReportStatus()
  const voteReportMutation = useVoteReport()

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

  const center: [number, number] = prioritizedReports.length
    ? [prioritizedReports[0].latitude, prioritizedReports[0].longitude]
    : [19.432608, -99.133209]

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 py-6">
      <header className="mb-6">
        <p className="text-sm text-slate-600">Fase 2 · Paso 1</p>
        <h1 className="text-2xl font-semibold text-slate-900">Reportes urbanos</h1>
        <p className="mt-2 text-sm text-slate-600">
          Priorización ciudadana por votos, con visualización en lista y mapa.
        </p>
      </header>

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
            {prioritizedReports.map((report) => (
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
            {prioritizedReports.map((report) => (
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
                        updateStatusMutation.mutate({
                          reportId: report.id,
                          status: event.target.value as ReportStatus,
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
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{report.address}</span>
                  <div className="flex items-center gap-2">
                    <span>{report.votes} votos</span>
                    <button
                      type="button"
                      onClick={() => {
                        voteReportMutation.mutate({ reportId: report.id })
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
