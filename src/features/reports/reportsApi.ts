import type { ReportItem } from './reportsTypes'
import { supabase } from '../../shared/lib/supabase'

export type UserRole = 'ciudadano' | 'autoridad'

type ReportRow = {
  id: string
  category: ReportItem['category']
  description: string
  latitude: number
  longitude: number
  address: string
  created_at: string
}

type ReportStatusHistoryRow = {
  report_id: string
  status: ReportItem['status']
  created_at: string
}

type ReportVoteRow = {
  report_id: string
  user_id: string | null
}

type CreateReportInput = {
  category: ReportItem['category']
  description: string
  latitude: number
  longitude: number
  photoFile: File
}

const REPORT_IMAGES_BUCKET = 'report-images'

function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize('NFD')
    .replace(/[^\w.-]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}

function buildReportItems(
  reportRows: ReportRow[],
  statusHistoryRows: ReportStatusHistoryRow[],
  voteRows: ReportVoteRow[],
  currentUserId: string | null,
): ReportItem[] {
  const latestStatusByReport = new Map<string, ReportItem['status']>()

  for (const statusRow of statusHistoryRows) {
    if (!latestStatusByReport.has(statusRow.report_id)) {
      latestStatusByReport.set(statusRow.report_id, statusRow.status)
    }
  }

  const voteCountByReport = voteRows.reduce<Record<string, number>>((accumulator, voteRow) => {
    accumulator[voteRow.report_id] = (accumulator[voteRow.report_id] ?? 0) + 1
    return accumulator
  }, {})

  return reportRows.map((reportRow) => ({
    id: reportRow.id,
    category: reportRow.category,
    description: reportRow.description,
    status: latestStatusByReport.get(reportRow.id) ?? 'nuevo',
    latitude: reportRow.latitude,
    longitude: reportRow.longitude,
    address: reportRow.address,
    votes: voteCountByReport[reportRow.id] ?? 0,
    hasUserVoted: voteRows.some(
      (voteRow) => voteRow.report_id === reportRow.id && voteRow.user_id === currentUserId,
    ),
    createdAt: reportRow.created_at,
  }))
}

export async function createReport(input: CreateReportInput): Promise<ReportItem> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const address = `Lat ${input.latitude.toFixed(5)}, Lng ${input.longitude.toFixed(5)}`

  const reportPayload: {
    category: ReportItem['category']
    description: string
    latitude: number
    longitude: number
    address: string
    user_id?: string
  } = {
    category: input.category,
    description: input.description,
    latitude: input.latitude,
    longitude: input.longitude,
    address,
  }

  if (user?.id) {
    reportPayload.user_id = user.id
  }

  const { data: insertedReport, error: insertReportError } = await supabase
    .from('reports')
    .insert(reportPayload)
    .select('id, category, description, latitude, longitude, address, created_at')
    .single<ReportRow>()

  if (insertReportError || !insertedReport) {
    throw new Error(
      `No se pudo crear el reporte: ${insertReportError?.message ?? 'Error desconocido'}`,
    )
  }

  const { error: insertStatusError } = await supabase.from('report_status_history').insert({
    report_id: insertedReport.id,
    status: 'nuevo',
  })

  if (insertStatusError) {
    throw new Error(`Reporte creado, pero falló estado inicial: ${insertStatusError.message}`)
  }

  const fileExtension = input.photoFile.name.split('.').pop() ?? 'jpg'
  const safeName = sanitizeFileName(input.photoFile.name)
  const filePath = `${insertedReport.id}/${Date.now()}-${safeName || `photo.${fileExtension}`}`

  const { error: uploadError } = await supabase.storage
    .from(REPORT_IMAGES_BUCKET)
    .upload(filePath, input.photoFile, {
      cacheControl: '3600',
      upsert: false,
      contentType: input.photoFile.type || 'image/jpeg',
    })

  if (uploadError) {
    throw new Error(`Reporte creado, pero falló la subida de imagen: ${uploadError.message}`)
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(REPORT_IMAGES_BUCKET).getPublicUrl(filePath)

  const reportImagePayload: {
    report_id: string
    user_id?: string
    storage_path: string
    public_url: string
  } = {
    report_id: insertedReport.id,
    storage_path: filePath,
    public_url: publicUrl,
  }

  if (user?.id) {
    reportImagePayload.user_id = user.id
  }

  await supabase.from('report_images').insert(reportImagePayload)

  return {
    id: insertedReport.id,
    category: insertedReport.category,
    description: insertedReport.description,
    status: 'nuevo',
    latitude: insertedReport.latitude,
    longitude: insertedReport.longitude,
    address: insertedReport.address,
    votes: 0,
    hasUserVoted: false,
    createdAt: insertedReport.created_at,
  }
}

export async function getReports(): Promise<ReportItem[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [
    { data: reportRows, error: reportsError },
    { data: statusHistoryRows, error: statusError },
    { data: voteRows, error: votesError },
  ] = await Promise.all([
    supabase
      .from('reports')
      .select('id, category, description, latitude, longitude, address, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('report_status_history')
      .select('report_id, status, created_at')
      .order('created_at', { ascending: false }),
    supabase.from('report_votes').select('report_id, user_id'),
  ])

  if (reportsError) {
    throw new Error(`No se pudieron cargar los reportes: ${reportsError.message}`)
  }

  if (statusError) {
    throw new Error(`No se pudo cargar el historial de estados: ${statusError.message}`)
  }

  if (votesError) {
    throw new Error(`No se pudo cargar la votación de reportes: ${votesError.message}`)
  }

  return buildReportItems(
    reportRows ?? [],
    statusHistoryRows ?? [],
    voteRows ?? [],
    user?.id ?? null,
  )
}

type UpdateReportStatusInput = {
  reportId: string
  status: ReportItem['status']
}

export async function updateReportStatus({
  reportId,
  status,
}: UpdateReportStatusInput): Promise<ReportItem> {
  const { error } = await supabase.from('report_status_history').insert({
    report_id: reportId,
    status,
  })

  if (error) {
    throw new Error(`No se pudo actualizar el estado: ${error.message}`)
  }

  const reports = await getReports()
  const updatedReport = reports.find((report) => report.id === reportId)

  if (!updatedReport) {
    throw new Error('Reporte no encontrado')
  }

  return updatedReport
}

type VoteReportInput = {
  reportId: string
}

export async function getCurrentUserRole(): Promise<UserRole> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id) {
    return 'ciudadano'
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle<{ role: UserRole }>()

  if (error || !data?.role) {
    return 'ciudadano'
  }

  return data.role
}

export async function voteReport({ reportId }: VoteReportInput): Promise<ReportItem> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const votePayload: { report_id: string; user_id?: string } = { report_id: reportId }
  if (user?.id) {
    votePayload.user_id = user.id
  }

  const { error } = await supabase.from('report_votes').insert(votePayload)

  if (error) {
    throw new Error(`No se pudo registrar el voto: ${error.message}`)
  }

  const reports = await getReports()
  const updatedReport = reports.find((report) => report.id === reportId)

  if (!updatedReport) {
    throw new Error('Reporte no encontrado')
  }

  return updatedReport
}
