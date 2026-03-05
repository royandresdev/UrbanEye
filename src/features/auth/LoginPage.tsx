import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../shared/lib/supabase'
import { useNotifications } from '../../shared/notifications/useNotifications'
import { AuthSessionActiveView } from './components/AuthSessionActiveView'
import { AuthSessionCheckingView } from './components/AuthSessionCheckingView'
import { LoginForm } from './components/LoginForm'

export function LoginPage() {
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
    <main className="mx-auto min-h-screen w-full max-w-md px-6 py-6 bg-base">
      <header className="mb-6">
        <p className="text-xl font-semibold text-fg-primary text-center">URBANEYE</p>
      </header>

      <div className="mb-6 aspect-video w-full rounded-md bg-fg-primary">
        <img src="/lima.jpg" alt="Vista de la ciudad de Lima" className="h-full w-full rounded-md object-cover" />
      </div>
      <h1 className="mb-2 text-3xl font-bold text-fg-primary">Mejora tu ciudad</h1>
      <p className="mb-6 text-fg-secondary">
        Inicie sesión para informar problemas de infraestructura y realizar un seguimiento del progreso en
        tiempo real.
      </p>
      <LoginForm />

      <p className="mt-10 text-center text-fg-secondary">
        ¿No tienes un cuenta?
        <Link to="/auth/signup" className="ml-1 font-medium text-accent-500">
          Crear cuenta
        </Link>
      </p>
    </main>
  )
}
