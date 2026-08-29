import { useEffect, useState } from 'react';

/**
 * Usage:
 *   const { toast, showToast } = useToast();
 *   ...
 *   showToast('Saved successfully', 'success');
 *   showToast('Something went wrong', 'error');
 *   ...
 *   <Toast {...toast} />
 */
export function useToast() {
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  function showToast(message, type = 'success') {
    setToast({ visible: true, message, type });
  }

  function hideToast() {
    setToast((t) => ({ ...t, visible: false }));
  }

  return { toast, showToast, hideToast };
}

export default function Toast({ visible, message, type = 'success', onHide }) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => onHide?.(), 3000);
    return () => clearTimeout(t);
  }, [visible, message]);

  if (!visible) return null;

  return (
    <div className={`toast toast-${type}`} role="status" aria-live="polite">
      <span className="toast-icon">{type === 'success' ? '✓' : '✕'}</span>
      {message}
    </div>
  );
}
