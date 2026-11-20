import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ErreurApi, modifierVinyle, recupererVinyle } from '../api/vinyles.js';
import PageModification from './PageModification.jsx';

vi.mock('../api/vinyles.js', async (importerOriginal) => {
  const original = await importerOriginal();
  return {
    ...original,
    recupererVinyle: vi.fn(),
    modifierVinyle: vi.fn(),
  };
});

const vinyleExistant = {
  id: 7,
  artiste: 'Miles Davis',
  titre: 'Kind of Blue',
  annee: 1959,
  genre: 'Jazz',
  label: 'Columbia',
  numeroCatalogue: 'CS 8163',
  format: 'LP',
  taille: '12"',
  pays: 'États-Unis',
  couleur: 'Noir',
  etatDisque: 'VG+',
  etatPochette: 'VG',
  liste: 'collection',
  notes: 'Pressage stéréo',
};

function PageDetailTemoin() {
  const location = useLocation();
  return (
    <div>
      <p>Fiche détaillée</p>
      {location.state?.message && <p>{location.state.message}</p>}
    </div>
  );
}

function afficherPageModification(id = '7') {
  render(
    <MemoryRouter initialEntries={[`/vinyles/${id}/modifier`]}>
      <Routes>
        <Route path="/vinyles/:id/modifier" element={<PageModification />} />
        <Route path="/vinyles/:id" element={<PageDetailTemoin />} />
        <Route path="/collection" element={<p>Page collection</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PageModification', () => {
  beforeEach(() => {
    vi.mocked(recupererVinyle).mockReset();
    vi.mocked(modifierVinyle).mockReset();
  });

  it('affiche un état de chargement puis pré-remplit le formulaire avec le vinyle', async () => {
    vi.mocked(recupererVinyle).mockResolvedValue(vinyleExistant);

    afficherPageModification();

    expect(screen.getByText('Chargement…')).toBeInTheDocument();
    expect(await screen.findByText('Miles Davis — Kind of Blue')).toBeInTheDocument();
    expect(screen.getByLabelText(/Artiste/)).toHaveValue('Miles Davis');
    expect(screen.getByLabelText(/Titre/)).toHaveValue('Kind of Blue');
    expect(screen.getByLabelText('État du disque')).toHaveValue('VG+');
    expect(screen.getByLabelText('État de la pochette')).toHaveValue('VG');
    expect(screen.getByRole('link', { name: '← Retour à la fiche' })).toHaveAttribute('href', '/vinyles/7');
  });

  it('enregistre les modifications via modifierVinyle et redirige vers la fiche', async () => {
    vi.mocked(recupererVinyle).mockResolvedValue(vinyleExistant);
    vi.mocked(modifierVinyle).mockResolvedValue({ ...vinyleExistant, etatPochette: 'NM' });
    const utilisateur = userEvent.setup();

    afficherPageModification();

    const champPochette = await screen.findByLabelText('État de la pochette');
    await utilisateur.selectOptions(champPochette, 'NM');
    await utilisateur.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(modifierVinyle).toHaveBeenCalledWith(
      '7',
      expect.objectContaining({
        artiste: 'Miles Davis',
        titre: 'Kind of Blue',
        etatDisque: 'VG+',
        etatPochette: 'NM',
      }),
    );
    expect(await screen.findByText('Fiche détaillée')).toBeInTheDocument();
    expect(screen.getByText('Modifications enregistrées.')).toBeInTheDocument();
  });

  it('affiche une erreur et un lien vers la collection si le vinyle est introuvable', async () => {
    vi.mocked(recupererVinyle).mockRejectedValue(new ErreurApi('Vinyle introuvable', 404));

    afficherPageModification('999');

    expect(await screen.findByRole('alert')).toHaveTextContent('Vinyle introuvable');
    expect(screen.getByRole('link', { name: /Retour à ma collection/ })).toHaveAttribute('href', '/collection');
  });

  it('retourne à la fiche du vinyle lorsque l’utilisateur annule', async () => {
    vi.mocked(recupererVinyle).mockResolvedValue(vinyleExistant);
    const utilisateur = userEvent.setup();

    afficherPageModification();

    await utilisateur.click(await screen.findByRole('button', { name: 'Annuler' }));

    expect(await screen.findByText('Fiche détaillée')).toBeInTheDocument();
  });
});
