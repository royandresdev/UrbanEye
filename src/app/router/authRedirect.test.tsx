import { render, screen } from '@testing-library/react'
import { RouterProvider } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

const getSessionMock = vi.hoisted(() => vi.fn())

vi.mock('../../features/auth/LoginPage', () => ({
  LoginPage: () => <h1>login-page</h1>,
}))

vi.mock('../../features/auth/RegisterPage', () => ({
  RegisterPage: () => <h1>register-page</h1>,
}))

vi.mock('../../features/home/HomePage', () => ({
  HomePage: () => <h1>home-page</h1>,
}))

vi.mock('../../features/reports/NewReportPage', () => ({
  NewReportPage: () => <h1>new-report-page</h1>,
}))

vi.mock('../../features/reports/ReportsOverviewPage', () => ({
  ReportsOverviewPage: () => <h1>reports-page</h1>,
}))

vi.mock('../../shared/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: getSessionMock,
    },
  },
}))

describe('Auth redirect', () => {
  it('redirecciona a /auth cuando se intenta entrar a /reports sin sesión', async () => {
    getSessionMock.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    window.history.pushState({}, '', '/reports')

    const { appRouter } = await import('./appRouter')

    render(<RouterProvider router={appRouter} />)

    expect(await screen.findByText('login-page')).toBeInTheDocument()
  })
})
