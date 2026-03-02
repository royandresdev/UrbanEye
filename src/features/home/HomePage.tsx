export function HomePage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 py-6">
      <header className="mb-6">
        <p className="text-sm text-slate-600">Fase 0</p>
        <h1 className="text-2xl font-semibold text-slate-900">UrbanEye</h1>
      </header>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-base font-medium text-slate-900">Base técnica lista</h2>
        <p className="mt-2 text-sm text-slate-600">
          Proyecto inicializado con React + TypeScript + Vite, enfoque mobile first y
          arquitectura preparada para iniciar el módulo de reportes.
        </p>
      </section>
    </main>
  )
}
