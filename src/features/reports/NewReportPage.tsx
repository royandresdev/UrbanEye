import 'leaflet/dist/leaflet.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { IconType } from 'react-icons'
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { FiArrowRight, FiCamera, FiCrosshair, FiMapPin, FiSun, FiTool, FiTrash2 } from 'react-icons/fi'
import { TbRoad } from 'react-icons/tb'
import { useEffect } from 'react'
import {
  type CreateReportFormInput,
  type CreateReportFormValues,
  createReportSchema,
} from './reportSchemas'
import { useCreateReport } from './useReports'
import { useNotifications } from '../../shared/notifications/useNotifications'
import NewReportPageHeader from './components/NewReportPageHeader'

const categoryOptions = [
  { value: 'bache', label: 'Bache', icon: TbRoad },
  { value: 'luminaria', label: 'Luminaria', icon: FiSun },
  { value: 'basura', label: 'Basura', icon: FiTrash2 },
  { value: 'vandalismo', label: 'Vandalismo', icon: FiTool },
] as const

const DEFAULT_LATITUDE = 19.432608
const DEFAULT_LONGITUDE = -99.133209

export function NewReportPage() {
  const [geoError, setGeoError] = useState<string | null>(null)
  const navigate = useNavigate()
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
      latitude: DEFAULT_LATITUDE,
      longitude: DEFAULT_LONGITUDE,
    },
  })

  const selectedCategory = useWatch({
    control,
    name: 'category',
  })

  const photoFileList = useWatch({
    control,
    name: 'photo',
  })

  const latitude = useWatch({
    control,
    name: 'latitude',
  })

  const longitude = useWatch({
    control,
    name: 'longitude',
  })

  const selectedPhotoName = photoFileList?.[0]?.name ?? ''
  const currentLatitude = typeof latitude === 'number' ? latitude : DEFAULT_LATITUDE
  const currentLongitude = typeof longitude === 'number' ? longitude : DEFAULT_LONGITUDE

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
      message: 'Tu incidencia fue registrada con estado Nuevo.',
      level: 'success',
    })

    navigate('/reports')
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-base py-6 text-fg-primary">
      <NewReportPageHeader />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 px-4">
        <input type="hidden" {...register('category')} />
        <input type="hidden" {...register('latitude', { valueAsNumber: true })} />
        <input type="hidden" {...register('longitude', { valueAsNumber: true })} />

        <section>
          <h2 className="mb-4 text-lg font-semibold">Selecciona la Categoría</h2>
          <div className="grid grid-cols-2 gap-3">
            {categoryOptions.map((option) => (
              <CategoryButton
                key={option.value}
                label={option.label}
                icon={option.icon}
                isActive={selectedCategory === option.value}
                onClick={() => {
                  setValue('category', option.value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }}
              />
            ))}
          </div>
          {errors.category?.message ? <p className="mt-2 text-xs text-error">{errors.category.message}</p> : null}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Añadir Foto</h2>
          <label
            htmlFor="report-photo"
            className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-accent-500/60 bg-field-bg-primary text-accent-500"
          >
            <FiCamera className="h-9 w-9" />
          </label>
          <input
            id="report-photo"
            type="file"
            accept="image/*"
            capture="environment"
            {...register('photo')}
            className="sr-only"
          />
          {selectedPhotoName ? <p className="mt-2 text-xs text-fg-secondary">{selectedPhotoName}</p> : null}
          {errors.photo?.message ? <p className="mt-2 text-xs text-error">{errors.photo.message.toString()}</p> : null}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Descripción</h2>
          <textarea
            {...register('description')}
            rows={4}
            placeholder="Describe el problema en detalle..."
            className="input-secondary h-32 resize-none p-4 text-fg-primary placeholder:text-fg-secondary"
          />
          {errors.description?.message ? <p className="mt-2 text-xs text-error">{errors.description.message}</p> : null}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Ubicación</h2>
            <button
              type="button"
              onClick={onUseCurrentLocation}
              className="inline-flex items-center gap-1 text-sm font-semibold text-accent-500"
            >
              <FiCrosshair className="h-4 w-4" />
              GPS Actual
            </button>

          </div>

          <div className="relative overflow-hidden rounded-2xl border border-field-border-secondary bg-field-bg-secondary">
            <div className="h-52">
              <MapContainer center={[currentLatitude, currentLongitude]} zoom={16} className="h-full w-full">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapLocationPicker
                  latitude={currentLatitude}
                  longitude={currentLongitude}
                  onSelect={(nextLatitude, nextLongitude) => {
                    setValue('latitude', Number(nextLatitude.toFixed(6)), {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                    setValue('longitude', Number(nextLongitude.toFixed(6)), {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }}
                />
                <CircleMarker
                  center={[currentLatitude, currentLongitude]}
                  radius={10}
                  pathOptions={{ color: '#1ce57b', fillOpacity: 0.9 }}
                />
              </MapContainer>
            </div>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-500/90 text-brand-950 shadow-md">
                <FiMapPin className="h-5 w-5" />
              </div>
            </div>
          </div>

          <p className="mt-2 text-xs text-fg-secondary">Calle Principal 245, Área Metropolitana</p>
          <p className="mt-1 text-xs text-fg-muted">
            Lat: {typeof latitude === 'number' ? latitude.toFixed(6) : DEFAULT_LATITUDE.toFixed(6)} · Lng:{' '}
            {typeof longitude === 'number' ? longitude.toFixed(6) : DEFAULT_LONGITUDE.toFixed(6)}
          </p>

          {geoError ? <p className="mt-2 text-xs text-error">{geoError}</p> : null}
          {errors.latitude?.message ? <p className="mt-2 text-xs text-error">{errors.latitude.message}</p> : null}
          {errors.longitude?.message ? <p className="mt-1 text-xs text-error">{errors.longitude.message}</p> : null}
        </section>

        <button
          type="submit"
          disabled={isSubmitting || createReportMutation.isPending}
          className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-xl py-4 text-brand-950 disabled:opacity-60"
        >
          {createReportMutation.isPending ? 'Publicando...' : 'Continuar a Revisión'}
          <FiArrowRight className="h-6 w-6" />
        </button>

        {isSubmitSuccessful ? (
          <p className="text-center text-sm text-fg-secondary">Reporte publicado correctamente.</p>
        ) : null}
      </form>
    </main>
  )
}

type CategoryButtonProps = {
  label: string
  icon: IconType
  isActive: boolean
  onClick: () => void
}

function CategoryButton({ label, icon: Icon, isActive, onClick }: CategoryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-md border px-4 py-3 text-left text-sm text-base font-medium transition ${isActive
        ? 'border-accent-500 bg-field-bg-primary text-fg-primary'
        : 'border-transparent bg-field-bg-secondary text-fg-primary hover:border-accent-500/40'
        }`}
    >
      <Icon className={`h-5 w-5 ${isActive ? 'text-accent-500' : 'text-fg-secondary'}`} />
      <span>{label}</span>
    </button>
  )
}

type MapLocationPickerProps = {
  latitude: number
  longitude: number
  onSelect: (latitude: number, longitude: number) => void
}

function MapLocationPicker({ latitude, longitude, onSelect }: MapLocationPickerProps) {
  const map = useMap()

  useEffect(() => {
    map.setView([latitude, longitude])
  }, [map, latitude, longitude])

  useMapEvents({
    click: (event) => {
      onSelect(event.latlng.lat, event.latlng.lng)
    },
  })

  return null
}
