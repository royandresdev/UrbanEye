import { FiBell, FiMenu } from "react-icons/fi"

type ReportPanelHeaderProps = {
  onOpenSidebar?: () => void
  roleUser: string;
}

export function ReportPanelHeader({ onOpenSidebar, roleUser }: ReportPanelHeaderProps) {
  return (
    <header className="mb-5 flex items-center justify-between border-b border-field-border-secondary pb-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-sm bg-field-bg-primary text-accent-500"
          aria-label="Abrir menú de usuario"
        >
          <FiMenu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold leading-tight">Panel de Gestión</h1>
          <p className="text-xs text-fg-secondary">Portal de {roleUser}</p>
        </div>
      </div>
      <button
        type="button"
        className="mr-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-field-bg-secondary text-fg-secondary"
        aria-label="Notificaciones"
      >
        <FiBell className="h-5 w-5" />
      </button>
    </header>
  )
}
