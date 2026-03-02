import { useMemo, useState, type PropsWithChildren } from 'react'
import type { AppNotification, CreateNotificationInput } from './notificationsTypes'
import { NotificationsContext } from './NotificationsContext'

type NotificationsProviderProps = PropsWithChildren

export function NotificationsProvider({ children }: NotificationsProviderProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  const addNotification = ({ title, message, level = 'info' }: CreateNotificationInput) => {
    setNotifications((currentNotifications) => [
      {
        id: crypto.randomUUID(),
        title,
        message,
        level,
        createdAt: new Date().toISOString(),
        read: false,
      },
      ...currentNotifications,
    ])
  }

  const markAllAsRead = () => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    )
  }

  const clearAll = () => {
    setNotifications([])
  }

  const value = useMemo(
    () => ({
      notifications,
      unreadCount: notifications.filter((notification) => !notification.read).length,
      addNotification,
      markAllAsRead,
      clearAll,
    }),
    [notifications],
  )

  return <NotificationsContext value={value}>{children}</NotificationsContext>
}
