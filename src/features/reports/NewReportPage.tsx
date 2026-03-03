import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  type CreateReportFormInput,
  type CreateReportFormValues,
  createReportSchema,
} from './reportSchemas'
import { useCreateReport } from './useReports'
import { NotificationCenter } from '../../shared/notifications/NotificationCenter'
import { useNotifications } from '../../shared/notifications/useNotifications'

const categoryOptions = [
  { value: 'bache', label: 'Bache' },
  { value: 'luminaria', label: 'Luminaria apagada' },
  { value: 'basura', label: 'Basura acumulada' },
  { value: 'vandalismo', label: 'Vandalismo' },
] as const

export function NewReportPage() {
  const [geoError, setGeoError] = useState<string | null>(null)
  const { addNotification } = useNotifications()
  const createReportMutation = useCreateReport()
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<CreateReportFormInput, unknown, CreateReportFormValues>({
    resolver: zodResolver(createReportSchema),
    defaultValues: {
      category: 'bache',
      description: '',
      latitude: undefined,
      longitude: undefined,
    },
  })

  const photoFileList = useWatch({
    control,
    name: 'photo',
  })
  const selectedPhotoName = photoFileList?.[0]?.name ?? ''

  const onUseCurrentLocation = () => {
    setGeoError(null)

    if (!navigator.geolocation) {
      setGeoError('Tu dispositivo no soporta geolocalización')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('latitude', Number(position.coords.latitude.toFixed(6)), {
          shouldValidate: true,
          shouldDirty: true,
        })
        setValue('longitude', Number(position.coords.longitude.toFixed(6)), {
          shouldValidate: true,
          shouldDirty: true,
        })
      },
      () => {
        setGeoError('No fue posible obtener tu ubicación')
      },
      {
        enableHighAccuracy: true,
        timeout: 12_000,
      },
    )
  }

  const onSubmit = async (values: CreateReportFormValues) => {
    const photoFile = values.photo.item(0)

    if (!photoFile) {
      addNotification({
        title: 'Foto requerida',
        message: 'Selecciona una foto para crear el reporte.',
        level: 'warning',
      })
      return
    }

    await createReportMutation.mutateAsync({
      category: values.category,
      description: values.description,
      latitude: values.latitude,
      longitude: values.longitude,
      photoFile,
    })

    addNotification({
      title: 'Reporte recibido',
      message: 'Tu incidencia fue registrada en Supabase con estado Nuevo.',
      level: 'success',
    })
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 py-6">
      <header className="mb-6">
        <p className="text-sm text-slate-600">Fase 1 · Paso 2</p>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">Crear reporte</h1>
          <NotificationCenter />
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Registra una incidencia con foto, categoría y ubicación.
        </p>
      </header>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldError label="Categoría" error={errors.category?.message}>
            <select
              {...register('category')}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FieldError>

          <FieldError label="Descripción" error={errors.description?.message}>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Ejemplo: Hay un bache grande frente al parque..."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            />
          </FieldError>

          <FieldError label="Foto" error={errors.photo?.message?.toString()}>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              {...register('photo')}
              className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
            />
            {selectedPhotoName ? <p className="mt-1 text-xs text-slate-600">{selectedPhotoName}</p> : null}
          </FieldError>

          <div className="space-y-2 rounded-lg border border-slate-200 p-3">
            <p className="text-sm font-medium text-slate-900">Ubicación</p>
            <button
              type="button"
              onClick={onUseCurrentLocation}
              className="inline-flex rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
            >
              Usar mi ubicación actual
            </button>
            {geoError ? <p className="text-xs text-red-600">{geoError}</p> : null}

            <div className="grid grid-cols-2 gap-3">
              <FieldError label="Latitud" error={errors.latitude?.message}>
                <input
                  type="number"
                  step="0.000001"
                  {...register('latitude')}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                />
              </FieldError>

              <FieldError label="Longitud" error={errors.longitude?.message}>
                <input
                  type="number"
                  step="0.000001"
                  {...register('longitude')}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                />
              </FieldError>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || createReportMutation.isPending}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {createReportMutation.isPending ? 'Publicando...' : 'Publicar reporte'}
          </button>

          {isSubmitSuccessful ? (
            <p className="text-sm text-slate-700">Reporte publicado correctamente en backend.</p>
          ) : null}
        </form>
      </section>

      <p className="mt-4 text-center text-sm text-slate-600">
        <Link to="/reports" className="font-medium text-slate-900 underline">
          Ver lista y mapa
        </Link>
        <span className="mx-2 text-slate-400">·</span>
        <Link to="/" className="font-medium text-slate-900 underline">
          Volver al inicio
        </Link>
      </p>
    </main>
  )
}

type FieldErrorProps = {
  label: string
  error?: string
  children: ReactNode
}

function FieldError({ label, error, children }: FieldErrorProps) {
  return (
    <label className="block text-sm text-slate-700">
      <span>{label}</span>
      {children}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </label>
  )
}
