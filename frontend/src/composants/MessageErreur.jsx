export default function MessageErreur({ erreur }) {
  if (!erreur) return null;
  return (
    <div className="alert alert-erreur" role="alert">
      {erreur.message}
    </div>
  );
}
