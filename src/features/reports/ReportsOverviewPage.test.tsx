import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ReportsOverviewPage } from './ReportsOverviewPage'
import type { ReportItem } from './reportsTypes'

const useReportsMock = vi.hoisted(() => vi.fn())
const useReportsRealtimeMock = vi.hoisted(() => vi.fn())
const useCurrentUserRoleMock = vi.hoisted(() => vi.fn())
const useUpdateReportStatusMock = vi.hoisted(() => vi.fn())
const useVoteReportMock = vi.hoisted(() => vi.fn())
const updateStatusMutateMock = vi.hoisted(() => vi.fn())
const voteMutateMock = vi.hoisted(() => vi.fn())

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

vi.mock('./components/UserSidebar', () => ({
  UserSidebar: () => null,
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
      mutate: updateStatusMutateMock,
      isPending: false,
      variables: undefined,
    })

    useVoteReportMock.mockReturnValue({
      mutate: voteMutateMock,
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

    expect(screen.queryByText(/fase|paso/i)).not.toBeInTheDocument()

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

  it('si autoridad cierra sesión y entra ciudadano, se ocultan controles de autoridad', () => {
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

    useCurrentUserRoleMock
      .mockReturnValueOnce({ data: 'autoridad' })
      .mockReturnValueOnce({ data: 'ciudadano' })

    useReportsMock.mockReturnValue({
      data: [report],
      isLoading: false,
      isError: false,
    })

    const { rerender } = render(
      <MemoryRouter>
        <ReportsOverviewPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: 'Tomar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Iniciar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Resolver' })).toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <ReportsOverviewPage />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('button', { name: 'Tomar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Iniciar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Resolver' })).not.toBeInTheDocument()
  })

  it('permite votar a ciudadano cuando no ha votado ese reporte', async () => {
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

    const voteButton = screen.getByRole('button', { name: 'Me afecta +1' })
    expect(voteButton).toBeEnabled()

    await userEvent.click(voteButton)

    expect(voteMutateMock).toHaveBeenCalledTimes(1)
    expect(voteMutateMock).toHaveBeenCalledWith(
      { reportId: 'r1' },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    )
  })

  it('desactiva botón de voto para ciudadano mientras votación está pending en ese reporte', () => {
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

    useVoteReportMock.mockReturnValue({
      mutate: voteMutateMock,
      isPending: true,
      variables: { reportId: 'r1' },
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

    expect(screen.getByRole('button', { name: 'Me afecta +1' })).toBeDisabled()
  })

  it('al cerrar sesión se re-renderiza ReportsOverviewPage y actualiza permisos', () => {
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

    useCurrentUserRoleMock
      .mockReturnValueOnce({ data: 'autoridad' })
      .mockReturnValueOnce({ data: 'ciudadano' })

    useReportsMock.mockReturnValue({
      data: [report],
      isLoading: false,
      isError: false,
    })

    const { rerender } = render(
      <MemoryRouter>
        <ReportsOverviewPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: 'Tomar' })).toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <ReportsOverviewPage />
      </MemoryRouter>,
    )

    expect(useCurrentUserRoleMock).toHaveBeenCalledTimes(2)
    expect(screen.queryByRole('button', { name: 'Tomar' })).not.toBeInTheDocument()
  })
})
