import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ReportsOverviewPage } from './ReportsOverviewPage'
import type { ReportItem } from './reportsTypes'

const useReportsMock = vi.hoisted(() => vi.fn())
const useReportsRealtimeMock = vi.hoisted(() => vi.fn())
const useUpdateReportStatusMock = vi.hoisted(() => vi.fn())
const useVoteReportMock = vi.hoisted(() => vi.fn())

vi.mock('./useReports', () => ({
  reportsQueryKey: ['reports'],
  useReports: useReportsMock,
  useReportsRealtime: useReportsRealtimeMock,
  useUpdateReportStatus: useUpdateReportStatusMock,
  useVoteReport: useVoteReportMock,
}))

vi.mock('../../shared/notifications/useNotifications', () => ({
  useNotifications: () => ({
    addNotification: vi.fn(),
  }),
}))

vi.mock('../../shared/notifications/NotificationCenter', () => ({
  NotificationCenter: () => <div data-testid="notification-center" />,
}))

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TileLayer: () => <div />,
  CircleMarker: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Popup: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}))

describe('ReportsOverviewPage - votación', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    useReportsRealtimeMock.mockImplementation(() => undefined)

    useUpdateReportStatusMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      variables: undefined,
    })

    useVoteReportMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      variables: undefined,
    })
  })

  it('debe desactivar el botón de votar si el usuario ya votó', () => {
    const reportWithVoteFlag = {
      id: 'r1',
      category: 'bache',
      description: 'Bache en cruce principal',
      status: 'nuevo',
      latitude: 19.4326,
      longitude: -99.1332,
      address: 'Centro',
      votes: 3,
      createdAt: '2026-03-01T10:00:00.000Z',
      hasUserVoted: true,
    } as ReportItem

    useReportsMock.mockReturnValue({
      data: [reportWithVoteFlag],
      isLoading: false,
      isError: false,
    })

    render(
      <MemoryRouter>
        <ReportsOverviewPage />
      </MemoryRouter>,
    )

    const voteButton = screen.getByRole('button', { name: 'Me afecta +1' })
    expect(voteButton).toBeDisabled()
  })
})
