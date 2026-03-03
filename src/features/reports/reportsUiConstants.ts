import type { ReportCategory, ReportStatus } from './reportsTypes'
import type { DistanceFilter } from './reportsViewUtils'

export const categoryLabel: Record<ReportCategory, string> = {
  bache: 'Bache',
  luminaria: 'Luminaria',
  basura: 'Basura',
  vandalismo: 'Vandalismo',
}

export const statusLabel: Record<ReportStatus, string> = {
  nuevo: 'Nuevo',
  en_revision: 'En revisión',
  en_proceso: 'En proceso',
  resuelto: 'Resuelto',
}

export const statusBadgeClass: Record<ReportStatus, string> = {
  nuevo: 'bg-slate-100 text-slate-700',
  en_revision: 'bg-amber-100 text-amber-800',
  en_proceso: 'bg-blue-100 text-blue-800',
  resuelto: 'bg-emerald-100 text-emerald-800',
}

export const statusMarkerColor: Record<ReportStatus, string> = {
  nuevo: '#475569',
  en_revision: '#b45309',
  en_proceso: '#1d4ed8',
  resuelto: '#047857',
}

export const distanceLabel: Record<DistanceFilter, string> = {
  all: 'Todas',
  '1': '1 km',
  '3': '3 km',
  '5': '5 km',
}
