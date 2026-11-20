import Toast from './Toast.jsx';
import { useToast } from './toastContexte.js';

export default function ToastConteneur() {
  const { toasts, fermerToast } = useToast();

  if (!toasts || toasts.length === 0) {
    return null;
  }

  return (
    <aside
      className="pointer-events-none fixed right-6 bottom-6 z-50 flex w-[calc(100vw-3rem)] max-w-sm flex-col gap-3"
      aria-label="Notifications système"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onFermer={fermerToast} />
      ))}
    </aside>
  );
}
