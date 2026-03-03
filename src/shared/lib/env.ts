export function getRequiredEnv(name: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_PUBLISHABLE_KEY') {
  const value = import.meta.env[name]

  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}. Revisa tu archivo .env.local`)
  }

  return value
}
