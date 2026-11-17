import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { modifierVinyle, supprimerVinyle } from '../api/vinyles.js';
import BadgeEtat from '../composants/BadgeEtat.jsx';
import MessageErreur from '../composants/MessageErreur.jsx';
import MessageSucces from '../composants/MessageSucces.jsx';
import { LISTES, trouverEtat } from '../vinyles/constantes.js';
import { useVinyle } from '../vinyles/useVinyle.js';

function Information({ libelle, valeur }) {
  return (
    <div className="information">
      <dt>{libelle}</dt>
      <dd>{valeur || '—'}</dd>
    </div>
  );
}

function InformationEtat({ libelle, code }) {
  const etat = trouverEtat(code);
  return (
    <div className="information">
      <dt>{libelle}</dt>
      <dd className="information__etat">
        <BadgeEtat code={code} />
        {etat && <span className="text-secondary">{`${etat.nom} : ${etat.description}`}</span>}
      </dd>
    </div>
  );
}

export default function PageDetail() {
  const { id } = useParams();
  const naviguer = useNavigate();
  const { vinyle, erreur, chargement } = useVinyle(id);
  const [erreurAction, setErreurAction] = useState(null);

  if (chargement) return <p className="text-secondary">Chargement…</p>;
  if (erreur) {
    return (
      <>
        <MessageErreur erreur={erreur} />
        <Link to="/collection">Retour à ma collection</Link>
      </>
    );
  }

  const liste = LISTES[vinyle.liste];

  async function supprimer() {
    if (!window.confirm(`Supprimer « ${vinyle.titre} » de ${liste.nomPossessif} ?`)) return;
    try {
      await supprimerVinyle(vinyle.id);
      naviguer(liste.chemin, { state: { message: `« ${vinyle.titre} » a été supprimé.` } });
    } catch (erreurSuppression) {
      setErreurAction(erreurSuppression);
    }
  }

  async function deplacerVersCollection() {
    try {
      await modifierVinyle(vinyle.id, { ...vinyle, liste: 'collection' });
      naviguer(`/vinyles/${vinyle.id}/modifier`, {
        state: { message: 'Ajouté à votre collection ! Renseignez maintenant l’état du disque et de la pochette.' },
      });
    } catch (erreurDeplacement) {
      setErreurAction(erreurDeplacement);
    }
  }

  return (
    <>
      <Link to={liste.chemin} className="lien-retour">
        ← {liste.titre}
      </Link>
      <MessageSucces />
      <MessageErreur erreur={erreurAction} />

      <article className="card fiche">
        <header className="fiche__entete">
          <div>
            <p className="fiche__artiste">{vinyle.artiste}</p>
            <h1 className="fiche__titre">{vinyle.titre}</h1>
            <p className="text-secondary">
              {[vinyle.annee, vinyle.genre, liste.nomCourt].filter(Boolean).join(' · ')}
            </p>
          </div>
          <div className="actions">
            {vinyle.liste === 'envies' && (
              <button type="button" className="btn btn-primary" onClick={deplacerVersCollection}>
                Je l’ai trouvé
              </button>
            )}
            <Link to={`/vinyles/${vinyle.id}/modifier`} className="btn btn-outline">
              Modifier
            </Link>
            <button type="button" className="btn btn-secondary" onClick={supprimer}>
              Supprimer
            </button>
          </div>
        </header>

        <h3>Pressage</h3>
        <dl className="informations">
          <Information libelle="Label" valeur={vinyle.label} />
          <Information libelle="Numéro de catalogue" valeur={vinyle.numeroCatalogue} />
          <Information libelle="Format" valeur={[vinyle.format, vinyle.taille].filter(Boolean).join(' ')} />
          <Information libelle="Pays" valeur={vinyle.pays} />
          <Information libelle="Couleur du vinyle" valeur={vinyle.couleur} />
        </dl>

        <h3>État</h3>
        <dl className="informations">
          <InformationEtat libelle="Disque" code={vinyle.etatDisque} />
          <InformationEtat libelle="Pochette" code={vinyle.etatPochette} />
        </dl>

        {vinyle.notes && (
          <>
            <h3>Notes</h3>
            <p className="fiche__notes">{vinyle.notes}</p>
          </>
        )}
      </article>
    </>
  );
}
