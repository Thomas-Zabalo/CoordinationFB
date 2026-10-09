import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ErreurApi } from '../api/vinyles.js';
import FormulaireVinyle from './FormulaireVinyle.jsx';

function afficherFormulaire(proprietes = {}) {
  const onEnregistrer = vi.fn(() => Promise.resolve());
  render(
    <FormulaireVinyle
      vinyleInitial={{ liste: 'collection' }}
      libelleBouton="Ajouter"
      onEnregistrer={onEnregistrer}
      onAnnuler={() => {}}
      {...proprietes}
    />,
  );
  return { onEnregistrer, utilisateur: userEvent.setup() };
}

describe('FormulaireVinyle', () => {
  it('envoie les valeurs saisies, avec les champs vides à null et l’année en nombre', async () => {
    const { onEnregistrer, utilisateur } = afficherFormulaire();

    await utilisateur.type(screen.getByLabelText(/Artiste/), 'The Beatles');
    await utilisateur.type(screen.getByLabelText(/Titre/), 'Abbey Road');
    await utilisateur.type(screen.getByLabelText('Année de sortie'), '1969');
    await utilisateur.selectOptions(screen.getByLabelText('État du disque'), 'VG+');
    await utilisateur.click(screen.getByRole('button', { name: 'Ajouter' }));

    expect(onEnregistrer).toHaveBeenCalledOnce();
    const vinyle = onEnregistrer.mock.calls[0][0];
    expect(vinyle).toMatchObject({
      artiste: 'The Beatles',
      titre: 'Abbey Road',
      annee: 1969,
      etatDisque: 'VG+',
      etatPochette: null,
      label: null,
      liste: 'collection',
    });
  });

  it('note séparément le disque et la pochette', () => {
    afficherFormulaire();

    expect(screen.getByLabelText('État du disque')).toBeInTheDocument();
    expect(screen.getByLabelText('État de la pochette')).toBeInTheDocument();
  });

  it('affiche les erreurs de validation renvoyées par l’API sous chaque champ', async () => {
    const { utilisateur } = afficherFormulaire({
      onEnregistrer: () =>
        Promise.reject(new ErreurApi('Certains champs sont invalides', 400, { artiste: 'Champ obligatoire', titre: 'Champ obligatoire' })),
    });

    await utilisateur.click(screen.getByRole('button', { name: 'Ajouter' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Certains champs sont invalides');
    expect(screen.getAllByText('Champ obligatoire')).toHaveLength(2);
    expect(screen.getByLabelText(/Artiste/)).toHaveAttribute('aria-invalid', 'true');
  });

  it('pré-remplit le formulaire avec le vinyle à modifier', () => {
    afficherFormulaire({
      vinyleInitial: { artiste: 'Miles Davis', titre: 'Kind of Blue', annee: 1959, liste: 'envies' },
    });

    expect(screen.getByLabelText(/Artiste/)).toHaveValue('Miles Davis');
    expect(screen.getByLabelText('Année de sortie')).toHaveValue(1959);
    expect(screen.getByRole('radio', { name: "Liste d'envies" })).toBeChecked();
  });
});
