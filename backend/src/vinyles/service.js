import { erreurIntrouvable, erreurValidation } from '../erreurs.js';
import {
  validerIdentifiant,
  validerModificationPartielle,
  validerRecherche,
  validerTransfert,
  validerVinyle,
} from './validation.js';

function lireIdentifiant(idBrut) {
  const id = validerIdentifiant(idBrut);
  if (id === null) throw erreurIntrouvable('Vinyle introuvable');
  return id;
}

export function creerServiceVinyles(depot) {
  return {
    lister(query) {
      const { filtres, erreurs } = validerRecherche(query);
      if (erreurs) throw erreurValidation(erreurs);
      return depot.lister(filtres);
    },

    listerGenres(query) {
      const { filtres, erreurs } = validerRecherche({ liste: query?.liste });
      if (erreurs) throw erreurValidation(erreurs);
      return depot.listerGenres(filtres.liste);
    },

    consulter(idBrut) {
      const vinyle = depot.trouver(lireIdentifiant(idBrut));
      if (!vinyle) throw erreurIntrouvable('Vinyle introuvable');
      return vinyle;
    },

    ajouter(corps) {
      const { valeurs, erreurs } = validerVinyle(corps);
      if (erreurs) throw erreurValidation(erreurs);
      return depot.creer(valeurs);
    },

    modifier(idBrut, corps) {
      const id = lireIdentifiant(idBrut);
      const { valeurs, erreurs } = validerVinyle(corps);
      if (erreurs) throw erreurValidation(erreurs);
      const vinyle = depot.modifier(id, valeurs);
      if (!vinyle) throw erreurIntrouvable('Vinyle introuvable');
      return vinyle;
    },

    modifierPartiellement(idBrut, corps) {
      const id = lireIdentifiant(idBrut);
      const { valeurs, erreurs } = validerModificationPartielle(corps);
      if (erreurs) throw erreurValidation(erreurs);
      const vinyle = depot.modifierPartiellement(id, valeurs);
      if (!vinyle) throw erreurIntrouvable('Vinyle introuvable');
      return vinyle;
    },

    transferer(idBrut, corps) {
      const id = lireIdentifiant(idBrut);
      const { valeurs, erreurs } = validerTransfert(corps);
      if (erreurs) throw erreurValidation(erreurs);
      const vinyle = depot.transfererVersCollection(id, valeurs);
      if (!vinyle) throw erreurIntrouvable('Vinyle introuvable');
      return vinyle;
    },

    supprimer(idBrut) {
      const id = lireIdentifiant(idBrut);
      if (!depot.supprimer(id)) throw erreurIntrouvable('Vinyle introuvable');
    },
  };
}
