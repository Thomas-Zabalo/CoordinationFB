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
    <div className="mx-auto max-w-4xl">
      <Link
        to={infosListe.chemin}
        className="mb-5 inline-flex items-center text-sm font-medium text-encre-douce no-underline transition-colors hover:text-terre"
      >
        ← {infosListe.titre}
      </Link>
      <header className="mb-6">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-terre">Nouveau pressage</p>
        <h1 className="mt-1.5 font-serif text-3xl font-bold text-encre sm:text-4xl">Ajouter un vinyle</h1>
        <p className="mt-2 text-sm text-encre-douce">
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
    </div>
  );
}
