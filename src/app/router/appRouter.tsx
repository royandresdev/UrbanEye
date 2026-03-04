import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from '../../features/auth/LoginPage'
import { RegisterPage } from '../../features/auth/RegisterPage'
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
    element: <LoginPage />,
  },
  {
    path: '/auth/signup',
    element: <RegisterPage />,
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
