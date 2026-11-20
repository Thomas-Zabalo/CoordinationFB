export default function ChampFormulaire({ id, libelle, erreur, obligatoire = false, aide, compteur, children }) {
  return (
    <div className={`champ ${erreur ? 'champ--erreur' : ''}`}>
      <label htmlFor={id}>
        {libelle}
        {obligatoire && (
          <span className="champ__obligatoire" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {children}
      {(aide || compteur) && (
        <div className="champ__pied">
          {aide ? <span className="champ__aide">{aide}</span> : <span />}
          {compteur && (
            <span className={`champ__compteur ${compteur.depasse ? 'champ__compteur--alerte' : ''}`}>
              {compteur.texte}
            </span>
          )}
        </div>
      )}
      {erreur && (
        <p className="champ__erreur" id={`${id}-erreur`}>
          {erreur}
        </p>
      )}
    </div>
  );
}
