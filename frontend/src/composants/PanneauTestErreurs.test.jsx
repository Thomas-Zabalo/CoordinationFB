import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from '../api/vinyles.js';
import PanneauTestErreurs from './PanneauTestErreurs.jsx';
import ToastConteneur from './ToastConteneur.jsx';
import ToastProvider from './ToastProvider.jsx';

describe('PanneauTestErreurs', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function afficher() {
    render(
      <ToastProvider>
        <PanneauTestErreurs />
        <ToastConteneur />
      </ToastProvider>,
    );
  }

  it('s’ouvre lorsqu’on clique sur le bouton flottant', () => {
    afficher();

    const boutonOuvrir = screen.getByRole('button', { name: /tester les toasts/i });
    expect(boutonOuvrir).toBeInTheDocument();

    fireEvent.click(boutonOuvrir);

    expect(screen.getByText('Tester la gestion des erreurs')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '403 Interdit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '404 Introuvable' })).toBeInTheDocument();
  });

  it('génère un toast 403 lors du clic sur le bouton 403', () => {
    afficher();
    fireEvent.click(screen.getByRole('button', { name: /tester les toasts/i }));

    fireEvent.click(screen.getByRole('button', { name: '403 Interdit' }));

    expect(screen.getByText('Accès refusé (403)')).toBeInTheDocument();
    expect(screen.getByText(/vous n’avez pas les droits nécessaires/i)).toBeInTheDocument();
  });

  it('génère un toast 404 lors du clic sur le bouton 404', () => {
    afficher();
    fireEvent.click(screen.getByRole('button', { name: /tester les toasts/i }));

    fireEvent.click(screen.getByRole('button', { name: '404 Introuvable' }));

    expect(screen.getByText('Ressource introuvable (404)')).toBeInTheDocument();
    expect(screen.getByText(/l’élément demandé n’existe pas/i)).toBeInTheDocument();
  });

  it('génère une erreur personnalisée 418', () => {
    afficher();
    fireEvent.click(screen.getByRole('button', { name: /tester les toasts/i }));

    fireEvent.click(screen.getByRole('button', { name: '+ Erreur 418 Théière' }));

    expect(screen.getByText('Théière (418)')).toBeInTheDocument();
    expect(screen.getByText(/Je suis une théière/i)).toBeInTheDocument();
  });

  it('génère une erreur lors d’un appel API réel simulé', async () => {
    vi.spyOn(api, 'declencherErreurApi').mockRejectedValue(new api.ErreurApi('Erreur de test API', 403));

    afficher();
    fireEvent.click(screen.getByRole('button', { name: /tester les toasts/i }));

    fireEvent.click(screen.getByRole('button', { name: 'API 403' }));

    expect(await screen.findByText('Accès refusé (403)')).toBeInTheDocument();
  });
});
