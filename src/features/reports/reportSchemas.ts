import { z } from 'zod'

export const reportCategorySchema = z.enum(['bache', 'luminaria', 'basura', 'vandalismo'])

export const createReportSchema = z.object({
  category: reportCategorySchema,
  description: z
    .string()
    .min(10, 'Describe el problema con al menos 10 caracteres')
    .max(500, 'La descripción no puede superar 500 caracteres'),
  photo: z
    .custom<FileList>((value) => value instanceof FileList && value.length > 0)
    .refine((value) => value instanceof FileList && value.length > 0, 'Debes adjuntar una foto'),
  latitude: z.coerce
    .number({ message: 'Ingresa una latitud válida' })
    .min(-90, 'La latitud debe estar entre -90 y 90')
    .max(90, 'La latitud debe estar entre -90 y 90'),
  longitude: z.coerce
    .number({ message: 'Ingresa una longitud válida' })
    .min(-180, 'La longitud debe estar entre -180 y 180')
    .max(180, 'La longitud debe estar entre -180 y 180'),
})

export type CreateReportFormInput = z.input<typeof createReportSchema>
export type CreateReportFormValues = z.output<typeof createReportSchema>
