import { FiX } from "react-icons/fi"
import { Link } from "react-router-dom"

const NewReportPageHeader = () => {
  return (
    <header className="mb-6 border-b border-field-border-secondary px-4 py-4">
      <div className="flex items-center justify-between">
        <Link
          to="/reports"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-primary transition hover:bg-field-bg-secondary"
          aria-label="Volver"
        >
          <FiX className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-semibold">Crear Nuevo Reporte</h1>
        <span className="h-8 w-8" aria-hidden />
      </div>
    </header>
  )
}
export default NewReportPageHeader
