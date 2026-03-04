import { Link } from 'react-router-dom'

type AuthSessionActiveViewProps = {
  email?: string
  isSigningOut: boolean
  onSignOut: () => void
}

export function AuthSessionActiveView({ email, isSigningOut, onSignOut }: AuthSessionActiveViewProps) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Sesión activa</h1>
        <p className="mt-2 text-sm text-slate-600">Has iniciado sesión en UrbanEye.</p>
      </header>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-700">
          Usuario: <span className="font-medium text-slate-900">{email}</span>
        </p>

        <button
          type="button"
          onClick={onSignOut}
          disabled={isSigningOut}
          className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          Cerrar sesión
        </button>
      </section>

      <p className="mt-4 text-center text-sm text-slate-600">
        <Link to="/" className="font-medium text-slate-900 underline">
          Volver al inicio
        </Link>
      </p>
    </main>
  )
}
