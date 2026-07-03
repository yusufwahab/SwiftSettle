export default function Spinner({ className = "h-5 w-5", tone = "border-t-primary" }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-border-strong ${tone} ${className}`}
    />
  );
}
