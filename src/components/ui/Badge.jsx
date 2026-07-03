const tones = {
  success: "text-success border-success/40",
  warning: "text-warning border-warning/40",
  danger: "text-danger border-danger/40",
  neutral: "text-muted border-border-strong",
  primary: "text-primary border-primary/40",
};

export default function Badge({ tone = "neutral", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center border rounded px-2 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
