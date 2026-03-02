import { createBrowserRouter } from 'react-router-dom'
import { AuthPage } from '../../features/auth/AuthPage'
import { HomePage } from '../../features/home/HomePage'
import { NewReportPage } from '../../features/reports/NewReportPage'

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
])
