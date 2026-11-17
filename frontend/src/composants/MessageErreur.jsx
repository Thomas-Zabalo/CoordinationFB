export default function MessageErreur({ erreur }) {
  if (!erreur) return null;
  const message = typeof erreur === 'string' ? erreur : erreur.message || 'Une erreur inattendue est survenue.';
  return (
    <div className="alert alert-erreur" role="alert">
      {message}
    </div>
  );
}
