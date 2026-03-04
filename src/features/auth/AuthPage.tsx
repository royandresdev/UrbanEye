import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../shared/lib/supabase'
import { useNotifications } from '../../shared/notifications/useNotifications'
import { AuthModeSwitch } from './components/AuthModeSwitch'
import { AuthSessionActiveView } from './components/AuthSessionActiveView'
import { AuthSessionCheckingView } from './components/AuthSessionCheckingView'
import { LoginForm } from './components/LoginForm'
import { RegisterForm } from './components/RegisterForm'

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
    return <AuthSessionCheckingView />
  }

  if (session?.user) {
    return (
      <AuthSessionActiveView
        email={session.user.email}
        isSigningOut={isSigningOut}
        onSignOut={() => {
          void handleSignOut()
        }}
      />
    )
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Acceso a UrbanEye</h1>
        <p className="mt-2 text-sm text-slate-600">Inicia sesión o crea tu cuenta para reportar incidencias.</p>
      </header>

      <AuthModeSwitch mode={mode} onModeChange={setMode} />

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
