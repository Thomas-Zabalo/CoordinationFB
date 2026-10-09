import { useState } from 'react';
import { ErreurApi } from '../api/vinyles.js';
import { ETATS, FORMATS, LISTES, TAILLES } from '../vinyles/constantes.js';
import MessageErreur from './MessageErreur.jsx';

const CHAMPS = [
  'artiste',
  'titre',
  'annee',
  'genre',
  'label',
  'numeroCatalogue',
  'format',
  'taille',
  'pays',
  'couleur',
  'etatDisque',
  'etatPochette',
  'liste',
  'notes',
];

function versFormulaire(vinyle) {
  return Object.fromEntries(CHAMPS.map((champ) => [champ, vinyle[champ] ?? '']));
}

function versVinyle(formulaire) {
  const vinyle = Object.fromEntries(
    Object.entries(formulaire).map(([champ, valeur]) => [champ, valeur.toString().trim() === '' ? null : valeur]),
  );
  vinyle.annee = vinyle.annee === null ? null : Number(vinyle.annee);
  return vinyle;
}

function Champ({ id, libelle, erreur, obligatoire, children }) {
  return (
    <div className={`champ ${erreur ? 'champ--erreur' : ''}`}>
      <label htmlFor={id}>
        {libelle}
        {obligatoire && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {erreur && (
        <p className="champ__erreur" id={`${id}-erreur`}>
          {erreur}
        </p>
      )}
    </div>
  );
}

function ChoixEtat({ id, libelle, valeur, erreur, onChange }) {
  return (
    <Champ id={id} libelle={libelle} erreur={erreur}>
      <select id={id} value={valeur} onChange={onChange} aria-invalid={Boolean(erreur)}>
        <option value="">Non noté</option>
        {ETATS.map((etat) => (
          <option key={etat.code} value={etat.code}>
            {etat.code} ({etat.nom}) : {etat.description}
          </option>
        ))}
      </select>
    </Champ>
  );
}

export default function FormulaireVinyle({ vinyleInitial, libelleBouton, onEnregistrer, onAnnuler }) {
  const [formulaire, setFormulaire] = useState(() => versFormulaire(vinyleInitial));
  const [erreurs, setErreurs] = useState({});
  const [erreurGenerale, setErreurGenerale] = useState(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  function modifier(champ) {
    return (evenement) => setFormulaire((precedent) => ({ ...precedent, [champ]: evenement.target.value }));
  }

  function proprietesTexte(champ) {
    return {
      id: `vinyle-${champ}`,
      value: formulaire[champ],
      onChange: modifier(champ),
      'aria-invalid': Boolean(erreurs[champ]),
      'aria-describedby': erreurs[champ] ? `vinyle-${champ}-erreur` : undefined,
    };
  }

  async function enregistrer(evenement) {
    evenement.preventDefault();
    setEnvoiEnCours(true);
    setErreurs({});
    setErreurGenerale(null);
    try {
      await onEnregistrer(versVinyle(formulaire));
    } catch (erreur) {
      if (erreur instanceof ErreurApi && erreur.statut === 400) setErreurs(erreur.details);
      setErreurGenerale(erreur);
      setEnvoiEnCours(false);
    }
  }

  return (
    <form className="formulaire card" onSubmit={enregistrer} noValidate>
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
              />
              {liste.nomCourt}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Sortie</legend>
        <div className="grille-champs">
          <Champ id="vinyle-artiste" libelle="Artiste" erreur={erreurs.artiste} obligatoire>
            <input {...proprietesTexte('artiste')} required maxLength={200} autoComplete="off" />
          </Champ>
          <Champ id="vinyle-titre" libelle="Titre" erreur={erreurs.titre} obligatoire>
            <input {...proprietesTexte('titre')} required maxLength={200} autoComplete="off" />
          </Champ>
          <Champ id="vinyle-annee" libelle="Année de sortie" erreur={erreurs.annee}>
            <input {...proprietesTexte('annee')} type="number" inputMode="numeric" min={1880} />
          </Champ>
          <Champ id="vinyle-genre" libelle="Genre" erreur={erreurs.genre}>
            <input {...proprietesTexte('genre')} maxLength={200} />
          </Champ>
        </div>
      </fieldset>

      <fieldset>
        <legend>Pressage</legend>
        <div className="grille-champs">
          <Champ id="vinyle-label" libelle="Label" erreur={erreurs.label}>
            <input {...proprietesTexte('label')} maxLength={200} />
          </Champ>
          <Champ id="vinyle-numeroCatalogue" libelle="Numéro de catalogue" erreur={erreurs.numeroCatalogue}>
            <input {...proprietesTexte('numeroCatalogue')} maxLength={200} placeholder="ex. PCS 7027" />
          </Champ>
          <Champ id="vinyle-format" libelle="Format" erreur={erreurs.format}>
            <select {...proprietesTexte('format')}>
              <option value="">Non précisé</option>
              {FORMATS.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </Champ>
          <Champ id="vinyle-taille" libelle="Taille" erreur={erreurs.taille}>
            <select {...proprietesTexte('taille')}>
              <option value="">Non précisée</option>
              {TAILLES.map((taille) => (
                <option key={taille} value={taille}>
                  {taille}
                </option>
              ))}
            </select>
          </Champ>
          <Champ id="vinyle-pays" libelle="Pays" erreur={erreurs.pays}>
            <input {...proprietesTexte('pays')} maxLength={200} />
          </Champ>
          <Champ id="vinyle-couleur" libelle="Couleur du vinyle" erreur={erreurs.couleur}>
            <input {...proprietesTexte('couleur')} maxLength={200} placeholder="ex. noir, rouge translucide" />
          </Champ>
        </div>
      </fieldset>

      <fieldset>
        <legend>État</legend>
        <p className="text-secondary">Le disque et la pochette sont notés séparément.</p>
        <div className="grille-champs">
          <ChoixEtat
            id="vinyle-etatDisque"
            libelle="État du disque"
            valeur={formulaire.etatDisque}
            erreur={erreurs.etatDisque}
            onChange={modifier('etatDisque')}
          />
          <ChoixEtat
            id="vinyle-etatPochette"
            libelle="État de la pochette"
            valeur={formulaire.etatPochette}
            erreur={erreurs.etatPochette}
            onChange={modifier('etatPochette')}
          />
        </div>
      </fieldset>

      <Champ id="vinyle-notes" libelle="Notes" erreur={erreurs.notes}>
        <textarea {...proprietesTexte('notes')} rows={4} maxLength={2000} />
      </Champ>

      <div className="actions">
        <button type="submit" className="btn btn-primary" disabled={envoiEnCours}>
          {envoiEnCours ? 'Enregistrement…' : libelleBouton}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onAnnuler}>
          Annuler
        </button>
      </div>
    </form>
  );
}
