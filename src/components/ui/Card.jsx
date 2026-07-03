export default function Card({ className = "", children, padded = true }) {
  return (
    <div className={`bg-white border border-border rounded-lg ${padded ? "p-6" : ""} ${className}`}>
      {children}
    </div>
  );
}
