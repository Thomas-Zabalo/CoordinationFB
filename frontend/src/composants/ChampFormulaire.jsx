export default function ChampFormulaire({ id, libelle, erreur, obligatoire = false, aide, compteur, children }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-encre">
        {libelle}
        {obligatoire && (
          <span className="font-bold text-terre" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {children}
      {(aide || compteur) && (
        <div className="flex items-center justify-between gap-2 text-xs text-encre-douce">
          {aide ? <span>{aide}</span> : <span />}
          {compteur && (
            <span className={`font-mono tabular-nums ${compteur.depasse ? 'font-semibold text-danger' : ''}`}>
              {compteur.texte}
            </span>
          )}
        </div>
      )}
      {erreur && (
        <p className="m-0 text-xs font-medium text-danger" id={`${id}-erreur`}>
          {erreur}
        </p>
      )}
    </div>
  );
}
