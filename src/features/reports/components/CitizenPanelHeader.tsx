export function CitizenPanelHeader() {
  return (
    <header className="mb-4 flex items-center justify-between border-b border-field-border-secondary pb-3">
      <button
        type="button"
        className="rounded-md border border-field-border-secondary bg-field-bg-secondary px-2 py-1 text-fg-secondary"
      >
        ☰
      </button>
      <h1 className="text-lg font-semibold">Panel del Ciudadano</h1>
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-field-border-secondary bg-field-bg-secondary text-fg-secondary">
        👤
      </div>
    </header>
  )
}
