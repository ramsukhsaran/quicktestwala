import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getAttemptResult } from "@/lib/data/store";
import {
  apiSuccess,
  apiError,
  apiUnauthorized,
  apiNotFound,
} from "@/lib/api/response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const result = await getAttemptResult(id);
    if (!result) {
      return apiNotFound("Attempt result not found");
    }

    if (result.userId !== session.id && session.role !== "ADMIN") {
      return apiError("Unauthorized to view this result", 403);
    }

    return apiSuccess(result);
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    return apiError(err.message || "Failed to retrieve test result", 500);
  }
}
