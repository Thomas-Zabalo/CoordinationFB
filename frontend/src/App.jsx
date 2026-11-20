import { Navigate, Route, Routes } from 'react-router';
import { FournisseurAuthentification } from './auth/ContexteAuthentification.jsx';
import EnTete from './composants/EnTete.jsx';
import PanneauTestErreurs from './composants/PanneauTestErreurs.jsx';
import ToastConteneur from './composants/ToastConteneur.jsx';
import ToastProvider from './composants/ToastProvider.jsx';
import PageAjout from './pages/PageAjout.jsx';
import PageAuthentification from './pages/PageAuthentification.jsx';
import PageDetail from './pages/PageDetail.jsx';
import PageIntrouvable from './pages/PageIntrouvable.jsx';
import PageListe from './pages/PageListe.jsx';
import PageModification from './pages/PageModification.jsx';

export default function App() {
  return (
    <ToastProvider>
      <FournisseurAuthentification>
        <div className="flex min-h-screen flex-col">
          <EnTete />
          <ToastConteneur />
          <PanneauTestErreurs />
          <main className="mx-auto w-full max-w-7xl flex-1 px-6 pt-8 pb-16">
            <Routes>
              <Route path="/" element={<Navigate to="/collection" replace />} />
              {/* La clé remet les filtres à zéro quand on passe d'une liste à l'autre. */}
              <Route path="/collection" element={<PageListe key="collection" liste="collection" />} />
              <Route path="/envies" element={<PageListe key="envies" liste="envies" />} />
              <Route path="/vinyles/nouveau" element={<PageAjout />} />
              <Route path="/vinyles/:id" element={<PageDetail />} />
              <Route path="/vinyles/:id/modifier" element={<PageModification />} />
              <Route path="/inscription" element={<PageAuthentification mode="inscription" />} />
              <Route path="/connexion" element={<PageAuthentification mode="connexion" />} />
              <Route path="*" element={<PageIntrouvable />} />
            </Routes>
          </main>
        </div>
      </FournisseurAuthentification>
    </ToastProvider>
  );
}
