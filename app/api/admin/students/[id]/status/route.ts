import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { updateUserStatus } from "@/lib/data/store";
import {
  apiSuccess,
  apiError,
  apiUnauthorized,
  apiForbidden,
} from "@/lib/api/response";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const { status } = body;
    if (status !== "ACTIVE" && status !== "BLOCKED") {
      return apiError("Status must be either ACTIVE or BLOCKED");
    }

    const updated = await updateUserStatus(id, status);
    return apiSuccess(updated, `Student status updated to ${status}`);
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    if (err.message?.includes("Forbidden")) return apiForbidden();
    return apiError(err.message || "Failed to update student status", 400);
  }
}
