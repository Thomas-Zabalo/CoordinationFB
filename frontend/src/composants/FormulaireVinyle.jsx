import { useMemo, useState } from 'react';
import { ErreurApi } from '../api/vinyles.js';
import {
  ANNEE_MIN,
  FORMATS,
  GENRES_SUGGERES,
  LISTES,
  LONGUEUR_MAX_NOTES,
  LONGUEUR_MAX_TEXTE,
  TAILLES,
} from '../vinyles/constantes.js';
import {
  anneeMaximaleAutorisee,
  estFormulaireModifie,
  validerChampVinyle,
  validerFormulaireVinyle,
  versFormulaire,
  versVinyle,
} from '../vinyles/validation.js';
import ChampFormulaire from './ChampFormulaire.jsx';
import MessageErreur from './MessageErreur.jsx';
import SelecteurEtat from './SelecteurEtat.jsx';
import { useToast } from './toastContexte.js';

function focaliserPremierChampEnErreur(erreurs) {
  const premierChamp = Object.keys(erreurs)[0];
  if (!premierChamp) return;
  document.getElementById(`vinyle-${premierChamp}`)?.focus();
}

export default function FormulaireVinyle({
  vinyleInitial,
  libelleBouton,
  onEnregistrer,
  onAnnuler,
  mode = 'ajout',
}) {
  const etatInitial = useMemo(() => versFormulaire(vinyleInitial), [vinyleInitial]);
  const [formulaire, setFormulaire] = useState(() => etatInitial);
  const [erreurs, setErreurs] = useState({});
  const [erreurGenerale, setErreurGenerale] = useState(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const { afficherErreur } = useToast();

  const anneeMax = anneeMaximaleAutorisee();
  const estModifie = estFormulaireModifie(formulaire, etatInitial);
  const longueurNotes = formulaire.notes.length;

  function modifier(champ) {
    return (evenement) => {
      const nouvelleValeur = evenement.target.value;
      setFormulaire((precedent) => ({ ...precedent, [champ]: nouvelleValeur }));

      if (erreurs[champ]) {
        const erreurChamp = validerChampVinyle(champ, nouvelleValeur, { anneeMax });
        setErreurs((precedentes) => {
          const suivantes = { ...precedentes };
          if (erreurChamp) suivantes[champ] = erreurChamp;
          else delete suivantes[champ];
          return suivantes;
        });
      }
    };
  }

  function validerAuFlou(champ) {
    return () => {
      const erreurChamp = validerChampVinyle(champ, formulaire[champ], { anneeMax });
      setErreurs((precedentes) => {
        if (!erreurChamp && !precedentes[champ]) return precedentes;
        const suivantes = { ...precedentes };
        if (erreurChamp) suivantes[champ] = erreurChamp;
        else delete suivantes[champ];
        return suivantes;
      });
    };
  }

  function proprietesChamp(champ, { validerSurBlur = false } = {}) {
    return {
      id: `vinyle-${champ}`,
      value: formulaire[champ],
      onChange: modifier(champ),
      onBlur: validerSurBlur ? validerAuFlou(champ) : undefined,
      'aria-invalid': Boolean(erreurs[champ]),
      'aria-describedby': erreurs[champ] ? `vinyle-${champ}-erreur` : undefined,
    };
  }

  function reinitialiser() {
    setFormulaire(etatInitial);
    setErreurs({});
    setErreurGenerale(null);
  }

  async function enregistrer(evenement) {
    evenement.preventDefault();
    if (envoiEnCours) return;

    const validation = validerFormulaireVinyle(formulaire, { anneeMax });
    if (!validation.valide) {
      setErreurs(validation.erreurs);
      setErreurGenerale('Veuillez corriger les champs signalés avant d’enregistrer.');
      focaliserPremierChampEnErreur(validation.erreurs);
      return;
    }

    setEnvoiEnCours(true);
    setErreurs({});
    setErreurGenerale(null);

    try {
      await onEnregistrer(versVinyle(formulaire));
    } catch (erreur) {
      if (erreur instanceof ErreurApi && erreur.statut === 400 && erreur.details) {
        setErreurs(erreur.details);
        focaliserPremierChampEnErreur(erreur.details);
      }
      setErreurGenerale(erreur);
      afficherErreur(erreur);
      setEnvoiEnCours(false);
    }
  }

  return (
    <form className="formulaire card" onSubmit={enregistrer} noValidate>
      <div className="formulaire__entete">
        <p className="text-secondary formulaire__legende">
          Les champs marqués d’un <span className="champ__obligatoire">*</span> sont obligatoires.
        </p>
        {mode === 'modification' && estModifie && (
          <span className="formulaire__statut" role="status">
            Modifications non enregistrées
          </span>
        )}
      </div>

      <MessageErreur erreur={erreurGenerale} />

      <fieldset>
        <legend>Liste</legend>
        <div className="choix-liste">
          {Object.entries(LISTES).map(([cle, liste]) => (
            <label key={cle} className="choix-liste__option">
              <input
                type="radio"
                name="liste"
                value={cle}
                checked={formulaire.liste === cle}
                onChange={modifier('liste')}
                aria-label={liste.nomCourt}
                aria-describedby={`liste-${cle}-description`}
              />
              <span className="choix-liste__texte">
                <span className="choix-liste__titre">{liste.nomCourt}</span>
                <span id={`liste-${cle}-description`} className="choix-liste__description">
                  {liste.description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Sortie</legend>
        <div className="grille-champs">
          <ChampFormulaire id="vinyle-artiste" libelle="Artiste" erreur={erreurs.artiste} obligatoire>
            <input
              {...proprietesChamp('artiste', { validerSurBlur: true })}
              required
              maxLength={LONGUEUR_MAX_TEXTE}
              autoComplete="off"
              placeholder="ex. Miles Davis"
            />
          </ChampFormulaire>
          <ChampFormulaire id="vinyle-titre" libelle="Titre" erreur={erreurs.titre} obligatoire>
            <input
              {...proprietesChamp('titre', { validerSurBlur: true })}
              required
              maxLength={LONGUEUR_MAX_TEXTE}
              autoComplete="off"
              placeholder="ex. Kind of Blue"
            />
          </ChampFormulaire>
          <ChampFormulaire
            id="vinyle-annee"
            libelle="Année de sortie"
            erreur={erreurs.annee}
            aide={`Entre ${ANNEE_MIN} et ${anneeMax}`}
          >
            <input
              {...proprietesChamp('annee', { validerSurBlur: true })}
              type="number"
              inputMode="numeric"
              min={ANNEE_MIN}
              max={anneeMax}
              placeholder="ex. 1959"
            />
          </ChampFormulaire>
          <ChampFormulaire id="vinyle-genre" libelle="Genre" erreur={erreurs.genre}>
            <input
              {...proprietesChamp('genre')}
              list="vinyle-genres-suggeres"
              maxLength={LONGUEUR_MAX_TEXTE}
              placeholder="ex. Jazz, Rock, Électro"
            />
            <datalist id="vinyle-genres-suggeres">
              {GENRES_SUGGERES.map((genre) => (
                <option key={genre} value={genre} />
              ))}
            </datalist>
          </ChampFormulaire>
        </div>
      </fieldset>

      <fieldset>
        <legend>Pressage</legend>
        <div className="grille-champs">
          <ChampFormulaire id="vinyle-label" libelle="Label" erreur={erreurs.label}>
            <input {...proprietesChamp('label')} maxLength={LONGUEUR_MAX_TEXTE} placeholder="ex. Columbia" />
          </ChampFormulaire>
          <ChampFormulaire
            id="vinyle-numeroCatalogue"
            libelle="Numéro de catalogue"
            erreur={erreurs.numeroCatalogue}
          >
            <input
              {...proprietesChamp('numeroCatalogue')}
              maxLength={LONGUEUR_MAX_TEXTE}
              placeholder="ex. PCS 7027"
            />
          </ChampFormulaire>
          <ChampFormulaire id="vinyle-format" libelle="Format" erreur={erreurs.format}>
            <select {...proprietesChamp('format')}>
              <option value="">Non précisé</option>
              {FORMATS.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </ChampFormulaire>
          <ChampFormulaire id="vinyle-taille" libelle="Taille" erreur={erreurs.taille}>
            <select {...proprietesChamp('taille')}>
              <option value="">Non précisée</option>
              {TAILLES.map((taille) => (
                <option key={taille} value={taille}>
                  {taille}
                </option>
              ))}
            </select>
          </ChampFormulaire>
          <ChampFormulaire id="vinyle-pays" libelle="Pays" erreur={erreurs.pays}>
            <input {...proprietesChamp('pays')} maxLength={LONGUEUR_MAX_TEXTE} placeholder="ex. Royaume-Uni" />
          </ChampFormulaire>
          <ChampFormulaire id="vinyle-couleur" libelle="Couleur du vinyle" erreur={erreurs.couleur}>
            <input
              {...proprietesChamp('couleur')}
              maxLength={LONGUEUR_MAX_TEXTE}
              placeholder="ex. noir, rouge translucide"
            />
          </ChampFormulaire>
        </div>
      </fieldset>

      <fieldset>
        <legend>État (échelle Goldmine)</legend>
        <p className="text-secondary">
          {formulaire.liste === 'envies'
            ? 'Le disque et la pochette sont notés séparément. Facultatif : indiquez l’état minimal recherché.'
            : 'Le disque et la pochette sont notés séparément selon le standard du marché du disque.'}
        </p>
        <div className="grille-champs">
          <SelecteurEtat
            id="vinyle-etatDisque"
            libelle="État du disque"
            valeur={formulaire.etatDisque}
            erreur={erreurs.etatDisque}
            onChange={modifier('etatDisque')}
          />
          <SelecteurEtat
            id="vinyle-etatPochette"
            libelle="État de la pochette"
            valeur={formulaire.etatPochette}
            erreur={erreurs.etatPochette}
            onChange={modifier('etatPochette')}
          />
        </div>
      </fieldset>

      <ChampFormulaire
        id="vinyle-notes"
        libelle="Notes"
        erreur={erreurs.notes}
        aide="Particularités du pressage, matrice, lieu ou prix d’achat…"
        compteur={{
          texte: `${longueurNotes} / ${LONGUEUR_MAX_NOTES}`,
          depasse: longueurNotes > LONGUEUR_MAX_NOTES,
        }}
      >
        <textarea {...proprietesChamp('notes')} rows={4} maxLength={LONGUEUR_MAX_NOTES} />
      </ChampFormulaire>

      <div className="actions">
        <button type="submit" className="btn btn-primary" disabled={envoiEnCours}>
          {envoiEnCours ? 'Enregistrement…' : libelleBouton}
        </button>
        {mode === 'modification' && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={reinitialiser}
            disabled={envoiEnCours || !estModifie}
          >
            Réinitialiser
          </button>
        )}
        <button type="button" className="btn btn-secondary" onClick={onAnnuler} disabled={envoiEnCours}>
          Annuler
        </button>
      </div>
    </form>
  );
}
