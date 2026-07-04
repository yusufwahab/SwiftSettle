import { X } from "lucide-react";

export default function Modal({ open, onClose, children, width = "480px" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div
        className="relative w-full rounded-2xl bg-panel p-8 text-text-1 shadow-2xl"
        style={{ maxWidth: width }}
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-5 text-text-3 hover:text-text-1"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
