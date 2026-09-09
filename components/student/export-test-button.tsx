"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download, FileText, Lock, Loader2 } from "lucide-react";

interface ExportTestButtonProps {
  testId: string;
  isSubscribed?: boolean;
  hasAttempted?: boolean;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showIconOnly?: boolean;
  label?: string;
}

export function ExportTestButton({
  testId,
  isSubscribed = true,
  hasAttempted = true,
  variant = "outline",
  size = "sm",
  className = "",
  showIconOnly = false,
  label = "Export PDF",
}: ExportTestButtonProps) {
  const isLocked = !isSubscribed || !hasAttempted;

  if (isLocked) {
    const tooltipText = !isSubscribed
      ? "Subscription to Test Series required to download PDF"
      : "Must attempt and submit this test to unlock PDF download";

    return (
      <Link href={`/student/tests/${testId}/export`} title={tooltipText}>
        <Button
          variant={variant}
          size={size}
          className={`gap-1.5 text-xs text-muted-foreground hover:text-foreground opacity-85 ${className}`}
        >
          <Lock className="h-3 w-3 text-amber-500" />
          {!showIconOnly && (
            <span>
              {label} <span className="text-[10px] text-amber-600 font-mono">(Locked)</span>
            </span>
          )}
        </Button>
      </Link>
    );
  }

  return (
    <Link
      href={`/student/tests/${testId}/export`}
      target="_blank"
      rel="noopener noreferrer"
      title="Download professional PDF question paper and step-by-step solutions"
    >
      <Button
        variant={variant}
        size={size}
        className={`gap-1.5 text-xs font-semibold shadow-xs ${className}`}
      >
        <FileText className="h-3.5 w-3.5 text-primary" />
        {!showIconOnly && label}
      </Button>
    </Link>
  );
}
