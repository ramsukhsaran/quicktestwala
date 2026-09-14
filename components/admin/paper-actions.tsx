"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { deletePreviousYearPaperAction } from "@/actions/admin";
import { useToast } from "@/components/ui/toast";
import { Download, Eye, Trash2, Loader2 } from "lucide-react";

interface PaperActionsProps {
  paperId: string;
  pdfUrl?: string;
}

export function PaperActions({ paperId, pdfUrl }: PaperActionsProps) {
  const [deleting, setDeleting] = React.useState(false);
  const { toast } = useToast();

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this previous year question paper?")) {
      return;
    }

    try {
      setDeleting(true);
      const res = await deletePreviousYearPaperAction(paperId);
      if (res.error) {
        toast({ title: "Error", description: res.error, type: "error" });
        setDeleting(false);
        return;
      }
      toast({ title: "Paper Deleted", description: "Previous year paper removed.", type: "success" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, type: "error" });
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-2 pt-2 border-t border-border">
      <Link href={`/student/question-papers/${paperId}/export`} target="_blank" className="flex-1">
        <Button size="sm" variant="outline" className="w-full text-xs h-8 gap-1.5 border-border">
          <Download className="h-3.5 w-3.5" />
          PDF
        </Button>
      </Link>

      <Link href={`/admin/question-papers/${paperId}`} className="flex-1">
        <Button size="sm" variant="secondary" className="w-full text-xs h-8 gap-1.5">
          <Eye className="h-3.5 w-3.5" />
          Preview
        </Button>
      </Link>

      <Button
        size="sm"
        variant="ghost"
        onClick={handleDelete}
        disabled={deleting}
        className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 shrink-0"
        title="Delete Paper"
      >
        {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}
