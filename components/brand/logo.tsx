import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showBadge = false,
  href = "/",
}: {
  className?: string;
  showBadge?: boolean;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 font-semibold text-lg tracking-tight select-none group",
        className
      )}
    >
      <div className="h-8 w-8 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-mono font-bold text-base shadow-sm transition-transform group-hover:scale-105">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="font-bold tracking-tight text-foreground">Exam</span>
        <span className="font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
          Forge
        </span>
      </div>
      {showBadge && (
        <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded border border-border bg-muted/50 text-muted-foreground font-semibold">
          CBT
        </span>
      )}
    </Link>
  );
}
