import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { modifierVinyle } from '../api/vinyles.js';
import FormulaireVinyle from '../composants/FormulaireVinyle.jsx';
import MessageErreur from '../composants/MessageErreur.jsx';
import MessageSucces from '../composants/MessageSucces.jsx';
import { useToast } from '../composants/toastContexte.js';
import { useVinyle } from '../vinyles/useVinyle.js';

export default function PageModification() {
  const { id } = useParams();
  const naviguer = useNavigate();
  const { vinyle, erreur, chargement } = useVinyle(id);
  const { afficherErreur } = useToast();

  useEffect(() => {
    if (erreur) {
      afficherErreur(erreur);
    }
  }, [erreur, afficherErreur]);

  if (chargement) {
    return (
      <p className="py-8 font-mono text-xs uppercase tracking-widest text-encre-douce" role="status" aria-live="polite">
        Chargement…
      </p>
    );
  }

  if (erreur || !vinyle) {
    return (
      <div className="mx-auto max-w-xl py-8">
        <MessageErreur erreur={erreur || 'Vinyle introuvable'} />
        <Link
          to="/collection"
          className="inline-flex items-center text-sm font-medium text-encre-douce no-underline transition-colors hover:text-terre"
        >
          ← Retour à ma collection
        </Link>
      </div>
    );
  }

  async function enregistrer(modifications) {
    await modifierVinyle(id, modifications);
    naviguer(`/vinyles/${id}`, { replace: true, state: { message: 'Modifications enregistrées.' } });
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to={`/vinyles/${id}`}
        className="mb-5 inline-flex items-center text-sm font-medium text-encre-douce no-underline transition-colors hover:text-terre"
      >
        ← Retour à la fiche
      </Link>
      <header className="mb-6">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-terre">Édition du pressage</p>
        <h1 className="mt-1.5 font-serif text-3xl font-bold text-encre sm:text-4xl">Modifier un vinyle</h1>
        <p className="mt-2 text-sm text-encre-douce">
          {vinyle.artiste} — {vinyle.titre}
        </p>
      </header>
      <MessageSucces />
      <FormulaireVinyle
        key={vinyle.id}
        mode="modification"
        vinyleInitial={vinyle}
        libelleBouton="Enregistrer"
        onEnregistrer={enregistrer}
        onAnnuler={() => naviguer(`/vinyles/${id}`)}
      />
    </div>
  );
}
