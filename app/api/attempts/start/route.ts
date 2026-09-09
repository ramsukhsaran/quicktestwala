import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getOrCreateTestAttempt } from "@/lib/data/store";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/api/response";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();

    const { testId } = body;
    if (!testId) {
      return apiError("testId is required to start a test attempt");
    }

    const attempt = await getOrCreateTestAttempt(session.id, testId);
    return apiSuccess(attempt, "Test attempt initialized successfully", 201);
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    return apiError(err.message || "Failed to start test attempt", 400);
  }
}
