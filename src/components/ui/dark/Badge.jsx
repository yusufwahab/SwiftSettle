const tones = {
  success: "text-accent-2 bg-accent-2/12",
  warning: "text-warning-vivid bg-warning-vivid/12",
  danger: "text-danger-vivid bg-danger-vivid/12",
  neutral: "text-text-2 bg-white/6",
  primary: "text-accent bg-accent/12",
};

export default function Badge({ tone = "neutral", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
