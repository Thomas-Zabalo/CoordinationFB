import { useLocation } from 'react-router';

// Affiche le message transmis par la page précédente lors d'une redirection.
export default function MessageSucces() {
  const message = useLocation().state?.message;
  if (!message) return null;
  return (
    <div className="alert alert-success" role="status">
      {message}
    </div>
  );
}
