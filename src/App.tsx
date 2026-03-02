import { RouterProvider } from 'react-router-dom'
import { AppProviders } from './app/providers/AppProviders'
import { appRouter } from './app/router/appRouter'
import { OfflineBanner } from './shared/network/OfflineBanner'

function App() {
  return (
    <AppProviders>
      <OfflineBanner />
      <RouterProvider router={appRouter} />
    </AppProviders>
  )
}

export default App
