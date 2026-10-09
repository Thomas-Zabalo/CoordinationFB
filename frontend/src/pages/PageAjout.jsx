import { useNavigate, useSearchParams } from 'react-router';
import { creerVinyle } from '../api/vinyles.js';
import FormulaireVinyle from '../composants/FormulaireVinyle.jsx';
import { LISTES } from '../vinyles/constantes.js';

export default function PageAjout() {
  const naviguer = useNavigate();
  const [parametres] = useSearchParams();
  const liste = LISTES[parametres.get('liste')] ? parametres.get('liste') : 'collection';

  async function enregistrer(vinyle) {
    const vinyleCree = await creerVinyle(vinyle);
    naviguer(`/vinyles/${vinyleCree.id}`, {
      replace: true,
      state: { message: `« ${vinyleCree.titre} » a été ajouté à ${LISTES[vinyleCree.liste].nomPossessif}.` },
    });
  }

  return (
    <>
      <h1>Ajouter un vinyle</h1>
      <FormulaireVinyle
        vinyleInitial={{ liste }}
        libelleBouton="Ajouter"
        onEnregistrer={enregistrer}
        onAnnuler={() => naviguer(LISTES[liste].chemin)}
      />
    </>
  );
}
