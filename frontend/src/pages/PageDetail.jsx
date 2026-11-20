import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { modifierVinyle, supprimerVinyle } from '../api/vinyles.js';
import BadgeEtat from '../composants/BadgeEtat.jsx';
import MessageErreur from '../composants/MessageErreur.jsx';
import MessageSucces from '../composants/MessageSucces.jsx';
import PochetteVinyle from '../composants/PochetteVinyle.jsx';
import { useToast } from '../composants/toastContexte.js';
import { LISTES, trouverEtat } from '../vinyles/constantes.js';
import { useVinyle } from '../vinyles/useVinyle.js';

function Information({ libelle, valeur, mono = false }) {
  return (
    <div className="border-b border-ligne/70 pb-3">
      <dt className="font-mono text-[10px] uppercase tracking-widest text-encre-douce">{libelle}</dt>
      <dd className={`mt-1 text-sm font-medium text-encre ${mono ? 'font-mono' : ''}`}>{valeur || '—'}</dd>
    </div>
  );
}

function CarteCondition({ etiquette, titre, code }) {
  const etat = trouverEtat(code);
  return (
    <div className="rounded-lg border border-ligne bg-carte p-5 shadow-2xs">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-encre-douce">{etiquette}</p>
          <h3 className="mt-0.5 font-serif text-base font-bold text-encre">{titre}</h3>
        </div>
        <BadgeEtat code={code} />
      </div>
      <p className="mt-3 text-sm text-encre-douce">
        {etat ? `${etat.nom} — ${etat.description}` : 'Aucune évaluation Goldmine renseignée pour le moment.'}
      </p>
    </div>
  );
}

export default function PageDetail() {
  const { id } = useParams();
  const naviguer = useNavigate();
  const { vinyle, erreur, chargement } = useVinyle(id);
  const [erreurAction, setErreurAction] = useState(null);
  const { afficherErreur } = useToast();

  useEffect(() => {
    if (erreur) {
      afficherErreur(erreur);
    }
  }, [erreur, afficherErreur]);

  if (chargement) {
    return (
      <p className="py-8 font-mono text-xs uppercase tracking-widest text-encre-douce" role="status">
        Chargement…
      </p>
    );
  }

  if (erreur || !vinyle || !LISTES[vinyle.liste]) {
    return (
      <div className="mx-auto max-w-xl py-8">
        <MessageErreur erreur={erreur || 'Vinyle introuvable'} />
        <Link
          to="/collection"
          className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-encre no-underline hover:text-terre"
        >
          ← Retour à ma collection
        </Link>
      </div>
    );
  }

  const liste = LISTES[vinyle.liste];
  const estCollection = vinyle.liste === 'collection';

  async function supprimer() {
    if (!window.confirm(`Supprimer « ${vinyle.titre} » de ${liste.nomPossessif} ?`)) return;
    try {
      await supprimerVinyle(vinyle.id);
      naviguer(liste.chemin, { state: { message: `« ${vinyle.titre} » a été supprimé.` } });
    } catch (erreurSuppression) {
      setErreurAction(erreurSuppression);
      afficherErreur(erreurSuppression);
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
      afficherErreur(erreurDeplacement);
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête supérieur : fil d'Ariane + statut + actions rapides */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ligne pb-4">
        <nav aria-label="Fil d’Ariane" className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            to={liste.chemin}
            className="font-medium text-encre-douce no-underline transition-colors hover:text-terre"
          >
            ← {liste.titre}
          </Link>
          <span aria-hidden="true" className="text-ligne">
            /
          </span>
          <span className="font-medium text-encre">{vinyle.titre}</span>
        </nav>

        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={`inline-flex h-6 items-center gap-1.5 rounded border px-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider ${
              estCollection
                ? 'border-qualite/30 bg-qualite-clair text-qualite'
                : 'border-terre/30 bg-terre-clair text-terre'
            }`}
          >
            {estCollection ? '✓ Dans la collection' : 'Dans la wantlist'}
          </span>

          {vinyle.liste === 'envies' && (
            <button
              type="button"
              onClick={deplacerVersCollection}
              className="inline-flex h-[34px] cursor-pointer items-center rounded-md bg-terre px-3.5 text-xs font-semibold text-white transition-colors hover:bg-terre-fonce"
            >
              Je l’ai trouvé
            </button>
          )}

          <Link
            to={`/vinyles/${vinyle.id}/modifier`}
            className="inline-flex h-[34px] items-center rounded-md border border-encre bg-carte px-3.5 text-xs font-semibold text-encre no-underline transition-colors hover:bg-papier"
          >
            Modifier
          </Link>

          <button
            type="button"
            onClick={supprimer}
            className="inline-flex h-[34px] cursor-pointer items-center rounded-md border border-ligne bg-papier px-3.5 text-xs font-medium text-encre-douce transition-colors hover:border-danger hover:bg-danger-clair hover:text-danger"
          >
            Supprimer
          </button>
        </div>
      </div>

      <MessageSucces />
      <MessageErreur erreur={erreurAction} />

      {/* Section Héro : Pochette + détails du pressage */}
      <article className="grid grid-cols-1 gap-8 rounded-lg border border-ligne bg-carte p-6 shadow-2xs md:grid-cols-[280px_1fr] lg:grid-cols-[340px_1fr] lg:p-8">
        <div className="mx-auto w-full max-w-[340px]">
          <PochetteVinyle vinyle={vinyle} taille="hero" />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-terre">{vinyle.artiste}</p>
            <h1 className="mt-2 font-serif text-3xl leading-tight font-bold text-encre sm:text-4xl">{vinyle.titre}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-xs text-encre-douce">
              {vinyle.annee && <span className="rounded bg-papier px-2 py-0.5 text-encre">{vinyle.annee}</span>}
              {vinyle.genre && <span className="rounded bg-papier px-2 py-0.5">{vinyle.genre}</span>}
              {(vinyle.format || vinyle.taille) && (
                <span className="rounded bg-papier px-2 py-0.5">
                  {[vinyle.format, vinyle.taille].filter(Boolean).join(' / ')}
                </span>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-encre-douce">
              Détails du pressage
            </h2>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              <Information libelle="Label" valeur={vinyle.label} />
              <Information libelle="Numéro de catalogue" valeur={vinyle.numeroCatalogue} mono />
              <Information libelle="Format" valeur={[vinyle.format, vinyle.taille].filter(Boolean).join(' ')} mono />
              <Information libelle="Pays" valeur={vinyle.pays} />
              <Information libelle="Couleur du vinyle" valeur={vinyle.couleur} />
              <Information libelle="Liste" valeur={liste.nomCourt} />
            </dl>
          </div>
        </div>
      </article>

      {/* Section État & Conservation (séparée Média / Pochette) */}
      <section aria-labelledby="section-etat">
        <h2
          id="section-etat"
          className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-encre-douce"
        >
          État &amp; Conservation (Goldmine)
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CarteCondition etiquette="Média" titre="Condition du disque" code={vinyle.etatDisque} />
          <CarteCondition etiquette="Pochette" titre="Condition de la pochette" code={vinyle.etatPochette} />
        </div>
      </section>

      {/* Notes personnelles */}
      {vinyle.notes && (
        <section className="rounded-lg border border-ligne bg-carte p-6 shadow-2xs">
          <h2 className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-encre-douce">
            Notes personnelles
          </h2>
          <p className="m-0 whitespace-pre-line text-sm leading-relaxed text-encre">{vinyle.notes}</p>
        </section>
      )}
    </div>
  );
}
