import { NextRequest } from "next/server";
import { requireAuth, setSessionCookie } from "@/lib/auth/session";
import { getUserById, updateUserProfile } from "@/lib/data/store";
import { updateProfileSchema } from "@/lib/validations/auth";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/api/response";

export async function GET() {
  try {
    const session = await requireAuth();
    const user = await getUserById(session.id);
    if (!user) return apiUnauthorized("User not found");

    return apiSuccess({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: (user as any).createdAt,
      profile: user.profile,
    });
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    return apiError(err.message || "Failed to retrieve student profile", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();

    const validated = updateProfileSchema.safeParse(body);
    if (!validated.success) {
      return apiError(validated.error.errors[0]?.message || "Invalid profile data");
    }

    const updated = await updateUserProfile(session.id, validated.data);
    if (!updated) {
      return apiError("User profile not found for update");
    }

    // Refresh JWT session cookie
    await setSessionCookie({
      id: session.id,
      name: updated.name,
      email: session.email,
      role: session.role,
      status: session.status,
    });

    return apiSuccess(
      {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        profile: updated.profile,
      },
      "Profile updated successfully"
    );
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    return apiError(err.message || "Failed to update profile", 400);
  }
}
