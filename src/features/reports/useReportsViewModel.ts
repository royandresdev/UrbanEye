import { useMemo } from 'react'
import type { ReportCategory, ReportItem, ReportStatus } from './reportsTypes'
import {
  type DistanceFilter,
  type UserLocation,
  buildCriticalZones,
  buildOperationalSummary,
  filterReports,
  getMapCenter,
  prioritizeReports,
} from './reportsViewUtils'

type UseReportsViewModelInput = {
  reports: ReportItem[]
  selectedCategory: 'all' | ReportCategory
  selectedStatus: 'all' | ReportStatus
  selectedDistance: DistanceFilter
  userLocation: UserLocation | null
}

export function useReportsViewModel({
  reports,
  selectedCategory,
  selectedStatus,
  selectedDistance,
  userLocation,
}: UseReportsViewModelInput) {
  const prioritizedReports = useMemo(() => prioritizeReports(reports), [reports])

  const filteredReports = useMemo(
    () =>
      filterReports(
        prioritizedReports,
        selectedCategory,
        selectedStatus,
        selectedDistance,
        userLocation,
      ),
    [prioritizedReports, selectedCategory, selectedStatus, selectedDistance, userLocation],
  )

  const operationalSummary = useMemo(
    () => buildOperationalSummary(prioritizedReports),
    [prioritizedReports],
  )

  const criticalZones = useMemo(() => buildCriticalZones(prioritizedReports), [prioritizedReports])

  const center = useMemo(() => getMapCenter(filteredReports), [filteredReports])

  return {
    prioritizedReports,
    filteredReports,
    operationalSummary,
    criticalZones,
    center,
  }
}
