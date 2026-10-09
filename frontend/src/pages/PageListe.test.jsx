import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listerGenres, listerVinyles } from '../api/vinyles.js';
import PageListe from './PageListe.jsx';

vi.mock('../api/vinyles.js', () => ({
  listerVinyles: vi.fn(),
  listerGenres: vi.fn(),
}));

const vinyles = [
  {
    id: 1,
    artiste: 'The Beatles',
    titre: 'Abbey Road',
    annee: 1969,
    format: 'LP',
    taille: '12"',
    numeroCatalogue: 'PCS 7088',
    etatDisque: 'VG+',
    etatPochette: 'VG',
    liste: 'collection',
  },
  {
    id: 2,
    artiste: 'Daft Punk',
    titre: 'Discovery',
    annee: null,
    format: null,
    taille: null,
    numeroCatalogue: null,
    etatDisque: null,
    etatPochette: null,
    liste: 'collection',
  },
];

function afficherPage(liste = 'collection') {
  render(
    <MemoryRouter>
      <PageListe liste={liste} />
    </MemoryRouter>,
  );
}

describe('PageListe', () => {
  beforeEach(() => {
    vi.mocked(listerVinyles).mockReset();
    vi.mocked(listerGenres).mockReset().mockResolvedValue(['Électro', 'Rock']);
  });

  it('affiche les vinyles de la collection avec leur état', async () => {
    vi.mocked(listerVinyles).mockResolvedValue(vinyles);
    afficherPage();

    expect(await screen.findByRole('link', { name: 'Abbey Road' })).toHaveAttribute('href', '/vinyles/1');
    expect(screen.getByText('2 vinyles')).toBeInTheDocument();
    expect(screen.getByText('VG+')).toBeInTheDocument();
    expect(screen.getAllByText('Non noté')).toHaveLength(2);
    expect(listerVinyles).toHaveBeenCalledWith(expect.objectContaining({ liste: 'collection' }), expect.any(AbortSignal));
  });

  it("invite à ajouter un premier vinyle quand la liste d'envies est vide", async () => {
    vi.mocked(listerVinyles).mockResolvedValue([]);
    afficherPage('envies');

    expect(await screen.findByText(/Votre liste d'envies est vide/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ajouter un vinyle' })).toHaveAttribute('href', '/vinyles/nouveau?liste=envies');
  });

  it('relance la recherche avec le genre choisi', async () => {
    vi.mocked(listerVinyles).mockResolvedValue(vinyles);
    afficherPage();
    const utilisateur = userEvent.setup();

    await screen.findByRole('option', { name: 'Rock' });
    await utilisateur.selectOptions(screen.getByLabelText('Genre'), 'Rock');

    expect(listerVinyles).toHaveBeenLastCalledWith(expect.objectContaining({ genre: 'Rock' }), expect.any(AbortSignal));
  });

  it("affiche l'erreur si l'API ne répond pas", async () => {
    vi.mocked(listerVinyles).mockRejectedValue(new Error('Impossible de joindre le serveur.'));
    afficherPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('Impossible de joindre le serveur.');
  });
});
