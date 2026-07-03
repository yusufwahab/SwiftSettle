export default function Skeleton({ className = "h-4 w-full", style }) {
  return <div className={`animate-pulse rounded bg-surface-alt ${className}`} style={style} />;
}
