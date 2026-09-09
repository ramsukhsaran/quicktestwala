import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { submitTestAttempt } from "@/lib/data/store";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/api/response";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const isAutoSubmit = Boolean(body.isAutoSubmit);
    const result = await submitTestAttempt(id, isAutoSubmit);

    return apiSuccess(result, "Test submitted and evaluated successfully");
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    return apiError(err.message || "Failed to submit test", 400);
  }
}
