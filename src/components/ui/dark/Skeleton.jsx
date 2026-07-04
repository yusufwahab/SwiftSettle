export default function Skeleton({ className = "h-4 w-full", style }) {
  return <div className={`animate-pulse rounded-lg bg-white/6 ${className}`} style={style} />;
}
