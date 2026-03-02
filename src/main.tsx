import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    registerSW({
      immediate: true,
    })
  } else {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister()
      })
    })

    if ('caches' in window) {
      caches.keys().then((cacheKeys) => {
        cacheKeys.forEach((cacheKey) => {
          if (cacheKey.includes('workbox') || cacheKey.includes('urbaneye')) {
            caches.delete(cacheKey)
          }
        })
      })
    }
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
