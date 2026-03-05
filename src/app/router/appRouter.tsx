import { createBrowserRouter, redirect } from 'react-router-dom'
import { LoginPage } from '../../features/auth/LoginPage'
import { RegisterPage } from '../../features/auth/RegisterPage'
//import { HomePage } from '../../features/home/HomePage'
import { NewReportPage } from '../../features/reports/NewReportPage'
import { ReportsOverviewPage } from '../../features/reports/ReportsOverviewPage'
import { supabase } from '../../shared/lib/supabase'

async function requireAuth() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error || !session) {
    throw redirect('/auth')
  }

  return null
}

export const appRouter = createBrowserRouter([
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
    loader: requireAuth,
    element: <NewReportPage />,
  },
  {
    path: '/',
    loader: requireAuth,
    element: <ReportsOverviewPage />,
  },
])
