import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ErreurApi } from '../api/vinyles.js';
import FormulaireVinyle from './FormulaireVinyle.jsx';

function afficherFormulaire(proprietes = {}) {
  const onEnregistrer = vi.fn(() => Promise.resolve());
  const onAnnuler = vi.fn();
  render(
    <FormulaireVinyle
      vinyleInitial={{ liste: 'collection' }}
      libelleBouton="Ajouter"
      onEnregistrer={onEnregistrer}
      onAnnuler={onAnnuler}
      {...proprietes}
    />,
  );
  return { onEnregistrer, onAnnuler, utilisateur: userEvent.setup() };
}

describe('FormulaireVinyle', () => {
  it('envoie les valeurs saisies et nettoyées, avec les champs vides à null et l’année en nombre', async () => {
    const { onEnregistrer, utilisateur } = afficherFormulaire();

    await utilisateur.type(screen.getByLabelText(/Artiste/), '  The Beatles  ');
    await utilisateur.type(screen.getByLabelText(/Titre/), '  Abbey Road ');
    await utilisateur.type(screen.getByLabelText('Année de sortie'), '1969');
    await utilisateur.selectOptions(screen.getByLabelText('État du disque'), 'VG+');
    await utilisateur.selectOptions(screen.getByLabelText('Format'), 'LP');
    await utilisateur.selectOptions(screen.getByLabelText('Taille'), '12"');
    await utilisateur.click(screen.getByRole('button', { name: 'Ajouter' }));

    expect(onEnregistrer).toHaveBeenCalledOnce();
    const vinyle = onEnregistrer.mock.calls[0][0];
    expect(vinyle).toMatchObject({
      artiste: 'The Beatles',
      titre: 'Abbey Road',
      annee: 1969,
      format: 'LP',
      taille: '12"',
      etatDisque: 'VG+',
      etatPochette: null,
      label: null,
      liste: 'collection',
    });
  });

  it('note séparément le disque et la pochette avec aperçu Goldmine en direct', async () => {
    const { utilisateur } = afficherFormulaire();

    const champDisque = screen.getByLabelText('État du disque');
    const champPochette = screen.getByLabelText('État de la pochette');
    expect(champDisque).toBeInTheDocument();
    expect(champPochette).toBeInTheDocument();

    await utilisateur.selectOptions(champDisque, 'NM');
    await utilisateur.selectOptions(champPochette, 'VG');

    expect(screen.getByText('NM')).toBeInTheDocument();
    expect(screen.getByText('VG')).toBeInTheDocument();
  });

  it('bloque la soumission côté client si les champs obligatoires manquent et efface l’erreur à la correction', async () => {
    const { onEnregistrer, utilisateur } = afficherFormulaire();

    await utilisateur.click(screen.getByRole('button', { name: 'Ajouter' }));

    expect(onEnregistrer).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Veuillez corriger les champs signalés');
    expect(screen.getAllByText('Champ obligatoire')).toHaveLength(2);
    expect(screen.getByLabelText(/Artiste/)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(/Artiste/)).toHaveFocus();

    await utilisateur.type(screen.getByLabelText(/Artiste/), 'Pink Floyd');
    expect(screen.getByLabelText(/Artiste/)).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getAllByText('Champ obligatoire')).toHaveLength(1);
  });

  it('valide l’année côté client avant l’envoi à l’API', async () => {
    const { onEnregistrer, utilisateur } = afficherFormulaire();

    await utilisateur.type(screen.getByLabelText(/Artiste/), 'Miles Davis');
    await utilisateur.type(screen.getByLabelText(/Titre/), 'Kind of Blue');
    await utilisateur.type(screen.getByLabelText('Année de sortie'), '1700');
    await utilisateur.click(screen.getByRole('button', { name: 'Ajouter' }));

    expect(onEnregistrer).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Année de sortie')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText(/Doit être une année entre 1880/)).toBeInTheDocument();
  });

  it('affiche les erreurs de validation renvoyées par l’API sous chaque champ', async () => {
    const { utilisateur } = afficherFormulaire({
      onEnregistrer: () =>
        Promise.reject(
          new ErreurApi('Certains champs sont invalides', 400, {
            numeroCatalogue: 'Format de catalogue refusé par le serveur',
          }),
        ),
    });

    await utilisateur.type(screen.getByLabelText(/Artiste/), 'The Beatles');
    await utilisateur.type(screen.getByLabelText(/Titre/), 'Abbey Road');
    await utilisateur.click(screen.getByRole('button', { name: 'Ajouter' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Certains champs sont invalides');
    expect(screen.getByText('Format de catalogue refusé par le serveur')).toBeInTheDocument();
    expect(screen.getByLabelText('Numéro de catalogue')).toHaveAttribute('aria-invalid', 'true');
  });

  it('désactive les actions pendant l’envoi et empêche les doubles soumissions', async () => {
    let resoudre;
    const onEnregistrer = vi.fn(
      () =>
        new Promise((resolve) => {
          resoudre = resolve;
        }),
    );
    const { utilisateur } = afficherFormulaire({ onEnregistrer });

    await utilisateur.type(screen.getByLabelText(/Artiste/), 'Daft Punk');
    await utilisateur.type(screen.getByLabelText(/Titre/), 'Discovery');
    await utilisateur.click(screen.getByRole('button', { name: 'Ajouter' }));

    expect(screen.getByRole('button', { name: 'Enregistrement…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeDisabled();

    resoudre();
  });

  it('pré-remplit le formulaire en mode modification, détecte les changements et permet de réinitialiser', async () => {
    const { utilisateur } = afficherFormulaire({
      mode: 'modification',
      libelleBouton: 'Enregistrer',
      vinyleInitial: {
        artiste: 'Miles Davis',
        titre: 'Kind of Blue',
        annee: 1959,
        liste: 'envies',
        notes: 'Première édition',
      },
    });

    const champArtiste = screen.getByLabelText(/Artiste/);
    const boutonReinitialiser = screen.getByRole('button', { name: 'Réinitialiser' });

    expect(champArtiste).toHaveValue('Miles Davis');
    expect(screen.getByLabelText('Année de sortie')).toHaveValue(1959);
    expect(screen.getByRole('radio', { name: "Liste d'envies" })).toBeChecked();
    expect(screen.getByText('16 / 2000')).toBeInTheDocument();
    expect(boutonReinitialiser).toBeDisabled();

    await utilisateur.clear(champArtiste);
    await utilisateur.type(champArtiste, 'John Coltrane');

    expect(screen.getByRole('status')).toHaveTextContent('Modifications non enregistrées');
    expect(boutonReinitialiser).toBeEnabled();

    await utilisateur.click(boutonReinitialiser);

    expect(champArtiste).toHaveValue('Miles Davis');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(boutonReinitialiser).toBeDisabled();
  });

  it('appelle onAnnuler lorsque l’utilisateur clique sur Annuler', async () => {
    const { onAnnuler, utilisateur } = afficherFormulaire();

    await utilisateur.click(screen.getByRole('button', { name: 'Annuler' }));

    expect(onAnnuler).toHaveBeenCalledOnce();
  });
});
