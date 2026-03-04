import type { ReactNode } from 'react'

type FieldErrorProps = {
  label: string
  error?: string
  children: ReactNode
}

export function FieldError({ label, error, children }: FieldErrorProps) {
  return (
    <label className="block text-sm text-slate-700">
      <span>{label}</span>
      {children}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </label>
  )
}
