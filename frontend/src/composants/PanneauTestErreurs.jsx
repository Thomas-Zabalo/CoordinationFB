import { useState } from 'react';
import { declencherErreurApi } from '../api/vinyles.js';
import { enregistrerErreur } from '../erreurs/gestionnaireErreurs.js';
import { useToast } from './toastContexte.js';

export default function PanneauTestErreurs() {
  const [ouvert, setOuvert] = useState(false);
  const [chargementApi, setChargementApi] = useState(false);
  const { afficherErreur, afficherSucces } = useToast();

  async function testerAppelApi(statut) {
    setChargementApi(true);
    try {
      await declencherErreurApi(statut);
    } catch (erreur) {
      afficherErreur(erreur);
    } finally {
      setChargementApi(false);
    }
  }

  function testerErreurPersonnalisee() {
    // Démonstration de l'ajout d'une erreur personnalisée à la volée
    enregistrerErreur(
      418,
      'Je suis une théière ! (Exemple d’erreur personnalisée ajoutée dynamiquement)',
      'Théière (418)',
    );
    afficherErreur(418);
  }

  if (!ouvert) {
    return (
      <div className="panneau-test-declencheur">
        <button
          type="button"
          className="btn btn-secondary btn-test-flottant"
          onClick={() => setOuvert(true)}
          title="Ouvrir le panneau pour tester les toasts d'erreur"
        >
          🧪 Tester les toasts
        </button>
      </div>
    );
  }

  return (
    <aside className="card panneau-test-erreurs" aria-label="Outil de test des toasts">
      <header className="panneau-test-erreurs__entete">
        <div className="panneau-test-erreurs__titre">
          <span aria-hidden="true">🧪</span>
          <strong>Tester la gestion des erreurs</strong>
        </div>
        <button
          type="button"
          className="panneau-test-erreurs__fermer"
          aria-label="Fermer le panneau de test"
          onClick={() => setOuvert(false)}
        >
          ✕
        </button>
      </header>

      <p className="panneau-test-erreurs__description">
        Cliquez sur un bouton pour générer une erreur et voir le toast correspondant :
      </p>

      <div className="panneau-test-erreurs__groupe">
        <span className="panneau-test-erreurs__groupe-titre">Erreurs HTTP par défaut :</span>
        <div className="panneau-test-erreurs__boutons">
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => afficherErreur(403)}
          >
            403 Interdit
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => afficherErreur(404)}
          >
            404 Introuvable
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => afficherErreur(500)}
          >
            500 Serveur
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => afficherErreur(0)}
          >
            Réseau (0)
          </button>
        </div>
      </div>

      <div className="panneau-test-erreurs__groupe">
        <span className="panneau-test-erreurs__groupe-titre">Extensibilité (erreur sur mesure) :</span>
        <div className="panneau-test-erreurs__boutons">
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={testerErreurPersonnalisee}
          >
            + Erreur 418 Théière
          </button>
        </div>
      </div>

      <div className="panneau-test-erreurs__groupe">
        <span className="panneau-test-erreurs__groupe-titre">Appel API réel (via le serveur Express) :</span>
        <div className="panneau-test-erreurs__boutons">
          <button
            type="button"
            className="btn btn-sm btn-outline"
            disabled={chargementApi}
            onClick={() => testerAppelApi(403)}
          >
            API 403
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            disabled={chargementApi}
            onClick={() => testerAppelApi(404)}
          >
            API 404
          </button>
        </div>
      </div>

      <div className="panneau-test-erreurs__groupe">
        <span className="panneau-test-erreurs__groupe-titre">Autre notification :</span>
        <div className="panneau-test-erreurs__boutons">
          <button
            type="button"
            className="btn btn-sm btn-outline-succes"
            onClick={() => afficherSucces('Opération validée avec succès !')}
          >
            Toast Succès
          </button>
        </div>
      </div>
    </aside>
  );
}
