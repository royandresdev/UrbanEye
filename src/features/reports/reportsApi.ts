import type { ReportItem } from './reportsTypes'

const mockReports: ReportItem[] = [
  {
    id: 'rpt-001',
    category: 'bache',
    description: 'Bache profundo en carril derecho, peligroso para motos.',
    status: 'nuevo',
    latitude: 19.432608,
    longitude: -99.133209,
    address: 'Av. Juárez, Centro',
    votes: 12,
    createdAt: '2026-03-01T10:30:00Z',
  },
  {
    id: 'rpt-002',
    category: 'luminaria',
    description: 'Luminaria apagada desde hace 4 noches frente a la escuela.',
    status: 'en_revision',
    latitude: 19.42681,
    longitude: -99.16767,
    address: 'Col. Roma Norte',
    votes: 21,
    createdAt: '2026-03-01T22:10:00Z',
  },
  {
    id: 'rpt-003',
    category: 'basura',
    description: 'Acumulación de bolsas en esquina, hay malos olores.',
    status: 'en_proceso',
    latitude: 19.44023,
    longitude: -99.14588,
    address: 'Eje Central, Doctores',
    votes: 9,
    createdAt: '2026-03-02T08:05:00Z',
  },
  {
    id: 'rpt-004',
    category: 'vandalismo',
    description: 'Pared con grafiti ofensivo y daños en señalética urbana.',
    status: 'resuelto',
    latitude: 19.4183,
    longitude: -99.1564,
    address: 'Col. Del Valle Centro',
    votes: 6,
    createdAt: '2026-02-28T19:45:00Z',
  },
]

export async function getReports(): Promise<ReportItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return [...mockReports]
}

type UpdateReportStatusInput = {
  reportId: string
  status: ReportItem['status']
}

export async function updateReportStatus({
  reportId,
  status,
}: UpdateReportStatusInput): Promise<ReportItem> {
  await new Promise((resolve) => setTimeout(resolve, 250))

  const reportIndex = mockReports.findIndex((report) => report.id === reportId)

  if (reportIndex < 0) {
    throw new Error('Reporte no encontrado')
  }

  const updatedReport: ReportItem = {
    ...mockReports[reportIndex],
    status,
  }

  mockReports[reportIndex] = updatedReport

  return updatedReport
}

type VoteReportInput = {
  reportId: string
}

export async function voteReport({ reportId }: VoteReportInput): Promise<ReportItem> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const reportIndex = mockReports.findIndex((report) => report.id === reportId)

  if (reportIndex < 0) {
    throw new Error('Reporte no encontrado')
  }

  const updatedReport: ReportItem = {
    ...mockReports[reportIndex],
    votes: mockReports[reportIndex].votes + 1,
  }

  mockReports[reportIndex] = updatedReport

  return updatedReport
}
