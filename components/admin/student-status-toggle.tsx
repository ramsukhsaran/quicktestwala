"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { toggleStudentStatusAction } from "@/actions/admin";
import { ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";

export function StudentStatusToggle({
  userId,
  currentStatus,
}: {
  userId: string;
  currentStatus: "ACTIVE" | "BLOCKED";
}) {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleToggle = async () => {
    const nextStatus = currentStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    try {
      setLoading(true);
      await toggleStudentStatusAction(userId, nextStatus);
      toast({
        title: "Status Updated",
        description: `Student account has been ${nextStatus === "BLOCKED" ? "blocked" : "unblocked"}.`,
        type: "success",
      });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      className={`h-7 text-[11px] gap-1 ${
        currentStatus === "ACTIVE"
          ? "border-rose-500/30 text-rose-600 hover:bg-rose-500/10"
          : "border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
      }`}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : currentStatus === "ACTIVE" ? (
        <>
          <ShieldAlert className="h-3 w-3" />
          Block
        </>
      ) : (
        <>
          <ShieldCheck className="h-3 w-3" />
          Unblock
        </>
      )}
    </Button>
  );
}
