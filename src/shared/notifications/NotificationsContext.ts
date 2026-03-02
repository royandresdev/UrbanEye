import { createContext } from 'react'
import type { AppNotification, CreateNotificationInput } from './notificationsTypes'

export type NotificationsContextValue = {
  notifications: AppNotification[]
  unreadCount: number
  addNotification: (input: CreateNotificationInput) => void
  markAllAsRead: () => void
  clearAll: () => void
}

export const NotificationsContext = createContext<NotificationsContextValue | null>(null)
