import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { creerVinyle } from '../api/vinyles.js';
import PageAjout from './PageAjout.jsx';

vi.mock('../api/vinyles.js', async (importerOriginal) => {
  const original = await importerOriginal();
  return {
    ...original,
    creerVinyle: vi.fn(),
  };
});

function PageTemoin({ nom }) {
  const location = useLocation();
  return (
    <div>
      <p>{nom}</p>
      {location.state?.message && <p>{location.state.message}</p>}
    </div>
  );
}

function afficherPageAjout(url = '/vinyles/nouveau') {
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/vinyles/nouveau" element={<PageAjout />} />
        <Route path="/vinyles/:id" element={<PageTemoin nom="Fiche vinyle" />} />
        <Route path="/collection" element={<PageTemoin nom="Page collection" />} />
        <Route path="/envies" element={<PageTemoin nom="Page envies" />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PageAjout', () => {
  beforeEach(() => {
    vi.mocked(creerVinyle).mockReset();
  });

  it('pré-sélectionne la collection par défaut et crée un vinyle puis redirige vers sa fiche', async () => {
    vi.mocked(creerVinyle).mockResolvedValue({
      id: 42,
      artiste: 'The Beatles',
      titre: 'Abbey Road',
      liste: 'collection',
    });
    const utilisateur = userEvent.setup();

    afficherPageAjout();

    expect(screen.getByRole('radio', { name: 'Collection' })).toBeChecked();
    expect(screen.getByRole('link', { name: '← Ma collection' })).toHaveAttribute('href', '/collection');

    await utilisateur.type(screen.getByLabelText(/Artiste/), 'The Beatles');
    await utilisateur.type(screen.getByLabelText(/Titre/), 'Abbey Road');
    await utilisateur.click(screen.getByRole('button', { name: 'Ajouter' }));

    expect(creerVinyle).toHaveBeenCalledWith(
      expect.objectContaining({
        artiste: 'The Beatles',
        titre: 'Abbey Road',
        liste: 'collection',
      }),
    );
    expect(await screen.findByText('Fiche vinyle')).toBeInTheDocument();
    expect(screen.getByText(/Abbey Road/)).toBeInTheDocument();
  });

  it('pré-sélectionne la liste d’envies via le paramètre ?liste=envies et revient sur /envies à l’annulation', async () => {
    const utilisateur = userEvent.setup();

    afficherPageAjout('/vinyles/nouveau?liste=envies');

    expect(screen.getByRole('radio', { name: "Liste d'envies" })).toBeChecked();
    expect(screen.getByRole('link', { name: "← Ma liste d'envies" })).toHaveAttribute('href', '/envies');

    await utilisateur.click(screen.getByRole('button', { name: 'Annuler' }));

    expect(await screen.findByText('Page envies')).toBeInTheDocument();
  });

  it('revient sur la collection si le paramètre ?liste est invalide', () => {
    afficherPageAjout('/vinyles/nouveau?liste=inconnu');

    expect(screen.getByRole('radio', { name: 'Collection' })).toBeChecked();
  });
});
