import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { emettreErreur, emettreToast, useToast } from './toastContexte.js';
import ToastConteneur from './ToastConteneur.jsx';
import ToastProvider from './ToastProvider.jsx';

function ComposantTest() {
  const { afficherErreur, afficherSucces } = useToast();

  return (
    <div>
      <button type="button" onClick={() => afficherErreur(403)}>
        Déclencher 403
      </button>
      <button type="button" onClick={() => afficherErreur(404)}>
        Déclencher 404
      </button>
      <button type="button" onClick={() => afficherSucces('Vinyle enregistré !')}>
        Déclencher Succès
      </button>
    </div>
  );
}

describe('ToastContexte & ToastConteneur', () => {
  it('affiche un toast d’erreur pour le code 403', () => {
    render(
      <ToastProvider>
        <ComposantTest />
        <ToastConteneur />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Déclencher 403' }));

    expect(screen.getByText('Accès refusé (403)')).toBeInTheDocument();
    expect(screen.getByText(/vous n’avez pas les droits nécessaires/i)).toBeInTheDocument();
  });

  it('affiche un toast d’erreur pour le code 404', () => {
    render(
      <ToastProvider>
        <ComposantTest />
        <ToastConteneur />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Déclencher 404' }));

    expect(screen.getByText('Ressource introuvable (404)')).toBeInTheDocument();
    expect(screen.getByText(/l’élément demandé n’existe pas/i)).toBeInTheDocument();
  });

  it('affiche un toast de succès', () => {
    render(
      <ToastProvider>
        <ComposantTest />
        <ToastConteneur />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Déclencher Succès' }));

    expect(screen.getByText('Succès')).toBeInTheDocument();
    expect(screen.getByText('Vinyle enregistré !')).toBeInTheDocument();
  });

  it('ferme le toast quand on clique sur le bouton de fermeture', () => {
    render(
      <ToastProvider>
        <ComposantTest />
        <ToastConteneur />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Déclencher 403' }));
    expect(screen.getByText('Accès refusé (403)')).toBeInTheDocument();

    const boutonFermer = screen.getByRole('button', { name: 'Fermer la notification' });
    fireEvent.click(boutonFermer);

    expect(screen.queryByText('Accès refusé (403)')).not.toBeInTheDocument();
  });

  it('réagit aux événements globaux via emettreErreur', async () => {
    render(
      <ToastProvider>
        <ToastConteneur />
      </ToastProvider>,
    );

    act(() => {
      emettreErreur(403);
    });

    expect(await screen.findByText('Accès refusé (403)')).toBeInTheDocument();
  });

  it('réagit aux événements globaux via emettreToast', async () => {
    render(
      <ToastProvider>
        <ToastConteneur />
      </ToastProvider>,
    );

    act(() => {
      emettreToast({ titre: 'Avis', message: 'Message personnalisé', type: 'info' });
    });

    expect(await screen.findByText('Avis')).toBeInTheDocument();
    expect(await screen.findByText('Message personnalisé')).toBeInTheDocument();
  });
});
