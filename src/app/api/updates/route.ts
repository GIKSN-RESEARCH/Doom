import type { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import { handleRouteError, json } from "@/lib/http";
import {
  listResponse,
  parseOptionalTag,
  parsePagination,
} from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { updateListSelect } from "@/lib/selects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { page, limit, skip, take } = parsePagination(
      request.nextUrl.searchParams,
    );
    const tag = parseOptionalTag(request.nextUrl.searchParams.get("tag"));

    const where: Prisma.UpdatePostWhereInput = { published: true };
    if (tag) where.tags = { has: tag };

    const [items, total] = await Promise.all([
      prisma.updatePost.findMany({
        where,
        select: updateListSelect,
        take,
        skip,
        orderBy: { publishedAt: "desc" },
      }),
      prisma.updatePost.count({ where }),
    ]);

    return json(listResponse(items, page, limit, total));
  } catch (error) {
    return handleRouteError(error);
  }
}
