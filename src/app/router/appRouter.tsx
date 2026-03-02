import { createBrowserRouter } from 'react-router-dom'
import { HomePage } from '../../features/home/HomePage'

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
])
