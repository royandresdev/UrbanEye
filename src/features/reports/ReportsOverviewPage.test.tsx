import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ReportsOverviewPage } from './ReportsOverviewPage'
import type { ReportItem } from './reportsTypes'

const useReportsMock = vi.hoisted(() => vi.fn())
const useReportsRealtimeMock = vi.hoisted(() => vi.fn())
const useCurrentUserRoleMock = vi.hoisted(() => vi.fn())
const useUpdateReportStatusMock = vi.hoisted(() => vi.fn())
const useVoteReportMock = vi.hoisted(() => vi.fn())

vi.mock('./useReports', () => ({
  reportsQueryKey: ['reports'],
  useCurrentUserRole: useCurrentUserRoleMock,
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
    useCurrentUserRoleMock.mockReturnValue({
      data: 'ciudadano',
    })

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

  it('oculta controles de cambio de estado para ciudadano', () => {
    const report = {
      id: 'r1',
      category: 'bache',
      description: 'Bache en cruce principal',
      status: 'nuevo',
      latitude: 19.4326,
      longitude: -99.1332,
      address: 'Centro',
      votes: 3,
      createdAt: '2026-03-01T10:00:00.000Z',
      hasUserVoted: false,
    } as ReportItem

    useCurrentUserRoleMock.mockReturnValue({
      data: 'ciudadano',
    })

    useReportsMock.mockReturnValue({
      data: [report],
      isLoading: false,
      isError: false,
    })

    render(
      <MemoryRouter>
        <ReportsOverviewPage />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('button', { name: 'Tomar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Iniciar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Resolver' })).not.toBeInTheDocument()
  })

  it('muestra controles de cambio de estado para autoridad', () => {
    const report = {
      id: 'r1',
      category: 'bache',
      description: 'Bache en cruce principal',
      status: 'nuevo',
      latitude: 19.4326,
      longitude: -99.1332,
      address: 'Centro',
      votes: 3,
      createdAt: '2026-03-01T10:00:00.000Z',
      hasUserVoted: false,
    } as ReportItem

    useCurrentUserRoleMock.mockReturnValue({
      data: 'autoridad',
    })

    useReportsMock.mockReturnValue({
      data: [report],
      isLoading: false,
      isError: false,
    })

    render(
      <MemoryRouter>
        <ReportsOverviewPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: 'Tomar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Iniciar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Resolver' })).toBeInTheDocument()
  })
})
