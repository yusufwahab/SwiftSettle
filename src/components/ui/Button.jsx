const variants = {
  primary: "bg-primary text-white hover:bg-primary-dark disabled:opacity-50",
  success: "bg-success text-white hover:opacity-90 disabled:opacity-50",
  danger: "bg-danger text-white hover:opacity-90 disabled:opacity-50",
  outline: "border border-border-strong text-ink hover:border-primary hover:text-primary",
  ghost: "text-primary hover:text-primary-dark",
  subtle: "bg-surface-alt text-muted hover:bg-border",
};

export default function Button({
  as: Component = "button",
  variant = "primary",
  square = false,
  className = "",
  children,
  ...props
}) {
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
        square ? "rounded-none" : "rounded"
      } ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
