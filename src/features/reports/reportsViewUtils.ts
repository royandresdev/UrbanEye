import type { ReportCategory, ReportItem, ReportStatus } from './reportsTypes'

export type DistanceFilter = 'all' | '1' | '3' | '5'

export type UserLocation = {
  latitude: number
  longitude: number
}

export type OperationalSummary = {
  pending: number
  inProgress: number
  resolved: number
  highPriority: number
}

export type ZoneMetrics = {
  zone: string
  totalReports: number
  pendingReports: number
  inProgressReports: number
  resolvedReports: number
  totalVotes: number
  criticalScore: number
  topCategory: ReportCategory
}

export function getDistanceInKm(from: UserLocation, to: UserLocation): number {
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

export function appliesDistanceFilter(
  report: ReportItem,
  userLocation: UserLocation | null,
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

export function prioritizeReports(reports: ReportItem[]): ReportItem[] {
  return [...reports].sort((firstReport, secondReport) => {
    if (secondReport.votes !== firstReport.votes) {
      return secondReport.votes - firstReport.votes
    }

    return new Date(secondReport.createdAt).getTime() - new Date(firstReport.createdAt).getTime()
  })
}

export function filterReports(
  prioritizedReports: ReportItem[],
  selectedCategory: 'all' | ReportCategory,
  selectedStatus: 'all' | ReportStatus,
  selectedDistance: DistanceFilter,
  userLocation: UserLocation | null,
): ReportItem[] {
  return prioritizedReports.filter((report) => {
    const categoryMatches = selectedCategory === 'all' || report.category === selectedCategory
    const statusMatches = selectedStatus === 'all' || report.status === selectedStatus
    const distanceMatches = appliesDistanceFilter(report, userLocation, selectedDistance)

    return categoryMatches && statusMatches && distanceMatches
  })
}

export function buildOperationalSummary(prioritizedReports: ReportItem[]): OperationalSummary {
  const pending = prioritizedReports.filter(
    (report) => report.status === 'nuevo' || report.status === 'en_revision',
  ).length
  const inProgress = prioritizedReports.filter((report) => report.status === 'en_proceso').length
  const resolved = prioritizedReports.filter((report) => report.status === 'resuelto').length
  const highPriority = prioritizedReports.filter((report) => report.votes >= 15).length

  return { pending, inProgress, resolved, highPriority }
}

export function buildCriticalZones(prioritizedReports: ReportItem[]): ZoneMetrics[] {
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
    const topCategory = Object.entries(stats.categoryCount).sort(
      (firstCategory, secondCategory) => {
        if (secondCategory[1] !== firstCategory[1]) {
          return secondCategory[1] - firstCategory[1]
        }

        return firstCategory[0].localeCompare(secondCategory[0])
      },
    )[0][0] as ReportCategory

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
}

export function getMapCenter(filteredReports: ReportItem[]): [number, number] {
  if (filteredReports.length) {
    return [filteredReports[0].latitude, filteredReports[0].longitude]
  }

  return [19.432608, -99.133209]
}
