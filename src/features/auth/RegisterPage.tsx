import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../shared/lib/supabase'
import { useNotifications } from '../../shared/notifications/useNotifications'
import { AuthSessionActiveView } from './components/AuthSessionActiveView'
import { AuthSessionCheckingView } from './components/AuthSessionCheckingView'
import { RegisterForm } from './components/RegisterForm'

export function RegisterPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { addNotification } = useNotifications()
  const navigate = useNavigate()

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

      <h1 className="mb-2 text-3xl font-bold text-fg-primary">Crear cuenta</h1>
      <p className="mb-6 text-fg-secondary">Regístrate para comenzar a reportar incidencias urbanas.</p>

      <RegisterForm
        onRegistered={() => {
          navigate('/auth')
        }}
      />

      <p className="mt-10 text-center text-fg-secondary">
        ¿Ya tienes una cuenta?
        <Link to="/auth" className="ml-1 font-medium text-accent-500">
          Iniciar sesión
        </Link>
      </p>
    </main>
  )
}
