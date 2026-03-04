import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">UrbanEye</h1>
        <p className="mt-2 text-sm text-slate-600">Reporta incidencias urbanas y da seguimiento en tiempo real.</p>
      </header>

      <section className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-base font-medium text-slate-900">Acciones rápidas</h2>
        <p className="text-sm text-slate-600">Inicia sesión, registra un reporte o revisa incidencias activas.</p>
        <Link
          to="/auth"
          className="inline-flex w-full justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Iniciar sesión
        </Link>
        <Link
          to="/reports/new"
          className="inline-flex w-full justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Crear reporte
        </Link>
        <Link
          to="/reports"
          className="inline-flex w-full justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Ver reportes
        </Link>
      </section>
    </main>
  )
}
