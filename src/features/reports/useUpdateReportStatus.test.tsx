import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { reportsQueryKey, useUpdateReportStatus } from './useReports'
import type { ReportItem } from './reportsTypes'

const updateReportStatusMock = vi.hoisted(() => vi.fn())

vi.mock('./reportsApi', () => ({
  createReport: vi.fn(),
  getReports: vi.fn(),
  updateReportStatus: updateReportStatusMock,
  voteReport: vi.fn(),
}))

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

function buildReports(): ReportItem[] {
  return [
    {
      id: 'r1',
      category: 'bache',
      description: 'Bache en avenida principal',
      status: 'nuevo',
      latitude: 19.4326,
      longitude: -99.1332,
      address: 'Centro',
      votes: 4,
      createdAt: '2026-03-02T10:00:00.000Z',
    },
    {
      id: 'r2',
      category: 'basura',
      description: 'Basura acumulada en esquina',
      status: 'en_revision',
      latitude: 19.43,
      longitude: -99.13,
      address: 'Norte',
      votes: 2,
      createdAt: '2026-03-02T09:00:00.000Z',
    },
  ]
}

describe('useUpdateReportStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('actualiza estado optimistamente para el reporte objetivo', async () => {
    const queryClient = createQueryClient()
    const initialReports = buildReports()
    queryClient.setQueryData(reportsQueryKey, initialReports)

    updateReportStatusMock.mockResolvedValue({
      ...initialReports[0],
      status: 'en_proceso',
    })

    const { result } = renderHook(() => useUpdateReportStatus(), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate({ reportId: 'r1', status: 'en_proceso' })

    await waitFor(() => {
      const optimisticReports = queryClient.getQueryData<ReportItem[]>(reportsQueryKey)
      expect(optimisticReports?.find((report) => report.id === 'r1')?.status).toBe('en_proceso')
      expect(optimisticReports?.find((report) => report.id === 'r2')?.status).toBe('en_revision')
      expect(updateReportStatusMock).toHaveBeenCalledWith(
        { reportId: 'r1', status: 'en_proceso' },
        expect.anything(),
      )
      expect(result.current.isSuccess).toBe(true)
    })
  })

  it('revierte el cambio optimista si la mutación falla', async () => {
    const queryClient = createQueryClient()
    const initialReports = buildReports()
    queryClient.setQueryData(reportsQueryKey, initialReports)

    updateReportStatusMock.mockRejectedValue(new Error('No se pudo actualizar estado'))

    const { result } = renderHook(() => useUpdateReportStatus(), {
      wrapper: createWrapper(queryClient),
    })

    await expect(
      result.current.mutateAsync({
        reportId: 'r1',
        status: 'resuelto',
      }),
    ).rejects.toThrow('No se pudo actualizar estado')

    const reportsAfterError = queryClient.getQueryData<ReportItem[]>(reportsQueryKey)
    expect(reportsAfterError).toEqual(initialReports)
  })

  it('no altera el cache cuando el reportId no existe', async () => {
    const queryClient = createQueryClient()
    const initialReports = buildReports()
    queryClient.setQueryData(reportsQueryKey, initialReports)

    updateReportStatusMock.mockResolvedValue(initialReports[0])

    const { result } = renderHook(() => useUpdateReportStatus(), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate({ reportId: 'r999', status: 'en_proceso' })

    const currentReports = queryClient.getQueryData<ReportItem[]>(reportsQueryKey)
    expect(currentReports).toEqual(initialReports)

    await waitFor(() => {
      expect(updateReportStatusMock).toHaveBeenCalledWith(
        { reportId: 'r999', status: 'en_proceso' },
        expect.anything(),
      )
    })
  })

  it('permite múltiples transiciones de estado sobre el mismo reporte', async () => {
    const queryClient = createQueryClient()
    const initialReports = buildReports()
    queryClient.setQueryData(reportsQueryKey, initialReports)

    updateReportStatusMock
      .mockResolvedValueOnce({ ...initialReports[0], status: 'en_revision' })
      .mockResolvedValueOnce({ ...initialReports[0], status: 'en_proceso' })
      .mockResolvedValueOnce({ ...initialReports[0], status: 'resuelto' })

    const { result } = renderHook(() => useUpdateReportStatus(), {
      wrapper: createWrapper(queryClient),
    })

    await result.current.mutateAsync({ reportId: 'r1', status: 'en_revision' })
    await result.current.mutateAsync({ reportId: 'r1', status: 'en_proceso' })
    await result.current.mutateAsync({ reportId: 'r1', status: 'resuelto' })

    const finalReports = queryClient.getQueryData<ReportItem[]>(reportsQueryKey)
    expect(finalReports?.find((report) => report.id === 'r1')?.status).toBe('resuelto')
  })
})
