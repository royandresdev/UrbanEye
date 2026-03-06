import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createReport, getReports, updateReportStatus, voteReport } from './reportsApi'

type QueryResult = {
  data: unknown
  error: { message: string } | null
}

const {
  getUserMock,
  fromMock,
  storageFromMock,
  reportsInsertMock,
  statusInsertMock,
  voteInsertMock,
  reportImagesInsertMock,
  uploadMock,
  getPublicUrlMock,
} = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  fromMock: vi.fn(),
  storageFromMock: vi.fn(),
  reportsInsertMock: vi.fn(),
  statusInsertMock: vi.fn(),
  voteInsertMock: vi.fn(),
  reportImagesInsertMock: vi.fn(),
  uploadMock: vi.fn(),
  getPublicUrlMock: vi.fn(),
}))

vi.mock('../../shared/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: getUserMock,
    },
    from: fromMock,
    storage: {
      from: storageFromMock,
    },
  },
}))

let reportsSelectResult: QueryResult
let statusSelectResult: QueryResult
let votesSelectResult: QueryResult
let reportImagesSelectResult: QueryResult
let insertReportResult: QueryResult
let insertStatusResult: { error: { message: string } | null }
let insertVoteResult: { error: { message: string } | null }
let insertReportImageResult: { error: { message: string } | null }

function setupFromMock() {
  fromMock.mockImplementation((table: string) => {
    if (table === 'reports') {
      return {
        select: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve(reportsSelectResult)),
        })),
        insert: vi.fn((payload: unknown) => {
          reportsInsertMock(payload)
          return {
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve(insertReportResult)),
            })),
          }
        }),
      }
    }

    if (table === 'report_status_history') {
      return {
        select: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve(statusSelectResult)),
        })),
        insert: vi.fn((payload: unknown) => {
          statusInsertMock(payload)
          return Promise.resolve(insertStatusResult)
        }),
      }
    }

    if (table === 'report_votes') {
      return {
        select: vi.fn(() => Promise.resolve(votesSelectResult)),
        insert: vi.fn((payload: unknown) => {
          voteInsertMock(payload)
          return Promise.resolve(insertVoteResult)
        }),
      }
    }

    if (table === 'report_images') {
      return {
        select: vi.fn(() => Promise.resolve(reportImagesSelectResult)),
        insert: vi.fn((payload: unknown) => {
          reportImagesInsertMock(payload)
          return Promise.resolve(insertReportImageResult)
        }),
      }
    }

    throw new Error(`Tabla no mockeada: ${table}`)
  })
}

function setupStorageMock() {
  storageFromMock.mockImplementation((bucketName: string) => {
    expect(bucketName).toBe('report-images')

    return {
      upload: uploadMock,
      getPublicUrl: getPublicUrlMock,
    }
  })
}

describe('reportsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    reportsSelectResult = { data: [], error: null }
    statusSelectResult = { data: [], error: null }
    votesSelectResult = { data: [], error: null }
    reportImagesSelectResult = { data: [], error: null }

    insertReportResult = {
      data: {
        id: 'report-1',
        category: 'bache',
        description: 'Bache frente al parque central',
        latitude: 19.4326,
        longitude: -99.1332,
        address: 'Lat 19.43260, Lng -99.13320',
        created_at: '2026-03-01T10:00:00.000Z',
      },
      error: null,
    }

    insertStatusResult = { error: null }
    insertVoteResult = { error: null }
    insertReportImageResult = { error: null }

    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
        },
      },
    })

    uploadMock.mockResolvedValue({ error: null })
    getPublicUrlMock.mockReturnValue({
      data: {
        publicUrl: 'https://cdn.urbaneye/report-1/photo.jpg',
      },
    })

    setupFromMock()
    setupStorageMock()
  })

  it('construye reportes con último estado y conteo de votos', async () => {
    reportsSelectResult = {
      data: [
        {
          id: 'r1',
          category: 'bache',
          description: 'Bache profundo',
          latitude: 19.4,
          longitude: -99.1,
          address: 'Zona Centro',
          created_at: '2026-03-01T12:00:00.000Z',
        },
        {
          id: 'r2',
          category: 'basura',
          description: 'Acumulación de basura',
          latitude: 19.41,
          longitude: -99.11,
          address: 'Zona Norte',
          created_at: '2026-03-01T11:00:00.000Z',
        },
      ],
      error: null,
    }

    statusSelectResult = {
      data: [
        { report_id: 'r1', status: 'en_proceso', created_at: '2026-03-02T10:00:00.000Z' },
        { report_id: 'r1', status: 'nuevo', created_at: '2026-03-01T10:00:00.000Z' },
        { report_id: 'r2', status: 'resuelto', created_at: '2026-03-02T09:00:00.000Z' },
      ],
      error: null,
    }

    votesSelectResult = {
      data: [{ report_id: 'r1' }, { report_id: 'r1' }, { report_id: 'r2' }],
      error: null,
    }

    reportImagesSelectResult = {
      data: [
        { report_id: 'r1', public_url: 'https://cdn.urbaneye/r1.jpg' },
        { report_id: 'r2', public_url: 'https://cdn.urbaneye/r2.jpg' },
      ],
      error: null,
    }

    const reports = await getReports()

    expect(reports).toEqual([
      {
        id: 'r1',
        category: 'bache',
        description: 'Bache profundo',
        status: 'en_proceso',
        latitude: 19.4,
        longitude: -99.1,
        address: 'Zona Centro',
        votes: 2,
        imageUrl: 'https://cdn.urbaneye/r1.jpg',
        hasUserVoted: false,
        createdAt: '2026-03-01T12:00:00.000Z',
      },
      {
        id: 'r2',
        category: 'basura',
        description: 'Acumulación de basura',
        status: 'resuelto',
        latitude: 19.41,
        longitude: -99.11,
        address: 'Zona Norte',
        votes: 1,
        imageUrl: 'https://cdn.urbaneye/r2.jpg',
        hasUserVoted: false,
        createdAt: '2026-03-01T11:00:00.000Z',
      },
    ])
  })

  it('crea reporte, sube imagen y guarda metadata', async () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000)

    const photoFile = new File(['mock-content'], 'Foto Árbol 1.JPG', {
      type: 'image/jpeg',
    })

    const created = await createReport({
      category: 'bache',
      description: 'Bache grande en avenida principal',
      latitude: 19.4326,
      longitude: -99.1332,
      photoFile,
    })

    expect(reportsInsertMock).toHaveBeenCalledWith({
      category: 'bache',
      description: 'Bache grande en avenida principal',
      latitude: 19.4326,
      longitude: -99.1332,
      address: 'Lat 19.43260, Lng -99.13320',
      user_id: 'user-1',
    })

    expect(statusInsertMock).toHaveBeenCalledWith({
      report_id: 'report-1',
      status: 'nuevo',
    })

    expect(uploadMock).toHaveBeenCalledWith(
      expect.stringMatching(/^report-1\/1700000000000-foto-.*-1.jpg$/),
      photoFile,
      expect.objectContaining({
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpeg',
      }),
    )

    expect(reportImagesInsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        report_id: 'report-1',
        user_id: 'user-1',
      }),
    )

    expect(created).toEqual({
      id: 'report-1',
      category: 'bache',
      description: 'Bache frente al parque central',
      status: 'nuevo',
      latitude: 19.4326,
      longitude: -99.1332,
      address: 'Lat 19.43260, Lng -99.13320',
      votes: 0,
      imageUrl: 'https://cdn.urbaneye/report-1/photo.jpg',
      hasUserVoted: false,
      createdAt: '2026-03-01T10:00:00.000Z',
    })

    nowSpy.mockRestore()
  })

  it('registra voto y devuelve reporte actualizado', async () => {
    reportsSelectResult = {
      data: [
        {
          id: 'r1',
          category: 'vandalismo',
          description: 'Daño en banca pública',
          latitude: 19.43,
          longitude: -99.12,
          address: 'Parque Sur',
          created_at: '2026-03-01T12:00:00.000Z',
        },
      ],
      error: null,
    }

    statusSelectResult = {
      data: [{ report_id: 'r1', status: 'en_revision', created_at: '2026-03-02T08:00:00.000Z' }],
      error: null,
    }

    votesSelectResult = {
      data: [{ report_id: 'r1' }, { report_id: 'r1' }, { report_id: 'r1' }],
      error: null,
    }

    reportImagesSelectResult = {
      data: [{ report_id: 'r1', public_url: 'https://cdn.urbaneye/r1.jpg' }],
      error: null,
    }

    const updatedReport = await voteReport({ reportId: 'r1' })

    expect(voteInsertMock).toHaveBeenCalledWith({
      report_id: 'r1',
      user_id: 'user-1',
    })

    expect(updatedReport).toEqual({
      id: 'r1',
      category: 'vandalismo',
      description: 'Daño en banca pública',
      status: 'en_revision',
      latitude: 19.43,
      longitude: -99.12,
      address: 'Parque Sur',
      votes: 3,
      imageUrl: 'https://cdn.urbaneye/r1.jpg',
      hasUserVoted: false,
      createdAt: '2026-03-01T12:00:00.000Z',
    })
  })

  it('lanza error si se actualiza estado de un reporte inexistente', async () => {
    reportsSelectResult = { data: [], error: null }
    statusSelectResult = { data: [], error: null }
    votesSelectResult = { data: [], error: null }
    reportImagesSelectResult = { data: [], error: null }

    await expect(
      updateReportStatus({
        reportId: 'no-existe',
        status: 'resuelto',
      }),
    ).rejects.toThrow('Reporte no encontrado')

    expect(statusInsertMock).toHaveBeenCalledWith({
      report_id: 'no-existe',
      status: 'resuelto',
    })
  })
})
