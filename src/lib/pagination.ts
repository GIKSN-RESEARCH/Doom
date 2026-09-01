import type { ArticleType, BottleneckTag } from "@prisma/client";

export const DEFAULT_LIMIT = 12;
export const MAX_LIMIT = 24;

export type Pagination = {
  page: number;
  limit: number;
  skip: number;
  take: number;
};

export type ListResponse<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};

function parsePositiveInt(value: string | null, fallback: number): number {
  if (value === null || value === "") return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return parsed;
}

export function parsePagination(searchParams: URLSearchParams): Pagination {
  const page = parsePositiveInt(searchParams.get("page"), 1);
  const requested = parsePositiveInt(searchParams.get("limit"), DEFAULT_LIMIT);
  const limit = Math.min(MAX_LIMIT, requested);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}

export function listResponse<T>(
  items: T[],
  page: number,
  limit: number,
  total: number,
): ListResponse<T> {
  return { items, page, limit, total };
}

export function parseOptionalBoolean(
  value: string | null,
): boolean | undefined {
  if (value === null || value === "") return undefined;
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return undefined;
}

export function parseOptionalTag(value: string | null): string | undefined {
  if (value === null) return undefined;
  const tag = value.trim();
  return tag === "" ? undefined : tag;
}

const ARTICLE_TYPES: ReadonlySet<string> = new Set([
  "BREAKDOWN",
  "EXPLAINER",
  "BUILD_LOG",
]);

const BOTTLENECK_TAGS: ReadonlySet<string> = new Set([
  "PRODUCT",
  "SHIPPING",
  "DISTRIBUTION",
  "FUNDING",
  "CLARITY",
  "OTHER",
]);

export function parseArticleType(
  value: string | null,
): ArticleType | undefined | "invalid" {
  if (value === null || value === "") return undefined;
  if (ARTICLE_TYPES.has(value)) return value as ArticleType;
  return "invalid";
}

export function parseBottleneckTag(
  value: string | null,
): BottleneckTag | undefined | "invalid" {
  if (value === null || value === "") return undefined;
  if (BOTTLENECK_TAGS.has(value)) return value as BottleneckTag;
  return "invalid";
}

export function parseOptionalPublished(
  value: string | null,
): boolean | undefined {
  return parseOptionalBoolean(value);
}
