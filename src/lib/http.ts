import { Prisma } from "@prisma/client";
import { ValidationError } from "@/lib/validation";

export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

export function jsonError(
  message: string,
  status: number,
  extra?: Record<string, unknown>,
): Response {
  return Response.json({ error: message, ...extra }, { status });
}

export async function readJsonBody(
  request: Request,
): Promise<Record<string, unknown>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new ValidationError("Request body must be valid JSON");
  }

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("Request body must be a JSON object");
  }

  return body as Record<string, unknown>;
}

export function handleRouteError(error: unknown): Response {
  if (error instanceof ValidationError) {
    return jsonError(error.message, 400, {
      ...(error.fields ? { fields: error.fields } : {}),
    });
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return jsonError("A record with that slug already exists", 409);
  }

  console.error(error);
  return jsonError("Internal server error", 500);
}
