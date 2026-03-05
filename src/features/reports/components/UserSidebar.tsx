import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiLogOut, FiUser, FiX } from 'react-icons/fi'
import { supabase } from '../../../shared/lib/supabase'
import { useNotifications } from '../../../shared/notifications/useNotifications'

type UserSidebarProps = {
  isOpen: boolean
  onClose: () => void
  roleLabel: string
}

export function UserSidebar({ isOpen, onClose, roleLabel }: UserSidebarProps) {
  const [userEmail, setUserEmail] = useState('Sin correo')
  const [isSigningOut, setIsSigningOut] = useState(false)
  const navigate = useNavigate()
  const { addNotification } = useNotifications()

  useEffect(() => {
    if (!isOpen) {
      return
    }

    let isMounted = true

    void supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) {
        return
      }

      setUserEmail(data.user?.email ?? 'Sin correo')
    })

    return () => {
      isMounted = false
    }
  }, [isOpen])

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
    onClose()
    navigate('/auth', { replace: true })
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        type="button"
        onClick={onClose}
        className="h-full flex-1 bg-brand-950/70"
        aria-label="Cerrar menú lateral"
      />

      <aside className="h-full w-72 border-l border-field-border-secondary bg-base p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-fg-primary">Usuario</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-field-bg-secondary text-fg-secondary"
            aria-label="Cerrar sidebar"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-field-border-secondary bg-field-bg-secondary p-3">
          <p className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-fg-primary">
            <FiUser className="h-4 w-4 text-accent-500" />
            {roleLabel}
          </p>
          <p className="break-all text-xs text-fg-secondary">{userEmail}</p>
        </div>

        <button
          type="button"
          onClick={() => {
            void handleSignOut()
          }}
          disabled={isSigningOut}
          className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm text-brand-950 disabled:opacity-60"
        >
          <FiLogOut className="h-4 w-4" />
          {isSigningOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
        </button>
      </aside>
    </div>
  )
}
