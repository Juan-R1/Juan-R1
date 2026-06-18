import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";
import { flattenZodError } from "@/lib/validation";

/** Standard success envelope. */
export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

/** Standard error envelope. `code` is a stable machine-readable string. */
export function jsonError(
  code: string,
  status: number,
  details?: unknown
) {
  return NextResponse.json({ error: { code, details } }, { status });
}

/** Parse + validate a JSON request body, returning a typed value or throwing. */
export async function parseBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<T> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new ApiError("invalid_json", 400);
  }
  try {
    return schema.parse(raw);
  } catch (err) {
    if (err instanceof ZodError) {
      throw new ApiError("validation_error", 422, flattenZodError(err));
    }
    throw err;
  }
}

/** Typed API error that route handlers can throw and `handleRoute` will map. */
export class ApiError extends Error {
  constructor(
    public code: string,
    public status: number,
    public details?: unknown
  ) {
    super(code);
    this.name = "ApiError";
  }
}

/** Wrap a route handler so thrown ApiErrors become clean JSON responses. */
export async function handleRoute(
  fn: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ApiError) {
      return jsonError(err.code, err.status, err.details);
    }
    console.error("[api] unhandled error", err);
    return jsonError("internal_error", 500);
  }
}
