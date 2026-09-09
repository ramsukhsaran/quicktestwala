import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

export function apiSuccess<T>(
  data: T,
  message?: string,
  status = 200,
  headers?: Record<string, string>
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message ? { message } : {}),
    },
    {
      status,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    }
  );
}

export function apiError(
  error: string,
  status = 400,
  errors?: Record<string, string[]>
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(errors ? { errors } : {}),
    },
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export function apiUnauthorized(message = "Unauthorized: Authentication required"): NextResponse<ApiResponse> {
  return apiError(message, 401);
}

export function apiForbidden(message = "Forbidden: Insufficient permissions"): NextResponse<ApiResponse> {
  return apiError(message, 403);
}

export function apiNotFound(message = "Resource not found"): NextResponse<ApiResponse> {
  return apiError(message, 404);
}

export function apiInternalError(message = "Internal server error occurred"): NextResponse<ApiResponse> {
  return apiError(message, 500);
}
