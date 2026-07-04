import { Loader2 } from "lucide-react";
import Button from "./Button";

export function LoadingState({ label = "Loading…", className = "py-16" }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 text-text-2 ${className}`}>
      <Loader2 className="h-5 w-5 animate-spin text-accent" strokeWidth={1.75} />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function ErrorState({ message = "Something went wrong.", onRetry, className = "py-16" }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 text-center ${className}`}>
      <div>
        <p className="text-sm font-medium text-text-1">Couldn't load this</p>
        <p className="mt-1 text-sm text-text-3">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="px-5 py-2">
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ title = "Nothing here yet", message, className = "py-16" }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-1 text-center ${className}`}>
      <p className="text-sm font-medium text-text-1">{title}</p>
      {message && <p className="text-sm text-text-3">{message}</p>}
    </div>
  );
}
