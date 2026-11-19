import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Toast from './Toast.jsx';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('affiche le titre et le message du toast', () => {
    const onFermer = vi.fn();
    render(
      <Toast
        toast={{ id: '1', titre: 'Accès refusé', message: 'Action interdite', type: 'erreur' }}
        onFermer={onFermer}
      />,
    );

    expect(screen.getByText('Accès refusé')).toBeInTheDocument();
    expect(screen.getByText('Action interdite')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveClass('toast--erreur');
  });

  it('appelle onFermer lors du clic sur le bouton de fermeture', () => {
    const onFermer = vi.fn();
    render(
      <Toast
        toast={{ id: '42', titre: 'Succès', message: 'Opération réussie', type: 'succes' }}
        onFermer={onFermer}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /fermer/i }));
    expect(onFermer).toHaveBeenCalledWith('42');
  });

  it('ferme automatiquement le toast après la durée spécifiée', () => {
    const onFermer = vi.fn();
    render(
      <Toast
        toast={{ id: '10', titre: 'Info', message: 'Message temporaire', type: 'info', duree: 3000 }}
        onFermer={onFermer}
      />,
    );

    expect(onFermer).not.toHaveBeenCalled();
    vi.advanceTimersByTime(3000);
    expect(onFermer).toHaveBeenCalledWith('10');
  });

  it('met en pause le minuteur au survol de la souris', () => {
    const onFermer = vi.fn();
    const { container } = render(
      <Toast
        toast={{ id: '10', titre: 'Info', message: 'Pause au hover', type: 'info', duree: 3000 }}
        onFermer={onFermer}
      />,
    );

    const toastElement = container.querySelector('.toast');
    fireEvent.mouseEnter(toastElement);

    vi.advanceTimersByTime(4000);
    expect(onFermer).not.toHaveBeenCalled();

    fireEvent.mouseLeave(toastElement);
    vi.advanceTimersByTime(3000);
    expect(onFermer).toHaveBeenCalledWith('10');
  });
});
