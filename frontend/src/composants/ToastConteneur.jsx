import Toast from './Toast.jsx';
import { useToast } from './toastContexte.js';

export default function ToastConteneur() {
  const { toasts, fermerToast } = useToast();

  if (!toasts || toasts.length === 0) {
    return null;
  }

  return (
    <aside className="toasts-conteneur" aria-label="Notifications système">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onFermer={fermerToast} />
      ))}
    </aside>
  );
}
