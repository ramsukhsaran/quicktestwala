import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getTestById, updateTest } from "@/lib/data/store";
import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  apiError,
  apiUnauthorized,
  apiForbidden,
  apiNotFound,
} from "@/lib/api/response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const test = await getTestById(id);
    if (!test) {
      return apiNotFound("Mock test not found");
    }

    return apiSuccess(test);
  } catch (err: any) {
    return apiError(err.message || "Failed to retrieve mock test", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const updated = await updateTest(id, body);
    if (!updated) {
      return apiNotFound("Mock test not found for update");
    }

    return apiSuccess(updated, "Mock test updated successfully");
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    if (err.message?.includes("Forbidden")) return apiForbidden();
    return apiError(err.message || "Failed to update mock test", 400);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.test.delete({ where: { id } });
    return apiSuccess({ id }, "Mock test deleted successfully");
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    if (err.message?.includes("Forbidden")) return apiForbidden();
    return apiError(err.message || "Failed to delete mock test", 400);
  }
}
