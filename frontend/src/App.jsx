import { Navigate, Route, Routes } from 'react-router';
import EnTete from './composants/EnTete.jsx';
import PageAjout from './pages/PageAjout.jsx';
import PageDetail from './pages/PageDetail.jsx';
import PageIntrouvable from './pages/PageIntrouvable.jsx';
import PageListe from './pages/PageListe.jsx';
import PageModification from './pages/PageModification.jsx';

export default function App() {
  return (
    <>
      <EnTete />
      <main className="container contenu">
        <Routes>
          <Route path="/" element={<Navigate to="/collection" replace />} />
          {/* La clé remet les filtres à zéro quand on passe d'une liste à l'autre. */}
          <Route path="/collection" element={<PageListe key="collection" liste="collection" />} />
          <Route path="/envies" element={<PageListe key="envies" liste="envies" />} />
          <Route path="/vinyles/nouveau" element={<PageAjout />} />
          <Route path="/vinyles/:id" element={<PageDetail />} />
          <Route path="/vinyles/:id/modifier" element={<PageModification />} />
          <Route path="*" element={<PageIntrouvable />} />
        </Routes>
      </main>
    </>
  );
}
