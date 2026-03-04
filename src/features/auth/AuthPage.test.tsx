import { MemoryRouter } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginPage } from './LoginPage'
import { RegisterPage } from './RegisterPage'

const {
  addNotificationMock,
  getSessionMock,
  onAuthStateChangeMock,
  signOutMock,
  signInWithPasswordMock,
  resendMock,
  signUpMock,
} = vi.hoisted(() => ({
  addNotificationMock: vi.fn(),
  getSessionMock: vi.fn(),
  onAuthStateChangeMock: vi.fn(),
  signOutMock: vi.fn(),
  signInWithPasswordMock: vi.fn(),
  resendMock: vi.fn(),
  signUpMock: vi.fn(),
}))

vi.mock('../../shared/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: getSessionMock,
      onAuthStateChange: onAuthStateChangeMock,
      signOut: signOutMock,
      signInWithPassword: signInWithPasswordMock,
      resend: resendMock,
      signUp: signUpMock,
    },
  },
}))

vi.mock('../../shared/notifications/useNotifications', () => ({
  useNotifications: () => ({
    addNotification: addNotificationMock,
  }),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    getSessionMock.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    onAuthStateChangeMock.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    })

    signOutMock.mockResolvedValue({ error: null })
    signInWithPasswordMock.mockResolvedValue({ error: null })
    resendMock.mockResolvedValue({ error: null })
    signUpMock.mockResolvedValue({ error: null })
  })

  it('inicia sesión correctamente y notifica éxito', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    await screen.findByRole('heading', { name: /mejora tu ciudad/i })

    await userEvent.type(screen.getByLabelText('Correo Electrónico'), 'ciudadano@urbaneye.app')
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secreto123')

    await userEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }))

    await waitFor(() => {
      expect(signInWithPasswordMock).toHaveBeenCalledWith({
        email: 'ciudadano@urbaneye.app',
        password: 'secreto123',
      })
    })

    expect(addNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Bienvenido',
        level: 'success',
      })
    )
  })

  it('maneja correo no confirmado y permite reenviar confirmación', async () => {
    signInWithPasswordMock.mockResolvedValueOnce({
      error: { message: 'Email not confirmed' },
    })

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    await screen.findByRole('heading', { name: /mejora tu ciudad/i })

    await userEvent.type(screen.getByLabelText('Correo Electrónico'), 'pendiente@urbaneye.app')
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secreto123')

    await userEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }))

    await screen.findByRole('button', { name: 'Reenviar correo de confirmación' })

    expect(addNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Correo sin confirmar',
        level: 'warning',
      })
    )

    await userEvent.click(screen.getByRole('button', { name: 'Reenviar correo de confirmación' }))

    await waitFor(() => {
      expect(resendMock).toHaveBeenCalledWith({
        type: 'signup',
        email: 'pendiente@urbaneye.app',
      })
    })

    expect(addNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Correo reenviado',
        level: 'success',
      })
    )
  })

  it('muestra sesión activa y permite cerrar sesión', async () => {
    getSessionMock.mockResolvedValueOnce({
      data: {
        session: {
          user: {
            email: 'activa@urbaneye.app',
          },
        },
      },
      error: null,
    })

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    await screen.findByRole('heading', { name: /sesión activa/i })

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

    await waitFor(() => {
      expect(signOutMock).toHaveBeenCalledTimes(1)
    })

    expect(addNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Sesión cerrada',
        level: 'info',
      })
    )
  })
})

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    getSessionMock.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    onAuthStateChangeMock.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    })

    signOutMock.mockResolvedValue({ error: null })
    signInWithPasswordMock.mockResolvedValue({ error: null })
    resendMock.mockResolvedValue({ error: null })
    signUpMock.mockResolvedValue({ error: null })
  })

  it('registra un usuario nuevo', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )

    await screen.findByRole('heading', { name: /crear cuenta/i })

    await userEvent.type(screen.getByLabelText('Nombre completo'), 'Ana Barrio')
    await userEvent.type(screen.getByLabelText('Correo'), 'ana@urbaneye.app')
    await userEvent.type(screen.getByLabelText('Contraseña'), 'supersegura')
    await userEvent.type(screen.getByLabelText('Confirmar contraseña'), 'supersegura')

    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledWith({
        email: 'ana@urbaneye.app',
        password: 'supersegura',
        options: {
          data: {
            full_name: 'Ana Barrio',
          },
        },
      })
    })

    expect(addNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Cuenta creada',
        level: 'success',
      })
    )
  })
})
