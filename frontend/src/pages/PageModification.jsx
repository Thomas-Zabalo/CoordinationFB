import { Link, useNavigate, useParams } from 'react-router';
import { modifierVinyle } from '../api/vinyles.js';
import FormulaireVinyle from '../composants/FormulaireVinyle.jsx';
import MessageErreur from '../composants/MessageErreur.jsx';
import MessageSucces from '../composants/MessageSucces.jsx';
import { useVinyle } from '../vinyles/useVinyle.js';

export default function PageModification() {
  const { id } = useParams();
  const naviguer = useNavigate();
  const { vinyle, erreur, chargement } = useVinyle(id);

  if (chargement) return <p className="text-secondary">Chargement…</p>;
  if (erreur) {
    return (
      <>
        <MessageErreur erreur={erreur} />
        <Link to="/collection">Retour à ma collection</Link>
      </>
    );
  }

  async function enregistrer(modifications) {
    await modifierVinyle(id, modifications);
    naviguer(`/vinyles/${id}`, { replace: true, state: { message: 'Modifications enregistrées.' } });
  }

  return (
    <>
      <h1>Modifier un vinyle</h1>
      <MessageSucces />
      <FormulaireVinyle
        vinyleInitial={vinyle}
        libelleBouton="Enregistrer"
        onEnregistrer={enregistrer}
        onAnnuler={() => naviguer(`/vinyles/${id}`)}
      />
    </>
  );
}
