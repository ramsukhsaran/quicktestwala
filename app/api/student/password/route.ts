import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { updateUserPassword } from "@/lib/data/store";
import { changePasswordSchema } from "@/lib/validations/auth";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/api/response";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();

    const validated = changePasswordSchema.safeParse(body);
    if (!validated.success) {
      return apiError(validated.error.errors[0]?.message || "Invalid password data");
    }

    const res = await updateUserPassword(
      session.id,
      validated.data.currentPassword,
      validated.data.newPassword
    );

    if (res.error) {
      return apiError(res.error, 400);
    }

    return apiSuccess(null, "Password updated successfully");
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    return apiError(err.message || "Failed to update password", 400);
  }
}
