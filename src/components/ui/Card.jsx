export default function Card({ className = "", children, padded = true }) {
  return (
    <div
      className={`rounded-2xl bg-panel ${padded ? "p-6" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
