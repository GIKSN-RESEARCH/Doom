import type { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { parseUpdateCreateInput } from "@/lib/content-input";
import { handleRouteError, json, readJsonBody } from "@/lib/http";
import {
  listResponse,
  parseOptionalPublished,
  parseOptionalTag,
  ADMIN_MAX_LIMIT,
  parsePagination,
} from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import { updateDetailSelect, updateListSelect } from "@/lib/selects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { page, limit, skip, take } = parsePagination(
      request.nextUrl.searchParams,
      ADMIN_MAX_LIMIT,
    );
    const tag = parseOptionalTag(request.nextUrl.searchParams.get("tag"));
    const published = parseOptionalPublished(
      request.nextUrl.searchParams.get("published"),
    );

    const where: Prisma.UpdatePostWhereInput = {};
    if (tag) where.tags = { has: tag };
    if (published !== undefined) where.published = published;

    const [items, total] = await Promise.all([
      prisma.updatePost.findMany({
        where,
        select: updateListSelect,
        take,
        skip,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.updatePost.count({ where }),
    ]);

    return json(listResponse(items, page, limit, total));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await readJsonBody(request);
    const data = parseUpdateCreateInput(body);
    data.slug = await uniqueSlug("updatePost", data.slug);

    const item = await prisma.updatePost.create({
      data,
      select: updateDetailSelect,
    });

    return json(item, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
