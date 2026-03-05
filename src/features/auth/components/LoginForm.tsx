import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type LoginFormValues, loginSchema } from '../authSchemas'
import { supabase } from '../../../shared/lib/supabase'
import { useNotifications } from '../../../shared/notifications/useNotifications'
import { FieldError } from './FieldError'

export function LoginForm() {
  const navigate = useNavigate()
  const { addNotification } = useNotifications()
  const [emailPendingConfirmation, setEmailPendingConfirmation] = useState<string | null>(null)
  const [isResendingConfirmation, setIsResendingConfirmation] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setEmailPendingConfirmation(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      const unconfirmedEmail = error.message.toLowerCase().includes('email not confirmed')

      if (unconfirmedEmail) {
        setEmailPendingConfirmation(values.email)
        addNotification({
          title: 'Correo sin confirmar',
          message: 'Revisa tu bandeja de entrada y confirma tu cuenta para iniciar sesión.',
          level: 'warning',
        })
        return
      }

      addNotification({
        title: 'Error al iniciar sesión',
        message: error.message,
        level: 'warning',
      })
      return
    }

    addNotification({
      title: 'Bienvenido',
      message: 'Inicio de sesión correcto.',
      level: 'success',
    })

    navigate('/')
  }

  const handleResendConfirmation = async () => {
    if (!emailPendingConfirmation) {
      return
    }

    setIsResendingConfirmation(true)

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: emailPendingConfirmation,
    })

    if (error) {
      addNotification({
        title: 'No se pudo reenviar',
        message: error.message,
        level: 'warning',
      })
      setIsResendingConfirmation(false)
      return
    }

    addNotification({
      title: 'Correo reenviado',
      message: 'Te enviamos nuevamente el correo de confirmación.',
      level: 'success',
    })
    setIsResendingConfirmation(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldError label="Correo Electrónico" error={errors.email?.message}>
        <input
          type="email"
          autoComplete="email"
          placeholder='ejemplo@correo.com'
          {...register('email')}
          className="input-secondary"
        />
      </FieldError>

      <FieldError label="Contraseña" error={errors.password?.message}>
        <input
          type="password"
          autoComplete="current-password"
          placeholder='Ingresa tu contraseña'
          {...register('password')}
          className="input-secondary"
        />
      </FieldError>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-4 btn-primary"
      >
        Iniciar Sesión
      </button>

      {emailPendingConfirmation ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs text-amber-900">
            Tu correo aún no está confirmado. Revisa tu bandeja de entrada o reenvía la confirmación.
          </p>
          <button
            type="button"
            onClick={() => {
              void handleResendConfirmation()
            }}
            disabled={isResendingConfirmation}
            className="mt-2 rounded-lg border border-amber-300 px-3 py-1 text-xs font-medium text-amber-900 disabled:opacity-60"
          >
            {isResendingConfirmation ? 'Reenviando...' : 'Reenviar correo de confirmación'}
          </button>
        </div>
      ) : null}
    </form>
  )
}
