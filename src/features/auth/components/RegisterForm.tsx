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
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
        />
      </FieldError>

      <FieldError label="Correo" error={errors.email?.message}>
        <input
          type="email"
          autoComplete="email"
          {...register('email')}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
        />
      </FieldError>

      <FieldError label="Contraseña" error={errors.password?.message}>
        <input
          type="password"
          autoComplete="new-password"
          {...register('password')}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
        />
      </FieldError>

      <FieldError label="Confirmar contraseña" error={errors.confirmPassword?.message}>
        <input
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword')}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
        />
      </FieldError>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        Crear cuenta
      </button>
    </form>
  )
}
