import { useOnlineStatus } from './useOnlineStatus'

export function OfflineBanner() {
  const isOnline = useOnlineStatus()

  if (isOnline) {
    return null
  }

  return (
    <div className="sticky top-0 z-[1200] border-b border-amber-300 bg-amber-100 px-3 py-2 text-center text-xs font-medium text-amber-900">
      Sin conexión. Puedes navegar con datos en caché; los cambios se sincronizarán al reconectar.
    </div>
  )
}
