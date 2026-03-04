import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('muestra acciones de producto sin etiquetas de desarrollo', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'UrbanEye' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /acceder/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /crear reporte/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ver reportes/i })).toBeInTheDocument()

    expect(screen.queryByText(/fase/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/paso/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/mvp en progreso/i)).not.toBeInTheDocument()
  })
})
