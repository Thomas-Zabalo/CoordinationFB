import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deconnecter } from '../api/auth.js';
import EnTete from './EnTete.jsx';

const mocks = vi.hoisted(() => ({
  utilisateur: null,
  setUtilisateur: vi.fn(),
  afficherErreur: vi.fn(),
  afficherSucces: vi.fn(),
}));

vi.mock('../api/auth.js', () => ({ deconnecter: vi.fn() }));
vi.mock('../auth/authentificationContexte.js', () => ({
  useAuthentification: () => ({
    utilisateur: mocks.utilisateur,
    setUtilisateur: mocks.setUtilisateur,
    chargement: false,
  }),
}));
vi.mock('./toastContexte.js', () => ({
  useToast: () => ({ afficherErreur: mocks.afficherErreur, afficherSucces: mocks.afficherSucces }),
}));

function CheminCourant() {
  return <output>{useLocation().pathname}</output>;
}

function afficherEntete() {
  render(
    <MemoryRouter initialEntries={['/envies']}>
      <EnTete />
      <CheminCourant />
    </MemoryRouter>,
  );
}

describe('EnTete', () => {
  beforeEach(() => {
    mocks.utilisateur = null;
    mocks.setUtilisateur.mockReset();
    mocks.afficherErreur.mockReset();
    mocks.afficherSucces.mockReset();
    vi.mocked(deconnecter).mockReset();
  });

  it('affiche les liens de connexion quand aucun utilisateur n’est connecté', () => {
    afficherEntete();

    expect(screen.getByRole('link', { name: 'Connexion' })).toHaveAttribute('href', '/connexion');
    expect(screen.getByRole('link', { name: 'Inscription' })).toHaveAttribute('href', '/inscription');
  });

  it('affiche le nom et déconnecte l’utilisateur', async () => {
    mocks.utilisateur = { id: 1, nom: 'Alex Martin' };
    vi.mocked(deconnecter).mockResolvedValue(null);
    afficherEntete();

    expect(screen.getByText('Alex Martin')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Connexion' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Inscription' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Déconnexion' }));

    await waitFor(() => expect(mocks.setUtilisateur).toHaveBeenCalledWith(null));
    expect(mocks.afficherSucces).toHaveBeenCalledWith('Vous êtes déconnecté.');
    expect(await screen.findByText('/collection')).toBeInTheDocument();
  });
});
