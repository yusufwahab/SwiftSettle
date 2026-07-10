export default function Card({ className = "", children, padded = true, ...rest }) {
  return (
    <div
      className={`rounded-2xl bg-panel ${padded ? "p-6" : ""} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
