"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  toggleTestSeriesStatusAction,
  deleteTestSeriesAction,
} from "@/actions/admin";
import {
  Eye,
  Layers,
  Pencil,
  Trash2,
  Power,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface TestSeriesActionsProps {
  series: {
    id: string;
    slug: string;
    status: string;
    title: string;
  };
}

export function TestSeriesActions({ series }: TestSeriesActionsProps) {
  const [loadingToggle, setLoadingToggle] = React.useState(false);
  const [loadingDelete, setLoadingDelete] = React.useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = React.useState(false);
  const { toast } = useToast();

  const isPublished = series.status === "PUBLISHED";

  const handleToggleStatus = async () => {
    try {
      setLoadingToggle(true);
      const res = await toggleTestSeriesStatusAction(series.id, series.status);
      if (res.error) {
        toast({ title: "Error", description: res.error, type: "error" });
      } else {
        toast({
          title: "Status Updated",
          description: isPublished
            ? "Test series deactivated (moved to Draft)."
            : "Test series activated (Published for students).",
          type: "success",
        });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, type: "error" });
    } finally {
      setLoadingToggle(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoadingDelete(true);
      const res = await deleteTestSeriesAction(series.id);
      if (res.error) {
        toast({ title: "Error", description: res.error, type: "error" });
      } else {
        toast({
          title: "Deleted",
          description: "Test series and associated mock tests deleted successfully.",
          type: "success",
        });
        setShowConfirmDelete(false);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, type: "error" });
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1.5 flex-wrap">
        {/* Toggle Activate / Deactivate */}
        <Button
          variant={isPublished ? "outline" : "default"}
          size="sm"
          onClick={handleToggleStatus}
          disabled={loadingToggle}
          className={`h-7 px-2.5 text-xs gap-1 font-semibold ${
            isPublished
              ? "text-amber-600 border-amber-500/30 hover:bg-amber-500/10 dark:text-amber-400"
              : "bg-emerald-600 hover:bg-emerald-700 text-white"
          }`}
          title={isPublished ? "Deactivate (Hide from students)" : "Activate (Publish for students)"}
        >
          {loadingToggle ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Power className="h-3 w-3" />
          )}
          <span>{isPublished ? "Deactivate" : "Activate"}</span>
        </Button>

        {/* Manage Tests */}
        <Link href={`/admin/tests?seriesId=${series.id}`}>
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1">
            <Layers className="h-3 w-3" />
            <span>Tests</span>
          </Button>
        </Link>

        {/* Edit */}
        <Link href={`/admin/test-series/${series.id}/edit`}>
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1">
            <Pencil className="h-3 w-3" />
            <span>Edit</span>
          </Button>
        </Link>

        {/* Public Preview */}
        <Link href={`/test-series/${series.slug}`} target="_blank">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
            <Eye className="h-3 w-3" />
            <span>View</span>
          </Button>
        </Link>

        {/* Delete */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowConfirmDelete(true)}
          className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 gap-1"
          title="Delete Test Series"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-foreground">
                  Delete Test Series?
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to permanently delete{" "}
                  <strong className="text-foreground">{series.title}</strong>? This will also remove any mock tests and student enrollment records linked to this series.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmDelete(false)}
                disabled={loadingDelete}
                className="text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={loadingDelete}
                className="text-xs h-8 gap-1.5 font-semibold"
              >
                {loadingDelete ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    Confirm Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
