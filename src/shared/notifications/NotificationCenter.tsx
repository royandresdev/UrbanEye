import { useMemo, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useNotifications } from './useNotifications'
import type { NotificationLevel } from './notificationsTypes'
import { FiBell } from 'react-icons/fi'

const levelBadgeClass: Record<NotificationLevel, string> = {
  info: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
}

const levelLabel: Record<NotificationLevel, string> = {
  info: 'Info',
  success: 'Éxito',
  warning: 'Alerta',
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, markAllAsRead, clearAll } = useNotifications()

  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (firstNotification, secondNotification) =>
          new Date(secondNotification.createdAt).getTime() -
          new Date(firstNotification.createdAt).getTime(),
      ),
    [notifications],
  )

  return (
    <>
      <button
        type="button"
        onClick={() => {
          const nextOpenValue = !isOpen
          setIsOpen(nextOpenValue)

          if (nextOpenValue) {
            markAllAsRead()
          }
        }}
        className="mr-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-field-bg-secondary text-fg-secondary"
        aria-label="Notificaciones"
      >
        <FiBell className="h-5 w-5" /> {unreadCount > 0 ? `(${unreadCount})` : ''}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-10 z-50 mt-2 w-80 max-w-[85vw] rounded-xl border border-field-border-primary bg-[#103721] p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-fg-primary">Centro de notificaciones</p>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-medium text-accent-500 underline"
            >
              Limpiar
            </button>
          </div>

          {sortedNotifications.length === 0 ? (
            <p className="text-sm text-fg-secondary">Sin notificaciones por ahora.</p>
          ) : (
            <ul className="max-h-72 space-y-2 overflow-y-auto">
              {sortedNotifications.map((notification) => (
                <li key={notification.id} className="rounded-lg border border-slate-200 p-2">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${levelBadgeClass[notification.level]}`}
                    >
                      {levelLabel[notification.level]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">{notification.message}</p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </>
  )
}
