import { createBrowserRouter } from 'react-router-dom'
import { AuthPage } from '../../features/auth/AuthPage'
import { HomePage } from '../../features/home/HomePage'

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/auth',
    element: <AuthPage />,
  },
])
