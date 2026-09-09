import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getTestSeriesList, createTestSeries } from "@/lib/data/store";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const categorySlug = url.searchParams.get("category") || undefined;
    const difficulty = (url.searchParams.get("difficulty") as any) || undefined;
    const isFeatured = url.searchParams.has("featured")
      ? url.searchParams.get("featured") === "true"
      : undefined;
    const search = url.searchParams.get("search") || undefined;

    const list = await getTestSeriesList({
      categorySlug,
      difficulty,
      isFeatured,
      search,
    });

    return apiSuccess(list);
  } catch (err: any) {
    return apiError(err.message || "Failed to retrieve test series", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    const {
      title,
      slug,
      description,
      shortDescription,
      thumbnail,
      categoryId,
      examName,
      language,
      difficulty,
      price,
      discountPrice,
      status,
      isFeatured,
    } = body;

    if (!title || !examName) {
      return apiError("Title and Exam Name are required fields.");
    }

    const series = await createTestSeries({
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: description || "",
      shortDescription: shortDescription || "",
      thumbnail: thumbnail || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800",
      categoryId: categoryId || "",
      examName,
      language: language || "Bilingual (Hindi + English)",
      difficulty: difficulty || "MEDIUM",
      price: price !== undefined ? Number(price) : 0,
      discountPrice: discountPrice !== undefined ? Number(discountPrice) : 0,
      status: status || "PUBLISHED",
      isFeatured: Boolean(isFeatured),
    });

    return apiSuccess(series, "Test series created successfully", 201);
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    if (err.message?.includes("Forbidden")) return apiForbidden();
    return apiError(err.message || "Failed to create test series", 400);
  }
}
