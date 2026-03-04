import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Session } from '@supabase/supabase-js'
import {
  type LoginFormValues,
  type RegisterFormValues,
  loginSchema,
  registerSchema,
} from './authSchemas'
import { supabase } from '../../shared/lib/supabase'
import { useNotifications } from '../../shared/notifications/useNotifications'

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [session, setSession] = useState<Session | null>(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { addNotification } = useNotifications()

  useEffect(() => {
    let isMounted = true

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) {
        return
      }

      if (error) {
        addNotification({
          title: 'Error de sesión',
          message: error.message,
          level: 'warning',
        })
      }

      setSession(data.session ?? null)
      setIsCheckingSession(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [addNotification])

  const handleSignOut = async () => {
    setIsSigningOut(true)

    const { error } = await supabase.auth.signOut()

    if (error) {
      addNotification({
        title: 'Error al cerrar sesión',
        message: error.message,
        level: 'warning',
      })
      setIsSigningOut(false)
      return
    }

    addNotification({
      title: 'Sesión cerrada',
      message: 'Tu sesión se cerró correctamente.',
      level: 'info',
    })
    setIsSigningOut(false)
  }

  if (isCheckingSession) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-md px-4 py-6">
        <section className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">Verificando sesión...</p>
        </section>
      </main>
    )
  }

  if (session?.user) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-md px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Sesión activa</h1>
          <p className="mt-2 text-sm text-slate-600">Has iniciado sesión en UrbanEye.</p>
        </header>

        <section className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-700">
            Usuario: <span className="font-medium text-slate-900">{session.user.email}</span>
          </p>

          <button
            type="button"
            onClick={() => {
              void handleSignOut()
            }}
            disabled={isSigningOut}
            className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Cerrar sesión
          </button>
        </section>

        <p className="mt-4 text-center text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-900 underline">
            Volver al inicio
          </Link>
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Acceso a UrbanEye</h1>
        <p className="mt-2 text-sm text-slate-600">Inicia sesión o crea tu cuenta para reportar incidencias.</p>
      </header>

      <div className="mb-4 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={
            mode === 'login'
              ? 'rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm'
              : 'rounded-md px-3 py-2 text-sm font-medium text-slate-600'
          }
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          className={
            mode === 'register'
              ? 'rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm'
              : 'rounded-md px-3 py-2 text-sm font-medium text-slate-600'
          }
        >
          Registrarme
        </button>
      </div>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        {mode === 'login' ? <LoginForm /> : <RegisterForm onRegistered={() => setMode('login')} />}
      </section>

      <p className="mt-4 text-center text-sm text-slate-600">
        <Link to="/" className="font-medium text-slate-900 underline">
          Volver al inicio
        </Link>
      </p>
    </main>
  )
}

function LoginForm() {
  const { addNotification } = useNotifications()
  const [emailPendingConfirmation, setEmailPendingConfirmation] = useState<string | null>(null)
  const [isResendingConfirmation, setIsResendingConfirmation] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setEmailPendingConfirmation(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      const unconfirmedEmail = error.message.toLowerCase().includes('email not confirmed')

      if (unconfirmedEmail) {
        setEmailPendingConfirmation(values.email)
        addNotification({
          title: 'Correo sin confirmar',
          message: 'Revisa tu bandeja de entrada y confirma tu cuenta para iniciar sesión.',
          level: 'warning',
        })
        return
      }

      addNotification({
        title: 'Error al iniciar sesión',
        message: error.message,
        level: 'warning',
      })
      return
    }

    addNotification({
      title: 'Bienvenido',
      message: 'Inicio de sesión correcto.',
      level: 'success',
    })
  }

  const handleResendConfirmation = async () => {
    if (!emailPendingConfirmation) {
      return
    }

    setIsResendingConfirmation(true)

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: emailPendingConfirmation,
    })

    if (error) {
      addNotification({
        title: 'No se pudo reenviar',
        message: error.message,
        level: 'warning',
      })
      setIsResendingConfirmation(false)
      return
    }

    addNotification({
      title: 'Correo reenviado',
      message: 'Te enviamos nuevamente el correo de confirmación.',
      level: 'success',
    })
    setIsResendingConfirmation(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldError label="Correo" error={errors.email?.message}>
        <input
          type="email"
          autoComplete="email"
          {...register('email')}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
        />
      </FieldError>

      <FieldError label="Contraseña" error={errors.password?.message}>
        <input
          type="password"
          autoComplete="current-password"
          {...register('password')}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
        />
      </FieldError>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        Continuar
      </button>

      {emailPendingConfirmation ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs text-amber-900">
            Tu correo aún no está confirmado. Revisa tu bandeja de entrada o reenvía la confirmación.
          </p>
          <button
            type="button"
            onClick={() => {
              void handleResendConfirmation()
            }}
            disabled={isResendingConfirmation}
            className="mt-2 rounded-lg border border-amber-300 px-3 py-1 text-xs font-medium text-amber-900 disabled:opacity-60"
          >
            {isResendingConfirmation ? 'Reenviando...' : 'Reenviar correo de confirmación'}
          </button>
        </div>
      ) : null}
    </form>
  )
}

type RegisterFormProps = {
  onRegistered: () => void
}

function RegisterForm({ onRegistered }: RegisterFormProps) {
  const { addNotification } = useNotifications()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
        },
      },
    })

    if (error) {
      addNotification({
        title: 'Error al registrarse',
        message: error.message,
        level: 'warning',
      })
      return
    }

    addNotification({
      title: 'Cuenta creada',
      message: 'Registro exitoso. Revisa tu correo si la confirmación está habilitada.',
      level: 'success',
    })
    onRegistered()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldError label="Nombre completo" error={errors.fullName?.message}>
        <input
          type="text"
          autoComplete="name"
          {...register('fullName')}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
        />
      </FieldError>

      <FieldError label="Correo" error={errors.email?.message}>
        <input
          type="email"
          autoComplete="email"
          {...register('email')}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
        />
      </FieldError>

      <FieldError label="Contraseña" error={errors.password?.message}>
        <input
          type="password"
          autoComplete="new-password"
          {...register('password')}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
        />
      </FieldError>

      <FieldError label="Confirmar contraseña" error={errors.confirmPassword?.message}>
        <input
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword')}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
        />
      </FieldError>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        Crear cuenta
      </button>
    </form>
  )
}

type FieldErrorProps = {
  label: string
  error?: string
  children: ReactNode
}

function FieldError({ label, error, children }: FieldErrorProps) {
  return (
    <label className="block text-sm text-slate-700">
      <span>{label}</span>
      {children}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </label>
  )
}
