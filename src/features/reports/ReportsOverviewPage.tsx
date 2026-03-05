import 'leaflet/dist/leaflet.css'
import {
  useCurrentUserRole,
  useReportsRealtime,
} from './useReports'
import { AuthorityReportsPage } from './pages/AuthorityReportsPage'
import { CitizenReportsPage } from './pages/CitizenReportsPage'

export function ReportsOverviewPage() {
  useReportsRealtime()
  const { data: currentUserRole = 'ciudadano' } = useCurrentUserRole()
  const isAuthority = currentUserRole === 'autoridad'

  return isAuthority ? <AuthorityReportsPage /> : <CitizenReportsPage />
}
