import { Link, NavLink } from 'react-router';
import { LISTES } from '../vinyles/constantes.js';

export default function EnTete() {
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
        </nav>
      </div>
    </header>
  );
}
