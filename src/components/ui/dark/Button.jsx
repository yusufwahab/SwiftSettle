const variants = {
  primary: "bg-accent text-white hover:bg-accent-dark disabled:opacity-50",
  success: "bg-accent-2 text-[#052e14] font-semibold hover:opacity-90 disabled:opacity-50",
  danger: "bg-danger-vivid text-[#3f0d0d] font-semibold hover:opacity-90 disabled:opacity-50",
  outline: "border border-white/12 text-text-1 hover:bg-white/5",
  ghost: "text-accent hover:opacity-80",
  subtle: "bg-white/5 text-text-2 hover:bg-white/10",
};

export default function Button({
  as: Component = "button",
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-colors ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
