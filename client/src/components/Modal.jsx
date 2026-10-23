// components/Modal.jsx
// Simple popup window used for edit forms and confirm dialogs.

export default function Modal({ open, title, onClose, children }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()} // clicks inside don't close it
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-2xl leading-none text-slate-400 hover:text-slate-600">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Ready-made "Are you sure?" dialog
export function ConfirmDialog({ open, title, message, confirmText = 'Delete', onConfirm, onClose, busy }) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="mb-6 text-sm text-slate-600">{message}</p>
      <div className="flex justify-end gap-2">
        <button className="btn-secondary" onClick={onClose} disabled={busy}>
          Cancel
        </button>
        <button className="btn-danger" onClick={onConfirm} disabled={busy}>
          {busy ? 'Deleting...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}
