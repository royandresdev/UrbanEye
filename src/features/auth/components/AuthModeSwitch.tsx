type AuthModeSwitchProps = {
  mode: 'login' | 'register'
  onModeChange: (mode: 'login' | 'register') => void
}

export function AuthModeSwitch({ mode, onModeChange }: AuthModeSwitchProps) {
  return (
    <div className="mb-4 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
      <button
        type="button"
        onClick={() => onModeChange('login')}
        className={
          mode === 'login'
            ? 'rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm'
            : 'rounded-md px-3 py-2 text-sm font-medium text-slate-600'
        }
      >
        Iniciar sesión
      </button>
      <button
        type="button"
        onClick={() => onModeChange('register')}
        className={
          mode === 'register'
            ? 'rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm'
            : 'rounded-md px-3 py-2 text-sm font-medium text-slate-600'
        }
      >
        Registrarme
      </button>
    </div>
  )
}
