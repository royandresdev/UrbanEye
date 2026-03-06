import type { z } from 'zod'
import { reportCategorySchema } from './reportSchemas'

export type ReportCategory = z.infer<typeof reportCategorySchema>
export type ReportStatus = 'nuevo' | 'en_revision' | 'en_proceso' | 'resuelto'

export type ReportItem = {
  id: string
  category: ReportCategory
  description: string
  status: ReportStatus
  latitude: number
  longitude: number
  address: string
  votes: number
  imageUrl?: string | null
  hasUserVoted?: boolean
  createdAt: string
}
