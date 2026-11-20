import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ANNEE_MIN, ETATS, FORMATS, LISTES, TAILLES } from '../src/vinyles/constantes.js';
import {
  LONGUEUR_MAX_NOTES,
  LONGUEUR_MAX_TEXTE,
  validerIdentifiant,
  validerModificationPartielle,
  validerRecherche,
  validerVinyle,
} from '../src/vinyles/validation.js';

describe('validation des vinyles', () => {
  describe('validerVinyle', () => {
    it('normalise et valide un vinyle minimal avec valeurs par défaut', () => {
      const { valeurs, erreurs } = validerVinyle({
        artiste: '  Miles Davis  ',
        titre: '  Kind of Blue  ',
      });

      assert.equal(erreurs, undefined);
      assert.deepEqual(valeurs, {
        artiste: 'Miles Davis',
        titre: 'Kind of Blue',
        annee: null,
        genre: null,
        label: null,
        numeroCatalogue: null,
        format: null,
        taille: null,
        pays: null,
        couleur: null,
        etatDisque: null,
        etatPochette: null,
        liste: 'collection',
        notes: null,
      });
    });

    it('accepte tous les champs valides et convertit une année en nombre', () => {
      const { valeurs, erreurs } = validerVinyle({
        artiste: 'Pink Floyd',
        titre: 'The Dark Side of the Moon',
        annee: '1973',
        genre: 'Rock progressif',
        label: 'Harvest',
        numeroCatalogue: 'SHVL 804',
        format: FORMATS[0],
        taille: TAILLES[0],
        pays: 'Royaume-Uni',
        couleur: 'Noir',
        etatDisque: ETATS[1],
        etatPochette: ETATS[2],
        liste: LISTES[1],
        notes: 'Pressage original britannique',
      });

      assert.equal(erreurs, undefined);
      assert.equal(valeurs.annee, 1973);
      assert.equal(valeurs.etatDisque, 'NM');
      assert.equal(valeurs.etatPochette, 'VG+');
      assert.equal(valeurs.liste, 'envies');
    });

    it('rejette un corps non objet (tableau, null, chaîne)', () => {
      for (const corpsInvalide of [null, undefined, 'texte', 42, []]) {
        const { erreurs } = validerVinyle(corpsInvalide);
        assert.ok(erreurs?.corps);
      }
    });

    it('exige artiste et titre non vides (même composés uniquement d’espaces)', () => {
      const { erreurs } = validerVinyle({ artiste: '   ', titre: '' });

      assert.equal(erreurs.artiste, 'Champ obligatoire');
      assert.equal(erreurs.titre, 'Champ obligatoire');
    });

    it('refuse les textes dépassant les longueurs maximales et les octets nuls', () => {
      const { erreurs } = validerVinyle({
        artiste: 'A'.repeat(LONGUEUR_MAX_TEXTE + 1),
        titre: 'Titre\0injecté',
        notes: 'N'.repeat(LONGUEUR_MAX_NOTES + 1),
      });

      assert.match(erreurs.artiste, new RegExp(String(LONGUEUR_MAX_TEXTE)));
      assert.match(erreurs.titre, /non autorisés/);
      assert.match(erreurs.notes, new RegExp(String(LONGUEUR_MAX_NOTES)));
    });

    it('refuse un type non textuel sur un champ texte', () => {
      const { erreurs } = validerVinyle({ artiste: 123, titre: ['Album'] });

      assert.equal(erreurs.artiste, 'Doit être un texte');
      assert.equal(erreurs.titre, 'Doit être un texte');
    });

    it('valide les bornes exactes et le format de l’année', () => {
      const anneeMax = new Date().getFullYear() + 1;

      assert.equal(validerVinyle({ artiste: 'A', titre: 'T', annee: ANNEE_MIN }).valeurs.annee, ANNEE_MIN);
      assert.equal(validerVinyle({ artiste: 'A', titre: 'T', annee: anneeMax }).valeurs.annee, anneeMax);

      for (const anneeInvalide of [ANNEE_MIN - 1, anneeMax + 1, 1969.5, '99', 'abcd', NaN, Infinity, true]) {
        const { erreurs } = validerVinyle({ artiste: 'A', titre: 'T', annee: anneeInvalide });
        assert.ok(erreurs?.annee, `L'année ${String(anneeInvalide)} devrait être refusée`);
      }
    });

    it('valide les champs énumérés (format, taille, état disque/pochette, liste)', () => {
      const { erreurs } = validerVinyle({
        artiste: 'A',
        titre: 'T',
        format: 'CD',
        taille: '5"',
        etatDisque: 'Neuf',
        etatPochette: 10,
        liste: 'favoris',
      });

      assert.ok(erreurs.format);
      assert.ok(erreurs.taille);
      assert.ok(erreurs.etatDisque);
      assert.ok(erreurs.etatPochette);
      assert.ok(erreurs.liste);
    });
  });

  describe('validerModificationPartielle', () => {
    it('ne valide et ne renvoie que les champs fournis', () => {
      const { valeurs, erreurs } = validerModificationPartielle({
        etatDisque: 'NM',
        notes: '  Nettoyé aux ultrasons  ',
      });

      assert.equal(erreurs, undefined);
      assert.deepEqual(valeurs, {
        etatDisque: 'NM',
        notes: 'Nettoyé aux ultrasons',
      });
    });

    it('autorise la remise à null des champs facultatifs', () => {
      const { valeurs, erreurs } = validerModificationPartielle({
        annee: '',
        notes: null,
        etatPochette: '',
      });

      assert.equal(erreurs, undefined);
      assert.deepEqual(valeurs, { annee: null, notes: null, etatPochette: null });
    });

    it('interdit de vider artiste, titre ou liste', () => {
      const { erreurs } = validerModificationPartielle({
        artiste: '   ',
        titre: null,
        liste: '',
      });

      assert.equal(erreurs.artiste, 'Champ obligatoire');
      assert.equal(erreurs.titre, 'Champ obligatoire');
      assert.ok(erreurs.liste);
    });

    it('rejette un objet vide ou ne contenant que des champs non modifiables', () => {
      assert.ok(validerModificationPartielle({}).erreurs?.corps);
      assert.ok(validerModificationPartielle({ id: 99, dateAjout: '2020-01-01', inconnu: 'x' }).erreurs?.corps);
      assert.ok(validerModificationPartielle([]).erreurs?.corps);
    });

    it('ignore les champs système immuables lorsqu’un champ valide est présent', () => {
      const { valeurs, erreurs } = validerModificationPartielle({
        id: 999,
        dateAjout: '2000-01-01T00:00:00.000Z',
        liste: 'collection',
      });

      assert.equal(erreurs, undefined);
      assert.deepEqual(valeurs, { liste: 'collection' });
    });
  });

  describe('validerIdentifiant', () => {
    it('accepte les entiers positifs valides en chaîne ou en nombre', () => {
      assert.equal(validerIdentifiant('1'), 1);
      assert.equal(validerIdentifiant(' 42 '), 42);
      assert.equal(validerIdentifiant(123456789), 123456789);
    });

    it('rejette les valeurs invalides, nulles, négatives ou trop longues', () => {
      for (const invalide of [null, undefined, '', '0', '-5', '1.5', 'abc', '1234567890', {}, []]) {
        assert.equal(validerIdentifiant(invalide), null, `Identifiant ${String(invalide)} devrait être refusé`);
      }
    });
  });

  describe('validerRecherche', () => {
    it('applique les valeurs par défaut quand aucun paramètre n’est fourni', () => {
      const { filtres, erreurs } = validerRecherche({});

      assert.equal(erreurs, undefined);
      assert.deepEqual(filtres, {
        q: null,
        genre: null,
        tri: 'dateAjout',
        ordre: 'desc',
        liste: null,
        format: null,
      });
    });

    it('bascule l’ordre par défaut en croissant quand un tri explicite est demandé', () => {
      const { filtres } = validerRecherche({ tri: 'artiste' });
      assert.equal(filtres.ordre, 'asc');
    });
  });
});
