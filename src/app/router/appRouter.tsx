import { createBrowserRouter } from 'react-router-dom'
import { AuthPage } from '../../features/auth/AuthPage'
import { HomePage } from '../../features/home/HomePage'
import { NewReportPage } from '../../features/reports/NewReportPage'
import { ReportsOverviewPage } from '../../features/reports/ReportsOverviewPage'

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/reports/new',
    element: <NewReportPage />,
  },
  {
    path: '/reports',
    element: <ReportsOverviewPage />,
  },
])
