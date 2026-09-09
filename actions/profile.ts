"use server";

import { requireAuth, setSessionCookie } from "@/lib/auth/session";
import { updateUserProfile, updateUserPassword } from "@/lib/data/store";
import { updateProfileSchema, changePasswordSchema } from "@/lib/validations/auth";
import { revalidatePath } from "next/cache";

function toOptionalTrimmedString(value: FormDataEntryValue | null | undefined): string | undefined {
  if (value == null) return undefined;
  const str = String(value).trim();
  return str.length > 0 ? str : undefined;
}

export async function updateStudentProfileAction(formData: FormData) {
  try {
    const session = await requireAuth();

    const rawData = {
      name: toOptionalTrimmedString(formData.get("name")),
      phone: toOptionalTrimmedString(formData.get("phone")),
      targetExam: toOptionalTrimmedString(formData.get("targetExam")),
      state: toOptionalTrimmedString(formData.get("state")),
      education: toOptionalTrimmedString(formData.get("education")),
    };

    const validated = updateProfileSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid profile data provided.",
      };
    }

    const updatedUser = await updateUserProfile(session.id, {
      name: validated.data.name,
      phone: validated.data.phone || null,
      targetExam: validated.data.targetExam || null,
      state: validated.data.state || null,
      education: validated.data.education || null,
    });

    if (!updatedUser) {
      return {
        success: false,
        error: "Unable to update profile. User account was not found.",
      };
    }

    // Refresh active session cookie with updated name
    await setSessionCookie({
      id: session.id,
      name: updatedUser.name,
      email: session.email,
      role: session.role,
      status: session.status,
    });

    revalidatePath("/student/profile");
    revalidatePath("/student/dashboard");
    revalidatePath("/student", "layout");

    return {
      success: true,
      message: "Profile preferences saved successfully!",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.profile?.phone || "",
        targetExam: updatedUser.profile?.targetExam || "",
        state: updatedUser.profile?.state || "",
        education: updatedUser.profile?.education || "",
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "An unexpected error occurred while saving your profile.",
    };
  }
}

export async function changeStudentPasswordAction(formData: FormData) {
  try {
    const session = await requireAuth();

    const rawData = {
      currentPassword: formData.get("currentPassword")?.toString() || "",
      newPassword: formData.get("newPassword")?.toString() || "",
      confirmPassword: formData.get("confirmPassword")?.toString() || "",
    };

    const validated = changePasswordSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid password data.",
      };
    }

    const result = await updateUserPassword(
      session.id,
      validated.data.currentPassword,
      validated.data.newPassword
    );

    if (result.error) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      message: "Your password has been changed successfully!",
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "An unexpected error occurred while updating your password.",
    };
  }
}
