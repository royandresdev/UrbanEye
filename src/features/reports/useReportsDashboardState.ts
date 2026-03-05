import { useMemo, useState } from 'react'
import { useReports, useUpdateReportStatus, useVoteReport } from './useReports'
import type { ReportCategory, ReportItem, ReportStatus } from './reportsTypes'
import { categoryLabel, statusLabel } from './reportsUiConstants'
import { useReportsViewModel } from './useReportsViewModel'
import type { DistanceFilter } from './reportsViewUtils'
import { useNotifications } from '../../shared/notifications/useNotifications'

export function useReportsDashboardState() {
  const { data: reports = [], isLoading, isError } = useReports()
  const updateStatusMutation = useUpdateReportStatus()
  const voteReportMutation = useVoteReport()
  const { addNotification } = useNotifications()

  const [selectedCategory, setSelectedCategory] = useState<'all' | ReportCategory>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | ReportStatus>('all')
  const [selectedDistance, setSelectedDistance] = useState<DistanceFilter>('all')
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null,
  )
  const [locationError, setLocationError] = useState<string | null>(null)

  const { filteredReports, operationalSummary, criticalZones, center, citizenSummary } =
    useReportsViewModel({
      reports,
      selectedCategory,
      selectedStatus,
      selectedDistance,
      userLocation,
    })

  const citizenRecentReports = useMemo(() => [...filteredReports].slice(0, 6), [filteredReports])

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

  const handleStatusChange = (report: ReportItem, nextStatus: ReportStatus) => {
    updateStatusMutation.mutate(
      {
        reportId: report.id,
        status: nextStatus,
      },
      {
        onSuccess: () => {
          addNotification({
            title: 'Estado actualizado',
            message: `${categoryLabel[report.category]} ahora está en ${statusLabel[nextStatus]}.`,
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

  return {
    isLoading,
    isError,
    filteredReports,
    citizenRecentReports,
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
    setLocationError,
    onUseCurrentLocation,
    handleStatusChange,
    handleTakeReport,
    handleStartReport,
    handleResolveReport,
    handleVoteReport,
    isUpdatePendingForReport: (reportId: string) =>
      updateStatusMutation.isPending && updateStatusMutation.variables?.reportId === reportId,
    isVotePendingForReport: (reportId: string) =>
      voteReportMutation.isPending && voteReportMutation.variables?.reportId === reportId,
    citizenSummary,
  }
}
