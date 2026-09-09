import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getCategories } from "@/lib/data/store";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/api/response";

export async function GET() {
  try {
    const categories = await getCategories();
    return apiSuccess(categories);
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch categories", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    const { name, slug, description, icon, displayOrder, isActive } = body;
    if (!name) return apiError("Category name is required");

    const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const category = await prisma.category.create({
      data: {
        name,
        slug: categorySlug,
        description: description || null,
        icon: icon || null,
        displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return apiSuccess(category, "Category created successfully", 201);
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    if (err.message?.includes("Forbidden")) return apiForbidden();
    return apiError(err.message || "Failed to create category", 400);
  }
}
