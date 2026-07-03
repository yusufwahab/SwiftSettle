export default function Modal({ open, onClose, children, width = "480px" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div
        className="relative w-full bg-white rounded-lg p-8 shadow-xl"
        style={{ maxWidth: width }}
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-5 text-xl leading-none text-subtle hover:text-ink"
          >
            ×
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
