import { screen, render, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import NewReportPageHeader from "./components/NewReportPageHeader";
import PathnameSpy from "../../app/router/PathnameSpy";

describe('NewReportPage', () => {
  it('Cuando cierro el formulario de nuevo reporte, me redirige a la ruta raíz ', () => {
    render(
      <MemoryRouter initialEntries={['/reports/new']}>
        <PathnameSpy />
        <Routes>
          <Route path="/reports/new" element={<NewReportPageHeader />} />
        </Routes>
      </MemoryRouter>
    );

    const linkToClose = screen.getByRole('link');
    fireEvent.click(linkToClose);

    const updatedUrl = screen.getByTestId('pathname').textContent;

    expect(updatedUrl).toBe('/');
  })
})
