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
  nuevo: 'bg-blue-500/20 text-blue-300',
  en_revision: 'bg-amber-500/20 text-amber-300',
  en_proceso: 'bg-amber-500/20 text-amber-300',
  resuelto: 'bg-emerald-500/20 text-emerald-300',
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
