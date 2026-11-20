import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { connecter, inscrire } from '../api/auth.js';
import { ErreurApi } from '../api/requete.js';
import PageAuthentification from './PageAuthentification.jsx';

const mocks = vi.hoisted(() => ({ setUtilisateur: vi.fn() }));

vi.mock('../api/auth.js', () => ({
  connecter: vi.fn(),
  inscrire: vi.fn(),
}));

vi.mock('../auth/authentificationContexte.js', () => ({
  useAuthentification: () => ({ setUtilisateur: mocks.setUtilisateur }),
}));

function PageCollection() {
  const location = useLocation();
  return <p>{location.state?.message}</p>;
}

function afficherPage(mode) {
  const chemin = mode === 'inscription' ? '/inscription' : '/connexion';
  render(
    <MemoryRouter initialEntries={[chemin]}>
      <Routes>
        <Route path="/inscription" element={<PageAuthentification mode="inscription" />} />
        <Route path="/connexion" element={<PageAuthentification mode="connexion" />} />
        <Route path="/collection" element={<PageCollection />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PageAuthentification', () => {
  beforeEach(() => {
    vi.mocked(connecter).mockReset();
    vi.mocked(inscrire).mockReset();
    mocks.setUtilisateur.mockReset();
  });

  it('valide les champs de l’inscription avant l’envoi', async () => {
    const utilisateur = userEvent.setup();
    afficherPage('inscription');

    await utilisateur.click(screen.getByRole('button', { name: 'Créer mon compte' }));

    expect(await screen.findAllByText('Champ obligatoire')).toHaveLength(3);
    expect(inscrire).not.toHaveBeenCalled();
  });

  it('inscrit un utilisateur puis le redirige vers sa collection', async () => {
    vi.mocked(inscrire).mockResolvedValue({ id: 1 });
    const utilisateur = userEvent.setup();
    afficherPage('inscription');

    await utilisateur.type(screen.getByLabelText('Adresse e-mail'), ' alex@example.com ');
    await utilisateur.type(screen.getByLabelText('Nom'), ' Alex ');
    await utilisateur.type(screen.getByLabelText('Mot de passe'), 'secret123');
    await utilisateur.type(screen.getByLabelText('Confirmer le mot de passe'), 'secret123');
    await utilisateur.click(screen.getByRole('button', { name: 'Créer mon compte' }));

    expect(inscrire).toHaveBeenCalledWith({ email: 'alex@example.com', nom: 'Alex', motDePasse: 'secret123' });
    expect(mocks.setUtilisateur).toHaveBeenCalledWith({ id: 1 });
    expect(await screen.findByText('Votre compte a été créé. Bienvenue !')).toBeInTheDocument();
  });

  it('connecte un utilisateur puis le redirige vers sa collection', async () => {
    vi.mocked(connecter).mockResolvedValue({ id: 1 });
    const utilisateur = userEvent.setup();
    afficherPage('connexion');

    await utilisateur.type(screen.getByLabelText('Adresse e-mail'), 'alex@example.com');
    await utilisateur.type(screen.getByLabelText('Mot de passe'), 'secret123');
    await utilisateur.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(connecter).toHaveBeenCalledWith({ email: 'alex@example.com', motDePasse: 'secret123' });
    expect(mocks.setUtilisateur).toHaveBeenCalledWith({ id: 1 });
    expect(await screen.findByText('Vous êtes connecté.')).toBeInTheDocument();
  });

  it('connecte un utilisateur et affiche une erreur de connexion', async () => {
    vi.mocked(connecter).mockRejectedValue(new ErreurApi('Identifiants invalides', 401));
    const utilisateur = userEvent.setup();
    afficherPage('connexion');

    await utilisateur.type(screen.getByLabelText('Adresse e-mail'), 'alex@example.com');
    await utilisateur.type(screen.getByLabelText('Mot de passe'), 'secret123');
    await utilisateur.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(connecter).toHaveBeenCalledWith({ email: 'alex@example.com', motDePasse: 'secret123' });
    expect(await screen.findByRole('alert')).toHaveTextContent('Identifiants invalides');
  });
});
