import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  reportsQueryKey,
  useCreateReport,
  useReports,
  useReportsRealtime,
  useVoteReport,
} from './useReports'
import type { ReportItem } from './reportsTypes'

const getReportsMock = vi.hoisted(() => vi.fn())
const createReportMock = vi.hoisted(() => vi.fn())
const voteReportMock = vi.hoisted(() => vi.fn())
const updateReportStatusMock = vi.hoisted(() => vi.fn())

const removeChannelMock = vi.hoisted(() => vi.fn())
const channelMock = vi.hoisted(() => ({
  on: vi.fn(),
  subscribe: vi.fn(),
}))
const channelFactoryMock = vi.hoisted(() => vi.fn())

vi.mock('./reportsApi', () => ({
  getReports: getReportsMock,
  createReport: createReportMock,
  voteReport: voteReportMock,
  updateReportStatus: updateReportStatusMock,
}))

vi.mock('../../shared/lib/supabase', () => ({
  supabase: {
    channel: channelFactoryMock,
    removeChannel: removeChannelMock,
  },
}))

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

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

function buildReports(): ReportItem[] {
  return [
    {
      id: 'r1',
      category: 'bache',
      description: 'Bache sobre avenida central',
      status: 'nuevo',
      latitude: 19.4326,
      longitude: -99.1332,
      address: 'Centro',
      votes: 4,
      createdAt: '2026-03-02T10:00:00.000Z',
    },
  ]
}

describe('useReports hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    channelMock.on.mockImplementation(() => channelMock)
    channelMock.subscribe.mockReturnValue(channelMock)
    channelFactoryMock.mockReturnValue(channelMock)
  })

  it('useReports carga datos con query key de reportes', async () => {
    const reports = buildReports()
    getReportsMock.mockResolvedValue(reports)

    const queryClient = createQueryClient()
    const { result } = renderHook(() => useReports(), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(reports)
    expect(getReportsMock).toHaveBeenCalledTimes(1)
    expect(queryClient.getQueryData(reportsQueryKey)).toEqual(reports)
  })

  it('useReportsRealtime suscribe cambios y limpia canal al desmontar', () => {
    const queryClient = createQueryClient()

    const { unmount } = renderHook(() => useReportsRealtime(), {
      wrapper: createWrapper(queryClient),
    })

    expect(channelFactoryMock).toHaveBeenCalledWith('urbaneye-reports-realtime')
    expect(channelMock.on).toHaveBeenCalledTimes(4)
    expect(channelMock.subscribe).toHaveBeenCalledTimes(1)

    unmount()

    expect(removeChannelMock).toHaveBeenCalledWith(channelMock)
  })

  it('useCreateReport invalida cache al crear reporte', async () => {
    const queryClient = createQueryClient()
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const photoFile = new File(['img'], 'foto.jpg', { type: 'image/jpeg' })

    createReportMock.mockResolvedValue({
      ...buildReports()[0],
      id: 'new-r1',
      votes: 0,
      status: 'nuevo',
    })

    const { result } = renderHook(() => useCreateReport(), {
      wrapper: createWrapper(queryClient),
    })

    await result.current.mutateAsync({
      category: 'bache',
      description: 'Bache nuevo en esquina',
      latitude: 19.43,
      longitude: -99.13,
      photoFile,
    })

    expect(createReportMock).toHaveBeenCalledTimes(1)

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: reportsQueryKey })
    })
  })

  it('useVoteReport aplica incremento optimista y rollback por error', async () => {
    const queryClient = createQueryClient()
    const initialReports = buildReports()
    queryClient.setQueryData(reportsQueryKey, initialReports)

    type RejectVote = (reason?: unknown) => void
    let rejectVotePromise: RejectVote = () => { }

    const votePromise = new Promise<unknown>((_resolve, reject) => {
      rejectVotePromise = reject as RejectVote
    })

    voteReportMock.mockReturnValueOnce(votePromise)

    const { result } = renderHook(() => useVoteReport(), {
      wrapper: createWrapper(queryClient),
    })

    const pendingVote = result.current.mutateAsync({ reportId: 'r1' })

    await waitFor(() => {
      const optimistic = queryClient.getQueryData<ReportItem[]>(reportsQueryKey)
      expect(optimistic?.[0].votes).toBe(5)
    })

    rejectVotePromise(new Error('No se pudo votar'))

    await expect(pendingVote).rejects.toThrow('No se pudo votar')

    const afterRollback = queryClient.getQueryData<ReportItem[]>(reportsQueryKey)
    expect(afterRollback).toEqual(initialReports)
  })
})
