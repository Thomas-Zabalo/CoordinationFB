import { describe, expect, it } from 'vitest';
import { ANNEE_MIN, LONGUEUR_MAX_NOTES, LONGUEUR_MAX_TEXTE } from './constantes.js';
import {
  estFormulaireModifie,
  validerChampVinyle,
  validerFormulaireVinyle,
  versFormulaire,
  versVinyle,
} from './validation.js';

describe('validation et conversion du formulaire vinyle', () => {
  describe('versFormulaire', () => {
    it('convertit les champs absents en chaînes vides et met la liste par défaut à collection', () => {
      const etat = versFormulaire({ artiste: 'Daft Punk', annee: 2001 });

      expect(etat.artiste).toBe('Daft Punk');
      expect(etat.titre).toBe('');
      expect(etat.annee).toBe('2001');
      expect(etat.liste).toBe('collection');
    });

    it('conserve une liste valide et corrige une liste invalide', () => {
      expect(versFormulaire({ liste: 'envies' }).liste).toBe('envies');
      expect(versFormulaire({ liste: 'inconnue' }).liste).toBe('collection');
    });
  });

  describe('versVinyle', () => {
    it('nettoie les espaces, met les champs vides à null et convertit l’année en nombre', () => {
      const formulaire = versFormulaire({
        artiste: '  The Beatles  ',
        titre: '  Abbey Road ',
        annee: ' 1969 ',
        genre: '   ',
        label: 'Apple Records',
        liste: 'collection',
      });

      expect(versVinyle(formulaire)).toMatchObject({
        artiste: 'The Beatles',
        titre: 'Abbey Road',
        annee: 1969,
        genre: null,
        label: 'Apple Records',
        etatDisque: null,
        etatPochette: null,
        liste: 'collection',
      });
    });
  });

  describe('validerChampVinyle & validerFormulaireVinyle', () => {
    it('valide un formulaire minimal complet', () => {
      const formulaire = versFormulaire({ artiste: 'Miles Davis', titre: 'Kind of Blue' });
      const resultat = validerFormulaireVinyle(formulaire);

      expect(resultat).toEqual({ valide: true, erreurs: {} });
    });

    it('exige artiste et titre non vides', () => {
      const formulaire = versFormulaire({ artiste: '   ', titre: '' });
      const { valide, erreurs } = validerFormulaireVinyle(formulaire);

      expect(valide).toBe(false);
      expect(erreurs).toEqual({
        artiste: 'Champ obligatoire',
        titre: 'Champ obligatoire',
      });
    });

    it('valide les bornes et le format de l’année', () => {
      expect(validerChampVinyle('annee', '', { anneeMax: 2027 })).toBeNull();
      expect(validerChampVinyle('annee', String(ANNEE_MIN), { anneeMax: 2027 })).toBeNull();
      expect(validerChampVinyle('annee', '2027', { anneeMax: 2027 })).toBeNull();

      expect(validerChampVinyle('annee', '1879', { anneeMax: 2027 })).toMatch(/1880/);
      expect(validerChampVinyle('annee', '2028', { anneeMax: 2027 })).toMatch(/2027/);
      expect(validerChampVinyle('annee', '99', { anneeMax: 2027 })).toBeTruthy();
      expect(validerChampVinyle('annee', '1969.5', { anneeMax: 2027 })).toBeTruthy();
    });

    it('contrôle la longueur maximale des champs texte et des notes', () => {
      expect(validerChampVinyle('artiste', 'A'.repeat(LONGUEUR_MAX_TEXTE + 1))).toMatch(
        new RegExp(String(LONGUEUR_MAX_TEXTE)),
      );
      expect(validerChampVinyle('notes', 'N'.repeat(LONGUEUR_MAX_NOTES + 1))).toMatch(
        new RegExp(String(LONGUEUR_MAX_NOTES)),
      );
    });

    it('rejette les valeurs hors énumération (format, taille, état, liste)', () => {
      expect(validerChampVinyle('format', 'CD')).toBeTruthy();
      expect(validerChampVinyle('taille', '5"')).toBeTruthy();
      expect(validerChampVinyle('etatDisque', 'Excellent')).toBeTruthy();
      expect(validerChampVinyle('etatPochette', 'Parfait')).toBeTruthy();
      expect(validerChampVinyle('liste', 'favoris')).toBeTruthy();
    });
  });

  describe('estFormulaireModifie', () => {
    it('détecte les vraies modifications en ignorant les espaces superflus', () => {
      const initial = versFormulaire({ artiste: 'Miles Davis', titre: 'Kind of Blue', annee: 1959 });
      const identiqueAvecEspaces = { ...initial, artiste: '  Miles Davis  ' };
      const modifie = { ...initial, annee: '1960' };

      expect(estFormulaireModifie(identiqueAvecEspaces, initial)).toBe(false);
      expect(estFormulaireModifie(modifie, initial)).toBe(true);
    });
  });
});
