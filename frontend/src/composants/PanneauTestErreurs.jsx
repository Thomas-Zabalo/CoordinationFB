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
    enregistrerErreur(
      418,
      'Je suis une théière ! (Exemple d’erreur personnalisée ajoutée dynamiquement)',
      'Théière (418)',
    );
    afficherErreur(418);
  }

  if (!ouvert) {
    return (
      <div className="fixed bottom-6 left-6 z-40">
        <button
          type="button"
          onClick={() => setOuvert(true)}
          title="Ouvrir le panneau pour tester les toasts d'erreur"
          className="inline-flex h-[34px] cursor-pointer items-center gap-2 rounded-full border border-encre/20 bg-carte px-4 font-mono text-xs font-medium text-encre shadow-md transition-colors hover:border-terre hover:text-terre"
        >
          🧪 Tester les toasts
        </button>
      </div>
    );
  }

  return (
    <aside
      className="fixed bottom-6 left-6 z-40 w-[calc(100vw-3rem)] max-w-sm rounded-lg border border-ligne bg-carte p-4 shadow-xl"
      aria-label="Outil de test des toasts"
    >
      <header className="mb-3 flex items-center justify-between border-b border-ligne pb-2.5">
        <div className="flex items-center gap-2 text-sm text-encre">
          <span aria-hidden="true">🧪</span>
          <strong className="font-serif text-sm font-bold">Tester la gestion des erreurs</strong>
        </div>
        <button
          type="button"
          aria-label="Fermer le panneau de test"
          onClick={() => setOuvert(false)}
          className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded text-encre-douce transition-colors hover:bg-papier hover:text-encre"
        >
          ✕
        </button>
      </header>

      <p className="mb-3 text-xs text-encre-douce">
        Cliquez sur un bouton pour générer une erreur et voir le toast correspondant :
      </p>

      <div className="space-y-3">
        <div>
          <span className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-widest text-encre-douce">
            Erreurs HTTP par défaut :
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => afficherErreur(403)}
              className="inline-flex h-7 cursor-pointer items-center rounded border border-danger/40 bg-carte px-2.5 font-mono text-[11px] font-medium text-danger transition-colors hover:bg-danger hover:text-white"
            >
              403 Interdit
            </button>
            <button
              type="button"
              onClick={() => afficherErreur(404)}
              className="inline-flex h-7 cursor-pointer items-center rounded border border-danger/40 bg-carte px-2.5 font-mono text-[11px] font-medium text-danger transition-colors hover:bg-danger hover:text-white"
            >
              404 Introuvable
            </button>
            <button
              type="button"
              onClick={() => afficherErreur(500)}
              className="inline-flex h-7 cursor-pointer items-center rounded border border-danger/40 bg-carte px-2.5 font-mono text-[11px] font-medium text-danger transition-colors hover:bg-danger hover:text-white"
            >
              500 Serveur
            </button>
            <button
              type="button"
              onClick={() => afficherErreur(0)}
              className="inline-flex h-7 cursor-pointer items-center rounded border border-danger/40 bg-carte px-2.5 font-mono text-[11px] font-medium text-danger transition-colors hover:bg-danger hover:text-white"
            >
              Réseau (0)
            </button>
          </div>
        </div>

        <div>
          <span className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-widest text-encre-douce">
            Extensibilité (erreur sur mesure) :
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={testerErreurPersonnalisee}
              className="inline-flex h-7 cursor-pointer items-center rounded border border-ligne bg-papier px-2.5 font-mono text-[11px] font-medium text-encre transition-colors hover:border-encre"
            >
              + Erreur 418 Théière
            </button>
          </div>
        </div>

        <div>
          <span className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-widest text-encre-douce">
            Appel API réel (via le serveur Express) :
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              disabled={chargementApi}
              onClick={() => testerAppelApi(403)}
              className="inline-flex h-7 cursor-pointer items-center rounded border border-encre/30 bg-carte px-2.5 font-mono text-[11px] font-medium text-encre transition-colors hover:border-terre hover:text-terre disabled:opacity-50"
            >
              API 403
            </button>
            <button
              type="button"
              disabled={chargementApi}
              onClick={() => testerAppelApi(404)}
              className="inline-flex h-7 cursor-pointer items-center rounded border border-encre/30 bg-carte px-2.5 font-mono text-[11px] font-medium text-encre transition-colors hover:border-terre hover:text-terre disabled:opacity-50"
            >
              API 404
            </button>
          </div>
        </div>

        <div>
          <span className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-widest text-encre-douce">
            Autre notification :
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => afficherSucces('Opération validée avec succès !')}
              className="inline-flex h-7 cursor-pointer items-center rounded border border-qualite/40 bg-carte px-2.5 font-mono text-[11px] font-medium text-qualite transition-colors hover:bg-qualite hover:text-white"
            >
              Toast Succès
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
