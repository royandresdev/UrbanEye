import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 py-6">
      <header className="mb-6">
        <p className="text-sm text-slate-600">Fase 1</p>
        <h1 className="text-2xl font-semibold text-slate-900">UrbanEye</h1>
      </header>

      <section className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-base font-medium text-slate-900">MVP en progreso</h2>
        <p className="text-sm text-slate-600">Avanza por pasos del módulo inicial.</p>
        <Link
          to="/auth"
          className="inline-flex w-full justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Paso 1: Auth básica
        </Link>
        <Link
          to="/reports/new"
          className="inline-flex w-full justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Paso 2: Crear reporte
        </Link>
      </section>
    </main>
  )
}
