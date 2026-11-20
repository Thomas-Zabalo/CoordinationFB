import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { connecter, inscrire } from '../api/auth.js';
import { ErreurApi } from '../api/requete.js';
import { useAuthentification } from '../auth/authentificationContexte.js';
import ChampFormulaire from '../composants/ChampFormulaire.jsx';
import MessageErreur from '../composants/MessageErreur.jsx';

const EMAIL_VALIDE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LONGUEUR_MAX_EMAIL = 254;
const LONGUEUR_MAX_NOM = 100;
const LONGUEUR_MAX_MOT_DE_PASSE = 128;

function validerFormulaire(formulaire, mode) {
  const erreurs = {};
  const email = formulaire.email.trim();

  if (!email) erreurs.email = 'Champ obligatoire';
  else if (email.length > LONGUEUR_MAX_EMAIL || !EMAIL_VALIDE.test(email)) erreurs.email = 'Adresse e-mail invalide';

  if (mode === 'inscription') {
    const nom = formulaire.nom.trim();
    if (!nom) erreurs.nom = 'Champ obligatoire';
    else if (nom.length < 2) erreurs.nom = 'Doit contenir au moins 2 caractères';
    else if (nom.length > LONGUEUR_MAX_NOM) erreurs.nom = `Ne doit pas dépasser ${LONGUEUR_MAX_NOM} caractères`;
  }

  const motDePasse = formulaire.motDePasse;
  if (!motDePasse) erreurs.motDePasse = 'Champ obligatoire';
  else if (motDePasse.length > LONGUEUR_MAX_MOT_DE_PASSE) {
    erreurs.motDePasse = `Ne doit pas dépasser ${LONGUEUR_MAX_MOT_DE_PASSE} caractères`;
  } else if (mode === 'inscription') {
    if (motDePasse.length < 8) erreurs.motDePasse = 'Doit contenir au moins 8 caractères';
    else if (!/[a-zA-ZÀ-ÿ]/.test(motDePasse) || !/\d/.test(motDePasse)) {
      erreurs.motDePasse = 'Doit contenir au moins une lettre et un chiffre';
    }
  }

  if (mode === 'inscription' && formulaire.confirmation !== motDePasse) {
    erreurs.confirmation = 'Les mots de passe ne correspondent pas';
  }

  return erreurs;
}

function focaliserPremierChampEnErreur(erreurs) {
  const premierChamp = Object.keys(erreurs)[0];
  if (premierChamp) document.getElementById(`auth-${premierChamp}`)?.focus();
}

export default function PageAuthentification({ mode }) {
  const estInscription = mode === 'inscription';
  const naviguer = useNavigate();
  const { setUtilisateur } = useAuthentification();
  const [formulaire, setFormulaire] = useState({ email: '', nom: '', motDePasse: '', confirmation: '' });
  const [erreurs, setErreurs] = useState({});
  const [erreurGenerale, setErreurGenerale] = useState(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  function modifier(champ) {
    return (evenement) => {
      const valeur = evenement.target.value;
      setFormulaire((precedent) => ({ ...precedent, [champ]: valeur }));
      setErreurs((precedentes) => {
        if (!precedentes[champ] && !(champ === 'motDePasse' && precedentes.confirmation)) return precedentes;
        const suivantes = { ...precedentes };
        delete suivantes[champ];
        if (champ === 'motDePasse' && suivantes.confirmation && valeur === formulaire.confirmation) {
          delete suivantes.confirmation;
        } else if (champ === 'motDePasse' && suivantes.confirmation) {
          suivantes.confirmation = 'Les mots de passe ne correspondent pas';
        }
        return suivantes;
      });
      setErreurGenerale(null);
    };
  }

  function proprietesChamp(champ) {
    return {
      id: `auth-${champ}`,
      value: formulaire[champ],
      onChange: modifier(champ),
      'aria-invalid': Boolean(erreurs[champ]),
      'aria-describedby': erreurs[champ] ? `auth-${champ}-erreur` : undefined,
      required: true,
    };
  }

  async function soumettre(evenement) {
    evenement.preventDefault();
    if (envoiEnCours) return;

    const erreursFormulaire = validerFormulaire(formulaire, mode);
    setErreurs(erreursFormulaire);
    setErreurGenerale(null);
    if (Object.keys(erreursFormulaire).length > 0) {
      focaliserPremierChampEnErreur(erreursFormulaire);
      return;
    }

    setEnvoiEnCours(true);
    try {
      if (estInscription) {
        const utilisateur = await inscrire({
          email: formulaire.email.trim(),
          nom: formulaire.nom.trim(),
          motDePasse: formulaire.motDePasse,
        });
        setUtilisateur(utilisateur);
      } else {
        const utilisateur = await connecter({ email: formulaire.email.trim(), motDePasse: formulaire.motDePasse });
        setUtilisateur(utilisateur);
      }

      naviguer('/collection', {
        replace: true,
        state: { message: estInscription ? 'Votre compte a été créé. Bienvenue !' : 'Vous êtes connecté.' },
      });
    } catch (erreur) {
      if (erreur instanceof ErreurApi && erreur.statut === 400 && erreur.details) {
        setErreurs(erreur.details);
        focaliserPremierChampEnErreur(erreur.details);
      }
      setErreurGenerale(erreur);
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <section className="mx-auto max-w-md py-4">
      <header className="mb-6">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-terre">
          {estInscription ? 'Nouveau collectionneur' : 'Espace personnel'}
        </p>
        <h1 className="mt-1.5 font-serif text-3xl font-bold text-encre">
          {estInscription ? 'Créer un compte' : 'Connexion'}
        </h1>
        <p className="mt-2 text-sm text-encre-douce">
          {estInscription
            ? 'Inscrivez-vous pour retrouver votre espace CoordinationFB.'
            : 'Connectez-vous à votre compte CoordinationFB.'}
        </p>
      </header>

      <form
        className="space-y-5 rounded-lg border border-ligne bg-carte p-6 shadow-2xs sm:p-7"
        onSubmit={soumettre}
        noValidate
      >
        <MessageErreur erreur={erreurGenerale} />

        <ChampFormulaire id="auth-email" libelle="Adresse e-mail" erreur={erreurs.email} obligatoire>
          <input
            {...proprietesChamp('email')}
            type="email"
            autoComplete="email"
            maxLength={LONGUEUR_MAX_EMAIL}
            autoCapitalize="none"
            placeholder="collectionneur@exemple.fr"
          />
        </ChampFormulaire>

        {estInscription && (
          <ChampFormulaire id="auth-nom" libelle="Nom" erreur={erreurs.nom} obligatoire>
            <input
              {...proprietesChamp('nom')}
              type="text"
              autoComplete="name"
              minLength={2}
              maxLength={LONGUEUR_MAX_NOM}
              placeholder="Alex Martin"
            />
          </ChampFormulaire>
        )}

        <ChampFormulaire
          id="auth-motDePasse"
          libelle="Mot de passe"
          erreur={erreurs.motDePasse}
          aide={estInscription ? '8 à 128 caractères, avec au moins une lettre et un chiffre.' : undefined}
          obligatoire
        >
          <input
            {...proprietesChamp('motDePasse')}
            type="password"
            autoComplete={estInscription ? 'new-password' : 'current-password'}
            minLength={estInscription ? 8 : undefined}
            maxLength={LONGUEUR_MAX_MOT_DE_PASSE}
          />
        </ChampFormulaire>

        {estInscription && (
          <ChampFormulaire
            id="auth-confirmation"
            libelle="Confirmer le mot de passe"
            erreur={erreurs.confirmation}
            obligatoire
          >
            <input
              {...proprietesChamp('confirmation')}
              type="password"
              autoComplete="new-password"
              maxLength={LONGUEUR_MAX_MOT_DE_PASSE}
            />
          </ChampFormulaire>
        )}

        <button
          type="submit"
          disabled={envoiEnCours}
          className="inline-flex h-[42px] w-full cursor-pointer items-center justify-center rounded-md bg-terre px-5 text-sm font-semibold text-white transition-colors hover:bg-terre-fonce disabled:cursor-not-allowed disabled:opacity-60"
        >
          {envoiEnCours ? 'Envoi en cours…' : estInscription ? 'Créer mon compte' : 'Se connecter'}
        </button>

        <p className="m-0 border-t border-ligne pt-4 text-center text-sm text-encre-douce">
          {estInscription ? 'Vous avez déjà un compte ? ' : 'Pas encore de compte ? '}
          <Link
            to={estInscription ? '/connexion' : '/inscription'}
            className="font-semibold text-terre no-underline hover:underline"
          >
            {estInscription ? 'Se connecter' : 'Créer un compte'}
          </Link>
        </p>
      </form>
    </section>
  );
}
