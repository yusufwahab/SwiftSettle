export function TextField({ label, help, error, className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1.5 block text-sm font-medium text-text-1">{label}</span>}
      <input
        className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-text-1 placeholder:text-text-3 focus:outline-none focus:border-accent ${
          error ? "border-danger-vivid" : "border-white/10"
        }`}
        {...props}
      />
      {error ? (
        <span className="mt-1.5 block text-xs text-danger-vivid">{error}</span>
      ) : help ? (
        <span className="mt-1.5 block text-xs text-text-3">{help}</span>
      ) : null}
    </label>
  );
}

export function SelectField({ label, help, error, children, className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1.5 block text-sm font-medium text-text-1">{label}</span>}
      <select
        className={`w-full rounded-xl border bg-panel px-4 py-3 text-sm text-text-1 focus:outline-none focus:border-accent ${
          error ? "border-danger-vivid" : "border-white/10"
        }`}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <span className="mt-1.5 block text-xs text-danger-vivid">{error}</span>
      ) : help ? (
        <span className="mt-1.5 block text-xs text-text-3">{help}</span>
      ) : null}
    </label>
  );
}

export function Checkbox({ label, className = "", ...props }) {
  return (
    <label className={`flex items-start gap-2.5 text-sm text-text-2 ${className}`}>
      <input type="checkbox" className="mt-0.5 h-4 w-4 accent-accent" {...props} />
      <span>{label}</span>
    </label>
  );
}

export function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-6 py-3">
      <div>
        <p className="text-sm text-text-1">{label}</p>
        {description && <p className="mt-0.5 text-xs text-text-3">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-accent" : "bg-white/10"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
