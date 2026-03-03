import { Link } from 'react-router-dom'
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import type { ReportCategory, ReportItem, ReportStatus } from '../reportsTypes'

type ReportsMapPanelProps = {
  center: [number, number]
  reports: ReportItem[]
  categoryLabel: Record<ReportCategory, string>
  statusMarkerColor: Record<ReportStatus, string>
}

export function ReportsMapPanel({
  center,
  reports,
  categoryLabel,
  statusMarkerColor,
}: ReportsMapPanelProps) {
  return (
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
          {reports.map((report) => (
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
  )
}
