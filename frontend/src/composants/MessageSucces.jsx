import { useLocation } from 'react-router';

// Affiche le message transmis par la page précédente lors d'une redirection.
export default function MessageSucces() {
  const message = useLocation().state?.message;
  if (!message) return null;
  return (
    <div
      className="mb-5 flex items-center gap-2.5 rounded-md border border-qualite/30 border-l-4 border-l-qualite bg-qualite-clair px-4 py-3 text-sm font-medium text-qualite"
      role="status"
    >
      <span aria-hidden="true" className="font-mono font-bold">
        ✓
      </span>
      <span>{message}</span>
    </div>
  );
}
