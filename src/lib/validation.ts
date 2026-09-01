import type { ArticleType, BottleneckTag } from "@prisma/client";

export class ValidationError extends Error {
  fields?: string[];

  constructor(message: string, fields?: string[]) {
    super(message);
    this.name = "ValidationError";
    this.fields = fields;
  }
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const ARTICLE_TYPES = ["BREAKDOWN", "EXPLAINER", "BUILD_LOG"] as const;
const BOTTLENECK_TAGS = [
  "PRODUCT",
  "SHIPPING",
  "DISTRIBUTION",
  "FUNDING",
  "CLARITY",
  "OTHER",
] as const;

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

export function optionalString(
  body: Record<string, unknown>,
  field: string,
): string | undefined {
  if (!(field in body)) return undefined;
  const value = body[field];
  if (value === null) return "";
  if (typeof value !== "string") {
    throw new ValidationError(`${field} must be a string`);
  }
  return value.trim();
}

export function optionalNullableString(
  body: Record<string, unknown>,
  field: string,
): string | null | undefined {
  if (!(field in body)) return undefined;
  const value = body[field];
  if (value === null) return null;
  if (typeof value !== "string") {
    throw new ValidationError(`${field} must be a string or null`);
  }
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function optionalBoolean(
  body: Record<string, unknown>,
  field: string,
): boolean | undefined {
  if (!(field in body)) return undefined;
  const value = body[field];
  if (typeof value !== "boolean") {
    throw new ValidationError(`${field} must be a boolean`);
  }
  return value;
}

export function optionalStringArray(
  body: Record<string, unknown>,
  field: string,
): string[] | undefined {
  if (!(field in body)) return undefined;
  const value = body[field];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new ValidationError(`${field} must be an array of strings`);
  }
  return value.map((item) => item.trim()).filter((item) => item !== "");
}

export function optionalYear(
  body: Record<string, unknown>,
  field: string,
): number | null | undefined {
  if (!(field in body)) return undefined;
  const value = body[field];
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new ValidationError(`${field} must be an integer or null`);
  }
  return value;
}

export function optionalSlug(
  body: Record<string, unknown>,
): string | undefined {
  const slug = optionalString(body, "slug");
  if (slug === undefined) return undefined;
  if (!isValidSlug(slug)) {
    throw new ValidationError("slug must be lowercase kebab-case");
  }
  return slug;
}

export function requireTitle(
  body: Record<string, unknown>,
  required: boolean,
): string | undefined {
  const title = optionalString(body, "title");
  if (title === undefined) {
    if (required) throw new ValidationError("title is required");
    return undefined;
  }
  if (title === "") {
    throw new ValidationError("title is required");
  }
  return title;
}

export function optionalArticleType(
  body: Record<string, unknown>,
): ArticleType | null | undefined {
  if (!("articleType" in body)) return undefined;
  const value = body.articleType;
  if (value === null) return null;
  if (typeof value !== "string" || !ARTICLE_TYPES.includes(value as ArticleType)) {
    throw new ValidationError(
      "articleType must be BREAKDOWN, EXPLAINER, or BUILD_LOG",
    );
  }
  return value as ArticleType;
}

export function optionalBottleneckTag(
  body: Record<string, unknown>,
): BottleneckTag | null | undefined {
  if (!("bottleneckTag" in body)) return undefined;
  const value = body.bottleneckTag;
  if (value === null) return null;
  if (
    typeof value !== "string" ||
    !BOTTLENECK_TAGS.includes(value as BottleneckTag)
  ) {
    throw new ValidationError(
      "bottleneckTag must be PRODUCT, SHIPPING, DISTRIBUTION, FUNDING, CLARITY, or OTHER",
    );
  }
  return value as BottleneckTag;
}

export function applyPublishedAt(
  next: { published?: unknown; publishedAt?: unknown },
  previousPublishedAt?: Date | null,
): void {
  if (next.published === true && (next.publishedAt === undefined || next.publishedAt === null)) {
    next.publishedAt = previousPublishedAt ?? new Date();
  }
}

function missing(record: Record<string, unknown>, fields: string[]): string[] {
  return fields.filter((field) => !isNonEmptyString(record[field]));
}

export function assertCanPublishCaseStudy(record: {
  title: string;
  slug: string;
  outcomeLine: string;
  bottleneck: string;
  published: boolean;
}): void {
  if (!record.published) return;
  const fields = missing(record as unknown as Record<string, unknown>, [
    "title",
    "slug",
    "outcomeLine",
    "bottleneck",
  ]);
  if (fields.length > 0) {
    throw new ValidationError(
      `Cannot publish a case study without ${fields.join(", ")}`,
      fields,
    );
  }
  if (!isValidSlug(record.slug)) {
    throw new ValidationError("slug must be lowercase kebab-case", ["slug"]);
  }
}

export function assertCanPublishUpdate(record: {
  title: string;
  slug: string;
  summary: string;
  body: string;
  published: boolean;
}): void {
  if (!record.published) return;
  const fields = missing(record as unknown as Record<string, unknown>, [
    "title",
    "slug",
    "summary",
    "body",
  ]);
  if (fields.length > 0) {
    throw new ValidationError(
      `Cannot publish an update without ${fields.join(", ")}`,
      fields,
    );
  }
  if (!isValidSlug(record.slug)) {
    throw new ValidationError("slug must be lowercase kebab-case", ["slug"]);
  }
}

export function assertCanPublishArticle(record: {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  articleType: ArticleType | null;
  published: boolean;
}): void {
  if (!record.published) return;
  const fields = missing(record as unknown as Record<string, unknown>, [
    "title",
    "slug",
    "excerpt",
    "body",
  ]);
  if (!record.articleType) fields.push("articleType");
  if (fields.length > 0) {
    throw new ValidationError(
      `Cannot publish an article without ${fields.join(", ")}`,
      fields,
    );
  }
  if (!isValidSlug(record.slug)) {
    throw new ValidationError("slug must be lowercase kebab-case", ["slug"]);
  }
}
