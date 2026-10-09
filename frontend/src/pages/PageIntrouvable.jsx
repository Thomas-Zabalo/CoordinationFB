import { Link } from 'react-router';

export default function PageIntrouvable() {
  return (
    <>
      <h1>Page introuvable</h1>
      <p>Cette page n’existe pas ou a été déplacée.</p>
      <Link to="/collection" className="btn btn-primary">
        Retour à ma collection
      </Link>
    </>
  );
}
