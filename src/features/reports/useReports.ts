import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createReport, getReports, updateReportStatus, voteReport } from './reportsApi'
import type { ReportItem, ReportStatus } from './reportsTypes'
import { supabase } from '../../shared/lib/supabase'

export const reportsQueryKey = ['reports'] as const

export function useReports() {
  return useQuery({
    queryKey: reportsQueryKey,
    queryFn: getReports,
  })
}

export function useReportsRealtime() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const invalidateReports = () => {
      void queryClient.invalidateQueries({ queryKey: reportsQueryKey })
    }

    const channel = supabase
      .channel('urbaneye-reports-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, invalidateReports)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'report_status_history' },
        invalidateReports,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'report_votes' },
        invalidateReports,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'report_images' },
        invalidateReports,
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [queryClient])
}

export function useCreateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createReport,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: reportsQueryKey })
    },
  })
}

type UpdateReportStatusInput = {
  reportId: string
  status: ReportStatus
}

export function useUpdateReportStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateReportStatus,
    onMutate: async ({ reportId, status }: UpdateReportStatusInput) => {
      await queryClient.cancelQueries({ queryKey: reportsQueryKey })

      const previousReports = queryClient.getQueryData<ReportItem[]>(reportsQueryKey)

      queryClient.setQueryData<ReportItem[]>(reportsQueryKey, (currentReports) => {
        if (!currentReports) {
          return currentReports
        }

        return currentReports.map((report) =>
          report.id === reportId
            ? {
                ...report,
                status,
              }
            : report,
        )
      })

      return { previousReports }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousReports) {
        queryClient.setQueryData(reportsQueryKey, context.previousReports)
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: reportsQueryKey })
    },
  })
}

type VoteReportInput = {
  reportId: string
}

export function useVoteReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: voteReport,
    onMutate: async ({ reportId }: VoteReportInput) => {
      await queryClient.cancelQueries({ queryKey: reportsQueryKey })

      const previousReports = queryClient.getQueryData<ReportItem[]>(reportsQueryKey)

      queryClient.setQueryData<ReportItem[]>(reportsQueryKey, (currentReports) => {
        if (!currentReports) {
          return currentReports
        }

        return currentReports.map((report) =>
          report.id === reportId
            ? {
                ...report,
                votes: report.votes + 1,
              }
            : report,
        )
      })

      return { previousReports }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousReports) {
        queryClient.setQueryData(reportsQueryKey, context.previousReports)
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: reportsQueryKey })
    },
  })
}
