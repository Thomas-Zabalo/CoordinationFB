import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import CarteVinyle from './CarteVinyle.jsx';

const vinyle = {
  id: 7,
  artiste: 'Miles Davis',
  titre: 'Kind of Blue',
  annee: 1959,
  genre: 'Jazz',
  label: 'Columbia',
  numeroCatalogue: 'CS 8163',
  format: 'LP',
  taille: '12"',
  etatDisque: 'NM',
  etatPochette: 'VG+',
  liste: 'collection',
};

describe('CarteVinyle', () => {
  it('affiche les métadonnées éditoriales et les deux notes Goldmine séparées', () => {
    render(
      <MemoryRouter>
        <CarteVinyle vinyle={vinyle} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Kind of Blue' })).toHaveAttribute('href', '/vinyles/7');
    expect(screen.getAllByText('Miles Davis').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('CS 8163').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Média')).toBeInTheDocument();
    expect(screen.getByText('Pochette')).toBeInTheDocument();
    expect(screen.getByText('NM')).toBeInTheDocument();
    expect(screen.getByText('VG+')).toBeInTheDocument();
  });

  it('ouvre la fiche détaillée au clic sur la carte', async () => {
    const utilisateur = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/collection']}>
        <Routes>
          <Route path="/collection" element={<CarteVinyle vinyle={vinyle} />} />
          <Route path="/vinyles/:id" element={<p>Fiche détaillée</p>} />
        </Routes>
      </MemoryRouter>,
    );

    await utilisateur.click(screen.getByRole('article'));

    expect(await screen.findByText('Fiche détaillée')).toBeInTheDocument();
  });
});
