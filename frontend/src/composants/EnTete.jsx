import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import { deconnecter } from '../api/auth.js';
import { useAuthentification } from '../auth/authentificationContexte.js';
import { LISTES } from '../vinyles/constantes.js';
import { useToast } from './toastContexte.js';

function extraireInitiales(nom) {
  if (!nom) return '??';
  return nom
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((morceau) => morceau[0]?.toUpperCase() ?? '')
    .join('');
}

export default function EnTete() {
  const { utilisateur, setUtilisateur, chargement } = useAuthentification();
  const { afficherErreur, afficherSucces } = useToast();
  const naviguer = useNavigate();
  const [deconnexionEnCours, setDeconnexionEnCours] = useState(false);

  async function gererDeconnexion() {
    if (deconnexionEnCours) return;
    setDeconnexionEnCours(true);
    try {
      await deconnecter();
      setUtilisateur(null);
      afficherSucces('Vous êtes déconnecté.');
      naviguer('/collection', { replace: true });
    } catch (erreur) {
      afficherErreur(erreur);
    } finally {
      setDeconnexionEnCours(false);
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-ligne bg-carte/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-3.5">
        <Link to="/" className="group inline-flex items-center gap-3 text-encre no-underline">
          <img
            src="/vinyle.svg"
            alt=""
            width="34"
            height="34"
            className="transition-transform duration-500 group-hover:rotate-45"
          />
          <span className="flex flex-col">
            <span className="font-serif text-xl leading-none font-bold tracking-tight text-encre">Records</span>
            <span className="mt-1 font-mono text-[10px] tracking-[0.18em] text-encre-douce uppercase">
              A home for your records
            </span>
          </span>
        </Link>

        <nav aria-label="Navigation principale" className="flex flex-wrap items-center gap-1 sm:gap-6">
          <div className="flex items-center gap-5">
            {Object.entries(LISTES).map(([cle, liste]) => (
              <NavLink
                key={cle}
                to={liste.chemin}
                className={({ isActive }) =>
                  `relative py-2 text-sm font-medium no-underline transition-colors ${
                    isActive
                      ? 'text-encre after:absolute after:right-0 after:bottom-0 after:left-0 after:h-[2px] after:bg-terre'
                      : 'text-encre-douce hover:text-encre'
                  }`
                }
              >
                {liste.nomCourt}
              </NavLink>
            ))}
          </div>

          {!chargement && (
            <div className="flex items-center gap-3 border-l border-ligne pl-4 sm:pl-6">
              {utilisateur ? (
                <>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-encre">
                    <span
                      aria-hidden="true"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-encre font-mono text-xs font-semibold text-papier"
                    >
                      {extraireInitiales(utilisateur.nom)}
                    </span>
                    <span className="hidden sm:inline">{utilisateur.nom}</span>
                  </span>
                  <button
                    type="button"
                    onClick={gererDeconnexion}
                    disabled={deconnexionEnCours}
                    className="inline-flex h-[34px] cursor-pointer items-center rounded-md border border-ligne bg-papier px-3 text-xs font-medium text-encre transition-colors hover:border-encre hover:bg-carte disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deconnexionEnCours ? 'Déconnexion…' : 'Déconnexion'}
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/connexion"
                    className={({ isActive }) =>
                      `inline-flex h-[34px] items-center rounded-md px-3 text-sm font-medium no-underline transition-colors ${
                        isActive ? 'text-terre' : 'text-encre-douce hover:text-encre'
                      }`
                    }
                  >
                    Connexion
                  </NavLink>
                  <NavLink
                    to="/inscription"
                    className="inline-flex h-[34px] items-center rounded-md border border-encre bg-encre px-3.5 text-sm font-medium text-papier no-underline transition-colors hover:bg-terre hover:border-terre"
                  >
                    Inscription
                  </NavLink>
                </>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
