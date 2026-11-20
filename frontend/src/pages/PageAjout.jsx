import { Link, useNavigate, useSearchParams } from 'react-router';
import { creerVinyle } from '../api/vinyles.js';
import FormulaireVinyle from '../composants/FormulaireVinyle.jsx';
import { LISTES } from '../vinyles/constantes.js';

export default function PageAjout() {
  const naviguer = useNavigate();
  const [parametres] = useSearchParams();
  const liste = LISTES[parametres.get('liste')] ? parametres.get('liste') : 'collection';
  const infosListe = LISTES[liste];

  async function enregistrer(vinyle) {
    const vinyleCree = await creerVinyle(vinyle);
    naviguer(`/vinyles/${vinyleCree.id}`, {
      replace: true,
      state: { message: `« ${vinyleCree.titre} » a été ajouté à ${LISTES[vinyleCree.liste].nomPossessif}.` },
    });
  }

  return (
    <>
      <Link to={infosListe.chemin} className="lien-retour">
        ← {infosListe.titre}
      </Link>
      <header className="entete-formulaire">
        <h1>Ajouter un vinyle</h1>
        <p className="text-secondary">
          Renseignez les informations du pressage pour l’ajouter à {infosListe.nomPossessif}.
        </p>
      </header>
      <FormulaireVinyle
        mode="ajout"
        vinyleInitial={{ liste }}
        libelleBouton="Ajouter"
        onEnregistrer={enregistrer}
        onAnnuler={() => naviguer(infosListe.chemin)}
      />
    </>
  );
}
