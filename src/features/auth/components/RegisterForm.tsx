import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type RegisterFormValues, registerSchema } from '../authSchemas'
import { supabase } from '../../../shared/lib/supabase'
import { useNotifications } from '../../../shared/notifications/useNotifications'
import { FieldError } from './FieldError'

type RegisterFormProps = {
  onRegistered: () => void
}

export function RegisterForm({ onRegistered }: RegisterFormProps) {
  const { addNotification } = useNotifications()
  const [registrationHelpMessage, setRegistrationHelpMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setRegistrationHelpMessage(null)

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
        },
      },
    })

    if (error) {
      const maybeCode = (error as { code?: string }).code?.toLowerCase()
      const message = error.message.toLowerCase()

      if (maybeCode === 'email_address_invalid' || message.includes('email address') || message.includes('invalid')) {
        setRegistrationHelpMessage(
          'El correo ingresado no es aceptado por el servicio de autenticación. Usa un correo real y prueba con otro dominio (por ejemplo gmail.com u outlook.com).',
        )
      }

      addNotification({
        title: 'Error al registrarse',
        message: error.message,
        level: 'warning',
      })
      return
    }

    addNotification({
      title: 'Cuenta creada',
      message: 'Registro exitoso. Revisa tu correo si la confirmación está habilitada.',
      level: 'success',
    })
    onRegistered()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldError label="Nombre completo" error={errors.fullName?.message}>
        <input
          type="text"
          autoComplete="name"
          {...register('fullName')}
          className="input-secondary"
        />
      </FieldError>

      <FieldError label="Correo" error={errors.email?.message}>
        <input
          type="email"
          autoComplete="email"
          {...register('email')}
          className="input-secondary"
        />
      </FieldError>

      <FieldError label="Contraseña" error={errors.password?.message}>
        <input
          type="password"
          autoComplete="new-password"
          {...register('password')}
          className="input-secondary"
        />
      </FieldError>

      <FieldError label="Confirmar contraseña" error={errors.confirmPassword?.message}>
        <input
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword')}
          className="input-secondary"
        />
      </FieldError>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 w-full btn-primary"
      >
        Crear cuenta
      </button>

      {registrationHelpMessage ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
          <p className="text-xs text-amber-900">{registrationHelpMessage}</p>
        </div>
      ) : null}
    </form>
  )
}
