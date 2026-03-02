export type NotificationLevel = 'info' | 'success' | 'warning'

export type AppNotification = {
  id: string
  title: string
  message: string
  level: NotificationLevel
  createdAt: string
  read: boolean
}

export type CreateNotificationInput = {
  title: string
  message: string
  level?: NotificationLevel
}
