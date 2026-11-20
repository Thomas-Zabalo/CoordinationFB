import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import { deconnecter } from '../api/auth.js';
import { useAuthentification } from '../auth/ContexteAuthentification.jsx';
import { useToast } from './toastContexte.js';
import { LISTES } from '../vinyles/constantes.js';

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
    <header className="nav">
      <div className="container nav__contenu">
        <Link to="/" className="marque">
          <img src="/vinyle.svg" alt="" width="32" height="32" />
          CoordinationFB
        </Link>
        <nav aria-label="Navigation principale" className="nav__liens">
          {Object.entries(LISTES).map(([cle, liste]) => (
            <NavLink key={cle} to={liste.chemin}>
              {liste.nomCourt}
            </NavLink>
          ))}
          {!chargement &&
            (utilisateur ? (
              <>
                <span className="nav__utilisateur">{utilisateur.nom}</span>
                <button
                  type="button"
                  className="nav__deconnexion"
                  onClick={gererDeconnexion}
                  disabled={deconnexionEnCours}
                >
                  {deconnexionEnCours ? 'Déconnexion…' : 'Déconnexion'}
                </button>
              </>
            ) : (
              <>
                <NavLink to="/connexion">Connexion</NavLink>
                <NavLink to="/inscription">Inscription</NavLink>
              </>
            ))}
        </nav>
      </div>
    </header>
  );
}
