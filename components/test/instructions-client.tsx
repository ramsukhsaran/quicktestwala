"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckSquare, Square } from "lucide-react";

export function InstructionsClient({ testId }: { testId: string }) {
  const [agreed, setAgreed] = React.useState(false);
  const router = useRouter();

  const handleStart = () => {
    if (!agreed) return;
    router.push(`/student/tests/${testId}/attempt`);
  };

  return (
    <div className="space-y-6 pt-4 border-t border-border">
      <div
        className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card cursor-pointer select-none"
        onClick={() => setAgreed(!agreed)}
      >
        <button
          type="button"
          className="mt-0.5 text-foreground focus:outline-none"
        >
          {agreed ? (
            <CheckSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Square className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
        <div className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground block mb-0.5">
            Declaration & Agreement
          </span>
          I have read and understood all instructions regarding duration, negative marking, and question palette operations. I agree not to use unauthorized reference materials during this computer-based test attempt.
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleStart}
          disabled={!agreed}
          size="lg"
          className="h-11 px-8 text-sm font-semibold gap-2 shadow-md disabled:opacity-50"
        >
          I am Ready to Begin
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
